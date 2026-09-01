"use client";

import { useState } from "react";
import { saveGuardian, type OnboardingResult } from "@/lib/actions/onboarding";

const RELACIONES = ["Padre", "Madre", "Tutor legal", "Familiar", "Encargado"];

export default function OnboardingTutorForm() {
  const [status, setStatus] = useState<OnboardingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const res = await saveGuardian(fd);
    setStatus(res);
    if (res.ok) return; // redirige
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && !status.ok && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{status.error}</div>
      )}

      {/* Datos del tutor */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-gray-900">Datos del tutor</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
            <input name="nombre" required className="input" placeholder="Nombre" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Apellido *</label>
            <input name="apellido" required className="input" placeholder="Apellido" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Relación con el atleta</label>
            <select name="relacion" className="input">
              <option value="">Selecciona...</option>
              {RELACIONES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
            <input name="telefono" className="input" placeholder="+507 ..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Documento (ID)</label>
            <input name="documento" className="input" placeholder="Cédula o pasaporte" />
          </div>
        </div>
      </fieldset>

      {/* Datos del atleta a cargo */}
      <fieldset className="space-y-4 rounded-xl bg-gray-50 p-5">
        <legend className="text-sm font-bold text-gray-900">Atleta a tu cargo</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del atleta *</label>
            <input name="atleta_nombre" required className="input" placeholder="Nombre" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Apellido del atleta *</label>
            <input name="atleta_apellido" required className="input" placeholder="Apellido" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Deporte</label>
            <input name="atleta_deporte" className="input" placeholder="p.ej. Fútbol" />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Como tutor legal, podrás dar seguimiento al perfil y a los consentimientos del atleta.
        </p>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar y vincular atleta"}
      </button>
    </form>
  );
}
