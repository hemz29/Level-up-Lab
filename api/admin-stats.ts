// GET /api/admin-stats: usage and progress NUMBERS for every child, for emails listed in ADMIN_EMAILS.
// Reads child_stats (numbers only), never child_state (the children's written work).
import { handle, isAdminEmail, requireUser, serviceClient, type Req, type Res } from './_lib.js';

export default async function handler(req: Req, res: Res) {
  await handle(res, async () => {
    const user = await requireUser(req);
    if (!isAdminEmail(user.email)) throw Object.assign(new Error('Admins only'), { status: 403 });
    if (req.query?.check) return { ok: true };

    const db = serviceClient();
    const [children, stats, feedback, users] = await Promise.all([
      db.from('children').select('id, parent_id, nickname, created_at'),
      db.from('child_stats').select('child_id, stats, last_active, updated_at'),
      db.from('feedback').select('child_id, week_start, rating, comment').order('week_start', { ascending: false }),
      db.auth.admin.listUsers({ perPage: 1000 }),
    ]);
    for (const r of [children, stats, feedback]) if (r.error) throw new Error(r.error.message);
    if (users.error) throw new Error(users.error.message);

    const statsBy = new Map((stats.data ?? []).map((s) => [s.child_id, s]));
    const families = users.data.users.map((u) => ({
      parentEmail: u.email ?? '(no email)',
      signedUpAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null,
      children: (children.data ?? []).filter((c) => c.parent_id === u.id).map((c) => {
        const s = statsBy.get(c.id);
        return {
          id: c.id,
          nickname: c.nickname,
          createdAt: c.created_at,
          lastActive: s?.last_active ?? null,
          statsUpdatedAt: s?.updated_at ?? null,
          stats: s?.stats ?? null,
          feedback: (feedback.data ?? []).filter((f) => f.child_id === c.id).map((f) => ({ weekStart: f.week_start, rating: f.rating, comment: f.comment })),
        };
      }),
    }));
    return { families };
  });
}
