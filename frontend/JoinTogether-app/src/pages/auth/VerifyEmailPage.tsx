import { useState, useRef, type KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { verifyEmailApi } from '../../services/auth.service';
import './VerifyEmail.css';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taiKhoanId = Number(searchParams.get('taiKhoanId'));
  const { setAuthState } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const container = (content: React.ReactNode) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background, #f7f9f8)', padding: 20 }}>
      {content}
    </div>
  );

  if (!taiKhoanId) {
    return container(
      <div className="auth-card">
        <h2>Liên kết không hợp lệ</h2>
        <p className="subtitle">Vui lòng đăng ký tài khoản trước.</p>
      </div>
    );
  }

  if (success) {
    return container(
      <div className="auth-card verify-success">
        <div className="success-icon">✅</div>
        <h2>Tài khoản đã được kích hoạt!</h2>
        <p className="subtitle">
          Cảm ơn bạn đã xác thực email. Hãy hoàn thiện hồ sơ để bắt đầu kết nối.
        </p>
        <div className="onboarding-steps">
          <div className="step-item step-done">
            <div className="step-number">1</div>
            <div className="step-info">
              <strong>Tài khoản</strong>
              <span>Đã xác thực email</span>
            </div>
            <span className="step-check">✓</span>
          </div>
          <div className="step-item step-active">
            <div className="step-number">2</div>
            <div className="step-info">
              <strong>Hồ sơ cá nhân</strong>
              <span>Điền thông tin cá nhân</span>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-info">
              <strong>Sở thích & Mục tiêu</strong>
              <span>Chọn sở thích, mục tiêu, thời gian rảnh</span>
            </div>
          </div>
        </div>
        <button className="primary-btn" onClick={() => navigate('/profile?onboarding=true')}>
          Tiếp tục — Bước 2: Hồ sơ
        </button>
      </div>
    );
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const code = [...next.slice(0, 5), value].join('');
      if (code.length === 6) submitCode(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitCode = async (code?: string) => {
    const maXacThuc = code || digits.join('');
    if (maXacThuc.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verifyEmailApi(taiKhoanId, maXacThuc);
      if (res.success && res.data) {
        const { token, nguoiDungId, roles, role } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('auth_state', JSON.stringify({ token, nguoiDungId, roles, role, isAuthenticated: true }));
        setAuthState({ token, nguoiDungId, roles, role, isAuthenticated: true });
      }
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Xác thực thất bại.';
      setError(msg);
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return container(
    <div className="auth-card">
      <h2>Xác thực email</h2>
      <p className="subtitle">
        Nhập mã 6 chữ số đã được gửi đến email của bạn.
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="otp-inputs">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="otp-digit"
          />
        ))}
      </div>

      <button
        className="primary-btn"
        disabled={loading || digits.some((d) => !d)}
        onClick={() => submitCode()}
      >
        {loading ? 'Đang xác thực...' : 'Xác thực'}
      </button>
    </div>
  );
}
