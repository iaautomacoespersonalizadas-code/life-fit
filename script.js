// Envia eventos do app para a função /api/hooks
async function sendWebhook(event, data) {
  try {
    const r = await fetch('/api/hooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-key': 'sk_app_123' // igual ao APP_KEY (ver Vercel)
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        userId: 'user123',
        data
      })
    });
    return r.json().catch(() => ({}));
  } catch (e) {
    console.error('Erro no webhook:', e);
    return {};
  }
}
