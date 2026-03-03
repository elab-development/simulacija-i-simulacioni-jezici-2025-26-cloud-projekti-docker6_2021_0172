const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function napraviAdmina() {
  try {
    const rezultat = await prisma.user.updateMany({
      data: { role: 'ADMIN' }
    });
    console.log(`🎉 USPEH! Broj korisnika koji su upravo dobili ADMIN prava: ${rezultat.count}`);
  } catch (error) {
    console.error("Desila se greška:", error);
  } finally {
    await prisma.$disconnect();
  }
}

napraviAdmina();