import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!user || !pass) return null;

    // Tự động nhận diện nhà cung cấp: Mailjet, Gmail hoặc SMTP tùy chỉnh
    let host = process.env.SMTP_HOST?.trim();
    let port = parseInt(process.env.SMTP_PORT || '587', 10);
    let secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (!host) {
      // Tự động phát hiện Mailjet (API Key 32 ký tự) hoặc mặc định Mailjet
      if (user.length === 32 || user.toLowerCase().includes('mailjet') || pass.length === 32) {
        host = 'in-v3.mailjet.com';
        port = 587;
        secure = false;
      } else {
        host = 'smtp.gmail.com';
        port = 587;
        secure = false;
      }
    }

    const senderEmail = process.env.SENDER_EMAIL?.trim() || user;

    if (host.includes('gmail') || user.toLowerCase().includes('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  private async sendMailjetRestApi(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.MAILJET_API_KEY?.trim() || process.env.SMTP_USER?.trim();
    const secretKey = process.env.MAILJET_SECRET_KEY?.trim() || process.env.SMTP_PASS?.trim();
    
    // Ưu tiên Email chính chủ đã Verify trên Mailjet (phucviplc12@gmail.com / SENDER_EMAIL)
    let sender = process.env.SENDER_EMAIL?.trim();
    if (!sender) {
      const userEmail = process.env.SMTP_USER?.trim();
      if (userEmail && userEmail.includes('@') && userEmail.length !== 32) {
        sender = userEmail;
      } else {
        sender = 'phucviplc12@gmail.com';
      }
    }

    if (!apiKey || !secretKey || !sender) {
      const missing = [];
      if (!apiKey) missing.push('MAILJET_API_KEY');
      if (!secretKey) missing.push('MAILJET_SECRET_KEY');
      if (!sender) missing.push('SENDER_EMAIL');
      return { success: false, error: `Thiếu cấu hình Mailjet: ${missing.join(', ')}` };
    }

    try {
      console.log(`📡 [MAILJET HTTPS API] Gửi mail tới (${to}) từ Email đã Verify: "${sender}"...`);
      const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
      const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Messages: [
            {
              From: {
                Email: sender,
                Name: 'JoinTogether Network',
              },
              To: [
                {
                  Email: to,
                  Name: to.split('@')[0],
                },
              ],
              Subject: subject,
              HTMLPart: html,
            },
          ],
        }),
      });

      if (response.ok) {
        console.log(`✅ [MAILJET SUCCESS] Email đã gửi thành công qua HTTPS API đến: ${to}`);
        return { success: true };
      } else {
        const errText = await response.text();
        console.error(`❌ [MAILJET API ERROR ${response.status}]:`, errText);
        let hint = '';
        if (response.status === 401) hint = 'Sai MAILJET_API_KEY hoặc MAILJET_SECRET_KEY.';
        if (response.status === 400 || response.status === 403) hint = 'Email người gửi (SMTP_FROM) chưa được Verify trên Mailjet.';
        return { success: false, error: `HTTP ${response.status}: ${errText}. ${hint}` };
      }
    } catch (err: any) {
      console.error(`❌ [MAILJET FETCH EXCEPTION]:`, err.stack || err.message || err);
      return { success: false, error: err.message || String(err) };
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    const mailjetKey = process.env.MAILJET_API_KEY?.trim();
    const mailjetSecret = process.env.MAILJET_SECRET_KEY?.trim();
    const user = process.env.SMTP_USER?.trim() || '';
    const pass = process.env.SMTP_PASS?.trim() || '';
    const host = process.env.SMTP_HOST?.trim() || '';
    const sender = process.env.SENDER_EMAIL?.trim() || process.env.SMTP_FROM?.trim() || user;

    console.log(`🔍 [EMAIL SERVICE] Khởi tạo gửi email tới: ${to}`);
    console.log(`ℹ️ [CONFIG DIAGNOSTIC] Host: "${host || 'auto'}" | MailjetKey: ${mailjetKey ? 'Yes' : 'No'} | User len: ${user.length} | Sender: "${sender}"`);

    // 1. Ưu tiên hàng đầu: Nếu có cài MAILJET_API_KEY & MAILJET_SECRET_KEY trên Render -> Gửi qua HTTPS API (Cổng 443)
    if (mailjetKey && mailjetSecret) {
      const mailjetResult = await this.sendMailjetRestApi(to, subject, html);
      if (mailjetResult.success) return true;
      console.warn(`⚠️ Gửi qua Mailjet API thất bại: ${mailjetResult.error}. Thử chuyển sang gửi qua SMTP...`);
    }

    // 2. Thử gửi qua Nodemailer SMTP
    try {
      const transporter = this.getTransporter();
      if (transporter) {
        console.log(`📡 [SMTP DIAGNOSTIC] Đang kết nối SMTP Server... Host: ${host || 'smtp.gmail.com'}`);
        await transporter.sendMail({
          from: `"JoinTogether Network" <${sender}>`,
          to,
          subject,
          html,
        });
        console.log(`✅ [SMTP SUCCESS] Email đã gửi thành công đến: ${to}`);
        return true;
      }
    } catch (err: any) {
      console.error(`❌ [SMTP ERROR DETAIL]:`, {
        message: err.message,
        code: err.code,
        command: err.command,
        response: err.response,
        stack: err.stack
      });
      console.error(`💡 [DIAGNOSTIC HINT] Lỗi Connection timeout xuất hiện khi Render chặn cổng TCP (587/465). Hãy kiểm tra lại SENDER_EMAIL đã được verify trên Mailjet chưa.`);
      return false;
    }

    return false;
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

  async sendNewActivityNotification(
    to: string,
    userName: string,
    activity: {
      tenHoatDong: string;
      moTa?: string;
      thoiGianBatDau?: Date | string;
      tenDiaDiem?: string;
      diaChi?: string;
      soLuongToiDa?: number;
    }
  ): Promise<boolean> {
    const subject = `🎯 [JoinTogether] Hoạt động mới phù hợp: "${activity.tenHoatDong}" - Tham gia ngay!`;
    const formattedTime = activity.thoiGianBatDau
      ? new Date(activity.thoiGianBatDau).toLocaleString('vi-VN', {
          dateStyle: 'full',
          timeStyle: 'short',
        })
      : 'Sắp diễn ra';

    const locationText = [activity.tenDiaDiem, activity.diaChi].filter(Boolean).join(' - ') || 'Địa điểm linh hoạt / Online';

    const html = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f4fbf5; padding: 30px 15px; color: #263238;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(46, 125, 50, 0.1); border: 1px solid #e8f5e9;">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #2e7d32, #6fbf73); padding: 28px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 26px; font-weight: 800; margin-bottom: 8px;">✨ JoinTogether Social Network</div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">GỢI Ý HOẠT ĐỘNG MỚI DÀNH CHO BẠN</h1>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 24px;">
            <p style="font-size: 16px; margin-top: 0;">Xin chào <strong>${userName}</strong> 👋,</p>
            <p style="font-size: 14.5px; color: #455a64; line-height: 1.6;">
              Chúc mừng bạn đã <strong>hoàn thiện 100% hồ sơ cá nhân</strong> trên hệ thống! Dựa trên độ uy tín và thông tin hồ sơ của bạn, JoinTogether trân trọng giới thiệu hoạt động mới vừa được khởi tạo trên nền tảng:
            </p>

            <!-- Activity Card Box -->
            <div style="background: #f7fbf8; border: 1.5px solid #c8e6c9; border-radius: 14px; padding: 20px; margin: 20px 0;">
              <h2 style="margin: 0 0 12px 0; color: #2e7d32; font-size: 18px; font-weight: 700;">
                🎯 ${activity.tenHoatDong}
              </h2>
              <div style="font-size: 14px; color: #37474f; line-height: 1.6; margin-bottom: 12px;">
                ⏱️ <strong>Thời gian:</strong> ${formattedTime}<br/>
                📍 <strong>Địa điểm:</strong> ${locationText}<br/>
                👥 <strong>Quy mô:</strong> Tối đa ${activity.soLuongToiDa || 20} thành viên
              </div>
              ${
                activity.moTa
                  ? `<div style="font-size: 13.5px; color: #546e7a; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px dashed #a5d6a7;">
                      <em>"${activity.moTa}"</em>
                    </div>`
                  : ''
              }
            </div>

            <!-- Friends & Community Callout -->
            <div style="background: #fff8e1; border-left: 4px solid #ffb300; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13.5px; color: #5d4037;">
              🤝 <strong>Cộng đồng & Bạn bè:</strong> Rất nhiều thành viên đã hoàn thiện hồ sơ và bạn bè lân cận đang xem và đăng ký tham gia các hoạt động tuần này. Hãy là một trong những người đầu tiên tham gia kết nối!
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0 15px 0;">
              <a href="http://localhost:5173/dashboard" target="_blank" style="display: inline-block; background: #2e7d32; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);">
                💬 XEM & ĐĂNG KÝ THAM GIA NGAY
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f1f8e9; padding: 16px 24px; text-align: center; font-size: 12px; color: #689f38; border-top: 1px solid #ded;">
            Bạn nhận được email này vì tài khoản JoinTogether của bạn đã hoàn thiện 100% hồ sơ.<br/>
            © 2026 JoinTogether Social Network. All rights reserved.
          </div>
        </div>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}

export const emailService = new EmailService();
