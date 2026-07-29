import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile } from '../../services/profile.service';
import SidebarLayout from '../../components/SidebarLayout';
import type { HoSoNguoiDung, SoThich } from '../../types/profile';
import './Profile.css';

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhauMoi: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.matKhauCu || !form.matKhauMoi || !form.xacNhanMatKhauMoi) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (form.matKhauMoi.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (form.matKhauMoi !== form.xacNhanMatKhauMoi) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }
    if (form.matKhauCu === form.matKhauMoi) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        setTimeout(onClose, 2000);
      } else {
        setError(json.message || 'Đổi mật khẩu thất bại.');
      }
    } catch {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)', animation: 'slideUp 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a2e1a' }}>🔒 Đổi mật khẩu</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#78909c' }}>Nhập mật khẩu hiện tại để xác nhận</p>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: '#eceff1', color: '#546e7a', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}
          >✕</button>
        </div>

        {error && (
          <div style={{ background: '#ffeaea', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'matKhauCu', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại...' },
            { key: 'matKhauMoi', label: 'Mật khẩu mới', placeholder: 'Tối thiểu 6 ký tự...' },
            { key: 'xacNhanMatKhauMoi', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#546e7a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
              </label>
              <input
                type="password"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid #e0e7e0', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6fbf73')}
                onBlur={(e) => (e.target.style.borderColor = '#e0e7e0')}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #e0e7e0',
                background: 'transparent', color: '#546e7a', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                background: loading ? '#a5d6a7' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(46,125,50,0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? '⏳ Đang xử lý...' : '🔐 Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

import VerifyPhoneModal from './VerifyPhoneModal';

export default function ProfilePage() {
    const { nguoiDungId } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<HoSoNguoiDung | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showVerifyPhone, setShowVerifyPhone] = useState(false);

    const loadProfile = () => {
        getMyProfile()
            .then((res) => {
                if (res.success && res.data) {
                    setProfile(res.data);
                } else {
                    setError(res.message || 'Không thể tải hồ sơ.');
                }
            })
            .catch((err) => {
                const msg = err?.response?.data?.message || err.message || 'Lỗi tải hồ sơ.';
                setError(msg);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProfile();
    }, []);

    if (loading) {
        return (
            <SidebarLayout title="Hồ sơ">
                <div className="profile-loading">
                    <div className="spinner" />
                    <p>Đang tải hồ sơ...</p>
                </div>
            </SidebarLayout>
        );
    }

    if (error) {
        return (
            <SidebarLayout title="Hồ sơ">
                <div className="profile-loading">
                    <p className="error-text">{error}</p>
                    <button className="edit-button" onClick={() => navigate('/dashboard')}>
                        Quay về bảng tin
                    </button>
                </div>
            </SidebarLayout>
        );
    }

    const user = profile?.user;
    const hoTen = user?.hoTen || `Người dùng #${nguoiDungId}`;
    const tenDangNhap = `user_${nguoiDungId}`;
    const email = user?.email || 'Chưa cập nhật';
    const soDienThoai = user?.soDienThoai || 'Chưa cập nhật';
    const tieuSu = profile?.tieuSu || 'Chưa có thông tin giới thiệu.';
    const khuVuc = profile?.khuVuc || 'Chưa cập nhật';
    const gioiTinh = profile?.gioiTinh || '';
    const anhDaiDien = profile?.anhDaiDien || 'https://i.pravatar.cc/200';
    const soThich: SoThich[] = profile?.soThich || [];

    const genderLabel = gioiTinh === 'nam' ? 'Nam' : gioiTinh === 'nu' ? 'Nữ' : gioiTinh === 'khac' ? 'Khác' : 'Chưa cập nhật';

    const allFields = [
      user?.hoTen || '',
      user?.email || '',
      user?.soDienThoai || '',
      profile?.tieuSu || '',
      profile?.khuVuc || '',
      profile?.ngaySinh || '',
      profile?.gioiTinh || '',
      profile?.mucTieuThamGia || '',
      profile?.thoiGianRanh || '',
      profile?.anhDaiDien || '',
    ];
    const filledCount = allFields.filter((v) => v.trim().length > 0).length;
    const progressPct = Math.round((filledCount / allFields.length) * 100);

    return (
        <SidebarLayout title="Hồ sơ">
            {showChangePassword && (
                <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
            )}

            {showVerifyPhone && (
                <VerifyPhoneModal
                    currentPhone={user?.soDienThoai || ''}
                    onClose={() => setShowVerifyPhone(false)}
                    onSuccess={() => loadProfile()}
                />
            )}

            <div className="profile-container">
                {/* PROFILE HEADER CARD */}
                <section className="profile-card profile-summary">
                    <img className="main-avatar" src={anhDaiDien} alt="avatar" />
                    <div className="user-info">
                        <h1>{hoTen}</h1>
                        <p>@{tenDangNhap}</p>
                        {profile?.daXacThuc ? (
                            <span className="verified">✓ Tài khoản xác thực</span>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                                <span className="unverified-warning">
                                    ⚠️ Tài khoản chưa xác thực, người dùng này có thể là ảo
                                </span>
                                <button
                                    onClick={() => setShowVerifyPhone(true)}
                                    style={{
                                        border: 'none',
                                        background: '#2e7d32',
                                        color: '#fff',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        padding: '4px 12px',
                                        borderRadius: 999,
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(46,125,50,0.3)',
                                    }}
                                >
                                    📱 Xác thực SĐT ngay
                                </button>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'flex-start' }}>
                        <Link to="/profile" className="edit-button" style={{ textDecoration: 'none' }}>
                            ✏️ Chỉnh sửa thông tin
                        </Link>
                        <button
                            className="edit-button"
                            onClick={() => setShowChangePassword(true)}
                            style={{
                                background: 'transparent',
                                border: '1.5px solid #e0e7e0',
                                color: '#546e7a',
                                cursor: 'pointer',
                            }}
                        >
                            🔒 Đổi mật khẩu
                        </button>
                    </div>
                </section>

                {/* STATISTIC */}
                <section className="statistic-grid">
                    <div className="stat-card">
                        <h2>{profile ? `${progressPct}%` : '0%'}</h2>
                        <p>Hoàn thiện hồ sơ</p>
                        <div className="progress">
                            <span style={{ width: profile ? `${progressPct}%` : '0%' }} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <h2>{soThich.length > 0 ? `${soThich.length}` : '0'}</h2>
                        <p>Sở thích đã thêm</p>
                        <div className="trust">{soThich.length > 0 ? '⭐ Đã có' : '⭐ Thêm ngay'}</div>
                    </div>
                </section>

                {/* PERSONAL INFORMATION */}
                <section className="profile-card">
                    <h2>Thông tin cá nhân</h2>
                    <div className="info-grid">
                        <div>
                            <label>Họ tên</label>
                            <p>{hoTen}</p>
                        </div>
                        <div>
                            <label>Email</label>
                            <p>{email}</p>
                        </div>
                        <div>
                            <label>Số điện thoại</label>
                            <p>{soDienThoai}</p>
                        </div>
                        <div>
                            <label>Giới tính</label>
                            <p>{genderLabel}</p>
                        </div>
                        <div>
                            <label>Khu vực</label>
                            <p>{khuVuc}</p>
                        </div>
                        <div>
                            <label>Ngày sinh</label>
                            <p>
                                {profile?.ngaySinh
                                    ? new Date(profile.ngaySinh).toLocaleDateString('vi-VN')
                                    : 'Chưa cập nhật'}
                            </p>
                        </div>
                        <div>
                            <label>Mục tiêu tham gia</label>
                            <p>{profile?.mucTieuThamGia || 'Chưa cập nhật'}</p>
                        </div>
                        <div>
                            <label>Thời gian rảnh</label>
                            <p>{profile?.thoiGianRanh || 'Chưa cập nhật'}</p>
                        </div>
                    </div>
                </section>

                {/* ABOUT */}
                <section className="profile-card">
                    <h2>Giới thiệu bản thân</h2>
                    <p className="about">{tieuSu}</p>
                </section>

                {/* INTEREST */}
                <section className="profile-card">
                    <h2>Sở thích</h2>
                    <div className="tags">
                        {soThich.length > 0 ? (
                            soThich.map((st) => <span key={st.soThichId}>🌱 {st.tenSoThich}</span>)
                        ) : (
                            <span className="tag-empty">Chưa có sở thích nào.</span>
                        )}
                    </div>
                </section>
            </div>
        </SidebarLayout>
    );
}
