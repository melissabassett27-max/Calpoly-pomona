'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GraduationCap, ArrowLeftRight, BookOpen, Globe, ArrowRight, Clock, DollarSign, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FadeIn, SlideIn, Stagger, StaggerItem, HoverLift } from '@/components/ui/animate';

const HERO_IMAGE = 'https://cdn.abacus.ai/images/40cca105-8927-426a-a91f-8cd16f93f142.png';

const categories = [
  { id: 'freshmen', title: 'Freshmen', icon: GraduationCap, color: '#1E5631' },
  { id: 'transfer', title: 'Transfer Students', icon: ArrowLeftRight, color: '#245E36' },
  { id: 'graduate', title: 'Graduate & Credential', icon: BookOpen, color: '#1E5631' },
  { id: 'international', title: 'International & Veterans', icon: Globe, color: '#245E36' },
];

export function LandingPageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative w-full h-[480px] md:h-[520px] overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Cal Poly Pomona campus with students walking along tree-lined paths"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E5631]/90 via-[#1E5631]/60 to-transparent" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 flex flex-col justify-center h-full">
          <FadeIn>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Become a<br />Bronco.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-md">Your journey starts here. Apply to Cal Poly Pomona today.</p>
            <Link href="/apply" className="mt-6 inline-block">
              <Button className="bg-[#D4A017] hover:bg-[#b8890f] text-white text-lg px-8 py-6 font-bold shadow-lg">
                APPLY NOW <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Categories + Info Sidebar */}
      <section className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Cards */}
            <div className="lg:col-span-2">
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <StaggerItem key={cat.id}>
                      <HoverLift>
                        <Link href={`/apply?type=${cat.id}`}>
                          <Card className="cursor-pointer border border-border hover:border-[#1E5631]/30 transition-all h-full">
                            <CardContent className="flex items-center gap-4 p-6">
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '15' }}>
                                <Icon className="w-6 h-6" style={{ color: cat.color }} />
                              </div>
                              <span className="font-display font-bold text-[#1A1A1A] text-lg">{cat.title}</span>
                            </CardContent>
                          </Card>
                        </Link>
                      </HoverLift>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <SlideIn from="right">
                {/* Deadlines & Fees */}
                <Card className="overflow-hidden border-0">
                  <div className="bg-[#D4A017] px-5 py-3">
                    <h3 className="font-display font-bold text-white text-base">APPLICATION DEADLINES & FEES</h3>
                  </div>
                  <CardContent className="p-5 space-y-3 text-sm bg-[#F5F5F5]">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#1E5631] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">Priority filing period:</p>
                        <p className="text-muted-foreground">Oct 1 – Nov 30</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-[#1E5631] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">Application Fee: $90</p>
                        <p className="text-muted-foreground">(Non-refundable)</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs">Late applications considered space permitting.</p>
                  </CardContent>
                </Card>
              </SlideIn>

              <SlideIn from="right" delay={0.1}>
                <Card className="overflow-hidden border-0">
                  <div className="bg-[#1E5631] px-5 py-3">
                    <h3 className="font-display font-bold text-white text-base">ADMISSION REQUIREMENTS</h3>
                  </div>
                  <CardContent className="p-5 space-y-2 text-sm bg-[#F5F5F5]">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                      <p className="text-muted-foreground">Completion of A-G requirements with a minimum 2.0 GPA</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                      <p className="text-muted-foreground">Official high school and college transcripts</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                      <p className="text-muted-foreground">Personal statement or essays</p>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>

              <SlideIn from="right" delay={0.2}>
                <Card className="overflow-hidden border-0">
                  <div className="bg-[#245E36] px-5 py-3">
                    <h3 className="font-display font-bold text-white text-base">IMPORTANT NOTICES</h3>
                  </div>
                  <CardContent className="p-5 text-sm bg-[#F5F5F5]">
                    <div className="flex items-start gap-2">
                      <Bell className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                      <p className="text-muted-foreground">Fall 2026 applications are now open. Submit your application before the priority deadline for best consideration.</p>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
