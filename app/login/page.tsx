import { LoginClient } from './_components/login-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/portal');
  return <LoginClient />;
}
