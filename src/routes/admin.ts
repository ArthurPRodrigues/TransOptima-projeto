import { Router } from 'express';
import { runExpiringCheck } from '../jobs/emailNotifier';

const router = Router();

router.post('/notify-now', async (_req, res) => {
  try {
    const r = await runExpiringCheck();
    res.json({ ok: true, ...r });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao disparar notificações.' });
  }
});

export default router;
