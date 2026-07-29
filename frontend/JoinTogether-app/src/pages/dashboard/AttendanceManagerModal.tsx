import { useState, useEffect } from 'react';
import { getAttendanceListApi, updateAttendanceStatusApi, sendReminderApi } from '../../services/activity.service';
import './CreateActivity.css';

interface AttendanceManagerModalProps {
  hoatDongId: number;
  tenHoatDong: string;
  onClose: () => void;
}

export default function AttendanceManagerModal({
  hoatDongId,
  tenHoatDong,
  onClose,
}: AttendanceManagerModalProps) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchList = () => {
    setLoading(true);
    getAttendanceListApi(hoatDongId)
      .then((res) => {
        if (res.success && res.data) {
          setList(res.data);
        }
      })
      .catch(() => setError('Không thể tải danh sách điểm danh.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [hoatDongId]);

  const handleUpdateStatus = async (thanhVienId: number, status: string) => {
    setError('');
    setMessage('');
    try {
      const res = await updateAttendanceStatusApi(hoatDongId, thanhVienId, status);
      if (res.success) {
        setMessage(`Đã cập nhật trạng thái điểm danh.`);
        fetchList();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  const handleSendReminder = async () => {
    if (sendingReminder) return;
    setSendingReminder(true);
    setError('');
    setMessage('');

    try {
      const res = await sendReminderApi(hoatDongId);
      if (res.success) {
        setMessage(res.message || 'Đã gửi thông báo nhắc lịch cho thành viên!');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gửi nhắc lịch thất bại.');
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <div className="cam-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="cam-header">
          <h2>📋 Quản lý điểm danh & Tham dự thực tế</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: '#3d7d43' }}>
              {tenHoatDong}
            </h3>
            <button
              type="button"
              className="save-btn"
              onClick={handleSendReminder}
              disabled={sendingReminder}
              style={{ borderRadius: 20, padding: '8px 16px', fontSize: 13 }}
            >
              {sendingReminder ? 'Đang gửi...' : '⏰ Gửi nhắc lịch'}
            </button>
          </div>

          {message && (
            <div style={{ padding: '10px 14px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
              ✅ {message}
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', background: '#ffebee', color: '#c62828', borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid #e4ece6', borderRadius: 12 }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#90a4ae' }}>Đang tải danh sách thành viên điểm danh...</div>
            ) : list.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#90a4ae' }}>
                Chưa có dữ liệu điểm danh. Khi thành viên check-in, danh sách sẽ tự động hiển thị tại đây.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f5f7f6', textAlign: 'left', color: '#546e7a' }}>
                    <th style={{ padding: '10px 14px' }}>Họ tên</th>
                    <th style={{ padding: '10px 14px' }}>Trạng thái điểm danh</th>
                    <th style={{ padding: '10px 14px' }}>Thời gian check-in</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => {
                    const statusStr = item.trangThaiThamDu;
                    return (
                      <tr key={item.xacNhanId || item.thanhVienId} style={{ borderBottom: '1px solid #e4ece6' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#263238' }}>
                          {item.hoTen || `Thành viên #${item.nguoiDungId}`}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 600,
                              background:
                                statusStr === 'DA_DIEM_DANH' ? '#e8f5e9' :
                                statusStr === 'CHO_XAC_MINH' ? '#fff3e0' : '#ffebee',
                              color:
                                statusStr === 'DA_DIEM_DANH' ? '#2e7d32' :
                                statusStr === 'CHO_XAC_MINH' ? '#e65100' : '#c62828',
                            }}
                          >
                            {statusStr === 'DA_DIEM_DANH' ? '✓ Đã điểm danh' :
                             statusStr === 'CHO_XAC_MINH' ? '⏳ Chờ xác minh' : '✕ Vắng mặt'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#78909c' }}>
                          {item.thoiGianCheckIn ? new Date(item.thoiGianCheckIn).toLocaleString('vi-VN') : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.thanhVienId, 'DA_DIEM_DANH')}
                              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #4caf50', background: '#fff', color: '#2e7d32', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                            >
                              Duyệt mặt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.thanhVienId, 'VANG_MAT')}
                              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #f44336', background: '#fff', color: '#c62828', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                            >
                              Vắng mặt
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <button className="cam-btn-outline" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
