"use client";

import { useEffect, useMemo, useState } from "react";

type Ingredient = {
  id: string;
  name: string;
  pricePerUnit: string;
  unitSize: string;
};

type RecipeIngredient = {
  id: string;
  ingredientId: string;
  ingredientName: string | null;
  quantityUsed: string;
};

type Recipe = {
  id: string;
  name: string;
  baseOverhead: string;
  calculatedCost?: number;
  ingredients: RecipeIngredient[];
};

type IngredientEdit = {
  name: string;
  pricePerUnit: string;
  unitSize: string;
};

const emptyRecipeForm = {
  id: null as string | null,
  name: "",
  baseOverhead: "",
  ingredients: [{ ingredientId: "", quantityUsed: "" }],
};

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function RecipesPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredientForm, setIngredientForm] = useState({
    name: "",
    pricePerUnit: "",
    unitSize: "",
  });
  const [ingredientEdits, setIngredientEdits] = useState<
    Record<string, IngredientEdit>
  >({});
  const [recipeForm, setRecipeForm] = useState(emptyRecipeForm);
  const [savingIngredient, setSavingIngredient] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);

  const loadIngredients = async () => {
    const res = await fetch("/api/ingredients", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setIngredients(data);
    setIngredientEdits(
      Object.fromEntries(
        data.map((i: Ingredient) => [
          i.id,
          {
            name: i.name,
            pricePerUnit: String(i.pricePerUnit ?? ""),
            unitSize: i.unitSize,
          },
        ])
      )
    );
  };

  const loadRecipes = async () => {
    const res = await fetch("/api/recipes", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setRecipes(data);
  };

  useEffect(() => {
    void (async () => {
      await Promise.all([loadIngredients(), loadRecipes()]);
    })();
  }, []);

  const submitIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingIngredient(true);
    await fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...ingredientForm,
        pricePerUnit: Number(ingredientForm.pricePerUnit || 0),
      }),
    });
    setIngredientForm({ name: "", pricePerUnit: "", unitSize: "" });
    await loadIngredients();
    setSavingIngredient(false);
  };

  const updateIngredient = async (id: string) => {
    const edit = ingredientEdits[id];
    if (!edit) return;
    setSavingIngredient(true);
    await fetch("/api/ingredients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: edit.name,
        pricePerUnit: Number(edit.pricePerUnit || 0),
        unitSize: edit.unitSize,
      }),
    });
    await loadIngredients();
    await loadRecipes();
    setSavingIngredient(false);
  };

  const deleteIngredient = async (id: string) => {
    await fetch("/api/ingredients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadIngredients();
    await loadRecipes();
  };

  const addIngredientRow = () =>
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { ingredientId: "", quantityUsed: "" },
      ],
    }));

  const updateRecipeIngredient = (
    index: number,
    field: "ingredientId" | "quantityUsed",
    value: string
  ) =>
    setRecipeForm((prev) => {
      const next = [...prev.ingredients];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, ingredients: next };
    });

  const removeRecipeIngredient = (index: number) =>
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));

  const resetRecipeForm = () => setRecipeForm(emptyRecipeForm);

  const submitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRecipe(true);

    const payload = {
      name: recipeForm.name,
      baseOverhead: Number(recipeForm.baseOverhead || 0),
      ingredients: recipeForm.ingredients
        .filter((i) => i.ingredientId && i.quantityUsed)
        .map((i) => ({
          ingredientId: i.ingredientId,
          quantityUsed: Number(i.quantityUsed || 0),
        })),
    };

    const method = recipeForm.id ? "PATCH" : "POST";
    await fetch("/api/recipes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        recipeForm.id ? { id: recipeForm.id, ...payload } : payload
      ),
    });

    resetRecipeForm();
    await loadRecipes();
    setSavingRecipe(false);
  };

  const editRecipe = (recipe: Recipe) =>
    setRecipeForm({
      id: recipe.id,
      name: recipe.name,
      baseOverhead: String(recipe.baseOverhead ?? ""),
      ingredients:
        recipe.ingredients?.length > 0
          ? recipe.ingredients.map((ri) => ({
              ingredientId: ri.ingredientId,
              quantityUsed: String(ri.quantityUsed ?? ""),
            }))
          : [{ ingredientId: "", quantityUsed: "" }],
    });

  const deleteRecipe = async (id: string) => {
    await fetch("/api/recipes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (recipeForm.id === id) resetRecipeForm();
    await loadRecipes();
  };

  const recipeTitle = recipeForm.id ? "Update Recipe" : "Add Recipe";
  const recipeCta = savingRecipe
    ? "Saving..."
    : recipeForm.id
    ? "Save Changes"
    : "Create Recipe";

  const ingredientOptions = useMemo(
    () => ingredients.map((ing) => ({ value: ing.id, label: ing.name })),
    [ingredients]
  );

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Ingredients</h1>
          <span className="text-xs text-gray-500">Market price snapshots</span>
        </div>
        <form className="mt-3 space-y-3" onSubmit={submitIngredient}>
          <input
            value={ingredientForm.name}
            onChange={(e) =>
              setIngredientForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="Amul Butter"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={ingredientForm.pricePerUnit}
              onChange={(e) =>
                setIngredientForm((f) => ({
                  ...f,
                  pricePerUnit: e.target.value,
                }))
              }
              placeholder="Price (₹)"
              inputMode="decimal"
              className="rounded-lg border border-gray-200 px-3 py-2"
            />
            <input
              value={ingredientForm.unitSize}
              onChange={(e) =>
                setIngredientForm((f) => ({ ...f, unitSize: e.target.value }))
              }
              placeholder="Unit size (e.g., 1kg)"
              className="rounded-lg border border-gray-200 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={savingIngredient}
            className="w-full rounded-lg bg-emerald-600 py-2 text-white font-semibold shadow"
          >
            {savingIngredient ? "Saving..." : "Add Ingredient"}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {ing.name}
                </p>
                <button
                  onClick={() => deleteIngredient(ing.id)}
                  className="text-xs text-red-500 underline"
                >
                  Delete
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={ingredientEdits[ing.id]?.name ?? ing.name}
                  onChange={(e) =>
                    setIngredientEdits((prev) => ({
                      ...prev,
                      [ing.id]: {
                        ...(prev[ing.id] ?? {
                          name: ing.name,
                          pricePerUnit: String(ing.pricePerUnit),
                          unitSize: ing.unitSize,
                        }),
                        name: e.target.value,
                      },
                    }))
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={
                    ingredientEdits[ing.id]?.pricePerUnit ?? ing.pricePerUnit
                  }
                  onChange={(e) =>
                    setIngredientEdits((prev) => ({
                      ...prev,
                      [ing.id]: {
                        ...(prev[ing.id] ?? {
                          name: ing.name,
                          pricePerUnit: String(ing.pricePerUnit),
                          unitSize: ing.unitSize,
                        }),
                        pricePerUnit: e.target.value,
                      },
                    }))
                  }
                  inputMode="decimal"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={ingredientEdits[ing.id]?.unitSize ?? ing.unitSize}
                  onChange={(e) =>
                    setIngredientEdits((prev) => ({
                      ...prev,
                      [ing.id]: {
                        ...(prev[ing.id] ?? {
                          name: ing.name,
                          pricePerUnit: String(ing.pricePerUnit),
                          unitSize: ing.unitSize,
                        }),
                        unitSize: e.target.value,
                      },
                    }))
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {formatCurrency(ing.pricePerUnit)} · {ing.unitSize}
                </span>
                <button
                  onClick={() => updateIngredient(ing.id)}
                  disabled={savingIngredient}
                  className="rounded-full bg-gray-900 px-3 py-1 text-white"
                >
                  Update
                </button>
              </div>
            </div>
          ))}
          {ingredients.length === 0 ? (
            <p className="text-sm text-gray-500">No ingredients yet.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{recipeTitle}</h2>
          <button
            onClick={resetRecipeForm}
            className="text-xs text-gray-500 underline"
          >
            Clear
          </button>
        </div>
        <form className="mt-3 space-y-3" onSubmit={submitRecipe}>
          <input
            value={recipeForm.name}
            onChange={(e) =>
              setRecipeForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="Truffle Cake"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <input
            value={recipeForm.baseOverhead}
            onChange={(e) =>
              setRecipeForm((f) => ({ ...f, baseOverhead: e.target.value }))
            }
            placeholder="Gas/Electricity (₹)"
            inputMode="decimal"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />

          <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Ingredients</p>
              <button
                type="button"
                onClick={addIngredientRow}
                className="text-xs text-emerald-700 underline"
              >
                Add row
              </button>
            </div>
            {recipeForm.ingredients.map((item, idx) => (
              <div key={idx} className="grid grid-cols-7 gap-2">
                <select
                  value={item.ingredientId}
                  onChange={(e) =>
                    updateRecipeIngredient(idx, "ingredientId", e.target.value)
                  }
                  className="col-span-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {ingredientOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  value={item.quantityUsed}
                  onChange={(e) =>
                    updateRecipeIngredient(idx, "quantityUsed", e.target.value)
                  }
                  placeholder="Qty"
                  inputMode="decimal"
                  className="col-span-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeRecipeIngredient(idx)}
                  className="text-xs text-red-500 underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {recipeForm.ingredients.length === 0 ? (
              <p className="text-xs text-gray-500">No ingredients added.</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={savingRecipe}
            className="w-full rounded-lg bg-emerald-600 py-2 text-white font-semibold shadow"
          >
            {recipeCta}
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Recipes</h3>
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="space-y-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {recipe.name}
                </p>
                <p className="text-xs text-gray-500">
                  Base: {formatCurrency(recipe.baseOverhead)} · Cost Snapshot:{" "}
                  {formatCurrency(recipe.calculatedCost ?? 0)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editRecipe(recipe)}
                  className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRecipe(recipe.id)}
                  className="text-xs text-red-500 underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              {recipe.ingredients?.map((ri) => (
                <div key={ri.id} className="flex items-center justify-between">
                  <span>{ri.ingredientName ?? "Ingredient"}</span>
                  <span className="text-xs text-gray-500">
                    Qty: {ri.quantityUsed}
                  </span>
                </div>
              ))}
              {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                <p className="text-xs text-gray-500">No ingredients linked.</p>
              )}
            </div>
          </div>
        ))}
        {recipes.length === 0 ? (
          <p className="text-sm text-gray-500">No recipes yet.</p>
        ) : null}
      </section>
    </div>
  );
}
