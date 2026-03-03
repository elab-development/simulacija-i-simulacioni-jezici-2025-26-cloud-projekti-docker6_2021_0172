import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // provera da li vec imamo kategorije
    const count = await prisma.category.count();
    
    if (count > 0) {
      return NextResponse.json({ message: 'Kategorije već postoje! Nema potrebe za dodavanjem.' });
    }

    // ako je baza prazna, ubaci ove kategorije
    await prisma.category.createMany({
      data: [
        { name: 'Plata', type: 'INCOME' },
        { name: 'Bonus', type: 'INCOME' },
        { name: 'Hrana', type: 'EXPENSE' },
        { name: 'Računi', type: 'EXPENSE' },
        { name: 'Prevoz', type: 'EXPENSE' },
        { name: 'Zabava', type: 'EXPENSE' },
        { name: 'Odeća', type: 'EXPENSE' },
        { name: 'Zdravlje', type: 'EXPENSE' },
      ]
    });

    return NextResponse.json({ message: '✅ USPEH! Kategorije su upisane u bazu.' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Došlo je do greške pri upisu.' }, { status: 500 });
  }
}