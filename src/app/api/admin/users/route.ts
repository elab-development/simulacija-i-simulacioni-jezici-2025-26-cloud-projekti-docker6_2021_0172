import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie || !userIdCookie.value) {
        return NextResponse.json({ error: "Neautorizovan pristup." }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: parseInt(userIdCookie.value) }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: "Zabranjen pristup. Niste administrator." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true, 
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}