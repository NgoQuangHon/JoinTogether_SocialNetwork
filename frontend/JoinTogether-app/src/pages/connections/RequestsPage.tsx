import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingRequestsApi, respondToRequestApi } from '../../services/connection.service';
import SidebarLayout from '../../components/SidebarLayout';
import type { ConnectionRequest } from '../../types/connection';
import '../../styles/dashboard.css';

export default function RequestsPage() {
  const { nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <SidebarLayout title="Yêu cầu kết nối">
      {loading ? (
        <p style={{ textAlign: 'center', padding: 32, color: '#90a4ae' }}>Đang tải...</p>
      ) : (
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
                    <button className="edit-button" style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 12, padding: '6px 14px' }} onClick={() => handleRespond(r.yeuCauKetNoiId, true)}>Chấp nhận</button>
                    <button className="edit-button" style={{ background: '#fce4ec', color: '#c62828', fontSize: 12, padding: '6px 14px' }} onClick={() => handleRespond(r.yeuCauKetNoiId, false)}>Từ chối</button>
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
      )}
    </SidebarLayout>
  );
}
