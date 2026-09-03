"use client";

import { useState } from "react";

// Formulario de contacto de la landing ("Hablemos de tu atleta").
// Persiste el lead vía POST /api/contacto y muestra éxito/error visual al usuario.
export default function ContactForm() {
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      nombre: String(fd.get("nombre") ?? ""),
      email: String(fd.get("email") ?? ""),
      telefono: String(fd.get("telefono") ?? ""),
      interes: String(fd.get("interes") ?? ""),
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
      if (data.ok) e.currentTarget.reset();
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
