"use client";

import { useMemo } from "react";

type MensajeDiario = {
  versiculo: string;
  cita: string;
  motivacion: string;
  recordatorio: string;
};

/**
 * Rotación de versículos de fortaleza y enfoque + frase de disciplina deportiva.
 * El recordatorio de hidratación/electrolitos y plan nutricional es transversal.
 */
const MENSAJES_DIARIOS: MensajeDiario[] = [
  {
    versiculo: "Todo lo puedo en Cristo que me fortalece.",
    cita: "Filipenses 4:13",
    motivacion:
      "Cree en ti: mantén la disciplina en cada entrenamiento y no negocies tu esfuerzo.",
    recordatorio:
      "💧 Toma tus electrolitos hoy y sigue tu plan nutricional al pie de la letra.",
  },
  {
    versiculo:
      "Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo, porque Jehová tu Dios estará contigo dondequiera que vayas.",
    cita: "Josué 1:9",
    motivacion:
      "El éxito es la suma de pequeños esfuerzos repetidos día tras día. Confía en tu proceso.",
    recordatorio:
      "⚡ No olvides tus electrolitos ni tus comidas del plan de hoy.",
  },
  {
    versiculo:
      "Mas los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.",
    cita: "Isaías 40:31",
    motivacion:
      "Cree en ti: la constancia vence al talento cuando el talento no es constante.",
    recordatorio:
      "🍎 Hidrátate bien, cumple tus macros y mantén la disciplina hoy.",
  },
  {
    versiculo:
      "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
    cita: "Mateo 6:33",
    motivacion:
      "Tu mentalidad define tu destino en la cancha. Sé implacable con tus metas.",
    recordatorio:
      "💧 Electrolitos + plan nutricional: dos cosas que no se negocian hoy.",
  },
  {
    versiculo:
      "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.",
    cita: "Isaías 41:10",
    motivacion:
      "Cree en ti: cada repetición, cada gota de sudor, te acerca a tu mejor versión.",
    recordatorio:
      "⚡ Rehidrátate con electrolitos y respeta tus porciones del plan.",
  },
  {
    versiculo:
      "Jehová es mi fortaleza y mi escudo; en él confió mi corazón.",
    cita: "Salmos 28:7",
    motivacion:
      "La disciplina es el puente entre tus metas y tus logros. Cruza con fe.",
    recordatorio:
      "💧 Sin excusas: electrolitos, agua y tu plan nutricional completo hoy.",
  },
  {
    versiculo:
      "He aquí, yo os doy potestad... esforzaos, y él os dará fuerzas al corazón.",
    cita: "Salmos 138:3",
    motivacion:
      "Cree en ti: los campeones se hacen en los días que no quieres entrenar.",
    recordatorio:
      "🍌 Come limpio, hidrátate con electrolitos y sigue tu plan al detalle.",
  },
  {
    versiculo:
      "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.",
    cita: "2 Timoteo 1:7",
    motivacion:
      "El autocontrol es tu arma secreta. Domina tu mente y el cuerpo te seguirá.",
    recordatorio:
      "⚡ Electrolitos y dieta hoy: tu rendimiento mañana empieza en tu plato.",
  },
  {
    versiculo:
      "Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.",
    cita: "Proverbios 16:3",
    motivacion:
      "Cree en ti: la excelencia no es un acto, es un hábito diario.",
    recordatorio:
      "💧 Hidratación con electrolitos + plan nutricional. Hoy, sin fallar.",
  },
  {
    versiculo:
      "Fortalécete y esfuérzate, porque tú darás a este pueblo posesión de la tierra.",
    cita: "Josué 1:6",
    motivacion:
      "Sé implacable con tus metas: lo difícil es lo que te hace distinto.",
    recordatorio:
      "🍎 Tu plan nutricional es parte del entrenamiento. Cúmplelo hoy.",
  },
  {
    versiculo:
      "El camino del justo es como la luz de la aurora, que va en aumento hasta que el día es perfecto.",
    cita: "Proverbios 4:18",
    motivacion:
      "Cree en ti: progresa cada día, aunque sea un uno por ciento más.",
    recordatorio:
      "⚡ Electrolitos y dieta: la recuperación es donde ganas los partidos.",
  },
  {
    versiculo:
      "Bendito el varón que confía en Jehová, y cuya confianza es Jehová.",
    cita: "Jeremías 17:7",
    motivacion:
      "La confianza se entrena igual que el músculo. Repítela todos los días.",
    recordatorio:
      "💧 No arranques sin tus electrolitos ni sin seguir tu plan de comidas.",
  },
  {
    versiculo:
      "Oh Jehová, Señor nuestro, cuán grande es tu nombre en toda la tierra.",
    cita: "Salmos 8:1",
    motivacion:
      "Cree en ti: entrena con propósito y competirás con gratitud.",
    recordatorio:
      "🍎 Macros en orden, electrolitos al día y tu plan nutricional cumplido.",
  },
  {
    versiculo:
      "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes.",
    cita: "Josué 1:9",
    motivacion:
      "Ser valiente también es levantarse cuando no tienes ganas de entrenar.",
    recordatorio:
      "⚡ La disciplina incluye el agua con electrolitos y tu dieta de hoy.",
  },
  {
    versiculo:
      "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.",
    cita: "Salmos 46:1",
    motivacion:
      "Cree en ti: la fe y la disciplina juntas son imbatibles.",
    recordatorio:
      "💧 Cierra el día con electrolitos y tu plan nutricional respetado.",
  },
  {
    versiculo:
      "Corramos con paciencia la carrera que tenemos por delante, puestos los ojos en Jesús.",
    cita: "Hebreos 12:1-2",
    motivacion:
      "El talento sin constancia no llega a la meta. Corre con disciplina.",
    recordatorio:
      "⚡ Hidratación con electrolitos + plan nutricional: tu base para rendir.",
  },
];

