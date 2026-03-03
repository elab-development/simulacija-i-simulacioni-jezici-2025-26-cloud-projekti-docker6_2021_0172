import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);

    // prvo provera da li je sistemska
    const category = await prisma.category.findUnique({ where: { id } });
    
    if (!category) return NextResponse.json({ error: "Nema je" }, { status: 404 });
    if (!category.isSystem) return NextResponse.json({ error: "Možete brisati samo sistemske kategorije" }, { status: 403 });

    
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Obrisano" });

  } catch (error) {
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}