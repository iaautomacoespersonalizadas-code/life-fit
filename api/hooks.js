export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = req.headers['x-app-key'];
  if (apiKey !== process.env.APP_KEY) return res.status(401).json({ error: 'unauthorized' });

  const r = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });
  const data = await r.json().catch(() => ({}));
  res.status(r.status).json(data);
}
