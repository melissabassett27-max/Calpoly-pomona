'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { toast } from 'sonner';

export function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantType = searchParams?.get('type') ?? 'freshmen';
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const update = (field: string, val: string) => setForm((p) => ({ ...p, [field]: val }));

  // After signup: create (or resume) an application, then go straight to Personal Details.
  const ensureApplicationAndContinue = async () => {
    try {
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationType: applicantType }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Existing application — resume it
        if (data?.applicationId) {
          router.replace(`/application/personal?id=${data.applicationId}`);
          return;
        }
        router.replace('/application');
        return;
      }
      router.replace(`/application/personal?id=${data?.id ?? ''}`);
    } catch {
      router.replace('/application');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('Please fill in all fields'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? 'Signup failed'); return; }
      // Auto sign in
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (result?.error) {
        toast.error('Account created. Please sign in.');
        router.push('/login');
      } else {
        toast.success('Account created! Welcome to Cal Poly Pomona.');
        await ensureApplicationAndContinue();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center bg-[#F5F5F5] py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="text-3xl mb-2">🐴</div>
            <CardTitle className="font-display text-2xl text-[#1E5631]">Create Your Account</CardTitle>
            <CardDescription>Start your application to Cal Poly Pomona</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="firstName" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="mt-1" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="pl-10" placeholder="Min 8 characters" required />
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#1E5631] hover:bg-[#245E36] text-white">
                {loading ? 'Creating account...' : <><UserPlus className="w-4 h-4 mr-2" />Create Account</>}
              </Button>
            </form>
            <p className="text-sm text-center mt-4 text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1E5631] font-semibold hover:underline">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
