import { db } from "@/db";
import { ingredients, recipeIngredients, recipes } from "@/db/schema";
import { calculateRecipeCost } from "@/lib/calculations";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const allRecipes = await db.select().from(recipes);
  const links = await db
    .select({
      id: recipeIngredients.id,
      recipeId: recipeIngredients.recipeId,
      ingredientId: recipeIngredients.ingredientId,
      quantityUsed: recipeIngredients.quantityUsed,
      ingredientName: ingredients.name,
    })
    .from(recipeIngredients)
    .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id));

  const enriched = await Promise.all(
    allRecipes.map(async (recipe) => {
      const linked = links.filter((l) => l.recipeId === recipe.id);
      const cost = await calculateRecipeCost(recipe.id);
      return {
        ...recipe,
        calculatedCost: Number(cost.toFixed(2)),
        ingredients: linked.map((l) => ({
          id: l.id,
          ingredientId: l.ingredientId,
          ingredientName: l.ingredientName,
          quantityUsed: l.quantityUsed,
        })),
      };
    }),
  );

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, baseOverhead, ingredients: items } = body;

  const [recipe] = await db
    .insert(recipes)
    .values({
      name,
      baseOverhead: baseOverhead?.toString(),
    })
    .returning();

  if (items?.length) {
    await db.insert(recipeIngredients).values(
      items.map((item: any) => ({
        recipeId: recipe.id,
        ingredientId: item.ingredientId,
        quantityUsed: item.quantityUsed?.toString(),
      })),
    );
  }

  const cost = await calculateRecipeCost(recipe.id);
  return NextResponse.json({ ...recipe, calculatedCost: cost });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, name, baseOverhead, ingredients: items } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const [updated] = await db
    .update(recipes)
    .set({
      name,
      baseOverhead: baseOverhead?.toString(),
    })
    .where(eq(recipes.id, id))
    .returning();

  if (items) {
    await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
    if (items.length) {
      await db.insert(recipeIngredients).values(
        items.map((item: any) => ({
          recipeId: id,
          ingredientId: item.ingredientId,
          quantityUsed: item.quantityUsed?.toString(),
        })),
      );
    }
  }

  const cost = await calculateRecipeCost(id);
  return NextResponse.json({ ...updated, calculatedCost: cost });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
  await db.delete(recipes).where(eq(recipes.id, id));

  return NextResponse.json({ success: true });
}


