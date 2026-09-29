import { RegisterClient } from './_components/register-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect('/portal');
  return <RegisterClient />;
}