/**
 * Índice del mensaje según el día del año (1-366), estable durante todo el día
 * y sin depender de base de datos ni de la hora exacta.
 */
function getIndiceDelDia(fecha: Date = new Date()): number {
  const inicioAno = Date.UTC(fecha.getFullYear(), 0, 1);
  const hoy = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const diaDelAno = Math.floor((hoy - inicioAno) / 86_400_000); // 0-based
  return diaDelAno % MENSAJES_DIARIOS.length;
}

export default function DailyMotivationCard() {
  // Rotación automática cada 24 horas basada en el día del año.
  const mensajeDelDia = useMemo(() => MENSAJES_DIARIOS[getIndiceDelDia()], []);

  return (
    <section
      aria-label="Motivación y disciplina diaria"
      className="relative overflow-hidden rounded-2xl border border-[#C8A24B]/40 bg-gradient-to-br from-[#0B1F3A] via-[#0F2C55] to-[#0B1F3A] p-6 text-white shadow-xl"
    >
      {/* Halo decorativo dorado/azul */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C8A24B]/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center justify-between border-b border-[#C8A24B]/30 pb-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E4C87A]">
            ⚡ Motivación y Disciplina Diaria
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-200/80">
            JG-IMPULSA
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <blockquote className="border-l-2 border-[#C8A24B] pl-4">
            <p className="text-base font-medium italic leading-relaxed text-blue-50">
              &ldquo;{mensajeDelDia.versiculo}&rdquo;
            </p>
            <cite className="mt-1 block text-xs font-semibold not-italic uppercase tracking-wider text-[#E4C87A]">
              — {mensajeDelDia.cita}
            </cite>
          </blockquote>

          <p className="text-sm font-semibold text-white">
            💪 Cree en ti: {mensajeDelDia.motivacion}
          </p>

          <div className="mt-2 flex items-start gap-3 rounded-xl border border-[#C8A24B]/40 bg-white/5 p-3.5">
            <span className="text-lg leading-none">🥤</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#E4C87A]">
                Hidratación · Electrolitos · Plan Nutricional
              </p>
              <p className="mt-1 text-xs font-semibold text-yellow-200">
                {mensajeDelDia.recordatorio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
