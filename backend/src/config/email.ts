import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

let transporter: nodemailer.Transporter | null = null;

function ensureTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
      },
    });
    return transporter;
  }
  return null;
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<void> {
  const t = ensureTransporter();

  if (t) {
    await t.sendMail({
      from: process.env.SMTP_FROM || 'noreply@jointogether.com',
      to: email,
      subject: 'Xác thực tài khoản JoinTogether',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #6fbf73;">Xác thực tài khoản JoinTogether</h2>
          <p>Cảm ơn bạn đã đăng ký. Vui lòng nhập mã xác thực bên dưới để kích hoạt tài khoản:</p>
          <div style="text-align: center; padding: 24px; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #3d7d43;">
            ${code}
          </div>
          <p style="color: #607d8b; font-size: 13px;">Mã có hiệu lực trong 10 phút.</p>
          <p style="color: #607d8b; font-size: 13px;">Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });
  } else {
    console.log('========================================');
    console.log(`📧 Verification code for ${email}: ${code}`);
    console.log('========================================');
  }
}
