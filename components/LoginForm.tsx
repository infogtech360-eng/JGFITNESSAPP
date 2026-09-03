"use client";

import { useState } from "react";
import { signInWithPassword, type AuthResult } from "@/lib/actions/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AuthResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    const res = await signInWithPassword(fd);
    setStatus(res);
    setPassword("");
    setLoading(false);
    if (res.ok) {
      // Destino por rol (admin/gestor → /dashboard/admin; el resto lo devuelve el servidor).
      window.location.href = res.redirectTo ?? "/dashboard";
    }
  };

  return (
    <div className="w-full max-w-md">
      {status?.ok && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          Sesión iniciada. Redirigiendo...
        </div>
      )}
      {status && !status.ok && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
        <p className="text-center text-xs text-gray-400">
          Acceso seguro con correo y contraseña.
        </p>
      </form>
    </div>
  );
}
