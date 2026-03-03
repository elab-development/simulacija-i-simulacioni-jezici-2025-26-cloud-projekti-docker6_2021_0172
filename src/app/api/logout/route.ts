import { NextResponse } from "next/server";
export async function POST() {
    return NextResponse.json({ message: "Uspesno odjavljen" }, { status: 200 });
}