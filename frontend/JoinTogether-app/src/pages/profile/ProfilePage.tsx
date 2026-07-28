import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile } from '../../services/profile.service';
import type { HoSoNguoiDung, SoThich } from '../../types/profile';
import './Profile.css';

export default function ProfilePage() {
    const { logout, nguoiDungId } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [profile, setProfile] = useState<HoSoNguoiDung | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="spinner" />
                    <p>Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <p className="error-text">{error}</p>
                    <button className="edit-button" onClick={() => navigate('/edit-profile')}>
                        Quay về bảng tin
                    </button>
                </div>
            </div>
        );
    }

    const hoTen = `Người dùng #${nguoiDungId}`;
    const tenDangNhap = `user_${nguoiDungId}`;
    const tieuSu = profile?.tieuSu || 'Chưa có thông tin giới thiệu.';
    const khuVuc = profile?.khuVuc || 'Chưa cập nhật';
    const anhDaiDien = profile?.anhDaiDien || 'https://i.pravatar.cc/200';
    const soThich: SoThich[] = profile?.soThich || [];

    return (
        <div className="profile-page">
            {/* ================= HEADER ================= */}
            <header className="profile-header">
                <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
                    ☰
                </button>
                <Link to="/dashboard" className="logo" style={{ textDecoration: 'none' }}>
                    JoinTogether
                </Link>
                <div className="header-user">
                    <span>🔔</span>
                    <img src={anhDaiDien} alt="avatar" />
                </div>
            </header>

            {/* ================= OVERLAY ================= */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

            {/* ================= SIDEBAR ================= */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>
                    ✕
                </button>

                <div className="sidebar-profile">
                    <img src={anhDaiDien} alt="avatar" />
                    <h3>{hoTen}</h3>
                    <span>@{tenDangNhap}</span>
                </div>

                <ul className="sidebar-menu">
                    <li className="active">👤 Hồ sơ</li>
                    <li
                        onClick={() => {
                            setIsSidebarOpen(false);
                            navigate('/dashboard');
                        }}
                    >
                        📝 Bảng tin
                    </li>
                    <li>🌱 Sở thích</li>
                    <li>📅 Hoạt động</li>
                    <li>⭐ Đánh giá</li>
                    <li>⚙ Cài đặt</li>
                </ul>

                <button className="logout-button" onClick={handleLogout}>
                    🚪 Đăng xuất
                </button>
            </aside>

            {/* ================= PROFILE CONTENT ================= */}
            <main className="profile-container">
                {/* PROFILE HEADER CARD */}
                <section className="profile-card profile-summary">
                    <img className="main-avatar" src={anhDaiDien} alt="avatar" />
                    <div className="user-info">
                        <h1>{hoTen}</h1>
                        <p>@{tenDangNhap}</p>
                        <span className="verified">✓ Tài khoản xác thực</span>
                    </div>
                    <Link to="/profile/edit" className="edit-button" style={{ textDecoration: 'none' }}>
                        Chỉnh sửa thông tin
                    </Link>
                </section>

                {/* STATISTIC */}
                <section className="statistic-grid">
                    <div className="stat-card">
                        <h2>{profile ? '100%' : '0%'}</h2>
                        <p>Hoàn thiện hồ sơ</p>
                        <div className="progress">
                            <span style={{ width: profile ? '100%' : '0%' }} />
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
            </main>
        </div>
    );
}
