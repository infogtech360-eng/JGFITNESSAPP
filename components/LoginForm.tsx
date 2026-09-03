"use client";

import { useState } from "react";
import { signInWithOtp, verifyOtp, type AuthResult } from "@/lib/actions/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"email" | "otp">("email");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<AuthResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("rol", "atleta");
    const res = await signInWithOtp(fd);
    setStatus(res);
    setLoading(false);
    if (res.ok) setMode("otp");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("token", token);
    const res = await verifyOtp(fd);
    setStatus(res);
    setLoading(false);
    if (res.ok) {
      // Destino por rol (admin → /dashboard/admin; resto del servidor devuelve redirectTo).
      window.location.href = res.redirectTo ?? "/onboarding";
    }
  };

  return (
    <div className="w-full max-w-md">
      {status?.ok && mode === "otp" && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {status.message}
        </div>
      )}
      {status && !status.ok && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {status.error}
        </div>
      )}

      {mode === "email" ? (
        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
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
            {loading ? "Enviando..." : "Enviar enlace de acceso (Magic Link)"}
          </button>
          <p className="text-center text-xs text-gray-400">
            Te enviaremos un enlace de acceso seguro por correo. Sin contraseñas.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Código de verificación
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Código de 6 dígitos"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
            <p className="mt-1 text-xs text-gray-400">
              Revisa el correo <b>{email}</b> para el código o enlace.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar y continuar"}
          </button>
          <button
            type="button"
            onClick={() => setMode("email")}
            className="w-full text-center text-sm text-blue-600 hover:underline"
          >
            ← Cambiar correo
          </button>
        </form>
      )}
    </div>
  );
}
