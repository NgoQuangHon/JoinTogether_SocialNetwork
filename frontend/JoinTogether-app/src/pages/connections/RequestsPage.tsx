import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingRequestsApi, respondToRequestApi } from '../../services/connection.service';
import NavItems from '../../components/NavItems';
import type { ConnectionRequest } from '../../types/connection';
import '../../styles/dashboard.css';

function RequestsContent({ received, sent, onRespond }: { received: ConnectionRequest[]; sent: ConnectionRequest[]; onRespond: (id: number, accept: boolean) => void }) {
  const navigate = useNavigate();
  return (
    <>
      <section className="section-block">
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Yêu cầu đến ({received.length})</h3>
        {received.length === 0 ? (
          <p style={{ color: '#90a4ae', fontSize: 13, margin: 0 }}>Không có yêu cầu kết nối nào.</p>
        ) : (
          received.map((r) => (
            <div key={r.yeuCauKetNoiId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: '#1565c0', cursor: 'pointer' }} onClick={() => navigate(`/profile/${r.nguoiGuiId}`)}>
                  {r.nguoiGui || `Người dùng #${r.nguoiGuiId}`}
                </p>
                {r.loiNhan && <p style={{ fontSize: 12, color: '#607d8b', margin: '4px 0 0' }}>"{r.loiNhan}"</p>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="edit-button" style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 12, padding: '6px 14px' }} onClick={() => onRespond(r.yeuCauKetNoiId, true)}>Chấp nhận</button>
                <button className="edit-button" style={{ background: '#fce4ec', color: '#c62828', fontSize: 12, padding: '6px 14px' }} onClick={() => onRespond(r.yeuCauKetNoiId, false)}>Từ chối</button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="section-block section-block-last">
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Yêu cầu đã gửi ({sent.length})</h3>
        {sent.length === 0 ? (
          <p style={{ color: '#90a4ae', fontSize: 13, margin: 0 }}>Bạn chưa gửi yêu cầu kết nối nào.</p>
        ) : (
          sent.map((r) => (
            <div key={r.yeuCauKetNoiId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{r.nguoiNhan || `Người dùng #${r.nguoiNhanId}`}</p>
              </div>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 12, background: '#fff8e1', color: '#f57f17' }}>Đang chờ</span>
            </div>
          ))
        )}
      </section>
    </>
  );
}

export default function RequestsPage() {
  const { logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuMo, setMenuMo] = useState(false);

  useEffect(() => {
    getPendingRequestsApi()
      .then((res) => { if (res.success && res.data) setRequests(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (yeuCauId: number, accept: boolean) => {
    try {
      const res = await respondToRequestApi(yeuCauId, accept);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.yeuCauKetNoiId !== yeuCauId));
      }
    } catch {}
  };

  const received = requests.filter((r) => r.nguoiNhanId === nguoiDungId);
  const sent = requests.filter((r) => r.nguoiGuiId === nguoiDungId);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <>
      {/* Mobile */}
      <div className="mobile-view" style={menuMo ? { maxHeight: '100vh', overflow: 'hidden' } : undefined}>
        <div className="app-outer">
          <div className="phone-shell">
            <header className="app-header">
              <button className="icon-btn" onClick={() => setMenuMo(true)} aria-label="Mở menu">☰</button>
              <span className="app-title">Yêu cầu kết nối</span>
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
              {loading ? <p style={{ textAlign: 'center', padding: 32, color: '#90a4ae' }}>Đang tải...</p> : <RequestsContent received={received} sent={sent} onRespond={handleRespond} />}
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
            <h1>Yêu cầu kết nối</h1>
            <div className="topbar-user"><span className="user-badge">ID: {nguoiDungId}</span></div>
          </header>
          <div className="content-body" style={{ maxWidth: 640, margin: '0 auto' }}>
            {loading ? <p style={{ textAlign: 'center', padding: 32, color: '#90a4ae' }}>Đang tải...</p> : <RequestsContent received={received} sent={sent} onRespond={handleRespond} />}
          </div>
        </main>
      </div>
    </>
  );
}
