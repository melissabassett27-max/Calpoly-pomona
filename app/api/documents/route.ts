export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { applicationId, documentType, filename, cloudStoragePath, contentType } = await request.json();

    const userId = (session.user as any)?.id;
    const app = await prisma.application.findFirst({ where: { id: applicationId, userId } });
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const doc = await prisma.document.create({
      data: {
        applicationId,
        documentType,
        filename,
        cloudStoragePath,
        contentType: contentType ?? 'application/pdf',
        isPublic: false,
        status: 'received',
      },
    });
    return NextResponse.json(doc);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const url = new URL(request.url);
    const applicationId = url.searchParams.get('applicationId');

    const app = await prisma.application.findFirst({ where: { id: applicationId ?? '', userId } });
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const docs = await prisma.document.findMany({ where: { applicationId: app.id }, orderBy: { uploadedAt: 'desc' } });

    const docsWithUrls = await Promise.all(
      (docs ?? []).map(async (doc: any) => {
        const fileUrl = await getFileUrl(doc.cloudStoragePath, doc.contentType, doc.isPublic);
        return { ...doc, fileUrl };
      })
    );
    return NextResponse.json(docsWithUrls);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}
