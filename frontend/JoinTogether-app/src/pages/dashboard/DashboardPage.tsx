import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';
import {
  baiVietList as baiVietMauBanDau,
  hoatDongNoiBatList,
  goiYKetNoiList,
  hoatDongSapDienRaList,
  type BaiViet,
} from './feedMockData';

// ==================== HELPERS ====================

function Avatar({ mau, chu, kichThuoc = 44 }: { mau: string; chu: string; kichThuoc?: number }) {
  return (
    <div
      className="avatar-tron"
      style={{ background: mau, width: kichThuoc, height: kichThuoc, fontSize: kichThuoc * 0.42 }}
    >
      {chu}
    </div>
  );
}

function nhanTrangThai(trangThai: 'sap-dien-ra' | 'con-cho' | 'sap-day') {
  switch (trangThai) {
    case 'con-cho':
      return { text: 'Còn chỗ', className: 'badge-success' };
    case 'sap-day':
      return { text: 'Sắp đầy', className: 'badge-warning' };
    default:
      return { text: 'Sắp diễn ra', className: 'badge-info' };
  }
}

// ==================== TRANG DASHBOARD ====================

export default function DashboardPage() {
  const { logout, nguoiDungId, role } = useAuth();
  const navigate = useNavigate();
  const [baiVietList, setBaiVietList] = useState<BaiViet[]>(baiVietMauBanDau);
  const [noiDungMoi, setNoiDungMoi] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">🌿</div>
                    <span className="brand-name">JoinTogether</span>
                </div>

                <nav className="sidebar-nav">
                    <a href="/dashboard" className="nav-item active">
                        <span className="nav-icon">📊</span>
                        Tổng quan
                    </a>
                    <a href="/profile" className="nav-item">
                        <span className="nav-icon">👤</span>
                        Hồ sơ
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">🎯</span>
                        Hoạt động
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">🔗</span>
                        Kết nối
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">💬</span>
                        Tin nhắn
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">⭐</span>
                        Đánh giá
                    </a>
                    {role === 'ADMIN' && (
                        <a href="#" className="nav-item">
                            <span className="nav-icon">⚙️</span>
                            Quản trị
                        </a>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <h1>Tổng quan</h1>
                    <div className="topbar-user">
                        <span className="user-badge">ID: {nguoiDungId}</span>
                        <span className="user-avatar">👤</span>
                    </div>
                </header>

                <div className="content-body">
                    <div className="welcome-card">
                        <h2>Chào mừng bạn đến với JoinTogether!</h2>
                        <p>Đây là trang tổng quan. Các tính năng đang được phát triển.</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-info">
                                <h3>0</h3>
                                <p>Hoạt động</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🔗</div>
                            <div className="stat-info">
                                <h3>0</h3>
                                <p>Kết nối</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-info">
                                <h3>0</h3>
                                <p>Đánh giá</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💬</div>
                            <div className="stat-info">
                                <h3>0</h3>
                                <p>Tin nhắn</p>
                            </div>
                        </div>
                    </div>

                    <div className="placeholder-section">
                        <div className="placeholder-card">
                            <h3>Hoạt động gần đây</h3>
                            <p className="text-muted">Chưa có hoạt động nào.</p>
                        </div>
                        <div className="placeholder-card">
                            <h3>Kết nối gợi ý</h3>
                            <p className="text-muted">Chưa có gợi ý kết nối.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
