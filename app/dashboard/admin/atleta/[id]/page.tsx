import { SeccionNutricionAtleta } from "@/components/admin/SeccionNutricionAtleta";

export default async function PerfilAtletaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const atletaId = resolvedParams.id;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-black text-gray-900">Perfil del Atleta</h1>
        <p className="mt-2 text-sm text-gray-500">ID: {atletaId}</p>

        {/* Aquí integramos tu componente de nutrición */}
        <div className="mt-8">
          <SeccionNutricionAtleta atletaId={atletaId} />
        </div>
      </div>
    </div>
  );
}