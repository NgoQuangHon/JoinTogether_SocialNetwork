import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordResetApi, resetPasswordApi } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Đếm ngược gửi lại mã OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await requestPasswordResetApi(email.trim());
      if (res.success) {
        setMessage(res.message || 'Mã xác thực OTP đã được gửi đến hòm thư Email của bạn.');
        setStep(2);
        setCountdown(60); // Đặt đếm ngược 60 giây
      } else {
        setError(res.message || 'Không thể gửi mã khôi phục.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể kết nối máy chủ, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setError(null);
    setMessage(null);
    setResending(true);

    try {
      const res = await requestPasswordResetApi(email.trim());
      if (res.success) {
        setMessage('Đã gửi lại mã OTP thành công. Vui lòng kiểm tra Hòm thư (hoặc Spam).');
        setCountdown(60);
      } else {
        setError(res.message || 'Không thể gửi lại mã OTP.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gửi lại mã thất bại, vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và Nhập lại mật khẩu không trùng khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await resetPasswordApi({
        email: email.trim(),
        maXacThuc: otp.trim(),
        matKhauMoi: newPassword,
      });
      if (res.success) {
        setMessage('🎉 Đổi mật khẩu thành công! Bạn sẽ được chuyển sang trang Đăng nhập sau 2 giây.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.message || 'Khôi phục mật khẩu không thành công.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác thực không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 440, width: '100%', margin: '0 auto', padding: '32px 28px' }}>
      {/* Step Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: step === 1 ? '#2e7d32' : '#81c784', color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            1
          </span>
          <span style={{ fontSize: 13, fontWeight: step === 1 ? 700 : 500, color: step === 1 ? '#2e7d32' : '#78909c' }}>
            Nhập Email
          </span>
        </div>
        <div style={{ width: 30, height: 2, background: step === 2 ? '#2e7d32' : '#e0e0e0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: step === 2 ? '#2e7d32' : '#e0e0e0', color: step === 2 ? '#fff' : '#999', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            2
          </span>
          <span style={{ fontSize: 13, fontWeight: step === 2 ? 700 : 500, color: step === 2 ? '#2e7d32' : '#78909c' }}>
            Đặt lại mật khẩu
          </span>
        </div>
      </div>

      <h2 style={{ fontSize: 22, color: '#1b4332', marginBottom: 6, textAlign: 'center' }}>
        {step === 1 ? '🔐 Quên Mật Khẩu?' : '🔑 Đặt Mật Khẩu Mới'}
      </h2>
      <p className="subtitle" style={{ textAlign: 'center', fontSize: 13, color: '#607d8b', lineHeight: 1.5, marginBottom: 20 }}>
        {step === 1
          ? 'Nhập địa chỉ email đăng ký tài khoản của bạn để nhận mã xác thực OTP khôi phục mật khẩu.'
          : `Mã OTP xác thực đã được gửi tới ${email}. Vui lòng nhập mã OTP và mật khẩu mới.`}
      </p>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 16, border: '1px solid #ffcdd2', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 16, border: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ {message}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendRequest}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#37474f', marginBottom: 6 }}>
              Email đăng ký tài khoản
            </label>
            <input
              id="email"
              type="email"
              placeholder="nhap_email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cfd8dc', fontSize: 14 }}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #2e7d32 0%, #1b4332 100%)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="spinner-sm" style={{ width: 16, height: 16, border: '2px solid #ffffff66', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Đang gửi mã xác thực...
              </>
            ) : (
              '📩 Gửi mã xác thực khôi phục →'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="otp" style={{ fontSize: 13, fontWeight: 700, color: '#37474f', margin: 0 }}>
                Mã xác thực OTP (6 chữ số)
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || resending}
                style={{
                  border: 'none',
                  background: 'none',
                  color: countdown > 0 ? '#90a4ae' : '#2e7d32',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: countdown > 0 || resending ? 'not-allowed' : 'pointer',
                  textDecoration: countdown > 0 ? 'none' : 'underline',
                  padding: 0,
                }}
              >
                {resending ? 'Đang gửi lại...' : countdown > 0 ? `Gửi lại mã (${countdown}s)` : '🔄 Gửi lại mã OTP'}
              </button>
            </div>
            <input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cfd8dc', fontSize: 18, letterSpacing: 6, fontWeight: 'bold', textAlign: 'center' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="newPassword" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#37474f', marginBottom: 6 }}>
              Mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 12, border: '1px solid #cfd8dc', fontSize: 14 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#78909c' }}
              >
                {showNewPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#37474f', marginBottom: 6 }}>
              Nhập lại mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 12, border: '1px solid #cfd8dc', fontSize: 14 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#78909c' }}
              >
                {showConfirmPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #2e7d32 0%, #1b4332 100%)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="spinner-sm" style={{ width: 16, height: 16, border: '2px solid #ffffff66', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Đang cập nhật mật khẩu...
              </>
            ) : (
              '🔑 Xác nhận đổi mật khẩu ✓'
            )}
          </button>

          <button
            type="button"
            style={{ marginTop: 14, width: '100%', background: 'transparent', border: 'none', color: '#546e7a', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onClick={() => { setStep(1); setError(null); setMessage(null); }}
          >
            ← Nhập lại email khác
          </button>
        </form>
      )}

      <div className="auth-footer" style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16, fontSize: 13, color: '#607d8b' }}>
        Nhớ lại mật khẩu? <Link to="/login" style={{ color: '#2e7d32', fontWeight: 700, textDecoration: 'none' }}>Đăng nhập ngay</Link>
      </div>
    </div>
  );
}
