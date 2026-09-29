export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { SAMPLE_ANNOUNCEMENTS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const { applicationId } = await request.json();

    const app = await prisma.application.findFirst({ where: { id: applicationId, userId } });
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'submitted',
        paymentConfirmed: true,
        submittedAt: new Date(),
      },
    });

    // Create portal status
    await prisma.portalStatus.upsert({
      where: { applicationId },
      update: { currentStatus: 'submitted' },
      create: {
        applicationId,
        currentStatus: 'submitted',
        checklist: [
          { id: 'transcript', label: 'Official High School Transcript', status: 'pending' },
          { id: 'fafsa', label: 'FAFSA Application', status: 'not_started' },
          { id: 'recommendation', label: 'Letter of Recommendation', status: 'not_started' },
        ],
        announcements: SAMPLE_ANNOUNCEMENTS,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}
