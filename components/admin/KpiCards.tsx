import type { Kpis } from "@/lib/data/dashboard";

// Tarjetas rápidas de métricas (KPIs) del panel admin.
type Props = { kpis: Kpis };

export function KpiCards({ kpis }: Props) {
  const cards = [
    {
      label: "Total Leads",
      value: kpis.totalLeads,
      icon: "🎯",
      accent: "bg-blue-50 text-blue-700 ring-blue-200",
    },
    {
      label: "Leads Hoy",
      value: kpis.leadsHoy,
      icon: "🕐",
      accent: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    {
      label: "Plan Preferido",
      value: kpis.planPreferido,
      icon: "💎",
      accent: "bg-violet-50 text-violet-700 ring-violet-200",
      big: true,
    },
    {
      label: "Atletas Activos",
      value: kpis.atletasActivos,
      icon: "🏅",
      accent: "bg-green-50 text-green-700 ring-green-200",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {c.label}
            </p>
            <span className="text-lg">{c.icon}</span>
          </div>
          <p
            className={`mt-2 truncate text-3xl font-black ${
              (c as { big?: boolean }).big ? "text-xl leading-tight" : ""
            }`}
            title={typeof c.value === "string" ? c.value : undefined}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
