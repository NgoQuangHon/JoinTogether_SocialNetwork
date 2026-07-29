import { useState } from 'react';
import { userCheckInApi, cancelParticipationApi } from '../../services/activity.service';
import './CreateActivity.css';

interface CheckInModalProps {
  hoatDongId: number;
  tenHoatDong: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CheckInModal({
  hoatDongId,
  tenHoatDong,
  onClose,
  onSuccess,
}: CheckInModalProps) {
  const [maCheckIn, setMaCheckIn] = useState(`CHECKIN-${hoatDongId}`);
  const [checkingIn, setCheckingIn] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [lyDoHuy, setLyDoHuy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleCheckIn = async () => {
    if (checkingIn) return;
    setCheckingIn(true);
    setError('');
    setMessage('');

    try {
      const res = await userCheckInApi(hoatDongId, maCheckIn);
      if (res.success) {
        setMessage(res.message || 'Check-in thành công!');
        setStatus((res as any).status || 'DA_DIEM_DANH');
        onSuccess?.();
      } else {
        setError(res.message || 'Check-in thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Check-in không thành công. Mã không hợp lệ hoặc lỗi kết nối.';
      setError(msg);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (cancelling) return;
    setCancelling(true);
    setError('');

    try {
      const res = await cancelParticipationApi(hoatDongId, lyDoHuy);
      if (res.success) {
        setMessage('Đã hủy tham gia hoạt động thành công.');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Hủy tham gia thất bại.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="cam-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="cam-header">
          <h2>📲 Check-in / Xác nhận tham gia</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        <div className="cam-form" style={{ padding: '20px 24px' }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary-800, #3d7d43)', fontSize: 15 }}>
            {tenHoatDong}
          </p>

          {message && (
            <div
              style={{
                marginTop: 14,
                padding: '12px 16px',
                borderRadius: 12,
                background: status === 'CHO_XAC_MINH' ? '#fff3e0' : '#e8f5e9',
                color: status === 'CHO_XAC_MINH' ? '#e65100' : '#2e7d32',
                fontSize: 14,
                fontWeight: 600,
                border: status === 'CHO_XAC_MINH' ? '1px solid #ffe0b2' : '1px solid #c8e6c9',
              }}
            >
              {status === 'CHO_XAC_MINH' ? '⏳ ' : '✅ '}
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: 14,
                padding: '12px 16px',
                borderRadius: 12,
                background: '#ffebee',
                color: '#c62828',
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid #ffcdd2',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {!showCancelForm ? (
            <>
              <div style={{ marginTop: 20 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: '#37474f', display: 'block', marginBottom: 8 }}>
                  Nhập Mã Check-in / Xác nhận
                </label>
                <input
                  type="text"
                  value={maCheckIn}
                  onChange={(e) => setMaCheckIn(e.target.value)}
                  placeholder={`Ví dụ: CHECKIN-${hoatDongId}`}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid #cfd8dc',
                    fontSize: 15,
                    fontWeight: 600,
                    outline: 'none',
                    letterSpacing: 1,
                  }}
                />
                <span style={{ fontSize: 12, color: '#78909c', marginTop: 6, display: 'block' }}>
                  Mã check-in mặc định: <strong>CHECKIN-{hoatDongId}</strong>
                </span>
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelForm(true)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#d32f2f',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Hủy tham gia trước giờ G
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="cam-btn-outline" onClick={onClose}>
                    Đóng
                  </button>
                  <button
                    className="save-btn"
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    style={{ borderRadius: 20, padding: '10px 20px' }}
                  >
                    {checkingIn ? 'Đang check-in...' : 'Xác nhận Check-in'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ color: '#c62828', margin: '0 0 8px 0', fontSize: 14 }}>
                Xác nhận Hủy Tham Gia Hoạt Động
              </h4>
              <p style={{ fontSize: 13, color: '#546e7a', margin: '0 0 12px 0' }}>
                Bạn có chắc chắn muốn hủy tham gia? Hành động này sẽ thông báo tới người tổ chức.
              </p>
              <textarea
                rows={3}
                value={lyDoHuy}
                onChange={(e) => setLyDoHuy(e.target.value)}
                placeholder="Nhập lý do hủy tham gia..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid #cfd8dc',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="cam-btn-outline" onClick={() => setShowCancelForm(false)}>
                  Quay lại
                </button>
                <button
                  className="cam-btn-danger"
                  onClick={handleCancelParticipation}
                  disabled={cancelling}
                  style={{ borderRadius: 20, padding: '10px 20px' }}
                >
                  {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
