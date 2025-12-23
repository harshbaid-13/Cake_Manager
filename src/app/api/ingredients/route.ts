import { db } from "@/db";
import { ingredients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db.select().from(ingredients);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, pricePerUnit, unitSize } = body;
  const [inserted] = await db
    .insert(ingredients)
    .values({
      name,
      pricePerUnit: pricePerUnit?.toString(),
      unitSize,
    })
    .returning();

  return NextResponse.json(inserted);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const [updated] = await db
    .update(ingredients)
    .set({
      name: updates.name,
      pricePerUnit: updates.pricePerUnit?.toString(),
      unitSize: updates.unitSize,
    })
    .where(eq(ingredients.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await db.delete(ingredients).where(eq(ingredients.id, id));
  return NextResponse.json({ success: true });
}


