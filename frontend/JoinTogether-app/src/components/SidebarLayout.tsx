import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavItems from './NavItems';

interface SidebarLayoutProps {
  title: string;
  children?: React.ReactNode;
  mobileChildren?: React.ReactNode;
  desktopChildren?: React.ReactNode;
  mobileHeaderRight?: React.ReactNode;
  desktopHeaderRight?: React.ReactNode;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onNavNavigate?: (href: string) => void;
}

export default function SidebarLayout({
  title,
  children,
  mobileChildren,
  desktopChildren,
  mobileHeaderRight,
  desktopHeaderRight,
  showSearch,
  searchValue,
  onSearchChange,
  onNavNavigate,
}: SidebarLayoutProps) {
  const { logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [menuMo, setMenuMo] = useState(false);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const mc = mobileChildren ?? children;
  const dc = desktopChildren ?? children;

  return (
    <>
      <div className="mobile-view" style={menuMo ? { maxHeight: '100vh', overflow: 'hidden' } : undefined}>
        <div className="app-outer">
          <div className="phone-shell">
            <header className="app-header">
              <button className="icon-btn" onClick={() => setMenuMo(true)} aria-label="Mở menu">☰</button>
              <span className="app-title">{title}</span>
              {mobileHeaderRight || <div style={{ width: 28 }} />}
            </header>

            {menuMo && (
              <>
                <div className="drawer-overlay" onClick={() => setMenuMo(false)} />
                <nav className="drawer-panel">
                  <div className="drawer-brand"><div className="brand-icon" style={{ width: 44, height: 44, fontSize: 22 }}>JT</div></div>
                  <NavItems onClose={() => setMenuMo(false)} onNavigate={onNavNavigate} />
                  <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </nav>
              </>
            )}

            <div className="app-body">{mc}</div>
          </div>
        </div>
      </div>

      <div className="desktop-view" style={{ height: '100vh' }}>
        <aside className="sidebar">
          <div className="drawer-brand"><div className="brand-icon" style={{ width: 44, height: 44, fontSize: 22 }}>JT</div></div>
          <nav className="sidebar-nav"><NavItems onNavigate={onNavNavigate} /></nav>
          <div className="sidebar-footer"><button className="logout-btn" onClick={handleLogout}>Đăng xuất</button></div>
        </aside>
        <main className="main-content">
          <header className="topbar">
            <h1>{title}</h1>
            {showSearch && (
              <div className="search-bar topbar-search">
                <span className="search-icon">T</span>
                <input type="text" placeholder="Tìm kiếm hoạt động, bạn bè..." value={searchValue || ''} onChange={(e) => onSearchChange?.(e.target.value)} />
              </div>
            )}
            <div className="topbar-user">
              <span className="user-badge">ID: {nguoiDungId}</span>
              {desktopHeaderRight}
            </div>
          </header>
          <div className="content-body" style={{ maxWidth: 840, margin: '0 auto' }}>
            {dc}
          </div>
        </main>
      </div>
    </>
  );
}
