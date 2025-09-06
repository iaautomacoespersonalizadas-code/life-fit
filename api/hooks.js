// life-fit/api/hooks.js
export default async function handler(req, res) {
  // pega a origem do navegador para CORS (ou usa '*' em último caso)
  const origin = req.headers.origin || '*';

  // 1) CORS preflight (quando o navegador manda OPTIONS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-app-key');
    return res.status(204).end(); // sem corpo
  }

  // 2) Só aceitamos POST
  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // 3) Autenticação simples via header
  const apiKey = req.headers['x-app-key'] || '';
  if (apiKey !== process.env.APP_KEY) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    return res.status(401).json({ error: 'unauthorized' });
  }

  // 4) Encaminha para o Webhook do n8n
  try {
    const r = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    });

    const data = await r.json().catch(() => ({}));

    // >>> AQUI É O "NO FIM DO HANDLER" QUE EU CITEI <<<
    // Antes de dar o return, setamos os headers de CORS da resposta final:
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');

    return res.status(r.status).json(data);
  } catch (e) {
    // Em erro, também devolvemos com CORS habilitado
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    return res.status(500).json({ error: 'proxy_error', detail: String(e) });
  }
}
