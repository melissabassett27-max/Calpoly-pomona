export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export default async function ApplicationResumePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session!.user as any)?.id;

  const app = await prisma.application.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // No application yet -> start by choosing applicant type
  if (!app) {
    redirect('/apply');
  }

  // Already submitted -> send to the applicant portal
  if (app!.status === 'submitted') {
    redirect('/portal');
  }

  const idParam = `?id=${app!.id}`;

  // Resume at the first incomplete section
  if (!app!.section1Complete) redirect(`/application/personal${idParam}`);
  if (!app!.section2Complete) redirect(`/application/academic${idParam}`);
  if (!app!.section3Complete) redirect(`/application/supporting${idParam}`);
  if (!app!.section4Complete) redirect(`/application/program${idParam}`);

  // All sections complete but not yet submitted -> review
  redirect(`/application/review${idParam}`);
}
