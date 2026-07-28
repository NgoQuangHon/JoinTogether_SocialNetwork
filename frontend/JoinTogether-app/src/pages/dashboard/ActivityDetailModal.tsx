import { useState } from 'react';
import type { HoatDongResponse } from '../../types/activity';
import { cancelActivityApi } from '../../services/activity.service';
import EditActivityModal from './EditActivityModal';
import './CreateActivity.css';
import './ActivityDetail.css';

const TRANG_THAI_LABEL: Record<string, string> = {
  sap_dien_ra: 'Sắp diễn ra',
  dang_dien_ra: 'Đang diễn ra',
  da_ket_thuc: 'Đã kết thúc',
  da_huy: 'Đã hủy',
};

const TRANG_THAI_COLOR: Record<string, string> = {
  sap_dien_ra: '#4caf50',
  dang_dien_ra: '#2196f3',
  da_ket_thuc: '#9e9e9e',
  da_huy: '#f44336',
};

export default function ActivityDetailModal({
  activity,
  onClose,
  onCancel,
  onEdited,
}: {
  activity: HoatDongResponse;
  onClose: () => void;
  onCancel: (id: number) => void;
  onEdited: () => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      await cancelActivityApi(activity.hoatDongId, cancelReason.trim());
      onCancel(activity.hoatDongId);
    } catch {
      alert('Hủy hoạt động thất bại.');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
      setCancelReason('');
    }
  };

  const statusLabel = TRANG_THAI_LABEL[activity.trangThai || 'sap_dien_ra'] || 'Sắp diễn ra';
  const statusColor = TRANG_THAI_COLOR[activity.trangThai || 'sap_dien_ra'] || '#4caf50';
  const isCancelled = activity.trangThai === 'da_huy';
  const thumbnail = activity.hinhAnh?.find((h) => h.laAnhDaiDien)?.duongDan;

  if (showEdit) {
    return (
      <EditActivityModal
        activity={activity}
        onClose={() => setShowEdit(false)}
        onSaved={() => {
          setShowEdit(false);
          onEdited();
        }}
      />
    );
  }

  return (
    <div className="cam-overlay" onClick={onClose}>
      <div className="cam-modal cam-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cam-header">
          <h2>Chi tiết hoạt động</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        <div className="cam-detail-body">
          {thumbnail && (
            <div className="cam-detail-thumb">
              <img src={thumbnail} alt={activity.tenHoatDong} />
            </div>
          )}

          <div className="cam-detail-header">
            <h3>{activity.tenHoatDong}</h3>
            <span className="cam-detail-status" style={{ background: statusColor }}>
              {statusLabel}
            </span>
          </div>

          {activity.tenDanhMuc && (
            <p className="cam-detail-cat">{activity.tenDanhMuc}</p>
          )}

          {activity.thoiGianBatDau && (
            <p className="cam-review-time">
              🕐 {new Date(activity.thoiGianBatDau).toLocaleString('vi-VN')}
              {activity.thoiGianKetThuc && ` — ${new Date(activity.thoiGianKetThuc).toLocaleString('vi-VN')}`}
            </p>
          )}

          {activity.tenDiaDiem && (
            <p className="cam-review-place">
              📍 {activity.tenDiaDiem}{activity.diaChi ? `, ${activity.diaChi}` : ''}
            </p>
          )}

          {activity.moTa && (
            <div className="cam-detail-section">
              <h5>Mô tả</h5>
              <p>{activity.moTa}</p>
            </div>
          )}

          <div className="cam-detail-section">
            <h5>Tiêu chí tham gia</h5>
            <ul>
              {activity.soLuongToiDa && <li>Tối đa {activity.soLuongToiDa} người</li>}
              {(activity.doTuoiTu || activity.doTuoiDen) && (
                <li>Độ tuổi: {activity.doTuoiTu || 0} - {activity.doTuoiDen || 99}</li>
              )}
              {activity.gioiTinhPhuHop && <li>Giới tính: {activity.gioiTinhPhuHop === 'nam' ? 'Nam' : activity.gioiTinhPhuHop === 'nu' ? 'Nữ' : 'Tất cả'}</li>}
              {activity.mucDoKinhNghiem && <li>Kinh nghiệm: {activity.mucDoKinhNghiem}</li>}
              {activity.yeuCauKhac && <li>Yêu cầu: {activity.yeuCauKhac}</li>}
            </ul>
          </div>

          {activity.noiQuyChung && (
            <div className="cam-detail-section">
              <h5>Nội quy</h5>
              <p>{activity.noiQuyChung}</p>
            </div>
          )}

          {activity.luuYDatBiet && (
            <div className="cam-detail-section">
              <h5>Lưu ý</h5>
              <p>{activity.luuYDatBiet}</p>
            </div>
          )}

          {activity.doDungCanMang && (
            <div className="cam-detail-section">
              <h5>Đồ dùng cần mang</h5>
              <div className="cam-review-tags">
                {activity.doDungCanMang.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="cam-tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {activity.hinhAnh && activity.hinhAnh.filter((h) => !h.laAnhDaiDien).length > 0 && (
            <div className="cam-detail-section">
              <h5>Hình ảnh</h5>
              <div className="cam-images">
                {activity.hinhAnh.filter((h) => !h.laAnhDaiDien).map((h, i) => (
                  <div key={i} className="cam-image-item">
                    <img src={h.duongDan} alt={`Ảnh ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activity.soLuongThanhVien !== undefined && (
            <div className="cam-detail-section">
              <h5>Tham gia</h5>
              <p>{activity.soLuongThanhVien} người đã tham gia</p>
            </div>
          )}
        </div>

        {!isCancelled && (
          <div className="cam-detail-actions">
            <button
              className="cam-btn-outline cam-btn-danger"
              onClick={() => setShowCancelConfirm(true)}
            >
              🗑 Hủy hoạt động
            </button>
            <button className="cam-btn-primary" onClick={() => setShowEdit(true)}>
              ✏️ Chỉnh sửa
            </button>
          </div>
        )}

        {isCancelled && (
          <div>
            <p className="cam-detail-cancelled">Hoạt động này đã bị hủy.</p>
            {activity.lyDoHuy && (
              <p className="cam-detail-cancelled-reason">
                Lý do: {activity.lyDoHuy}
              </p>
            )}
          </div>
        )}

        {showCancelConfirm && (
          <div className="cam-overlay" onClick={() => { setShowCancelConfirm(false); setCancelReason(''); }}>
            <div className="cam-modal cam-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cam-header">
                <h2>Xác nhận hủy hoạt động</h2>
                <button className="cam-close" onClick={() => { setShowCancelConfirm(false); setCancelReason(''); }}>✕</button>
              </div>
              <div className="cam-confirm-body">
                <p>Bạn có chắc muốn hủy hoạt động "<strong>{activity.tenHoatDong}</strong>"?</p>
                <div className="cam-confirm-reason">
                  <label>Lý do hủy:</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="cam-confirm-actions">
                <button
                  className="cam-btn-outline"
                  onClick={() => { setShowCancelConfirm(false); setCancelReason(''); }}
                >
                  Quay lại
                </button>
                <button
                  className="cam-btn-danger"
                  onClick={handleCancel}
                  disabled={!cancelReason.trim() || cancelling}
                >
                  {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
