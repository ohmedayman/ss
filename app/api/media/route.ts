import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  const session = await getSession();
  const media = db.getMedia(session.organization.id);
  return NextResponse.json({ media });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const contentType = req.headers.get('content-type') || '';

    // Handle multipart form-data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const customName = formData.get('name') as string | null;
      const folder = (formData.get('folder') as string) || 'عام';
      const durationSeconds = parseInt((formData.get('duration') as string) || '10', 10);

      if (!file) {
        return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 });
      }

      // Check organization storage limit
      const org = session.organization;
      if (org.storageUsedBytes + file.size > org.storageLimitMb * 1024 * 1024) {
        return NextResponse.json({ error: 'تم تجاوز الحد المسموح للمساحة التخزينية في باقتك' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file to public/uploads
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadDir, cleanFileName);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/${cleanFileName}`;
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const fileType = isVideo ? 'video' : isImage ? 'image' : 'document';

      const mediaItem = db.createMedia({
        organizationId: session.organization.id,
        name: customName && customName.trim() ? customName.trim() : file.name,
        fileType,
        fileUrl,
        thumbnailUrl: isImage ? fileUrl : undefined,
        fileSizeBytes: file.size,
        durationSeconds: isVideo ? Math.max(15, durationSeconds) : durationSeconds,
        folder,
        tags: [folder, isVideo ? 'فيديو' : 'صورة'],
      });

      db.logActivity({
        organizationId: session.organization.id,
        userId: session.user.id,
        userName: session.user.fullName,
        action: 'رفع ملف وسائط',
        actionType: 'media',
        details: `تم رفع ملف جديد: "${mediaItem.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });

      return NextResponse.json({ success: true, media: mediaItem });
    }

    // Handle JSON payload (web_url or ticker_text or predefined link)
    const body = await req.json();
    const { name, fileType, fileUrl, customTickerText, folder = 'عام', durationSeconds = 15, tags = [] } = body;

    if (!name || !fileType) {
      return NextResponse.json({ error: 'الاسم ونوع الوسائط مطلوبان' }, { status: 400 });
    }

    const mediaItem = db.createMedia({
      organizationId: session.organization.id,
      name: name.trim(),
      fileType,
      fileUrl: fileUrl || '',
      customTickerText,
      fileSizeBytes: fileType === 'ticker_text' ? (customTickerText?.length || 0) * 2 : 1024,
      durationSeconds: parseInt(durationSeconds.toString(), 10) || 15,
      folder,
      tags: tags.length ? tags : [folder, fileType],
    });

    db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إضافة وسائط',
      actionType: 'media',
      details: `تمت إضافة "${mediaItem.name}" (${mediaItem.fileType})`,
    });

    return NextResponse.json({ success: true, media: mediaItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل في حفظ الوسائط' }, { status: 500 });
  }
}
