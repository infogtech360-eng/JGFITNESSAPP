"use client";

import { useState } from "react";
import PhotoUpload, { type PhotoFile } from "@/components/PhotoUpload";
import { saveAthleteProfile, type OnboardingResult } from "@/lib/actions/onboarding";

const DEPORTES = ["Fútbol", "Baloncesto", "Voleibol", "Béisbol", "Tenis", "Natación", "Atletismo", "Boxeo", "Otro"];

export default function OnboardingAthleteForm() {
  const [status, setStatus] = useState<OnboardingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const res = await saveAthleteProfile(fd);
    setStatus(res);
    if (res.ok) return; // redirige vía server action
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && !status.ok && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{status.error}</div>
      )}

      {/* Identidad */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-gray-900">Datos personales</legend>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
            <input name="fecha_nacimiento" type="date" className="input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">País</label>
            <input name="pais" className="input" placeholder="Panamá" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ciudad</label>
            <input name="ciudad" className="input" placeholder="Ciudad" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Correo</label>
            <input name="correo" type="email" className="input" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
            <input name="telefono" className="input" placeholder="+507 ..." />
          </div>
        </div>
      </fieldset>

      {/* Deporte */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-gray-900">Datos deportivos</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Deporte</label>
            <select name="deporte" className="input">
              <option value="">Selecciona...</option>
              {DEPORTES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Posición</label>
            <input name="posicion" className="input" placeholder="Posición" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
            <input name="categoria" className="input" placeholder="Sub-15, Juvenil..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Equipo</label>
            <input name="equipo" className="input" placeholder="Nombre del equipo" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pierna/Mano dominante</label>
            <select name="pierna_mano_dominante" className="input">
              <option value="">Selecciona...</option>
              <option>Derecha</option>
              <option>Izquierda</option>
              <option>Ambidiestro/a</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Altura (m)</label>
              <input name="altura" type="number" step="0.01" className="input" placeholder="1.75" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input name="peso" type="number" step="0.1" className="input" placeholder="70" />
            </div>
          </div>
        </div>
      </fieldset>

      {/* Horarios */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-gray-900">Horarios</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Horario escolar</label>
            <input name="horario_escolar" className="input" placeholder="p.ej. 7:30–13:00" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Horario de entrenamiento</label>
            <input name="horario_entrenamiento" className="input" placeholder="p.ej. 16:00–18:00" />
          </div>
        </div>
      </fieldset>

      {/* Objetivos */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-gray-900">Objetivos y motivación</legend>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Objetivo principal</label>
          <input name="objetivo" className="input" placeholder="¿Qué quieres lograr?" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">¿Qué quieres mejorar?</label>
          <textarea name="que_quiere_mejorar" rows={2} className="input" placeholder="Tu área de mejora prioritaria..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">¿Qué hábito quieres cambiar?</label>
          <textarea name="habito_a_cambiar" rows={2} className="input" placeholder="p.ej. dormir mejor, manejar la ansiedad..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sueño deportivo</label>
          <textarea name="sueno_deportivo" rows={2} className="input" placeholder="¿Cuál es tu gran meta deportiva?" />
        </div>
      </fieldset>

      {/* Fotos */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-bold text-gray-900">Fotos (máx. 3)</legend>
        <PhotoUpload onChange={setPhotos} />
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar y continuar"}
      </button>
    </form>
  );
}
