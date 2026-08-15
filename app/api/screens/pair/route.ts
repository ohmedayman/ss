import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { realtime } from '@/lib/realtime';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { code, name, branchId, activeContentType = 'playlist', activeContentId } = await req.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'رمز الاقتران مطلوب' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    let screen = await db.getScreenByCode(cleanCode);

    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (screen) {
      // Screen already exists (maybe created from player init or unlinked)
      screen = (await db.updateScreen(screen.id, {
        organizationId: session.organization.id,
        name: name && name.trim() ? name.trim() : screen.name,
        branchId: branchId || screen.branchId,
        isPaired: true,
        pairingToken: token,
        status: 'online',
        lastHeartbeatAt: new Date().toISOString(),
        activeContentType: activeContentType || screen.activeContentType,
        activeContentId: activeContentId || screen.activeContentId || 'pl-general-ads',
      })) || undefined;
    } else {
      // Screen code was entered, create and pair
      screen = await db.createScreen({
        organizationId: session.organization.id,
        branchId,
        name: name && name.trim() ? name.trim() : `شاشة جديدة (${cleanCode})`,
        registrationCode: cleanCode,
        pairingToken: token,
        isPaired: true,
        status: 'online',
        lastHeartbeatAt: new Date().toISOString(),
        orientation: 'landscape',
        resolution: '1920x1080',
        activeContentType: activeContentType || 'playlist',
        activeContentId: activeContentId || 'pl-general-ads',
        volume: 80,
        brightness: 100,
        tags: ['شاشة_شاشة'],
      });
    }

    if (!screen) {
      return NextResponse.json({ error: 'خطأ في إنشاء الشاشة' }, { status: 500 });
    }

    // Broadcast to the screen via realtime so the waiting /player transitions immediately to playing!
    realtime.notifyScreen(screen.id, 'paired', {
      screenId: screen.id,
      pairingToken: token,
      screenName: screen.name,
      activeContentType: screen.activeContentType,
      activeContentId: screen.activeContentId,
    });
    // Also notify on the code channel for unlinked screens waiting on registration code
    realtime.notifyScreen(cleanCode, 'paired', {
      screenId: screen.id,
      pairingToken: token,
      screenName: screen.name,
      activeContentType: screen.activeContentType,
      activeContentId: screen.activeContentId,
    });

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'اقتران شاشة جديدة',
      actionType: 'screen',
      details: `تم ربط الشاشة "${screen.name}" برمز ${cleanCode}`,
    });

    return NextResponse.json({
      success: true,
      screen,
      message: 'تم اقتران الشاشة وبدء البث المباشر',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل الاقتران' }, { status: 500 });
  }
}
