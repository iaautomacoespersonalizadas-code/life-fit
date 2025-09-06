// life-fit/api/hooks.js
export default async function handler(req, res) {
  const origin = req.headers.origin || '*';

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-app-key');
    return res.status(204).end(); // sem corpo
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Auth por cabeçalho simples
  const apiKey = req.headers['x-app-key'] || '';
  if (apiKey !== process.env.APP_KEY) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    return res.status(401).json({ error: 'unauthorized' });
  }

  // Encaminha para o Webhook do n8n
  const r = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body || {}),
  });

  const data = await r.json().catch(() => ({}));
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  return res.status(r.status).json(data);
}

