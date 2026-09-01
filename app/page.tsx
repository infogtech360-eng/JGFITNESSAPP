import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-5xl font-black tracking-tight">
          JG <span className="text-blue-600">IMPULSA</span>
        </h1>
        <p className="text-2xl font-semibold text-gray-800">
          EL ATLETA ES EL CENTRO.
        </p>
        <p className="max-w-xl text-gray-600">
          Acompañamiento integral donde el atleta es el centro y los datos
          permiten medir, comprender y mejorar su evolución.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            MENTAL
          </span>
          <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            EMOCIONAL
          </span>
          <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            TÁCTICO
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <a
          href="#"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Quiero impulsar a mi atleta
        </a>
        <a
          href="#"
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
        >
          Soy club / equipo
        </a>
      </div>

      <p className="mt-10 text-xs text-gray-400">
        MVP Fase 1 — plataforma en construcción
      </p>
    </main>
  );
}
