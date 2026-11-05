export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getSectionCompletionIssues } from '@/lib/application-validation';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const { applicationType } = await request.json();

    // Check existing draft
    const existing = await prisma.application.findFirst({
      where: { userId, status: { in: ['draft', 'submitted'] } },
    });
    if (existing) {
      return NextResponse.json({ error: 'You already have an application', applicationId: existing.id }, { status: 409 });
    }

    const app = await prisma.application.create({
      data: { userId, applicationType: applicationType ?? 'freshmen' },
    });
    return NextResponse.json(app);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create application' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any)?.id;

    const app = await prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        documents: { orderBy: { uploadedAt: 'desc' } },
        payments: {
          select: { id: true, provider: true, amount: true, currency: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        portalStatus: true,
      },
    });
    return NextResponse.json(app);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const body = await request.json();
    const { applicationId, section, data, complete } = body;

    if (!Number.isInteger(section) || section < 1 || section > 4) {
      return NextResponse.json({ error: 'A valid application section is required.' }, { status: 400 });
    }
    if (typeof complete !== 'undefined' && typeof complete !== 'boolean') {
      return NextResponse.json({ error: 'Section completion must be true or false.' }, { status: 400 });
    }
    if (typeof complete === 'boolean' && (typeof data !== 'object' || data === null || Array.isArray(data))) {
      return NextResponse.json({ error: 'Section data must be an object.' }, { status: 400 });
    }
    if (complete === true) {
      const issues = getSectionCompletionIssues(section, data);
      if (issues.length > 0) {
        return NextResponse.json({ error: `Please complete: ${issues.join(', ')}.` }, { status: 400 });
      }
    }

    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const updateData: any = {};
    if (section === 1) { updateData.section1Data = data; if (complete !== undefined) updateData.section1Complete = complete; }
    if (section === 2) { updateData.section2Data = data; if (complete !== undefined) updateData.section2Complete = complete; }
    if (section === 3) { updateData.section3Data = data; if (complete !== undefined) updateData.section3Complete = complete; }
    if (section === 4) { updateData.section4Data = data; if (complete !== undefined) updateData.section4Complete = complete; }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to save' }, { status: 500 });
  }
}
