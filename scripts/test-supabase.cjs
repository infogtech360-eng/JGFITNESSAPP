// Test de conexión a Supabase usando la SDK oficial
// Lee .env.local manualmente (sin dotenv) y prueba la conexión real
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const txt = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const env = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', url);
console.log('ANON len:', anon ? anon.length : 'MISSING');

if (!url || !anon) { console.log('FALTAN variables'); process.exit(1); }

const supabase = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  // 1. Llamada REST a tabla "users" (no debe existir si aún no migramos)
  const { data, error } = await supabase.from('users').select('id').limit(1);
  if (error) {
    console.log('SELECT users →', error.code, '|', error.message);
    if (error.code === '42P01') {
      console.log('✅ CONEXIÓN Y KEY VÁLIDAS: la tabla no existe (esperado, falta migrar)');
    } else {
      console.log('⚠️ código inesperado (revisar conectividad/key)');
    }
  } else {
    console.log('SELECT users → OK, rows:', data.length);
  }

  // 2. Auth: probar envío de OTP con correo de prueba
  const { data: otp, error: otpErr } = await supabase.auth.signInWithOtp({
    email: 'test@jgimpulsa.com',
    options: { shouldCreateUser: true },
  });
  if (otpErr) {
    console.log('signInWithOtp →', otpErr.status, otpErr.message);
  } else {
    console.log('✅ signInWithOtp OK: se envió magic link a test@jgimpulsa.com');
  }
})();
