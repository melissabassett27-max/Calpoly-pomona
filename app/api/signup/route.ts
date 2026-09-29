export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase().trim(), passwordHash, firstName, lastName },
    });
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Signup failed' }, { status: 500 });
  }
}
