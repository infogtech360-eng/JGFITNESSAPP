import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-2xl font-black tracking-tight text-white">
          JG <span className="text-blue-500">IMPULSA</span>
        </Link>
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-center text-2xl font-black text-gray-900">Iniciar sesión</h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Accede con tu correo y contraseña.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Nuevo atleta o tutor?{" "}
          <Link href="/registro" className="font-semibold text-blue-400 hover:underline">
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
