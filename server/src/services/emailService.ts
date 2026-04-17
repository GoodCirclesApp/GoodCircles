import { Resend } from 'resend';

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Good Circles <onboarding@resend.dev>';

export async function sendEmail(options: {
  to: string;
  toName: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.group('[EMAIL SIMULATION] RESEND_API_KEY not configured');
    console.log(`To: ${options.toName} (${options.to})`);
    console.log(`Subject: ${options.subject}`);
    console.groupEnd();
    return true;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return false;
    }

    console.log(`[Email] Sent successfully to ${options.to} — ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error('[Email] Unexpected error:', err);
    return false;
  }
}
