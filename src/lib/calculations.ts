import { db } from "@/db";
import {
  expenses,
  orders,
  recipeIngredients,
  recipes,
  workSessions,
  ingredients,
} from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

type NumericLike = string | number | null;

const toNumber = (value: NumericLike) => Number(value ?? 0);

export const calculateRecipeCost = async (recipeId: string) => {
  const [recipe] = await db
    .select({ baseOverhead: recipes.baseOverhead })
    .from(recipes)
    .where(eq(recipes.id, recipeId));

  if (!recipe) throw new Error("Recipe not found");

  const rows = await db
    .select({
      pricePerUnit: ingredients.pricePerUnit,
      quantityUsed: recipeIngredients.quantityUsed,
    })
    .from(recipeIngredients)
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipeIngredients.recipeId, recipeId));

  const ingredientCost = rows.reduce(
    (sum, row) => sum + toNumber(row.pricePerUnit) * toNumber(row.quantityUsed),
    0,
  );

  return ingredientCost + toNumber(recipe.baseOverhead);
};

export const getActiveSession = async () => {
  const [session] = await db
    .select()
    .from(workSessions)
    .where(isNull(workSessions.endTime))
    .limit(1);

  return session ?? null;
};

export type DashboardMetrics = {
  revenue: number;
  expenses: number;
  netProfit: number;
  hoursWorked: number;
  effectiveHourlyRate: number;
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const allOrders = await db.select().from(orders);
  const allExpenses = await db.select().from(expenses);
  const sessions = await db.select().from(workSessions);

  const revenue = allOrders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + toNumber(o.quotedPrice), 0);

  const totalExpenses = allExpenses.reduce(
    (sum, e) => sum + toNumber(e.amount),
    0,
  );

  const hoursWorked = sessions.reduce((total, session) => {
    if (!session.endTime) return total;
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const diffMs = end.getTime() - start.getTime();
    return total + diffMs / (1000 * 60 * 60);
  }, 0);

  const netProfit = revenue - totalExpenses;
  const effectiveHourlyRate =
    hoursWorked > 0 ? Number((netProfit / hoursWorked).toFixed(2)) : 0;

  return {
    revenue: Number(revenue.toFixed(2)),
    expenses: Number(totalExpenses.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    hoursWorked: Number(hoursWorked.toFixed(2)),
    effectiveHourlyRate,
  };
};


