import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: `"JoinTogether Network" <${process.env.SMTP_USER}>`,
          to,
          subject,
          html,
        });
        console.log(`✉️ Email đã được gửi đến: ${to}`);
        return true;
      } else {
        console.log(`[SMTP DEV MODE] Email gửi đến ${to} | Tiêu đề: ${subject}`);
        return true;
      }
    } catch (err: any) {
      console.error('❌ Lỗi gửi email:', err.message || err);
      return false;
    }
  }

  async sendVerificationOtp(to: string, otpCode: string): Promise<boolean> {
    const subject = 'Mã xác thực tài khoản JoinTogether';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #2e7d32;">Mã xác thực tài khoản JoinTogether</h2>
        <p>Xin chào,</p>
        <p>Mã OTP xác thực tài khoản của bạn là:</p>
        <div style="font-size: 28px; font-weight: bold; color: #2e7d32; letter-spacing: 4px; padding: 12px; background: #e8f5e9; width: fit-content; border-radius: 8px; margin: 16px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 13px; color: #666;">Mã này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}

export const emailService = new EmailService();
