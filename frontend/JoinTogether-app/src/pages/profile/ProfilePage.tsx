import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile } from '../../services/profile.service';
import SidebarLayout from '../../components/SidebarLayout';
import type { HoSoNguoiDung, SoThich } from '../../types/profile';
import './Profile.css';

export default function ProfilePage() {
    const { nguoiDungId } = useAuth();
    const navigate = useNavigate();
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
            <div className="profile-container">
                {/* PROFILE HEADER CARD */}
                <section className="profile-card profile-summary">
                    <img className="main-avatar" src={anhDaiDien} alt="avatar" />
                    <div className="user-info">
                        <h1>{hoTen}</h1>
                        <p>@{tenDangNhap}</p>
                        <span className="verified">✓ Tài khoản xác thực</span>
                    </div>
                    <Link to="/profile" className="edit-button" style={{ textDecoration: 'none' }}>
                        Chỉnh sửa thông tin
                    </Link>
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
