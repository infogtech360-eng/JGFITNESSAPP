import Link from "next/link";

export default function OnboardingIndexPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-black text-white">
          Elige tu <span className="text-blue-500">camino</span>
        </h1>
        <p className="mt-2 text-gray-400">¿Cómo quieres comenzar tu acompañamiento?</p>
        <div className="mt-8 space-y-4">
          <Link
            href="/onboarding/atleta"
            className="block rounded-2xl border-2 border-blue-600 bg-white p-6 text-left transition hover:bg-blue-50"
          >
            <span className="text-2xl">🏃</span>
            <span className="mt-2 block text-lg font-bold text-gray-900">Soy atleta</span>
            <span className="block text-sm text-gray-500">
              Complementa mi perfil deportivo y personal.
            </span>
          </Link>
          <Link
            href="/onboarding/tutor"
            className="block rounded-2xl border-2 border-gray-700 bg-gray-900 p-6 text-left transition hover:bg-gray-800"
          >
            <span className="text-2xl">👨‍👩‍👧</span>
            <span className="mt-2 block text-lg font-bold text-white">Soy tutor / padre</span>
            <span className="block text-sm text-gray-400">
              Acompaño a un atleta y vinculo su perfil.
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
