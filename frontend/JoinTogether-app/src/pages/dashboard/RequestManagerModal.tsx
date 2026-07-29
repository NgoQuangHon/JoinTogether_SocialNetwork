import { useState, useEffect } from 'react';
import { getPendingRequestsApi, approveRequestApi, rejectRequestApi } from '../../services/activity.service';
import type { YeuCauThamGia } from '../../services/activity.service';
import './CreateActivity.css';

interface RequestManagerModalProps {
  hoatDongId: number;
  tenHoatDong: string;
  onClose: () => void;
  onProcessed: () => void;
}

export default function RequestManagerModal({
  hoatDongId,
  tenHoatDong,
  onClose,
  onProcessed,
}: RequestManagerModalProps) {
  const [requests, setRequests] = useState<YeuCauThamGia[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadRequests = () => {
    setLoading(true);
    setError('');
    getPendingRequestsApi(hoatDongId)
      .then((res) => {
        if (res.success && res.data) {
          setRequests(res.data);
        } else {
          setError(res.message || 'Không thể tải danh sách yêu cầu.');
        }
      })
      .catch(() => setError('Không thể tải danh sách yêu cầu.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, [hoatDongId]);

  const handleApprove = async (yeuCauId: number) => {
    setProcessing(yeuCauId);
    setError('');
    try {
      const res = await approveRequestApi(hoatDongId, yeuCauId);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.yeuCauId !== yeuCauId));
        onProcessed();
      } else {
        setError(res.message || 'Chấp nhận thất bại.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Chấp nhận thất bại.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (yeuCauId: number) => {
    setProcessing(yeuCauId);
    setError('');
    try {
      const res = await rejectRequestApi(hoatDongId, yeuCauId);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.yeuCauId !== yeuCauId));
        onProcessed();
      } else {
        setError(res.message || 'Từ chối thất bại.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Từ chối thất bại.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="cam-overlay" onClick={onClose} style={{ zIndex: 1150 }}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="cam-header">
          <h2>📋 Yêu cầu tham gia</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#37474f', fontWeight: 600 }}>
            {tenHoatDong}
          </p>

          {error && (
            <div style={{ padding: '10px 14px', background: '#ffebee', color: '#c62828', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', color: '#78909c', padding: 30 }}>Đang tải danh sách yêu cầu...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#78909c', padding: 40 }}>
              <p style={{ fontSize: 40, margin: '0 0 12px 0' }}>📭</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Không có yêu cầu tham gia nào đang chờ.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
              {requests.map((req) => (
                <div
                  key={req.yeuCauId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid #e4ece6',
                    background: '#fafbfc',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: '#6fbf73',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {(req.hoTen || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: 14, color: '#263238' }}>{req.hoTen || `Người dùng #${req.nguoiDungId}`}</strong>
                        {req.email && <div style={{ fontSize: 12, color: '#78909c' }}>{req.email}</div>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="save-btn"
                      onClick={() => handleApprove(req.yeuCauId)}
                      disabled={processing === req.yeuCauId}
                      style={{ padding: '6px 16px', fontSize: 12, borderRadius: 14 }}
                    >
                      {processing === req.yeuCauId ? '...' : '✅ Chấp nhận'}
                    </button>
                    <button
                      className="cam-btn-outline"
                      onClick={() => handleReject(req.yeuCauId)}
                      disabled={processing === req.yeuCauId}
                      style={{ padding: '6px 16px', fontSize: 12, borderRadius: 14, color: '#d32f2f', borderColor: '#ffcdd2' }}
                    >
                      ❌ Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
