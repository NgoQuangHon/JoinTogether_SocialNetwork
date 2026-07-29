import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordResetApi, resetPasswordApi } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await requestPasswordResetApi(email);
      if (res.success) {
        setMessage(res.message || 'Mã xác thực OTP đã được gửi đến email của bạn.');
        setStep(2);
      } else {
        setError(res.message || 'Không thể gửi mã khôi phục.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và nhập lại mật khẩu không khớp.');
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
        email,
        maXacThuc: otp,
        matKhauMoi: newPassword,
      });
      if (res.success) {
        setMessage('Đổi mật khẩu thành công! Bạn sẽ được chuyển sang trang đăng nhập sau 2 giây.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.message || 'Khôi phục mật khẩu không thành công.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Quên Mật Khẩu</h2>
      <p className="subtitle">
        {step === 1
          ? 'Nhập email đã đăng ký để nhận mã xác thực khôi phục mật khẩu'
          : `Mã OTP đã được gửi tới ${email}. Vui lòng nhập mã và mật khẩu mới.`}
      </p>

      {error && <div className="auth-error-box" style={{ color: '#ef5350', marginBottom: 12 }}>{error}</div>}
      {message && <div className="auth-success-box" style={{ color: '#4caf50', marginBottom: 12 }}>{message}</div>}

      {step === 1 ? (
        <form onSubmit={handleSendRequest}>
          <div className="form-group">
            <label htmlFor="email">Email đăng ký</label>
            <input
              id="email"
              type="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Đang gửi mã...' : 'Gửi mã khôi phục'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="otp">Mã xác thực OTP (6 chữ số)</label>
            <input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu mới</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
          </button>
          <button
            type="button"
            className="auth-secondary-btn"
            style={{ marginTop: 8, width: '100%', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
            onClick={() => setStep(1)}
          >
            ← Quay lại nhập email khác
          </button>
        </form>
      )}

      <div className="auth-footer" style={{ marginTop: 16, textAlign: 'center' }}>
        Nhớ lại mật khẩu? <Link to="/login">Đăng nhập ngay</Link>
      </div>
    </div>
  );
}
