import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Koristimo onaj tvoj singleton
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    // citamo podatke koje je korisnik poslao
    const body = await req.json();
    const { email, name, password } = body;

    // provera da li su sva polja tu
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: 'Nedostaju podaci (email, ime ili lozinka)' },
        { status: 400 }
      );
    }

    // provera da li email već postoji u bazi
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Korisnik sa ovim email-om već postoji!' },
        { status: 409 } // 409 Conflict
      );
    }

    // hesovanje lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // upis u bazu
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER', // po defaultu je obican korisnik
      },
    });

    // vracamo uspeh bez slanja lozinke nazad
    return NextResponse.json(
      { message: 'Uspešna registracija!', user: { email: newUser.email, name: newUser.name } },
      { status: 201 }
    );

  } catch (error) {
    console.error('Greška pri registraciji:', error);
    return NextResponse.json(
      { message: 'Došlo je do greške na serveru.' },
      { status: 500 }
    );
  }
}