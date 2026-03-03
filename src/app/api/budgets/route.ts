import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: vraca listu budzeta sa izracunatom funkcijom za sledeci mesec
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Nedostaje userId" }, { status: 400 });
    }

    // odredjujemo pocetak i kraj trenutnog meseca
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // ucitaj budzete korisnika
    const budgets = await prisma.budget.findMany({
      where: { userId: Number(userId) },
      include: { category: true } // da vidimo ime kategorije
    });

    // za svaki budzet izracunava koliko je vec potroseno
    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
      
      const spentAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId: Number(userId),
          type: "EXPENSE",
          date: {
            gte: startOfMonth, // Od prvog u mesecu
            lte: endOfMonth    // Do kraja meseca
          },
          // Ako je budzet za specificnu kategoriju, filtriraj po njoj,
          // ako je budget.categoryId null, to znaci "Ukupan budzet" (sve kategorije).
          ...(budget.categoryId ? { categoryId: budget.categoryId } : {})
        }
      });

      const spent = Number(spentAgg._sum.amount || 0);
      const limit = Number(budget.amount);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      return {
        ...budget,
        spent,       // Koliko je potroseno
        remaining: limit - spent, // Koliko je ostalo
        percentage   // Procenat za progress bar
      };
    }));

    return NextResponse.json(budgetsWithSpent);

  } catch (error) {
    console.error("Greška pri učitavanju budžeta:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}

// POST: Kreira novi budzet
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, categoryId, userId } = body;

    if (!amount || !userId) {
      return NextResponse.json({ error: "Iznos i korisnik su obavezni" }, { status: 400 });
    }

    // Provera da li vec posto budzet za tu kategoriju
    const existingBudget = await prisma.budget.findFirst({
        where: {
            userId: Number(userId),
            categoryId: categoryId ? Number(categoryId) : null // null znači ukupan budzet
        }
    });

    if (existingBudget) {
        return NextResponse.json({ error: "Budžet za ovu kategoriju već postoji." }, { status: 400 });
    }

    const newBudget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        period: "monthly", // Podrazumevano
        userId: Number(userId),
        categoryId: categoryId ? Number(categoryId) : null
      }
    });

    return NextResponse.json(newBudget, { status: 201 });

  } catch (error) {
    console.error("Greška pri kreiranju budžeta:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}