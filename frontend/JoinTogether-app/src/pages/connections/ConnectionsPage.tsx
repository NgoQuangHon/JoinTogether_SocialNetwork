import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConnectionsApi, removeConnectionApi } from '../../services/connection.service';
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

  return (
    <SidebarLayout title="Kết nối">
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
              <button
                style={{ border: 'none', background: '#fce4ec', color: '#c62828', fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}
                onClick={() => handleRemove(c.nguoiDungId)}
              >
                Hủy kết nối
              </button>
            </div>
          ))}
        </>
      )}
    </SidebarLayout>
  );
}
