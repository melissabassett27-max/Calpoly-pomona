'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { APPLICATION_STEPS } from '@/lib/constants';
import { ApplicationStepper } from './application-stepper';

interface ApplicationShellProps {
  currentStep: number;
  children: React.ReactNode;
}

export function ApplicationShell({ currentStep, children }: ApplicationShellProps) {
  const searchParams = useSearchParams();
  const appId = searchParams?.get('id') ?? '';
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchApp = useCallback(async () => {
    try {
      const res = await fetch('/api/application');
      if (res.ok) {
        const data = await res.json();
        setApp(data);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  const getStepStatus = (stepNum: number) => {
    if (!app) return 'not_started';
    const key = `section${stepNum}Complete` as keyof typeof app;
    return app?.[key] ? 'complete' : 'not_started';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <SiteHeader />

      <ApplicationStepper currentStep={currentStep} app={app} />

      <div className="flex-1 max-w-[1200px] mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <nav className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-1 sticky top-24">
              {APPLICATION_STEPS.map((step) => {
                const status = getStepStatus(step.id);
                const isCurrent = step.id === currentStep;
                return (
                  <Link
                    key={step.id}
                    href={`/application/${step.slug}${appId ? `?id=${appId}` : ''}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      isCurrent
                        ? 'bg-[#1E5631]/10 text-[#1E5631] font-semibold'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {status === 'complete' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#1E5631] shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#D4A017] shrink-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#D4A017]" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span>Step {step.id}: {step.title}</span>
                  </Link>
                );
              })}
              <hr className="my-2" />
              <Link
                href={`/application/review${appId ? `?id=${appId}` : ''}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted"
              >
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                Review & Submit
              </Link>
            </div>
          </nav>

          {/* Main content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#1E5631]" />
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
