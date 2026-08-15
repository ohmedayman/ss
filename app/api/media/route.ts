import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { uploadToFirebaseStorage, isStorageConfigured } from '@/lib/storage';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  const session = await getSession();
  const media = await db.getMedia(session.organization.id);
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
        return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });
      }

      // Check organization storage limit
      const org = await db.getOrganization(session.organization.id);
      const storageLimitBytes = (org?.storageLimitMb || 10240) * 1024 * 1024;
      const storageUsed = org?.storageUsedBytes || 0;
      if (storageUsed + file.size > storageLimitBytes) {
        return NextResponse.json({ error: 'تم تجاوز مساحة التخزين المسموح بها لحساب المؤسسة' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const fileType = isVideo ? 'video' : isImage ? 'image' : 'document';

      let fileUrl: string;
      let thumbnailUrl: string | undefined = undefined;

      if (isStorageConfigured()) {
        // Upload to Firebase Storage
        fileUrl = await uploadToFirebaseStorage(buffer, file.name, file.type);
        thumbnailUrl = isImage ? fileUrl : undefined;
      } else {
        // Local fallback upload
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, cleanFileName);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/${cleanFileName}`;
        thumbnailUrl = isImage ? fileUrl : undefined;
      }

      const mediaItem = await db.createMedia({
        organizationId: session.organization.id,
        name: customName && customName.trim() ? customName.trim() : file.name,
        fileType,
        fileUrl,
        thumbnailUrl,
        fileSizeBytes: file.size,
        durationSeconds: isVideo ? Math.max(15, durationSeconds) : durationSeconds,
        folder,
        tags: [folder, isVideo ? 'فيديو' : 'صورة'],
      });

      await db.logActivity({
        organizationId: session.organization.id,
        userId: session.user.id,
        userName: session.user.fullName,
        action: 'رفع وسائط جديدة',
        actionType: 'media',
        details: `تم رفع وسائط جديدة: "${mediaItem.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });

      return NextResponse.json({ success: true, media: mediaItem });
    }

    // Handle JSON payload (web_url or ticker_text or predefined link)
    const body = await req.json();
    const { name, fileType, fileUrl, customTickerText, folder = 'عام', durationSeconds = 15, tags = [] } = body;

    if (!name || !fileType) {
      return NextResponse.json({ error: 'مطلوب اسم ونوع الوسائط' }, { status: 400 });
    }

    const mediaItem = await db.createMedia({
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

    await db.logActivity({
      organizationId: session.organization.id,
      userId: session.user.id,
      userName: session.user.fullName,
      action: 'إضافة وسائط',
      actionType: 'media',
      details: `تمت إضافة "${mediaItem.name}" (${mediaItem.fileType})`,
    });

    return NextResponse.json({ success: true, media: mediaItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ في إضافة الوسائط' }, { status: 500 });
  }
}
