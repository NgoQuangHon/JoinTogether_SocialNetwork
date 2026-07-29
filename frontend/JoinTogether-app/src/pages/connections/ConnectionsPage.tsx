import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getConnectionsApi, removeConnectionApi } from '../../services/connection.service';
import NavItems from '../../components/NavItems';
import '../../styles/dashboard.css';

function ConnectionsContent() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConnectionsApi()
      .then((res) => { if (res.success && res.data) setConnections(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (userId: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy kết nối với người dùng này?')) return;
    try {
      const res = await removeConnectionApi(userId);
      if (res.success) {
        setConnections((prev) => prev.filter((c) => c.nguoiDungId !== userId));
      }
    } catch {}
  };

  if (loading) return <p style={{ textAlign: 'center', padding: 32, color: '#90a4ae' }}>Đang tải...</p>;
  if (connections.length === 0) return <p style={{ textAlign: 'center', padding: 32, color: '#90a4ae' }}>Chưa có kết nối nào.</p>;

  return (
    <>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Danh sách kết nối ({connections.length})</h3>
      {connections.map((c) => (
        <div key={c.quanHeId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div
            style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f5e9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#2e7d32', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => navigate(`/profile/${c.nguoiDungId}`)}
          >
            {c.anhDaiDien ? <img src={c.anhDaiDien} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (c.hoTen || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/profile/${c.nguoiDungId}`)}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{c.hoTen || `Người dùng #${c.nguoiDungId}`}</p>
            {c.email && <p style={{ fontSize: 12, color: '#90a4ae', margin: '2px 0 0' }}>{c.email}</p>}
          </div>
          <button
            style={{ border: 'none', background: '#fce4ec', color: '#c62828', fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}
            onClick={() => handleRemove(c.nguoiDungId)}
          >
            Hủy kết nối
          </button>
        </div>
      ))}
    </>
  );
}

export default function ConnectionsPage() {
  const { logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [menuMo, setMenuMo] = useState(false);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <>
      {/* Mobile */}
      <div className="mobile-view" style={menuMo ? { maxHeight: '100vh', overflow: 'hidden' } : undefined}>
        <div className="app-outer">
          <div className="phone-shell">
            <header className="app-header">
              <button className="icon-btn" onClick={() => setMenuMo(true)} aria-label="Mở menu">☰</button>
              <span className="app-title">Kết nối</span>
              <div style={{ width: 28 }} />
            </header>

            {menuMo && (
              <>
                <div className="drawer-overlay" onClick={() => setMenuMo(false)} />
                <nav className="drawer-panel">
                  <div className="drawer-brand"><div className="brand-icon" style={{ width: 44, height: 44, fontSize: 22 }}>JT</div></div>
                  <NavItems onClose={() => setMenuMo(false)} />
                  <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </nav>
              </>
            )}

            <div className="app-body">
              <ConnectionsContent />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="desktop-view" style={{ height: '100vh' }}>
        <aside className="sidebar">
          <div className="drawer-brand"><div className="brand-icon" style={{ width: 44, height: 44, fontSize: 22 }}>JT</div></div>
          <nav className="sidebar-nav"><NavItems /></nav>
          <div className="sidebar-footer"><button className="logout-btn" onClick={handleLogout}>Đăng xuất</button></div>
        </aside>
        <main className="main-content">
          <header className="topbar">
            <h1>Kết nối</h1>
            <div className="topbar-user"><span className="user-badge">ID: {nguoiDungId}</span></div>
          </header>
          <div className="content-body" style={{ maxWidth: 640, margin: '0 auto' }}>
            <ConnectionsContent />
          </div>
        </main>
      </div>
    </>
  );
}
