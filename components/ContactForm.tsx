"use client";

import { useState } from "react";

// Planes ofrecidos en la landing (sección #planes de app/page.tsx). Estos valores
// son la fuente de verdad para el dropdown; se guardan tal cual en public.leads.plan.
const PLANES = [
  { value: "Mensual $40/mes", label: "Mensual — $40/mes", detalle: "Seguimiento mensual, plan personalizado, soporte directo." },
  { value: "Trimestral $105 (3 meses)", label: "Trimestral — $105 / 3 meses ($35/mes)", detalle: "Seguimiento trimestral, revisión de progreso, soporte prioritario." },
  { value: "Anual $360/año", label: "Anual — $360/año ($30/mes)", detalle: "Seguimiento anual, métricas de evolución, soporte + reportes." },
  { value: "Club/Equipo", label: "Soy club / equipo", detalle: "Charlas, talleres y acompañamiento grupal (desde $150/sesión)." },
  { value: "Aún no lo sé", label: "Aún no lo sé", detalle: "Quiero más información antes de decidir." },
] as const;

// Formulario de contacto/lead de la landing ("Hablemos de tu atleta").
// Persiste el lead vía POST /api/contacto y muestra éxito/error visual al usuario.
export default function ContactForm() {
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // IMPORTANTE: capturar el <form> ANTES de cualquier await. En React, `e.currentTarget`
    // se pone a null en cuanto el handler async cede el control (después del primer await);
    // usarlo al final (e.currentTarget.reset()) disparaba un TypeError que caía al catch y
    // mostraba "No se pudo enviar..." aunque el POST ya hubiera funcionado (200 en servidor).
    const form = e.currentTarget;
    setLoading(true);
    setStatus(null);
    const fd = new FormData(form);
    const payload = {
      nombre: String(fd.get("nombre") ?? ""),
      email: String(fd.get("email") ?? ""),
      telefono: String(fd.get("telefono") ?? ""),
      interes: String(fd.get("interes") ?? ""),
      plan: String(fd.get("plan") ?? ""),
      mensaje: String(fd.get("mensaje") ?? ""),
    };
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setStatus({ ok: data.ok, message: data.message || data.error || "Error." });
      if (data.ok) form.reset();
    } catch {
      setStatus({ ok: false, message: "No se pudo enviar. Revisa tu conexión e intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-4 rounded-2xl border border-gray-200 bg-white p-8">
      {status && (
        <div
          className={`rounded-lg p-4 text-sm ${
            status.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}
      <input
        type="text"
        name="nombre"
        placeholder="Nombre completo"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="Correo electrónico"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
      />
      <input
        type="tel"
        name="telefono"
        placeholder="Teléfono / WhatsApp"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
      />

      {/* Plan de interés — selección explícita (obligatoria) */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          ¿Qué plan te interesa? <span className="text-blue-600">*</span>
        </label>
        <select
          name="plan"
          required
          defaultValue=""
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
        >
          <option value="" disabled>
            Selecciona un plan
          </option>
          {PLANES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400">
          Eliges el plan; el resto del acompañamiento se ajusta en una llamada.
        </p>
      </div>

      <select
        name="interes"
        defaultValue=""
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
      >
        <option value="" disabled>¿Qué te interesa?</option>
        <option>Impulsar a mi atleta</option>
        <option>Soy club / equipo</option>
        <option>Otro</option>
      </select>
      <textarea
        name="mensaje"
        rows={4}
        placeholder="Cuéntanos un poco más..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
