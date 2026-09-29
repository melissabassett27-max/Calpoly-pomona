import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const testHash = await bcrypt.hash('SQwrI#Xx5i', 12);
  await prisma.user.upsert({
    where: { email: 'abacus-c02d6e38@example.com' },
    update: {},
    create: {
      email: 'abacus-c02d6e38@example.com',
      passwordHash: testHash,
      firstName: 'Test',
      lastName: 'Admin',
    },
  });
  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
