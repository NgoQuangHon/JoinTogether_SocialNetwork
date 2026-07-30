import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConnectionsApi, removeConnectionApi } from '../../services/connection.service';
import { getOrCreatePrivateRoomApi } from '../../services/chat.service';
import SidebarLayout from '../../components/SidebarLayout';
import '../../styles/dashboard.css';

export default function ConnectionsPage() {
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

  const handleStartChat = async (userId: number) => {
    try {
      const res = await getOrCreatePrivateRoomApi(userId);
      if (res.success && res.data) {
        navigate(`/chat?room=${res.data.phongId}`);
      }
    } catch {
      alert('Không thể bắt đầu chat riêng với người dùng này.');
    }
  };

  return (
    <SidebarLayout title="Kết nối">
      {/* Navigation Sub-Tabs cho phép truy cập nhanh Bạn bè, Yêu cầu kết nối, Tìm bạn lân cận */}
      <div className="connection-nav-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e0e0e0', paddingBottom: 10, overflowX: 'auto' }}>
        <button
          onClick={() => navigate('/connections')}
          style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: '#2e7d32', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          👥 Bạn bè ({connections.length})
        </button>
        <button
          onClick={() => navigate('/requests')}
          style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e0e0e0', background: '#fff', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📩 Yêu cầu kết nối
        </button>
        <button
          onClick={() => navigate('/nearby')}
          style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e0e0e0', background: '#fff', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📍 Tìm bạn lân cận
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: 32, color: '#90a4ae' }}>Đang tải...</p>
      ) : connections.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 32, color: '#90a4ae' }}>Chưa có kết nối nào.</p>
      ) : (
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{ border: 'none', background: '#e8f5e9', color: '#2e7d32', fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}
                  onClick={() => handleStartChat(c.nguoiDungId)}
                >
                  💬 Bắt đầu chat
                </button>
                <button
                  style={{ border: 'none', background: '#fce4ec', color: '#c62828', fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => handleRemove(c.nguoiDungId)}
                >
                  Hủy kết nối
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </SidebarLayout>
  );
}
