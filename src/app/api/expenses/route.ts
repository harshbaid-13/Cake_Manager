import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db.select().from(expenses);
  const sorted = rows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { itemName, amount, category, date: expenseDate } = body;

  const [inserted] = await db
    .insert(expenses)
    .values({
      itemName,
      amount: amount?.toString(),
      category,
      date: expenseDate ?? new Date().toISOString().slice(0, 10),
    })
    .returning();

  return NextResponse.json(inserted);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await db.delete(expenses).where(eq(expenses.id, id));
  return NextResponse.json({ success: true });
}


