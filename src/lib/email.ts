import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailNotification(to: string, subject: string, htmlContent: string) {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: subject,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Gagal kirim email:", error);
    return { success: false, error };
  }
}