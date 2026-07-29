import { useState } from 'react';
import { API_BASE_URL } from '../../config/constants';
import '../../styles/dashboard.css';

interface VerifyPhoneModalProps {
  currentPhone?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerifyPhoneModal({ currentPhone = '', onClose, onSuccess }: VerifyPhoneModalProps) {
  const [phone, setPhone] = useState(currentPhone);
  const [step, setStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMessage, setDemoMessage] = useState('');

  const token = localStorage.getItem('token');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/auth/send-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ soDienThoai: phone.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Không thể gửi mã OTP.');
      } else {
        setStep(2);
        if (data.otpDemo) {
          setDemoMessage(`[MÔ PHỎNG SMS] Mã OTP của bạn là: ${data.otpDemo} (Hoặc nhập 686868 để test nhanh)`);
        }
      }
    } catch {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP 6 số.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ soDienThoai: phone.trim(), maXacThuc: otpCode.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Xác thực không thành công.');
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="profile-card" style={{ width: 440, maxWidth: '90vw', padding: 28, background: '#fff', borderRadius: 20, boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#1b4332', display: 'flex', alignItems: 'center', gap: 8 }}>
            📱 Xác thực số điện thoại
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {demoMessage && step === 2 && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
            {demoMessage}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <p style={{ fontSize: 13, color: '#607d8b', marginBottom: 16, lineHeight: 1.5 }}>
              Nhập số điện thoại chính chủ để nhận mã OTP SMS nâng cấp tài khoản lên <b>✓ Tài khoản xác thực</b>.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#37474f' }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="Ví dụ: 0987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cfd8dc', fontSize: 14 }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid #cfd8dc', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#2e7d32', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                {loading ? 'Đang gửi SMS...' : 'Gửi mã OTP →'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ fontSize: 13, color: '#607d8b', marginBottom: 16, lineHeight: 1.5 }}>
              Nhập mã OTP 6 số đã được gửi đến số điện thoại <b>{phone}</b>.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#37474f' }}>
                Mã xác thực OTP
              </label>
              <input
                type="text"
                placeholder="Nhập 6 số (hoặc 686868)"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cfd8dc', fontSize: 16, letterSpacing: 4, fontWeight: 'bold', textAlign: 'center' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => setStep(1)} style={{ border: 'none', background: 'none', color: '#1565c0', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                ← Nhập lại SĐT
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #cfd8dc', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#2e7d32', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                >
                  {loading ? 'Đang xác thực...' : 'Xác thực ngay ✓'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
