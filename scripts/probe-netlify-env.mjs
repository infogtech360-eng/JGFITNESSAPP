// Netlify env vars - sondeo de endpoints/métodos correctos
const T = 'nfp_Nqoi65M4T9NFAXxM3sXfLkoFnKsJ9Sqod874';
const SITE = 'c29d4e1f-853b-4bbd-85a9-cfb44901e12a';
const B = 'https://api.netlify.com/api/v1';
const URL_VAL = 'https://ynjzroeuccaocbmmymyy.supabase.co';

async function probe(name, path, method, body) {
  try {
    const res = await fetch(B + path, {
      method, body: body ? JSON.stringify(body) : undefined,
      headers: { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' },
    });
    const text = await res.text();
    console.log(`${name} → HTTP ${res.status} | ${text.slice(0, 200)}`);
  } catch (e) { console.log(`${name} → ERR ${e.message}`); }
}

// Variante 1: PUT site env con body {key, values, contexts}
await probe('PUT /sites/:id/env/URL (values)', `/sites/${SITE}/env/NEXT_PUBLIC_SUPABASE_URL`, 'PUT',
  { key: 'NEXT_PUBLIC_SUPABASE_URL', values: [{ context: 'all', value: URL_VAL }] });

// Variante 2: POST site env (crear) con body variado
await probe('POST /sites/:id/env (values)', `/sites/${SITE}/env`, 'POST',
  { key: 'NEXT_PUBLIC_SUPABASE_URL', values: [{ context: 'all', value: URL_VAL }] });

// Variante 3: PUT site env con "value" plano (formato v1 legacy)
await probe('PUT /sites/:id/env/URL (value plano)', `/sites/${SITE}/env/NEXT_PUBLIC_SUPABASE_URL`, 'PUT',
  { key: 'NEXT_PUBLIC_SUPABASE_URL', value: URL_VAL });

// Variante 4: POST con "scopes" + "contexts"
await probe('POST /sites/:id/env (contexts)', `/sites/${SITE}/env`, 'POST',
  { key: 'NEXT_PUBLIC_SUPABASE_URL', scopes: ['builds', 'functions', 'runtime'], contexts: ['production'] });

// Variante 5: PATCH a cuenta pero usando /sites env collection? probar POST con array
await probe('POST /sites/:id/env (array 1)', `/sites/${SITE}/env`, 'POST',
  [{ key: 'NEXT_PUBLIC_SUPABASE_URL', values: [{ context: 'all', value: URL_VAL }] }]);

console.log('\n=== GET final para confirmar ===');
try {
  const r = await fetch(`${B}/sites/${SITE}/env`, { headers: { Authorization: 'Bearer ' + T } });
  const j = await r.json();
  console.log('GET site env:', r.status, '| total:', Array.isArray(j) ? j.length : 'n/a');
} catch (e) { console.log('GET err', e.message); }
