'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Home,
  Users,
  Trophy,
  Utensils,
  Leaf,
  HeartHandshake,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FadeIn, Stagger, StaggerItem, HoverLift, SlideIn } from '@/components/ui/animate';

const highlights = [
  { icon: Home, title: 'On-Campus Housing', desc: 'Modern residence halls and University Village apartments create a close-knit living-learning community steps from class.' },
  { icon: Users, title: 'Clubs & Organizations', desc: 'Hundreds of student clubs, cultural organizations, and professional societies help you find your community.' },
  { icon: Trophy, title: 'Bronco Athletics', desc: 'Cheer on our NCAA Division II teams and stay active through intramural and recreational sports.' },
  { icon: Utensils, title: 'Dining', desc: 'Diverse dining options across campus, including the acclaimed programs run by our Collins College of Hospitality Management.' },
  { icon: Leaf, title: 'A Green, Scenic Campus', desc: 'Explore 1,400+ acres including the historic Rose Garden, arboretum, and working farm at the heart of campus.' },
  { icon: HeartHandshake, title: 'Student Support', desc: 'Advising, wellness, career services, and tutoring resources support you throughout your Bronco journey.' },
];

export function CampusLifeClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-[#1E5631] text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn>
            <p className="text-[#D4A017] font-semibold tracking-widest text-sm mb-2">CAMPUS LIFE</p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl">
              Life as a Bronco
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-xl">
              From residence halls and dining to clubs, athletics, and one of the most beautiful campuses in
              Southern California — there&apos;s always something happening at Cal Poly Pomona.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-[#F5F5F5] py-14">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-[#1E5631] text-center">Explore Campus Life</h2>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <StaggerItem key={h.title}>
                  <HoverLift>
                    <Card className="border border-border h-full">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-[#1E5631]/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-[#1E5631]" />
                        </div>
                        <h3 className="font-display font-bold text-[#1A1A1A]">{h.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{h.desc}</p>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white py-14">
        <div className="max-w-[1200px] mx-auto px-4">
          <SlideIn from="left">
            <Card className="border-0 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-[#245E36] text-white p-8 md:p-10">
                  <MapPin className="w-8 h-8 text-[#D4A017] mb-3" />
                  <h3 className="font-display text-2xl font-bold">Where We Are</h3>
                  <p className="mt-3 text-white/90">
                    Cal Poly Pomona sits in the heart of Southern California, offering easy access to the
                    region&apos;s vibrant industries, internships, and cultural experiences.
                  </p>
                  <p className="mt-4 font-semibold">3801 W. Temple Ave<br />Pomona, CA 91768</p>
                </div>
                <div className="bg-[#F5F5F5] p-8 md:p-10 flex flex-col justify-center">
                  <h3 className="font-display text-xl font-bold text-[#1E5631]">Plan a Visit</h3>
                  <p className="text-muted-foreground mt-2">
                    Experience the campus firsthand. Prospective students and families are encouraged to explore
                    our grounds, meet current Broncos, and picture themselves here.
                  </p>
                  <Link href="/apply" className="mt-5 inline-block">
                    <Button className="bg-[#D4A017] hover:bg-[#b8890f] text-white font-bold">
                      Start Your Application <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </SlideIn>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
