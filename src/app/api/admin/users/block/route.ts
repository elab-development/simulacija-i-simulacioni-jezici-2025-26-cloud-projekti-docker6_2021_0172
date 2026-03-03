import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, isBlocked } = body;

    // provera podataka
    if (!userId) {
      return NextResponse.json({ error: "Nedostaje userId" }, { status: 400 });
    }

    // azuriranje podataka
    const updatedUser = await prisma.user.update({
      where: { 
        id: Number(userId)
      },
      data: { 
        isBlocked: isBlocked 
      } 
    });

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error("Greška pri blokiranju:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}