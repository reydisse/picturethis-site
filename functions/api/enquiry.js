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

    if (response.ok) {
      try {
        await sendAcknowledgement(env, email.trim(), name.trim().split(/\s+/)[0], interest);
      } catch (error) {
        console.error('Enquiry acknowledgement failed', error);
      }
    }

    return Response.json({ success: response.ok }, { status: response.ok ? 200 : 502 });
  } catch {
    return Response.json({ success: false }, { status: 502 });
  }
}

const acknowledgementCopy = {
  cohort: {
    subject: 'We got your application',
    paragraphs: [
      'Thanks for applying to join a PictureThis Production cohort. Your application is in, and a real person reads every one.',
      'Here is what happens next. The January cohort has 20 places, and we confirm places in December. If you get a place, we will email you the start date and everything you need for week one. Training is free, always: eight Saturdays, 10:00 a.m. to 2:00 p.m., at 139 Millwick Dr in Toronto, on real gear, beside working technicians. No experience needed.',
      'If you applied for someone else, or your plans change, just reply to this email.',
    ],
  },
  mentor: {
    subject: 'Thanks for offering to mentor',
    paragraphs: [
      'Thanks for offering to mentor with PictureThis Production. Your form is in, and we are glad you raised your hand.',
      'Here is how mentoring works here. You are paired with one participant for the eight-week cohort: monthly check-ins at minimum, real shows together, and the honest stuff nobody teaches, like rates, first bookings and when to say no. Every mentor passes a Vulnerable Sector Check before working with participants and follows a written code of conduct. Screening sounds heavy; it is not, and we will walk you through both, step by step.',
      'The next step is a conversation, not a commitment. We will email you in the next little while to set up a short call.',
    ],
  },
  other: {
    subject: 'Thanks for reaching out',
    paragraphs: [
      'Thanks for reaching out to PictureThis Production. Your message is in, and we read every one.',
      'Whether it is hosting a training day, lending gear, funding a cohort or hiring our graduates, partnerships are what keep the program free for participants. Someone from our team will reply properly in the next little while.',
    ],
  },
};

async function sendAcknowledgement(env, email, firstName, interest) {
  let copy = acknowledgementCopy.other;
  if (interest === 'Join the next cohort') copy = acknowledgementCopy.cohort;
  if (interest === 'Become a mentor') copy = acknowledgementCopy.mentor;

  const htmlName = firstName.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const signOff = ['Talk soon,', 'The PictureThis Production team', 'hello@picturethis-production.com'];
  const footer = 'PictureThis Production · 139 Millwick Dr, Toronto, ON M9L 1Y7 · picturethis-production.com';
  const tagline = 'Free training. Real shows. A real path into the industry.';
  const text = ['PICTURETHIS\nPRODUCTION', `Hi ${firstName},`, ...copy.paragraphs, signOff.join('\n'), `${footer}\n${tagline}`].join('\n\n');
  const paragraphs = [`Hi ${htmlName},`, ...copy.paragraphs, signOff.join('<br>')]
    .map((paragraph) => `<p style="margin:0 0 14px 0;">${paragraph}</p>`).join('');
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin:0;padding:0;">
<tr><td style="background-color:#203da5;padding:20px 24px;"><div style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:1px;line-height:1.2;">PICTURETHIS<br>PRODUCTION</div></td></tr>
<tr><td style="padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;font-size:15px;line-height:1.55;">${paragraphs}</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #ccd5ed;font-family:Arial,Helvetica,sans-serif;color:#536185;font-size:12px;line-height:1.5;">${footer.replaceAll('·', '&middot;')}<br>${tagline}</td></tr>
</table>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'PictureThis Production <hello@picturethis-production.com>',
      to: [email],
      subject: `${copy.subject}, ${firstName}`,
      text,
      html,
    }),
  });

  if (!response.ok) throw new Error(`Resend returned HTTP ${response.status}`);
}
