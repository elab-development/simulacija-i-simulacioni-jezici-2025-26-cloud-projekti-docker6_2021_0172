import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    
    const idString = params.id;
    const budgetId = parseInt(idString);

    console.log("🗑️ Pokušavam brisanje budžeta ID:", budgetId);

    if (isNaN(budgetId)) {
      return NextResponse.json({ error: "Nevalidan ID" }, { status: 400 });
    }

    // Provera da li postoji pre brisanja
    const exists = await prisma.budget.findUnique({ where: { id: budgetId } });
    if (!exists) {
      return NextResponse.json({ error: "Budžet ne postoji" }, { status: 404 });
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    console.log("✅ Uspešno obrisan budžet ID:", budgetId);
    return NextResponse.json({ message: "Budžet obrisan" }, { status: 200 });

  } catch (error) {
    console.error("❌ Greška pri brisanju:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}