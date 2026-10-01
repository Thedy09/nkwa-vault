const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Administrateur Nkwa';

  if (!adminEmail || !adminPassword) {
    console.log('Seed ignoré: ADMIN_EMAIL et ADMIN_PASSWORD non définis.');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      name: adminName,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    },
    create: {
      email: adminEmail.toLowerCase(),
      name: adminName,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    }
  });

  console.log(`Admin seed OK: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error('Erreur seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
