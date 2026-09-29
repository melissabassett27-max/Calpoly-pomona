'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { GraduationCap, ArrowLeftRight, BookOpen, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FadeIn, Stagger, StaggerItem, HoverLift } from '@/components/ui/animate';
import { APPLICANT_TYPES } from '@/lib/constants';
import { toast } from 'sonner';
import { useState } from 'react';

const iconMap: Record<string, any> = {
  GraduationCap,
  ArrowLeftRight,
  BookOpen,
  Globe,
};

export function ApplyClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams?.get('type') ?? null;
  const [loading, setLoading] = useState<string | null>(null);

  const handleStart = async (type: string) => {
    if (!session?.user) {
      toast.info('Please create an account or sign in first.');
      router.push(`/register?type=${type}`);
      return;
    }
    setLoading(type);
    try {
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationType: type }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.applicationId) {
          router.push(`/application/personal?id=${data.applicationId}`);
          return;
        }
        toast.error(data?.error ?? 'Failed to create application');
        return;
      }
      router.push(`/application/personal?id=${data?.id ?? ''}`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-[#F5F5F5]">
        <div className="bg-[#1E5631] text-white py-12">
          <div className="max-w-[1200px] mx-auto px-4">
            <FadeIn>
              <h1 className="font-display text-3xl md:text-4xl font-bold">Select Your Application Type</h1>
              <p className="mt-2 text-white/80 text-lg">Choose the category that best describes you to begin your application.</p>
            </FadeIn>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-10">
          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {APPLICANT_TYPES.map((type) => {
              const Icon = iconMap[type.icon] ?? GraduationCap;
              const isSelected = preselected === type.id;
              return (
                <StaggerItem key={type.id}>
                  <HoverLift>
                    <Card className={`h-full transition-all ${isSelected ? 'ring-2 ring-[#D4A017] border-[#D4A017]' : 'border-border hover:border-[#1E5631]/30'}`}>
                      <CardHeader className="flex flex-row items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-[#1E5631]/10 flex items-center justify-center shrink-0">
                          <Icon className="w-7 h-7 text-[#1E5631]" />
                        </div>
                        <div>
                          <CardTitle className="font-display text-xl text-[#1A1A1A]">{type.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm mb-5">{type.description}</CardDescription>
                        <Button
                          onClick={() => handleStart(type.id)}
                          disabled={loading === type.id}
                          className="bg-[#1E5631] hover:bg-[#245E36] text-white"
                        >
                          {loading === type.id ? 'Creating...' : <>Start Application <ArrowRight className="w-4 h-4 ml-2" /></>}
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </Stagger>

          {status === 'unauthenticated' && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-3">You&apos;ll need an account to start your application.</p>
              <div className="flex gap-3 justify-center">
                <Link href={`/register?type=${preselected ?? 'freshmen'}`}><Button className="bg-[#D4A017] hover:bg-[#b8890f] text-white">Create Account</Button></Link>
                <Link href="/login"><Button variant="outline" className="border-[#1E5631] text-[#1E5631]">Sign In</Button></Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
