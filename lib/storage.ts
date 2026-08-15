import { getAdminStorage, isFirebaseConfigured } from './firebase/admin';

export async function uploadToFirebaseStorage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const bucket = (await getAdminStorage()).bucket();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `uploads/${Date.now()}-${safeName}`;
  const file = bucket.file(path);
  await file.save(buffer, { contentType, public: true, resumable: false });
  await file.makePublic();
  const encoded = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media`;
}

export async function deleteFromFirebaseStorage(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  try {
    const match = fileUrl.match(/\/o\/(.+)\?alt=media/);
    if (!match) return;
    const path = decodeURIComponent(match[1]);
    const bucket = (await getAdminStorage()).bucket();
    await bucket.file(path).delete();
  } catch (e) {
    // ignore missing files
  }
}

export function isStorageConfigured(): boolean {
  return isFirebaseConfigured() && Boolean(process.env.FIREBASE_STORAGE_BUCKET);
}
