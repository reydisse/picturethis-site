export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return Response.json({ success: false }, { status: 405, headers: { Allow: 'POST' } });
  }

  let fields;
  try {
    fields = await request.json();
  } catch {
    return Response.json({ success: false }, { status: 400 });
  }

  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return Response.json({ success: false }, { status: 400 });
  }

  const { name, email, interest, _honey, _subject } = fields;
  if (_honey != null && _honey !== '') {
    return Response.json({ success: true });
  }

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof interest !== 'string' || !interest.trim() ||
    typeof email !== 'string' || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email.trim())
  ) {
    return Response.json({ success: false }, { status: 400 });
  }

  try {
    const subject = String(_subject ?? '').replace(/[\r\n\u2028\u2029]/g, '').trim() || 'Website enquiry';
    const text = Object.entries(fields)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join('\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PictureThis Production <hello@picturethis-production.com>',
        to: ['hello@picturethis-production.com'],
        reply_to: email.trim(),
        subject,
        text,
      }),
    });

    return Response.json({ success: response.ok }, { status: response.ok ? 200 : 502 });
  } catch {
    return Response.json({ success: false }, { status: 502 });
  }
}
