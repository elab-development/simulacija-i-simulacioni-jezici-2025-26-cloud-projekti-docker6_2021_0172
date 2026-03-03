const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Ova SQL komanda ručno dodaje kolonu u MySQL tabelu
    await prisma.$executeRawUnsafe(`
      ALTER TABLE User 
      ADD COLUMN isBlocked BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log("✅ Uspešno dodata kolona 'isBlocked'!");
  } catch (e) {
    console.error("❌ Greška (možda kolona već postoji):", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();