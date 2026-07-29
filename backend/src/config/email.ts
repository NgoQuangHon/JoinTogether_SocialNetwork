import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function createTransporter(): nodemailer.Transporter | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (user && pass) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL Port 465 vượt tường lửa chặn cổng 587 của Cloud
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return null;
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<void> {
  const t = createTransporter();

  if (t) {
    try {
      const fromEmail = process.env.SMTP_FROM || `"JoinTogether Network" <${process.env.SMTP_USER}>`;
      await t.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Xác thực tài khoản JoinTogether',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 24px; border-radius: 12px;">
            <h2 style="color: #6fbf73; text-align: center;">Xác thực tài khoản JoinTogether</h2>
            <p>Cảm ơn bạn đã đăng ký. Vui lòng nhập mã xác thực bên dưới để kích hoạt tài khoản:</p>
            <div style="text-align: center; padding: 20px; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #3d7d43; background: #e8f5e9; border-radius: 8px; margin: 16px 0;">
              ${code}
            </div>
            <p style="color: #607d8b; font-size: 13px;">Mã có hiệu lực trong 10 phút.</p>
            <p style="color: #607d8b; font-size: 13px;">Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
          </div>
        `,
      });
      console.log(`✉️ [SMTP SUCCESS] Đã gửi mã xác thực thành công đến email: ${email}`);
    } catch (err: any) {
      console.error(`❌ [SMTP ERROR] Gửi email đến ${email} thất bại:`, err.message || err);
    }
  } else {
    console.warn(`⚠️ [SMTP WARNING] Chưa cài đặt SMTP_USER/SMTP_PASS trên Render. Mã xác thực của ${email} là: ${code}`);
  }
}
