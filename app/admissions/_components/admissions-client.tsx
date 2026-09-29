'use client';

import Link from 'next/link';
import {
  GraduationCap,
  ArrowLeftRight,
  BookOpen,
  Globe,
  ArrowRight,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  UserPlus,
  ClipboardList,
  Send,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FadeIn, SlideIn, Stagger, StaggerItem, HoverLift } from '@/components/ui/animate';

const applicantTypes = [
  { id: 'freshmen', title: 'Freshmen', icon: GraduationCap, desc: 'First-time college students entering directly from high school or with fewer than 60 transferable units.' },
  { id: 'transfer', title: 'Transfer Students', icon: ArrowLeftRight, desc: 'Students with 60+ transferable semester units from an accredited college or university.' },
  { id: 'graduate', title: 'Graduate & Credential', icon: BookOpen, desc: 'Students seeking a master\'s degree, doctoral degree, or teaching credential.' },
  { id: 'international', title: 'International & Veterans', icon: Globe, desc: 'International students, military veterans, and active duty service members.' },
];

const requirements = [
  'Completion of A-G college preparatory requirements with a minimum 2.0 GPA',
  'Official high school and college transcripts',
  'Personal statement or program-specific essays',
  'Standardized test scores (if required by your program)',
  'Non-refundable $90 application fee',
];

const steps = [
  { icon: UserPlus, title: 'Create Your Account', desc: 'Register with your email to start and save your application.' },
  { icon: ClipboardList, title: 'Complete Each Section', desc: 'Personal, academic, supporting, and program details across a guided 7-stage tracker.' },
  { icon: FileText, title: 'Upload Documents', desc: 'Add transcripts, essays, and any program-specific materials.' },
  { icon: Send, title: 'Review & Submit', desc: 'Certify your information, pay the $90 fee, and submit.' },
];

export function AdmissionsClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-[#1E5631] text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn>
            <p className="text-[#D4A017] font-semibold tracking-widest text-sm mb-2">ADMISSIONS</p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl">
              Your path to becoming a Bronco starts here
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-xl">
              Everything you need to know to apply to Cal Poly Pomona — deadlines, requirements, and a
              step-by-step guide to submitting a strong application.
            </p>
            <Link href="/apply" className="mt-6 inline-block">
              <Button className="bg-[#D4A017] hover:bg-[#b8890f] text-white text-lg px-8 py-6 font-bold shadow-lg">
                Apply Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Deadlines & Fees */}
      <section className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <SlideIn from="left">
            <Card className="h-full border border-border">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-[#1E5631] mb-3" />
                <h3 className="font-display font-bold text-lg text-[#1A1A1A]">Priority Filing Period</h3>
                <p className="text-muted-foreground mt-1">October 1 &ndash; November 30</p>
                <p className="text-sm text-muted-foreground mt-2">Late applications are considered space permitting.</p>
              </CardContent>
            </Card>
          </SlideIn>
          <SlideIn from="left" delay={0.1}>
            <Card className="h-full border border-border">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-[#1E5631] mb-3" />
                <h3 className="font-display font-bold text-lg text-[#1A1A1A]">Application Fee</h3>
                <p className="text-muted-foreground mt-1">$90 (non-refundable)</p>
                <p className="text-sm text-muted-foreground mt-2">Fee waivers may be available for eligible students.</p>
              </CardContent>
            </Card>
          </SlideIn>
          <SlideIn from="left" delay={0.2}>
            <Card className="h-full border border-border">
              <CardContent className="p-6">
                <Bell className="w-8 h-8 text-[#1E5631] mb-3" />
                <h3 className="font-display font-bold text-lg text-[#1A1A1A]">Fall 2026 Is Open</h3>
                <p className="text-muted-foreground mt-1">Applications now accepted</p>
                <p className="text-sm text-muted-foreground mt-2">Submit before the priority deadline for best consideration.</p>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </section>

      {/* Applicant Types */}
      <section className="bg-[#F5F5F5] py-14">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-[#1E5631] text-center">Who Is Applying?</h2>
          <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">
            Select the category that best describes you to begin a tailored application.
          </p>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {applicantTypes.map((t) => {
              const Icon = t.icon;
              return (
                <StaggerItem key={t.id}>
                  <HoverLift>
                    <Link href={`/apply?type=${t.id}`}>
                      <Card className="cursor-pointer border border-border hover:border-[#1E5631]/40 transition-all h-full">
                        <CardContent className="p-6">
                          <div className="w-12 h-12 rounded-lg bg-[#1E5631]/10 flex items-center justify-center mb-4">
                            <Icon className="w-6 h-6 text-[#1E5631]" />
                          </div>
                          <h3 className="font-display font-bold text-[#1A1A1A]">{t.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2">{t.desc}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Requirements + Steps */}
      <section className="bg-white py-14">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <SlideIn from="left">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#1E5631]">Admission Requirements</h2>
              <ul className="mt-6 space-y-4">
                {requirements.map((r) => (
                  <li key={r} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#D4A017] shrink-0 mt-0.5" />
                    <span className="text-[#1A1A1A]">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SlideIn>
          <SlideIn from="right">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#1E5631]">How to Apply</h2>
              <div className="mt-6 space-y-5">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1E5631] text-white flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[#1A1A1A] flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#D4A017]" /> {s.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1E5631] py-14">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Ready to begin?</h2>
          <p className="text-white/90 mt-2">Create your account and start your Cal Poly Pomona application today.</p>
          <Link href="/apply" className="mt-6 inline-block">
            <Button className="bg-[#D4A017] hover:bg-[#b8890f] text-white text-lg px-8 py-6 font-bold shadow-lg">
              Start Your Application <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
