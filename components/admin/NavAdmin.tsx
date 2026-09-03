import Link from "next/link";

// Navegación "pro" del panel admin: barra superior fija de marca + pestañas de sección.
// Inyectable en cada vista admin vía query ?vista=overview|leads|atletas.

type Props = {
  rol: string;
  activa: "overview" | "leads" | "atletas";
};

const secciones = [
  { key: "overview", label: "Visión general", icon: "📊", link: "/dashboard/admin?vista=overview" },
  { key: "leads", label: "Prospectos", icon: "🎯", link: "/dashboard/admin?vista=leads" },
  { key: "atletas", label: "Atletas", icon: "🏅", link: "/dashboard/admin?vista=atletas" },
] as const;

export function NavAdmin({ rol, activa }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight text-gray-900">
          JG <span className="text-blue-600">IMPULSA</span>
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Admin
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            Mi panel
          </Link>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700 ring-1 ring-blue-200">
            {rol}
          </span>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <nav className="mx-auto max-w-7xl px-4">
        <div className="flex gap-1 overflow-x-auto">
          {secciones.map((s) => {
            const activo = activa === s.key;
            return (
              <Link
                key={s.key}
                href={s.link}
                className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
                  activo
                    ? "border-b-2 border-blue-600 text-blue-700"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <span className="mr-1.5">{s.icon}</span>
                {s.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
