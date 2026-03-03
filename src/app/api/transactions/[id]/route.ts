import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const transactionId = parseInt(params.id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ error: "Nevalidan ID" }, { status: 400 });
    }

    // prvo moramo naci transakciju da vidimo koliko je para i koji je tip
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true } // Treba nam i novcanik da azuriramo stanje
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transakcija ne postoji" }, { status: 404 });
    }

    if (transaction.type === "TRANSFER") {
      return NextResponse.json(
        { error: "Transferi se ne mogu brisati. Napravite kontra-transakciju." }, 
        { status: 400 }
      );
    }

    // koristimo transakciju baze, sve ili nista
    await prisma.$transaction(async (tx) => {
      
      if (transaction.type === "EXPENSE") {
        // ako brisemo trosak pare se vracaju u novcanik
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: transaction.amount } }
        });
      } else if (transaction.type === "INCOME") {
        // ako brisemo prihod pare se oduzimaju iz novcanika
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { decrement: transaction.amount } }
        });
      }

      // brisemo zapis
      await tx.transaction.delete({
        where: { id: transactionId }
      });
    });

    return NextResponse.json({ message: "Transakcija uspešno obrisana i saldo ažuriran." }, { status: 200 });

  } catch (error) {
    console.error("Greška pri brisanju transakcije:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}