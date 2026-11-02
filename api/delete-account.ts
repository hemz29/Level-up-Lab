// POST /api/delete-account: permanently deletes the signed-in parent's account and all their children's data.
import { handle, requireUser, serviceClient, type Req, type Res } from './_lib.js';

export default async function handler(req: Req, res: Res) {
  await handle(res, async () => {
    if (req.method !== 'POST') throw Object.assign(new Error('Method not allowed'), { status: 405 });
    const user = await requireUser(req);
    const { error } = await serviceClient().auth.admin.deleteUser(user.id); // tables cascade on delete
    if (error) throw new Error(error.message);
    return { ok: true };
  });
}
