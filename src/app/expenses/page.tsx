'use client';

import { useEffect, useState } from "react";

type Expense = {
  id: string;
  date: string;
  itemName: string;
  amount: string;
  category: string;
};

const categories = ["Raw Material", "Packaging", "Gas", "Other"];

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    itemName: "",
    amount: "",
    category: categories[0],
  });

  const load = async () => {
    const res = await fetch("/api/expenses", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });
    setForm((prev) => ({ ...prev, itemName: "", amount: "" }));
    await load();
    setLoading(false);
  };

  const remove = async (id: string) => {
    await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Add Expense</h1>
        <form className="mt-3 space-y-3" onSubmit={submit}>
          <div className="flex gap-2">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-1/2 rounded-lg border border-gray-200 px-3 py-2"
            />
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-1/2 rounded-lg border border-gray-200 px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <input
            value={form.itemName}
            onChange={(e) =>
              setForm((f) => ({ ...f, itemName: e.target.value }))
            }
            placeholder="Maida & Sugar"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <input
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: e.target.value }))
            }
            placeholder="₹450"
            inputMode="decimal"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2 text-white font-semibold shadow"
          >
            {loading ? "Saving..." : "Add Expense"}
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Recent Expenses</h2>
        {items.map((exp) => (
          <div
            key={exp.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-semibold text-gray-900">{exp.itemName}</p>
              <p className="text-xs text-gray-500">
                {exp.date} · {exp.category}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-gray-900">
                ₹{Number(exp.amount).toFixed(0)}
              </p>
              <button
                onClick={() => remove(exp.id)}
                className="text-xs text-red-500 underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No expenses yet.</p>
        ) : null}
      </section>
    </div>
  );
}


