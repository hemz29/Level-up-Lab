// POST /api/send-report: emails the child's daily report to the signed-in parent's own address.
// The recipient comes from the verified account, never from the request. Max 5 reports a day per account.
import { handle, requireUser, serviceClient, type Req, type Res } from './_lib.js';

const MAX_PER_DAY = 5;

export default async function handler(req: Req, res: Res) {
  await handle(res, async () => {
    if (req.method !== 'POST') throw Object.assign(new Error('Method not allowed'), { status: 405 });
    const { RESEND_API_KEY, REPORT_FROM_EMAIL } = process.env;
    if (!RESEND_API_KEY) throw Object.assign(new Error('Email is not configured yet'), { status: 500 });
    const user = await requireUser(req);
    if (!user.email) throw Object.assign(new Error('This account has no email address'), { status: 400 });

    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as { subject?: unknown; text?: unknown } | undefined;
    const subject = typeof body?.subject === 'string' ? body.subject.slice(0, 200) : '';
    const text = typeof body?.text === 'string' ? body.text : '';
    if (!subject || !text || text.length > 8000) throw Object.assign(new Error('Bad report'), { status: 400 });

    const db = serviceClient();
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count } = await db.from('report_log').select('id', { count: 'exact', head: true }).eq('parent_id', user.id).gte('sent_at', since);
    if ((count ?? 0) >= MAX_PER_DAY) throw Object.assign(new Error('Too many reports today, try again tomorrow'), { status: 429 });

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: REPORT_FROM_EMAIL || 'Level-Up Lab <onboarding@resend.dev>', to: [user.email], subject, text }),
    });
    if (!r.ok) throw Object.assign(new Error('The email service did not accept the report'), { status: 502 });
    await db.from('report_log').insert({ parent_id: user.id });
    return { ok: true };
  });
}
