"use client";

import { useEffect, useMemo, useState } from "react";

type Recipe = {
  id: string;
  name: string;
  calculatedCost?: number;
};

type Order = {
  id: string;
  customerName: string;
  description: string;
  dueDate: string;
  status: string;
  isPaid: boolean;
  quotedPrice: string;
  estimatedCost: string;
  recipeId: string | null;
};

export default function OrdersPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    description: "",
    dueDate: new Date().toISOString().slice(0, 16),
    quotedPrice: "",
    recipeId: "custom",
    estimatedCost: "",
  });

  const loadData = async () => {
    const [recipesRes, ordersRes] = await Promise.all([
      fetch("/api/recipes", { cache: "no-store" }),
      fetch("/api/orders", { cache: "no-store" }),
    ]);
    if (recipesRes.ok) setRecipes(await recipesRes.json());
    if (ordersRes.ok) setOrders(await ordersRes.json());
  };

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, []);

  const selectedRecipeCost = useMemo(() => {
    if (!form.recipeId || form.recipeId === "custom") return null;
    const recipe = recipes.find((r) => r.id === form.recipeId);
    return recipe?.calculatedCost ?? null;
  }, [form.recipeId, recipes]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quotedPrice: Number(form.quotedPrice),
        estimatedCost:
          form.recipeId === "custom"
            ? Number(form.estimatedCost || 0)
            : undefined,
      }),
    });
    setForm((prev) => ({
      ...prev,
      customerName: "",
      description: "",
      quotedPrice: "",
      estimatedCost: "",
    }));
    await loadData();
    setLoading(false);
  };

  const markDelivered = async (order: Order) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: "Delivered" }),
    });
    await loadData();
  };

  const togglePaid = async (order: Order) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, isPaid: !order.isPaid }),
    });
    await loadData();
  };

  const remove = async (id: string) => {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadData();
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">New Order</h1>
        <form className="mt-3 space-y-3" onSubmit={submit}>
          <input
            value={form.customerName}
            onChange={(e) =>
              setForm((f) => ({ ...f, customerName: e.target.value }))
            }
            placeholder="Customer name"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Order description"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <input
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, dueDate: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.recipeId}
              onChange={(e) =>
                setForm((f) => ({ ...f, recipeId: e.target.value }))
              }
              className="rounded-lg border border-gray-200 px-3 py-2"
            >
              <option value="custom">Custom Order</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <input
              value={form.quotedPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, quotedPrice: e.target.value }))
              }
              placeholder="Quoted price (₹)"
              inputMode="decimal"
              className="rounded-lg border border-gray-200 px-3 py-2"
            />
          </div>

          {form.recipeId === "custom" ? (
            <input
              value={form.estimatedCost}
              onChange={(e) =>
                setForm((f) => ({ ...f, estimatedCost: e.target.value }))
              }
              placeholder="Estimated cost (₹)"
              inputMode="decimal"
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          ) : (
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Snapshot cost will auto-save: ₹{selectedRecipeCost ?? 0}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2 text-white font-semibold shadow"
          >
            {loading ? "Saving..." : "Save Order"}
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Orders</h2>
        {orders.map((order) => (
          <div
            key={order.id}
            className="space-y-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{order.customerName}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.description}
                </p>
                <p className="text-xs text-gray-500">
                  Due {order.dueDate?.slice(0, 16).replace("T", " · ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  ₹{Number(order.quotedPrice).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">
                  Est: ₹{Number(order.estimatedCost).toFixed(0)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  order.status === "Delivered"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {order.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePaid(order)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    order.isPaid
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Unpaid"}
                </button>
                {order.status !== "Delivered" ? (
                  <button
                    onClick={() => markDelivered(order)}
                    className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Mark Delivered
                  </button>
                ) : null}
                <button
                  onClick={() => remove(order.id)}
                  className="text-xs text-red-500 underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : null}
      </section>
    </div>
  );
}
