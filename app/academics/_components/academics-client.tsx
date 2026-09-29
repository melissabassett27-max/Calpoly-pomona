'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Cpu,
  Briefcase,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Sprout,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FadeIn, Stagger, StaggerItem, HoverLift } from '@/components/ui/animate';
import { collegesAndMajors } from '@/lib/majors';

const collegeIcons: Record<string, any> = {
  'College of Engineering': Cpu,
  'College of Business Administration': Briefcase,
  'College of Science': FlaskConical,
  'College of Liberal Arts': BookOpen,
  'College of Education': GraduationCap,
  'College of Agriculture': Sprout,
  'College of Environmental Design': Building2,
};

export function AcademicsClient() {
  const colleges = Object.entries(collegesAndMajors);
  const totalMajors = colleges.reduce((sum, [, m]) => sum + m.length, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-[#1E5631] text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn>
            <p className="text-[#D4A017] font-semibold tracking-widest text-sm mb-2">ACADEMICS</p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl">
              Learn by doing across {colleges.length} colleges
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-xl">
              Explore {totalMajors}+ undergraduate majors at Cal Poly Pomona, built on our signature
              polytechnic, hands-on approach to education.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Colleges */}
      <section className="bg-[#F5F5F5] py-14">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-[#1E5631] text-center">Colleges & Majors</h2>
          <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">
            Browse our academic colleges and the degree programs offered within each.
          </p>
          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {colleges.map(([college, majors]) => {
              const Icon = collegeIcons[college] ?? BookOpen;
              return (
                <StaggerItem key={college}>
                  <HoverLift>
                    <Card className="border border-border h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-lg bg-[#1E5631]/10 flex items-center justify-center shrink-0">
                            <Icon className="w-6 h-6 text-[#1E5631]" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-[#1A1A1A] leading-tight">{college}</h3>
                            <p className="text-xs text-muted-foreground">{majors.length} majors</p>
                          </div>
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                          {majors.map((m) => (
                            <li key={m} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                              <ChevronRight className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-14">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-[#1E5631]">Find your program</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            You&apos;ll select your intended major during the Program Materials step of your application.
          </p>
          <Link href="/apply" className="mt-6 inline-block">
            <Button className="bg-[#D4A017] hover:bg-[#b8890f] text-white text-lg px-8 py-6 font-bold shadow-lg">
              Apply Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
