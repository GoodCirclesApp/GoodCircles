import { Router } from 'express';
import { sendEmail } from '../services/emailService';

const router = Router();

// POST /api/email/send
// Body: { to: string, toName: string, subject: string, html: string }
router.post('/send', async (req, res) => {
  const { to, toName, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  const success = await sendEmail({ to, toName: toName || '', subject, html });

  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
