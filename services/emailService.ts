export async function sendRecoveryEmail(
  email: string,
  name: string,
  html: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        toName: name,
        subject: 'Reset your Good Circles password',
        html,
      }),
    });
    return response.ok;
  } catch (err) {
    console.error('[RecoveryEmail] Error:', err);
    return false;
  }
}
