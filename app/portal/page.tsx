import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PortalClient } from './_components/portal-client';

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <PortalClient userName={session?.user?.name ?? 'Applicant'} />;
}
