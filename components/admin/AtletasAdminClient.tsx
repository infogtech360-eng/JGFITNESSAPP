"use client";
import { useState } from "react";

export function SeccionNutricionAtleta({ atletaId }: { atletaId: string }) {
  const [calorias, setCalorias] = useState("");
  const [objetivoNutri, setObjetivoNutri] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardarPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    const res = await fetch("/api/nutricion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atleta_id: atletaId, calorias, objetivo: objetivoNutri }),
    });
    setGuardando(false);
    if (res.ok) alert("Plan alimenticio actualizado correctamente.");
  };

  return (
    <form onSubmit={guardarPlan} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mt-4">
      <h3 className="text-lg font-black text-gray-900 mb-4">🥗 Plan Nutricional y Deportivo</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Calorías Diarias Objetivo</label>
          <input
            type="number"
            value={calorias}
            onChange={(e) => setCalorias(e.target.value)}
            placeholder="Ej. 2500 kcal"
            className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Enfoque Nutricional</label>
          <input
            type="text"
            value={objetivoNutri}
            onChange={(e) => setObjetivoNutri(e.target.value)}
            placeholder="Ej. Definición / Ganancia muscular"
            className="mt-1 w-full rounded-xl border border-gray-300 p-2.5 text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={guardando}
        className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
      >
        {guardando ? "Guardando..." : "Asignar Plan Nutricional"}
      </button>
    </form>
  );
}