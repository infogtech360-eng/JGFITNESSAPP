"use client";

import { useState } from "react";
import { signInWithOtp, type AuthResult } from "@/lib/actions/auth";

export default function RegisterForm() {
  const [rol, setRol] = useState<"atleta" | "tutor">("atleta");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("rol", rol);
    const res = await signInWithOtp(fd);
    setStatus(res);
    setLoading(false);
    if (res.ok) {
      window.location.href = "/onboarding";
    }
  };

  return (
    <div className="space-y-6">
      {status && !status.ok && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{status.error}</div>
      )}
      {status?.ok && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{status.message}</div>
      )}

      {/* Selector de rol */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Soy...</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRol("atleta")}
            className={`rounded-xl border-2 p-4 text-left transition ${
              rol === "atleta"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="block text-xl">🏃</span>
            <span className="mt-1 block text-sm font-bold text-gray-900">Atleta</span>
            <span className="block text-xs text-gray-500">Entreno y quiero impulsar mi rendimiento.</span>
          </button>
          <button
            type="button"
            onClick={() => setRol("tutor")}
            className={`rounded-xl border-2 p-4 text-left transition ${
              rol === "tutor"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="block text-xl">👨‍👩‍👧</span>
            <span className="mt-1 block text-sm font-bold text-gray-900">Tutor / Padre</span>
            <span className="block text-xs text-gray-500">Acompaño a un atleta (hijo/a, menor a mi cargo).</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear cuenta y recibir enlace"}
        </button>
        <p className="text-center text-xs text-gray-400">
          Te enviaremos un enlace seguro por correo para empezar tu onboarding.
        </p>
      </form>
    </div>
  );
}
