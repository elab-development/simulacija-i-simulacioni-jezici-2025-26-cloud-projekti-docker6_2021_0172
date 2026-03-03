import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

// get metoda
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
    }

    const wallets = await prisma.wallet.findMany({
      where: {
        userId: parseInt(userId),
      },
    });

    return NextResponse.json(wallets, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Greška prilikom dovlačenja novčanika" },
      { status: 500 }
    );
  }
}

// kreiramo novcanik za odredjenog korisnika
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, balance, currency, userId } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Podaci nisu kompletni" },
        { status: 400 }
      );
    }

    const newWallet = await prisma.wallet.create({
      data: {
        name,
        balance: balance || 0,
        currency: currency || "RSD",
        userId: parseInt(userId),
      },
    });

    return NextResponse.json(newWallet, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Greška prilikom kreiranja novčanika" },
      { status: 500 }
    );
  }
}


// delete funkcija
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID je obavezan" }, { status: 400 });
    }

    await prisma.wallet.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ message: "Obrisano uspešno" }, { status: 200 });
  } catch (error) {
    console.error("Greška pri brisanju:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}

