import {
  boolean,
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const ingredients = pgTable("ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }).notNull(),
  unitSize: text("unit_size").notNull(),
});

export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  baseOverhead: numeric("base_overhead", { precision: 12, scale: 2 }).notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  ingredientId: uuid("ingredient_id")
    .notNull()
    .references(() => ingredients.id, { onDelete: "cascade" }),
  quantityUsed: numeric("quantity_used", { precision: 12, scale: 3 }).notNull(),
});

export const workSessions = pgTable("work_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  startTime: timestamp("start_time", { mode: "string" }).notNull(),
  endTime: timestamp("end_time", { mode: "string" }),
  date: date("date").notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  itemName: text("item_name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: text("customer_name").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date", { mode: "string" }).notNull(),
  status: text("status").default("Pending").notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  quotedPrice: numeric("quoted_price", { precision: 12, scale: 2 }).notNull(),
  estimatedCost: numeric("estimated_cost", { precision: 12, scale: 2 }).notNull(),
  recipeId: uuid("recipe_id").references(() => recipes.id, { onDelete: "set null" }),
});


