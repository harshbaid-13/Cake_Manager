import { db } from "@/db";
import { orders } from "@/db/schema";
import { calculateRecipeCost } from "@/lib/calculations";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db.select().from(orders);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    customerName,
    description,
    dueDate,
    quotedPrice,
    recipeId,
    estimatedCost,
    status = "Pending",
    isPaid = false,
  } = body;

  const cost =
    recipeId && recipeId !== "custom"
      ? await calculateRecipeCost(recipeId)
      : Number(estimatedCost ?? 0);

  const [order] = await db
    .insert(orders)
    .values({
      customerName,
      description,
      dueDate,
      status,
      isPaid,
      quotedPrice: quotedPrice?.toString(),
      estimatedCost: cost.toString(),
      recipeId: recipeId === "custom" ? null : recipeId,
    })
    .returning();

  return NextResponse.json(order);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let computedCost = updates.estimatedCost;
  if (updates.recipeId && updates.recipeId !== "custom") {
    computedCost = await calculateRecipeCost(updates.recipeId);
  }

  const [updated] = await db
    .update(orders)
    .set({
      customerName: updates.customerName,
      description: updates.description,
      dueDate: updates.dueDate,
      status: updates.status,
      isPaid: updates.isPaid,
      quotedPrice: updates.quotedPrice?.toString(),
      estimatedCost: computedCost?.toString(),
      recipeId: updates.recipeId === "custom" ? null : updates.recipeId,
    })
    .where(eq(orders.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(orders).where(eq(orders.id, id));
  return NextResponse.json({ success: true });
}


