import { Resend } from 'resend';

type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let resend: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

export async function sendEmail(options: EmailOptions) {
  const resendClient = getResendClient();

  if (!resendClient) {
    console.info(
      [
        '[email] Resend is not configured. Email was not sent.',
        `To: ${options.to}`,
        `Subject: ${options.subject}`,
        options.text,
      ].join('\n'),
    );
    return;
  }

  const { error } = await resendClient.emails.send({
    from:
      process.env.EMAIL_FROM ??
      process.env.RESEND_FROM ??
      'Operon <onboarding@resend.dev>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  if (error) {
    throw new Error(`Resend email failed: ${error.message}`);
  }
}
