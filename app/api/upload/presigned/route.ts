export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generatePresignedUploadUrl } from '@/lib/s3';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { fileName, contentType, fileSize } = await request.json();

    if (typeof fileName !== 'string' || !fileName.trim() || fileName.length > 255) {
      return NextResponse.json({ error: 'A valid file name is required' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'File type not allowed. Please upload PDF, JPG, or PNG files.' }, { status: 400 });
    }
    if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const result = await generatePresignedUploadUrl(fileName, contentType, false);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Upload failed' }, { status: 500 });
  }
}
