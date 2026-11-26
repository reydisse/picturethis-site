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

  if (interest === 'Donate equipment' && (
    typeof fields.equipment !== 'string' || !fields.equipment.trim() ||
    !['Working', 'Needs repair', 'Not sure'].includes(fields.condition) ||
    !['I can drop it off', 'Please arrange pickup'].includes(fields.handover)
  )) {
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

const acknowledgementHeader = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@700&family=DM+Sans:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>a{color:#2438A0}@media (max-width:620px){.px{padding-left:24px!important;padding-right:24px!important}.h1{font-size:32px!important}}</style></head>
<body style="margin:0;padding:0;background-color:#E4E7F4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E4E7F4;"><tr><td align="center" style="padding:24px 8px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;max-width:600px;width:100%;"><tr><td class="px" style="background-color:#2438A0;padding:36px 48px;font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:700;text-transform:uppercase;line-height:0.95;font-size:34px;color:#FFFFFF;">PictureThis<br>Production</td></tr><tr><td class="px" style="padding:44px 48px 0;font-family:'DM Sans',Arial,sans-serif;">
`;

const acknowledgementFooter = `</td></tr><tr><td class="px" style="padding:30px 48px 42px;font-family:'DM Sans',Arial,sans-serif;font-size:17px;line-height:1.55;color:#1B2455;">
<div>Talk soon,</div>
<div style="font-weight:700;">The PictureThis Production team</div>
<div><a href="mailto:hello@picturethis-production.com" style="color:#2438A0;">hello@picturethis-production.com</a></div>
</td></tr><tr><td class="px" style="background-color:#1B2455;padding:36px 48px;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:700;text-transform:uppercase;line-height:0.95;font-size:22px;color:#FFFFFF;">PictureThis<br>Production</div>
<div style="font-size:14px;line-height:1.6;color:#C8CEEA;padding-top:14px;">139 Millwick Dr, Toronto, ON M9L 1Y7 &middot; <a href="https://picturethis-production.com" style="color:#FFFFFF;">picturethis-production.com</a></div>
<div style="font-size:14px;font-weight:700;letter-spacing:0.06em;color:#FFFFFF;padding-top:12px;">Free training. Real shows. A real path into the industry.</div>
</td></tr>
</table></td></tr></table>
</body></html>`;

const acknowledgementCopy = {
  cohort: {
    subject: 'We got your application',
    html: `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@700&family=DM+Sans:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>a{color:#2438A0}@media (max-width:620px){.px{padding-left:24px!important;padding-right:24px!important}.h1{font-size:32px!important}}</style></head>
<body style="margin:0;padding:0;background-color:#E4E7F4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E4E7F4;"><tr><td align="center" style="padding:24px 8px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;max-width:600px;width:100%;"><tr><td class="px" style="background-color:#2438A0;padding:36px 48px;font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:700;text-transform:uppercase;line-height:0.95;font-size:34px;color:#FFFFFF;">PictureThis<br>Production</td></tr><tr><td class="px" style="padding:44px 48px 0;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2438A0;">Application received</div>
<div class="h1" style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:42px;line-height:1.08;letter-spacing:-0.01em;color:#2438A0;padding-top:14px;">We got your application, {{FIRST_NAME}}.</div>
</td></tr><tr><td class="px" style="padding:18px 48px 0;font-family:'DM Sans',Arial,sans-serif;"><p style="margin:0 0 14px 0;font-size:17px;line-height:1.65;color:#2B3263;">Thanks for applying to join a PictureThis Production cohort. Your application is in, and a real person reads every one.</p></td></tr><tr><td class="px" style="padding:30px 48px 0;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2438A0;padding-bottom:20px;">What happens next</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-top:0px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="background-color:#2438A0;color:#FFFFFF;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:20px;line-height:40px;">1</td>
<td style="padding-left:20px;font-family:'DM Sans',Arial,sans-serif;"><div style="font-weight:700;font-size:18px;color:#1B2455;">A person reads it</div><div style="font-size:16px;line-height:1.55;color:#2B3263;padding-top:3px;">Every application is read by a real person on our team.</div></td>
</tr></table></td></tr><tr><td style="padding-top:20px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="background-color:#2438A0;color:#FFFFFF;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:20px;line-height:40px;">2</td>
<td style="padding-left:20px;font-family:'DM Sans',Arial,sans-serif;"><div style="font-weight:700;font-size:18px;color:#1B2455;">Places confirmed in December</div><div style="font-size:16px;line-height:1.55;color:#2B3263;padding-top:3px;">The January cohort has 20 places. We confirm them in December.</div></td>
</tr></table></td></tr><tr><td style="padding-top:20px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="background-color:#2438A0;color:#FFFFFF;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:20px;line-height:40px;">3</td>
<td style="padding-left:20px;font-family:'DM Sans',Arial,sans-serif;"><div style="font-weight:700;font-size:18px;color:#1B2455;">Your start date</div><div style="font-size:16px;line-height:1.55;color:#2B3263;padding-top:3px;">If you get a place, we email you the start date and everything you need for week one.</div></td>
</tr></table></td></tr></table>
</td></tr><tr><td class="px" style="padding:34px 48px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF0F8;"><tr><td style="padding:26px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="33%" valign="top" style="font-family:'DM Sans',Arial,sans-serif;padding-right:12px;"><div style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:38px;line-height:1;color:#2438A0;">20</div><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5A607A;line-height:1.4;padding-top:6px;">Places in January</div></td><td width="33%" valign="top" style="font-family:'DM Sans',Arial,sans-serif;padding-right:12px;"><div style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:38px;line-height:1;color:#2438A0;">8</div><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5A607A;line-height:1.4;padding-top:6px;">Saturdays, 10 AM–2 PM</div></td><td width="33%" valign="top" style="font-family:'DM Sans',Arial,sans-serif;padding-right:12px;"><div style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:38px;line-height:1;color:#2438A0;">$0</div><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5A607A;line-height:1.4;padding-top:6px;">Free, always</div></td></tr></table></td></tr></table>
<div style="font-size:15px;line-height:1.6;color:#5A607A;padding-top:14px;font-family:'DM Sans',Arial,sans-serif;">At 139 Millwick Dr, Toronto. Real gear, beside working technicians. No experience needed.</div></td></tr><tr><td class="px" style="padding:18px 48px 0;font-family:'DM Sans',Arial,sans-serif;"><p style="margin:0 0 14px 0;font-size:17px;line-height:1.65;color:#2B3263;">If you applied for someone else, or your plans change, just reply to this email.</p></td></tr><tr><td class="px" style="padding:30px 48px 42px;font-family:'DM Sans',Arial,sans-serif;font-size:17px;line-height:1.55;color:#1B2455;">
<div>Talk soon,</div>
<div style="font-weight:700;">The PictureThis Production team</div>
<div><a href="mailto:hello@picturethis-production.com" style="color:#2438A0;">hello@picturethis-production.com</a></div>
</td></tr><tr><td class="px" style="background-color:#1B2455;padding:36px 48px;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:700;text-transform:uppercase;line-height:0.95;font-size:22px;color:#FFFFFF;">PictureThis<br>Production</div>
<div style="font-size:14px;line-height:1.6;color:#C8CEEA;padding-top:14px;">139 Millwick Dr, Toronto, ON M9L 1Y7 &middot; <a href="https://picturethis-production.com" style="color:#FFFFFF;">picturethis-production.com</a></div>
<div style="font-size:14px;font-weight:700;letter-spacing:0.06em;color:#FFFFFF;padding-top:12px;">Free training. Real shows. A real path into the industry.</div>
</td></tr>
</table></td></tr></table>
</body></html>`,
    text: `We got your application, {{FIRST_NAME}}.

Thanks for applying to join a PictureThis Production cohort. Your application is in, and a real person reads every one.

What happens next
1. A person reads it. Every application is read by a real person on our team.
2. Places confirmed in December. The January cohort has 20 places. We confirm them in December.
3. Your start date. If you get a place, we email you the start date and everything you need for week one.

20 places in January · 8 Saturdays, 10 AM–2 PM · $0, free, always.
At 139 Millwick Dr, Toronto. Real gear, beside working technicians. No experience needed.

If you applied for someone else, or your plans change, just reply to this email.

Talk soon,
The PictureThis Production team
hello@picturethis-production.com

PictureThis Production · 139 Millwick Dr, Toronto, ON M9L 1Y7 · picturethis-production.com
Free training. Real shows. A real path into the industry.`,
  },
  mentor: {
    subject: 'Thanks for offering to mentor',
    html: `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@700&family=DM+Sans:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>a{color:#2438A0}@media (max-width:620px){.px{padding-left:24px!important;padding-right:24px!important}.h1{font-size:32px!important}}</style></head>
<body style="margin:0;padding:0;background-color:#E4E7F4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E4E7F4;"><tr><td align="center" style="padding:24px 8px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;max-width:600px;width:100%;"><tr><td class="px" style="background-color:#2438A0;padding:36px 48px;font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:700;text-transform:uppercase;line-height:0.95;font-size:34px;color:#FFFFFF;">PictureThis<br>Production</td></tr><tr><td class="px" style="padding:44px 48px 0;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2438A0;">Mentor form received</div>
<div class="h1" style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:42px;line-height:1.08;letter-spacing:-0.01em;color:#2438A0;padding-top:14px;">Thanks for offering to mentor, {{FIRST_NAME}}.</div>
</td></tr><tr><td class="px" style="padding:18px 48px 0;font-family:'DM Sans',Arial,sans-serif;"><p style="margin:0 0 14px 0;font-size:17px;line-height:1.65;color:#2B3263;">Thanks for offering to mentor with PictureThis Production. Your form is in, and we are glad you raised your hand.</p><p style="margin:0 0 14px 0;font-size:17px;line-height:1.65;color:#2B3263;">Expect real shows together, plus the honest stuff nobody teaches: rates, first bookings and when to say no.</p></td></tr><tr><td class="px" style="padding:30px 48px 0;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2438A0;padding-bottom:20px;">How mentoring works here</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-top:0px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="background-color:#2438A0;color:#FFFFFF;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:20px;line-height:40px;">1</td>
<td style="padding-left:20px;font-family:'DM Sans',Arial,sans-serif;"><div style="font-weight:700;font-size:18px;color:#1B2455;">You are paired with one participant</div><div style="font-size:16px;line-height:1.55;color:#2B3263;padding-top:3px;">For the eight-week cohort, with monthly check-ins at minimum.</div></td>
</tr></table></td></tr><tr><td style="padding-top:20px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="background-color:#2438A0;color:#FFFFFF;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:20px;line-height:40px;">2</td>
<td style="padding-left:20px;font-family:'DM Sans',Arial,sans-serif;"><div style="font-weight:700;font-size:18px;color:#1B2455;">Screening, step by step</div><div style="font-size:16px;line-height:1.55;color:#2B3263;padding-top:3px;">Every mentor passes a Vulnerable Sector Check before working with participants and follows a written code of conduct. It sounds heavy; it is not, and we will walk you through both.</div></td>
</tr></table></td></tr><tr><td style="padding-top:20px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="background-color:#2438A0;color:#FFFFFF;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:20px;line-height:40px;">3</td>
<td style="padding-left:20px;font-family:'DM Sans',Arial,sans-serif;"><div style="font-weight:700;font-size:18px;color:#1B2455;">A short call</div><div style="font-size:16px;line-height:1.55;color:#2B3263;padding-top:3px;">The next step is a conversation, not a commitment. We will email you in the next little while to set one up.</div></td>
</tr></table></td></tr></table>
</td></tr><tr><td class="px" style="padding:34px 48px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF0F8;"><tr><td style="padding:26px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="33%" valign="top" style="font-family:'DM Sans',Arial,sans-serif;padding-right:12px;"><div style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:38px;line-height:1;color:#2438A0;">1:1</div><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5A607A;line-height:1.4;padding-top:6px;">One participant</div></td><td width="33%" valign="top" style="font-family:'DM Sans',Arial,sans-serif;padding-right:12px;"><div style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:38px;line-height:1;color:#2438A0;">8</div><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5A607A;line-height:1.4;padding-top:6px;">Week cohort</div></td><td width="33%" valign="top" style="font-family:'DM Sans',Arial,sans-serif;padding-right:12px;"><div style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:38px;line-height:1;color:#2438A0;">Monthly</div><div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5A607A;line-height:1.4;padding-top:6px;">Check-ins, at minimum</div></td></tr></table></td></tr></table>
</td></tr><tr><td class="px" style="padding:30px 48px 42px;font-family:'DM Sans',Arial,sans-serif;font-size:17px;line-height:1.55;color:#1B2455;">
<div>Talk soon,</div>
<div style="font-weight:700;">The PictureThis Production team</div>
<div><a href="mailto:hello@picturethis-production.com" style="color:#2438A0;">hello@picturethis-production.com</a></div>
</td></tr><tr><td class="px" style="background-color:#1B2455;padding:36px 48px;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:700;text-transform:uppercase;line-height:0.95;font-size:22px;color:#FFFFFF;">PictureThis<br>Production</div>
<div style="font-size:14px;line-height:1.6;color:#C8CEEA;padding-top:14px;">139 Millwick Dr, Toronto, ON M9L 1Y7 &middot; <a href="https://picturethis-production.com" style="color:#FFFFFF;">picturethis-production.com</a></div>
<div style="font-size:14px;font-weight:700;letter-spacing:0.06em;color:#FFFFFF;padding-top:12px;">Free training. Real shows. A real path into the industry.</div>
</td></tr>
</table></td></tr></table>
</body></html>`,
    text: `Thanks for offering to mentor, {{FIRST_NAME}}.

Thanks for offering to mentor with PictureThis Production. Your form is in, and we are glad you raised your hand.

Expect real shows together, plus the honest stuff nobody teaches: rates, first bookings and when to say no.

How mentoring works here
1. You are paired with one participant. For the eight-week cohort, with monthly check-ins at minimum.
2. Screening, step by step. Every mentor passes a Vulnerable Sector Check before working with participants and follows a written code of conduct. It sounds heavy; it is not, and we will walk you through both.
3. A short call. The next step is a conversation, not a commitment. We will email you in the next little while to set one up.

1:1, one participant · 8 week cohort · Monthly check-ins, at minimum.

Talk soon,
The PictureThis Production team
hello@picturethis-production.com

PictureThis Production · 139 Millwick Dr, Toronto, ON M9L 1Y7 · picturethis-production.com
Free training. Real shows. A real path into the industry.`,
  },
  equipment: {
    subject: 'Thanks for offering equipment',
    html: `${acknowledgementHeader}<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2438A0;">Equipment offer received</div>
<div class="h1" style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:42px;line-height:1.08;color:#2438A0;padding-top:14px;">Thanks for offering equipment, {{FIRST_NAME}}.</div>
</td></tr><tr><td class="px" style="padding:18px 48px 0;font-family:'DM Sans',Arial,sans-serif;font-size:17px;line-height:1.65;color:#2B3263;">
<p>We’ll check whether we can use your gear. If we can, we’ll arrange a drop-off at 139 Millwick Dr or a pickup. When we receive it, we’ll log the donation and send you a written acknowledgement.</p>
<p>PictureThis is a nonprofit. We aren’t a registered charity, so we can’t issue a tax receipt for donated equipment.</p>
${acknowledgementFooter}`,
    text: `Thanks for offering equipment, {{FIRST_NAME}}.

We’ll check whether we can use your gear. If we can, we’ll arrange a drop-off at 139 Millwick Dr or a pickup. When we receive it, we’ll log the donation and send you a written acknowledgement.

PictureThis is a nonprofit. We aren’t a registered charity, so we can’t issue a tax receipt for donated equipment.

Talk soon,
The PictureThis Production team
hello@picturethis-production.com

PictureThis Production · 139 Millwick Dr, Toronto, ON M9L 1Y7 · picturethis-production.com`,
  },
  other: {
    subject: 'Thanks for reaching out',
    html: `${acknowledgementHeader}<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2438A0;">Message received</div>
<div class="h1" style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:42px;line-height:1.08;letter-spacing:-0.01em;color:#2438A0;padding-top:14px;">Thanks for reaching out, {{FIRST_NAME}}.</div>
</td></tr><tr><td class="px" style="padding:18px 48px 0;font-family:'DM Sans',Arial,sans-serif;"><p style="margin:0 0 14px 0;font-size:17px;line-height:1.65;color:#2B3263;">Thanks for reaching out to PictureThis Production. Your message is in, and we read every one.</p><p style="margin:0 0 14px 0;font-size:17px;line-height:1.65;color:#2B3263;">Partnerships are what keep the program free for participants. However you want to help, we would like to hear it.</p></td></tr><tr><td class="px" style="padding:30px 48px 0;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2438A0;padding-bottom:20px;">What happens next</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-top:0px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="background-color:#2438A0;color:#FFFFFF;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:20px;line-height:40px;">1</td>
<td style="padding-left:20px;font-family:'DM Sans',Arial,sans-serif;"><div style="font-weight:700;font-size:18px;color:#1B2455;">We read your message</div><div style="font-size:16px;line-height:1.55;color:#2B3263;padding-top:3px;">Every message is read by a person on our team.</div></td>
</tr></table></td></tr><tr><td style="padding-top:20px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="background-color:#2438A0;color:#FFFFFF;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:20px;line-height:40px;">2</td>
<td style="padding-left:20px;font-family:'DM Sans',Arial,sans-serif;"><div style="font-weight:700;font-size:18px;color:#1B2455;">Someone replies properly</div><div style="font-size:16px;line-height:1.55;color:#2B3263;padding-top:3px;">A team member will reply in the next little while.</div></td>
</tr></table></td></tr></table>
</td></tr><tr><td class="px" style="padding:34px 48px 0;font-family:'DM Sans',Arial,sans-serif;">
<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2438A0;padding-bottom:16px;">Ways to partner</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" valign="top" style="background-color:#EEF0F8;border-top:4px solid #2438A0;padding:20px 22px;font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:17px;color:#1B2455;line-height:1.3;">Host a training day</td><td width="12"></td><td width="50%" valign="top" style="background-color:#EEF0F8;border-top:4px solid #2438A0;padding:20px 22px;font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:17px;color:#1B2455;line-height:1.3;">Lend gear</td></tr><tr><td height="12" colspan="3"></td></tr><tr><td width="50%" valign="top" style="background-color:#EEF0F8;border-top:4px solid #2438A0;padding:20px 22px;font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:17px;color:#1B2455;line-height:1.3;">Fund a cohort</td><td width="12"></td><td width="50%" valign="top" style="background-color:#EEF0F8;border-top:4px solid #2438A0;padding:20px 22px;font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:17px;color:#1B2455;line-height:1.3;">Hire our graduates</td></tr></table>
${acknowledgementFooter}`,
    text: `Thanks for reaching out, {{FIRST_NAME}}.

Thanks for reaching out to PictureThis Production. Your message is in, and we read every one.

Partnerships are what keep the program free for participants. However you want to help, we would like to hear it.

What happens next
1. We read your message. Every message is read by a person on our team.
2. Someone replies properly. A team member will reply in the next little while.

Ways to partner: host a training day · lend gear · fund a cohort · hire our graduates.

Talk soon,
The PictureThis Production team
hello@picturethis-production.com

PictureThis Production · 139 Millwick Dr, Toronto, ON M9L 1Y7 · picturethis-production.com
Free training. Real shows. A real path into the industry.`,
  },
};

async function sendAcknowledgement(env, email, firstName, interest) {
  let copy = acknowledgementCopy.other;
  if (interest === 'Join the next cohort') copy = acknowledgementCopy.cohort;
  if (interest === 'Become a mentor') copy = acknowledgementCopy.mentor;
  if (interest === 'Donate equipment') copy = acknowledgementCopy.equipment;

  const htmlName = firstName.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const text = copy.text.replace('{{FIRST_NAME}}', () => firstName);
  const html = copy.html.replace('{{FIRST_NAME}}', () => htmlName);

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
