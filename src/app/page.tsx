import { SessionTimer } from "@/components/SessionTimer";
import { getDashboardMetrics } from "@/lib/calculations";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default async function Home() {
  const metrics = await getDashboardMetrics();

  const cards = [
    { label: "Revenue (Delivered)", value: formatCurrency(metrics.revenue) },
    { label: "Expenses", value: formatCurrency(metrics.expenses) },
    { label: "Net Profit", value: formatCurrency(metrics.netProfit) },
    {
      label: "Hours Worked",
      value: `${metrics.hoursWorked}h (${formatCurrency(
        metrics.effectiveHourlyRate
      )}/hr)`,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <SessionTimer />

      {/* <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Workflow</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add expenses right after shopping, start/stop kitchen sessions while
          baking, and create orders with either standard recipes or custom
          costing.
        </p>
      </section> */}
    </div>
  );
}
