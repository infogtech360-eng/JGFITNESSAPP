import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// POST /api/contacto — Persiste un lead/contacto de la landing ("Hablemos de tu atleta").
// El service-role hace el insert con privilegios de servicio (la policy de la tabla leads
// también lo permite). El cliente del navegador NO tiene las claves de servicio.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  const nombre = String(body.nombre ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const telefono = String(body.telefono ?? "").trim();
  const interes = String(body.interes ?? "").trim();
  const mensaje = String(body.mensaje ?? "").trim();

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Ingresa tu correo electrónico." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "El correo no tiene un formato válido." },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  const { error } = await service.from("leads").insert({
    nombre: nombre || null,
    email,
    telefono: telefono || null,
    interes: interes || null,
    mensaje: mensaje || null,
  });

  if (error) {
    console.error("[api/contacto] insert error:", error.message);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar tu mensaje. Intenta de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto.",
  });
}
