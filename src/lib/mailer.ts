import nodemailer from 'nodemailer';

export function createTransport() {
  const host = process.env.MAIL_HOST!;
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER!;
  const pass = process.env.MAIL_PASS!;
  const secure = port === 465;

  return nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass },
  });
}

export async function sendMail(to: string | string[], subject: string, html: string) {
  const transporter = createTransport();
  const from = process.env.MAIL_FROM || 'no-reply@localhost';
  await transporter.sendMail({ from, to, subject, html });
}
