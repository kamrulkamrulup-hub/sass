
// @ts-ignore - Fixing PrismaClient import error in this environment
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");
  
  const workspace1 = await (prisma as any).workspace.upsert({
    where: { slug: 'opspilot' },
    update: {},
    create: {
      id: 'w1',
      name: 'OpsPilot HQ',
      slug: 'opspilot',
    },
  });

  const workspace2 = await (prisma as any).workspace.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      id: 'w2',
      name: 'Acme Corp Ops',
      slug: 'acme',
    },
  });

  const adminEmail = 'admin@opspilot.com';
  const hashedPassword = await bcrypt.hash('password', 10);

  const admin = await (prisma as any).user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashedPassword },
    create: {
      id: 'u1',
      email: adminEmail,
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'OWNER',
    },
  });

  // Ensure membership exists
  await (prisma as any).membership.upsert({
    where: { id: 'm1' }, 
    update: { role: 'OWNER' },
    create: {
      id: 'm1',
      userId: admin.id,
      workspaceId: workspace1.id,
      role: 'OWNER'
    }
  });

  console.log('Seed completed successfully. Admin created with password: password');
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await (prisma as any).$disconnect();
  });
