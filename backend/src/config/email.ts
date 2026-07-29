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
      secure: true,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  }
  return null;
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // Khung HTML email xác thực
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 24px; border-radius: 12px;">
      <h2 style="color: #6fbf73; text-align: center;">Xác thực tài khoản JoinTogether</h2>
      <p>Cảm ơn bạn đã đăng ký. Vui lòng nhập mã xác thực bên dưới để kích hoạt tài khoản:</p>
      <div style="text-align: center; padding: 20px; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #3d7d43; background: #e8f5e9; border-radius: 8px; margin: 16px 0;">
        ${code}
      </div>
      <p style="color: #607d8b; font-size: 13px;">Mã có hiệu lực trong 10 phút.</p>
      <p style="color: #607d8b; font-size: 13px;">Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
    </div>
  `;

  // 1. Ưu tiên gửi qua Resend HTTP API (Port 443 - Hoàn toàn không bị Render chặn)
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: [email],
          subject: 'Xác thực tài khoản JoinTogether',
          html: htmlContent,
        }),
      });
      const resJson: any = await response.json();
      if (response.ok) {
        console.log(`✉️ [RESEND API SUCCESS] Đã gửi email qua HTTP API tới ${email} (ID: ${resJson.id})`);
        return;
      } else {
        console.error(`❌ [RESEND API REJECTED]:`, JSON.stringify(resJson));
      }
    } catch (err: any) {
      console.error(`❌ [RESEND API ERROR]:`, err.message || err);
    }
  }

  // 2. Thử gửi qua SMTP Gmail (Cổng 465)
  const t = createTransporter();
  if (t) {
    try {
      const fromEmail = process.env.SMTP_FROM || `"JoinTogether Network" <${process.env.SMTP_USER}>`;
      await t.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Xác thực tài khoản JoinTogether',
        html: htmlContent,
      });
      console.log(`✉️ [SMTP SUCCESS] Đã gửi mã xác thực thành công đến email: ${email}`);
      return;
    } catch (err: any) {
      console.error(`❌ [SMTP BLOCKED BY CLOUD] Render Free Tier chặn cổng SMTP (${err.message}).`);
    }
  }

  // 3. Fallback: In mã OTP rõ ràng ra Render Logs để đăng ký không bao giờ bị nghẽn
  console.log('====================================================');
  console.log(`🔑 [MÃ OTP DÀNH CHO ${email} LA]: ${code}`);
  console.log('====================================================');
}
