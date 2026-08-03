import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile } from '../../services/profile.service';
import NavItems from '../NavItems';
import '../../styles/dashboard.css';

interface MainLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function MainLayout({ children, pageTitle: _pageTitle = 'JoinTogether' }: MainLayoutProps) {
  const { logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (nguoiDungId) {
      getMyProfile()
        .then((res) => {
          if (res.success && res.data) {
            const name = res.data.user?.hoTen || `Thành viên #${nguoiDungId}`;
            setUserName(name);
            if (res.data.anhDaiDien) setAvatarUrl(res.data.anhDaiDien);
          }
        })
        .catch(() => {
          setUserName(`Thành viên #${nguoiDungId}`);
        });
    }
  }, [nguoiDungId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout-container">
      {/* ================= DESKTOP SIDEBAR (>= 1024px) ================= */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">🌿</div>
          <span className="brand-text">JoinTogether</span>
        </div>

        <nav className="sidebar-nav">
          <NavItems />
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info" onClick={() => navigate('/my-profile')} style={{ cursor: 'pointer' }}>
            <div className="sidebar-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="sidebar-avatar-img" />
              ) : (
                <div className="avatar-tron" style={{ background: '#6fbf73', width: 32, height: 32, fontSize: 13, color: '#fff' }}>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <span className="user-name" title={userName || `Thành viên #${nguoiDungId || 1}`}>
              {userName || `Thành viên #${nguoiDungId || 1}`}
            </span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>



      {/* ================= MOBILE DRAWER MENU OVERLAY ================= */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="brand-icon" style={{ width: 36, height: 36, fontSize: 16 }}>JT</div>
              <span className="brand-name">JoinTogether</span>
              <button className="drawer-close-btn" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            <nav className="drawer-nav">
              <NavItems onClose={() => setDrawerOpen(false)} />
            </nav>
            <button className="logout-btn" onClick={handleLogout} style={{ marginTop: 'auto' }}>
              Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <main className="main-content-body">
        {children}
      </main>

      {/* ================= MOBILE BOTTOM TAB BAR (< 1024px) ================= */}
      <nav className="mobile-bottom-nav">
        <button
          className={`bottom-tab-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <span className="tab-icon">🏠</span>
          <span>Trang chủ</span>
        </button>

        <button
          className={`bottom-tab-item ${isActive('/activities') ? 'active' : ''}`}
          onClick={() => navigate('/activities')}
        >
          <span className="tab-icon">📅</span>
          <span>Hoạt động</span>
        </button>

        <button
          className={`bottom-tab-item ${isActive('/ai-match') ? 'active' : ''}`}
          onClick={() => navigate('/ai-match')}
        >
          <span className="tab-icon">✦</span>
          <span>AI Match</span>
        </button>

        <button
          className={`bottom-tab-item ${isActive('/connections') || isActive('/requests') ? 'active' : ''}`}
          onClick={() => navigate('/connections')}
        >
          <span className="tab-icon">👥</span>
          <span>Kết nối</span>
        </button>

        <button
          className={`bottom-tab-item ${isActive('/my-profile') || isActive('/profile') ? 'active' : ''}`}
          onClick={() => navigate('/my-profile')}
        >
          <span className="tab-icon">👤</span>
          <span>Hồ sơ</span>
        </button>
      </nav>
    </div>
  );
}
