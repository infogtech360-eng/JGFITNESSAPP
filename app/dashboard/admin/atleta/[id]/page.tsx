import { createClient } from "@/lib/supabase/server";
import { SeccionNutricionAtleta } from "@/components/admin/SeccionNutricionAtleta";
import Link from "next/link";

export default async function PerfilAtletaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const atletaId = resolvedParams.id;
  const supabase = await createClient();

  // Consultar los datos reales del atleta en Supabase
  const { data: atleta } = await supabase
    .from("atletas")
    .select("*")
    .eq("id", atletaId)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/dashboard/admin?vista=atletas"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Volver al listado de atletas
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-gray-900">
            {atleta ? atleta.nombre : "Perfil del Atleta"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Deporte: <span className="font-medium text-gray-700">{atleta?.deporte || "No asignado"}</span> | 
            Categoría: <span className="font-medium text-gray-700">{atleta?.categoria || "No asignada"}</span>
          </p>
        </div>

        <SeccionNutricionAtleta atletaId={atletaId} />
      </div>
    </div>
  );
}