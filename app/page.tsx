import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="text-2xl font-black tracking-tight">
            JG <span className="text-blue-600">IMPULSA</span>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-gray-700 md:flex">
            <a href="#mision" className="hover:text-blue-600">Misión</a>
            <a href="#pilares" className="hover:text-blue-600">Pilares</a>
            <a href="#planes" className="hover:text-blue-600">Planes</a>
            <a href="#clubes" className="hover:text-blue-600">Clubes</a>
            <a href="#contacto" className="hover:text-blue-600">Contacto</a>
          </nav>
          <a
            href="#contacto"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Quiero impulsar
          </a>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-blue-400">
              Acompañamiento integral para atletas
            </p>
            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              EL ATLETA ES EL <span className="text-blue-500">CENTRO.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-300">
              No buscamos solamente mejores jugadores. Buscamos formar atletas
              preparados para competir, crecer y perseguir sus sueños sin perder
              sus valores, su propósito y su fe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-gray-800 px-5 py-2 text-sm font-semibold">
                🧠 MENTAL
              </span>
              <span className="rounded-full bg-gray-800 px-5 py-2 text-sm font-semibold">
                ❤️ EMOCIONAL
              </span>
              <span className="rounded-full bg-gray-800 px-5 py-2 text-sm font-semibold">
                ⚔️ TÁCTICO
              </span>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#planes"
                className="rounded-lg bg-blue-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Quiero impulsar a mi atleta
              </a>
              <a
                href="#clubes"
                className="rounded-lg border border-gray-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                Soy club / equipo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISIÓN / VISIÓN / VALORES ===== */}
      <section id="mision" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-black md:text-4xl">
          Nuestra <span className="text-blue-600">identidad</span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-7">
            <div className="mb-3 text-3xl">🎯</div>
            <h3 className="text-xl font-bold">Misión</h3>
            <p className="mt-2 text-gray-600">
              Acompañar integralmente al atleta —en lo mental, emocional y
              táctico— usando datos para medir, comprender y potenciar su
              evolución, sin perder su propósito y sus valores.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-7">
            <div className="mb-3 text-3xl">🔭</div>
            <h3 className="text-xl font-bold">Visión</h3>
            <p className="mt-2 text-gray-600">
              Ser la plataforma de referencia en el desarrollo integral de
              atletas, formando personas preparadas para competir en el deporte
              y en la vida.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-7">
            <div className="mb-3 text-3xl">💎</div>
            <h3 className="text-xl font-bold">Valores</h3>
            <p className="mt-2 text-gray-600">
              Fe, propósito, disciplina, integridad, excelencia y compromiso.
              Creemos que el atleta se forma en lo deportivo y en lo humano.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-gray-950 p-8 text-center text-white">
          <p className="text-2xl font-bold">
            🙏 Dios como fundamento
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-gray-300">
            Nuestro acompañamiento se sostiene en la fe: ayudamos a cada atleta
            a perseguir sus sueños sin perder sus valores, su propósito y su fe.
          </p>
        </div>
      </section>

      {/* ===== PILARES ===== */}
      <section id="pilares" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-black md:text-4xl">
            Tres pilares, <span className="text-blue-600">un solo atleta</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            El desarrollo integral se apoya en lo mental, lo emocional y lo
            táctico, con capas complementarias de acompañamiento.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="mb-3 text-3xl">🧠</div>
              <h3 className="text-xl font-bold">Mental</h3>
              <p className="mt-2 text-gray-600">
                Fortalecer la mente competitiva: concentración, confianza,
                manejo de la presión y preparación precompetitiva.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="mb-3 text-3xl">❤️</div>
              <h3 className="text-xl font-bold">Emocional</h3>
              <p className="mt-2 text-gray-600">
                Gestionar emociones, energía y estrés para rendir con equilibrio
                dentro y fuera del terreno.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="mb-3 text-3xl">⚔️</div>
              <h3 className="text-xl font-bold">Táctico</h3>
              <p className="mt-2 text-gray-600">
                Leer el juego, tomar mejores decisiones y ejecutar con
                inteligencia en la competencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLANES ===== */}
      <section id="planes" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-black md:text-4xl">
          Planes de <span className="text-blue-600">acompañamiento</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
          Acompañamiento individual con seguimiento personalizado. Equivalencias
          mensuales más bajas a mayor compromiso.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-7 text-center">
            <h3 className="text-lg font-bold">Mensual</h3>
            <p className="mt-3 text-4xl font-black">$40<span className="text-base font-medium text-gray-500">/mes</span></p>
            <ul className="mt-5 space-y-2 text-sm text-gray-600">
              <li>Seguimiento mensual</li>
              <li>Plan personalizado</li>
              <li>Soporte directo</li>
            </ul>
            <a href="#contacto" className="mt-6 block rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
              Empezar
            </a>
          </div>
          <div className="rounded-2xl border-2 border-blue-600 p-7 text-center shadow-lg">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">MÁS POPULAR</span>
            <h3 className="mt-3 text-lg font-bold">Trimestral</h3>
            <p className="mt-3 text-4xl font-black">$105<span className="text-base font-medium text-gray-500">/3 meses</span></p>
            <p className="mt-1 text-sm text-gray-500">equivalente a $35/mes</p>
            <ul className="mt-5 space-y-2 text-sm text-gray-600">
              <li>Seguimiento trimestral</li>
              <li>Plan + revisión de progreso</li>
              <li>Soporte prioritario</li>
            </ul>
            <a href="#contacto" className="mt-6 block rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
              Empezar
            </a>
          </div>
          <div className="rounded-2xl border border-gray-200 p-7 text-center">
            <h3 className="text-lg font-bold">Anual</h3>
            <p className="mt-3 text-4xl font-black">$360<span className="text-base font-medium text-gray-500">/año</span></p>
            <p className="mt-1 text-sm text-gray-500">equivalente a $30/mes</p>
            <ul className="mt-5 space-y-2 text-sm text-gray-600">
              <li>Seguimiento anual completo</li>
              <li>Métricas de evolución</li>
              <li>Soporte prioritario + reportes</li>
            </ul>
            <a href="#contacto" className="mt-6 block rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
              Empezar
            </a>
          </div>
        </div>
      </section>

      {/* ===== CLUBES ===== */}
      <section id="clubes" className="bg-gray-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-black md:text-4xl">
            Para <span className="text-blue-500">clubes y equipos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-300">
            Acompañamiento grupal, charlas, integración mental y talleres con
            seguimiento y métricas agregadas.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-900 p-7">
              <h3 className="text-xl font-bold">Sesión de 2 horas</h3>
              <p className="mt-2 text-4xl font-black text-blue-500">desde $150</p>
              <p className="mt-3 text-gray-400">Por sesión para diagnóstico o taller puntual.</p>
            </div>
            <div className="rounded-2xl bg-gray-900 p-7">
              <h3 className="text-xl font-bold">Acompañamiento mensual</h3>
              <p className="mt-2 text-4xl font-black text-blue-500">desde $500</p>
              <p className="mt-3 text-gray-400">
                Ajustable por número de atletas, frecuencia y alcance.
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <a
              href="#contacto"
              className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Soy club / equipo
            </a>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIOS ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-black md:text-4xl">
          Historias que <span className="text-blue-600">impulsan</span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { q: "El acompañamiento mental cambió mi forma de afrontar las competencias.", n: "Atleta · Fútbol", p: "p" },
            { q: "Ahora entiendo el juego de otra forma, tomo mejores decisiones en cancha.", n: "Atleta · Baloncesto", p: "p" },
            { q: "Como padre, ver el progreso y la evolución de mi hijo con datos es increíble.", n: "Tutor de atleta", p: "p" },
          ].map((t, i) => (
            <figure key={i} className="rounded-2xl border border-gray-200 p-7">
              <blockquote className="text-gray-700">“{t.q}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-gray-500">{t.n}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          Testimonios ilustrativos de resultados formativos; no garantizan resultados individuales.
        </p>
      </section>

      {/* ===== CONTACTO ===== */}
      <section id="contacto" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="text-center text-3xl font-black md:text-4xl">
            Hablemos de <span className="text-blue-600">tu atleta</span>
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Déjanos tus datos y te contactamos para armar el plan adecuado.
          </p>
          <form className="mt-10 space-y-4 rounded-2xl border border-gray-200 bg-white p-8">
            <input
              type="text"
              placeholder="Nombre completo"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
            <input
              type="tel"
              placeholder="Teléfono / WhatsApp"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
              defaultValue=""
            >
              <option value="" disabled>¿Qué te interesa?</option>
              <option>Impulsar a mi atleta</option>
              <option>Soy club / equipo</option>
              <option>Otro</option>
            </select>
            <textarea
              rows={4}
              placeholder="Cuéntanos un poco más..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Enviar
            </button>
          </form>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} JG IMPULSA — EL ATLETA ES EL CENTRO.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Formamos atletas preparados para competir, crecer y perseguir sus sueños
          sin perder sus valores, su propósito y su fe.
        </p>
      </footer>
    </main>
  );
}
