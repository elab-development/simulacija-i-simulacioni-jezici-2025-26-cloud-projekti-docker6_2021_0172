/*import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromWalletId, toWalletId, amount, description, userId, date } = body;
    const transferAmount = parseFloat(amount);

    if (!fromWalletId || !toWalletId || !amount || !userId) {
      return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
    }

    if (fromWalletId === toWalletId) {
      return NextResponse.json({ error: "Ne možete slati novac na isti novčanik" }, { status: 400 });
    }

    // KORISTIMO TRANSAKCIJU BAZE
    const result = await prisma.$transaction(async (tx) => {
      // 1. Proveri IZVORNI novčanik
      const senderWallet = await tx.wallet.findUnique({ where: { id: parseInt(fromWalletId) } });
      if (!senderWallet || senderWallet.userId !== userId) throw new Error("Izvorni novčanik ne postoji.");
      if (parseFloat(senderWallet.balance.toString()) < transferAmount) throw new Error("Nemate dovoljno sredstava.");

      // 2. Proveri CILJNI novčanik (Da bismo mu uzeli IME)
      const receiverWallet = await tx.wallet.findUnique({ where: { id: parseInt(toWalletId) } });
      if (!receiverWallet) throw new Error("Ciljni novčanik ne postoji.");

      // 3. Skini sa izvornog
      await tx.wallet.update({
        where: { id: parseInt(fromWalletId) },
        data: { balance: { decrement: transferAmount } }
      });

      // 4. Dodaj na ciljni
      await tx.wallet.update({
        where: { id: parseInt(toWalletId) },
        data: { balance: { increment: transferAmount } }
      });

      // 5. Zabeleži transakciju (Sada koristimo IME novčanika)
      const transaction = await tx.transaction.create({
        data: {
          amount: transferAmount,
          type: "TRANSFER",
          // OVDE JE PROMENA: Koristimo receiverWallet.name
          description: description || `Prenos na ${receiverWallet.name}`, 
          date: new Date(date),
          walletId: parseInt(fromWalletId),
          categoryId: 1, // <--- O ovome ti pišem ispod
          userId: userId
        }
      });

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("Greška transfera:", error);
    return NextResponse.json({ error: error.message || "Greška na serveru" }, { status: 500 });
  }
}*/
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromWalletId, toWalletId, amount, description, userId, date } = body;
    const transferAmount = parseFloat(amount);

    if (!fromWalletId || !toWalletId || !amount || !userId) {
      return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
    }

    if (fromWalletId === toWalletId) {
      return NextResponse.json({ error: "Ne možete slati novac na isti novčanik" }, { status: 400 });
    }

    // koristimo transakciju baze
    const result = await prisma.$transaction(async (tx) => {
      
      // provera izvornog novcanika
      const senderWallet = await tx.wallet.findUnique({ where: { id: parseInt(fromWalletId) } });
      if (!senderWallet || senderWallet.userId !== userId) throw new Error("Izvorni novčanik ne postoji.");
      if (parseFloat(senderWallet.balance.toString()) < transferAmount) throw new Error("Nemate dovoljno sredstava.");

      // provera ciljnog novacnika
      const receiverWallet = await tx.wallet.findUnique({ where: { id: parseInt(toWalletId) } });
      if (!receiverWallet) throw new Error("Ciljni novčanik ne postoji.");

      // trazimo kategoriju transfer ili prenos
      let transferCategory = await tx.category.findFirst({
        where: { 
            name: { in: ["Transfer", "Prenos", "Interni prenos"] } 
        }
      });

      // ako ne postoji napravi je odmah
      if (!transferCategory) {
        transferCategory = await tx.category.create({
            data: {
                name: "Transfer",
                type: "EXPENSE", 
                userId: userId 
            }
        });
      }

      // skini sa izvornog
      await tx.wallet.update({
        where: { id: parseInt(fromWalletId) },
        data: { balance: { decrement: transferAmount } }
      });

      // dodaj na ciljni
      await tx.wallet.update({
        where: { id: parseInt(toWalletId) },
        data: { balance: { increment: transferAmount } }
      });

      // zabeleži transakciju
      const transaction = await tx.transaction.create({
        data: {
          amount: transferAmount,
          type: "TRANSFER", 
          description: description || `Prenos na ${receiverWallet.name}`, 
          date: new Date(date),
          walletId: parseInt(fromWalletId),
          categoryId: transferCategory.id, 
          userId: userId
        }
      });

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("Greška transfera:", error);
    return NextResponse.json({ error: error.message || "Greška na serveru" }, { status: 500 });
  }
}