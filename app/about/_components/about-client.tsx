'use client';

import Link from 'next/link';
import { ArrowRight, Phone, Mail, MapPin, Award, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FadeIn, SlideIn, Stagger, StaggerItem, HoverLift } from '@/components/ui/animate';

const facts = [
  { icon: Users, stat: '30,000+', label: 'Students' },
  { icon: BookOpen, stat: '90+', label: 'Undergraduate Majors' },
  { icon: Award, stat: '1938', label: 'Founded' },
];

export function AboutClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-[#1E5631] text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn>
            <p className="text-[#D4A017] font-semibold tracking-widest text-sm mb-2">ABOUT</p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl">
              About Cal Poly Pomona
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              Cal Poly Pomona is a nationally ranked public polytechnic university where students learn by doing.
              Our inclusive community empowers students from all backgrounds to become leaders in their fields.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Facts */}
      <section className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {facts.map((f) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={f.label}>
                  <Card className="border border-border text-center">
                    <CardContent className="p-8">
                      <Icon className="w-8 h-8 text-[#D4A017] mx-auto mb-3" />
                      <p className="font-display text-3xl font-extrabold text-[#1E5631]">{f.stat}</p>
                      <p className="text-muted-foreground mt-1">{f.label}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-[#F5F5F5] py-14">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <SlideIn from="left">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#1E5631]">Our Polytechnic Approach</h2>
              <p className="text-muted-foreground mt-4">
                For more than 85 years, Cal Poly Pomona has combined theory and practice through a hands-on,
                learn-by-doing philosophy. Students collaborate on real projects, conduct research alongside
                faculty, and graduate ready to make an immediate impact.
              </p>
              <p className="text-muted-foreground mt-4">
                As one of the most diverse universities in the nation, we are committed to student success and
                to expanding opportunity for every Bronco.
              </p>
            </div>
          </SlideIn>
          <SlideIn from="right">
            <Card className="border-0 bg-[#245E36] text-white">
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold">Contact Admissions</h3>
                <p className="text-white/85 mt-2">Questions about applying? Our team is here to help.</p>
                <div className="mt-6 space-y-4">
                  <a href="tel:+19162908848" className="flex items-center gap-3 hover:text-[#D4A017] transition-colors">
                    <Phone className="w-5 h-5 text-[#D4A017] shrink-0" />
                    <span suppressHydrationWarning>+1 916-290-8848</span>
                  </a>
                  <a href="mailto:cristinachen.cpp.edu@gmail.com" className="flex items-center gap-3 hover:text-[#D4A017] transition-colors break-all">
                    <Mail className="w-5 h-5 text-[#D4A017] shrink-0" />
                    <span suppressHydrationWarning>cristinachen.cpp.edu@gmail.com</span>
                  </a>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#D4A017] shrink-0 mt-0.5" />
                    <span>3801 W. Temple Ave<br />Pomona, CA 91768</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-14">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-[#1E5631]">Join the Bronco family</h2>
          <p className="text-muted-foreground mt-2">Take the first step toward your future at Cal Poly Pomona.</p>
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
