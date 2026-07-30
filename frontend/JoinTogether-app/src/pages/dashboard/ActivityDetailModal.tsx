import { useState, useEffect } from 'react';
import type { HoatDongResponse } from '../../types/activity';
import { cancelActivityApi, joinActivityApi, leaveActivityApi } from '../../services/activity.service';
import { getReviewsByActivityApi } from '../../services/review.service';
import type { DanhGia } from '../../types/review';
import EditActivityModal from './EditActivityModal';
import CriteriaManagerModal from './CriteriaManagerModal';
import ActivityChatModal from '../../components/chat/ActivityChatModal';
import CheckInModal from './CheckInModal';
import AttendanceManagerModal from './AttendanceManagerModal';
import SubmitReviewModal from './SubmitReviewModal';
import RequestManagerModal from './RequestManagerModal';
import ReportModal from '../../components/report/ReportModal';
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
  onDataChanged,
  currentUserId,
}: {
  activity: HoatDongResponse;
  onClose: () => void;
  onCancel: (id: number) => void;
  onEdited: () => void;
  currentUserId?: number | null;
  onDataChanged?: () => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState(false);
  const [isMember, setIsMember] = useState(activity.isMember ?? false);
  const [trangThaiYeuCau, setTrangThaiYeuCau] = useState<string | null>(activity.trangThaiYeuCau ?? null);
  const [reviewsList, setReviewsList] = useState<DanhGia[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    setIsMember(activity.isMember ?? false);
    setTrangThaiYeuCau(activity.trangThaiYeuCau ?? null);
  }, [activity.isMember, activity.trangThaiYeuCau]);

  useEffect(() => {
    if (activity.hoatDongId) {
      setLoadingReviews(true);
      getReviewsByActivityApi(activity.hoatDongId)
        .then((res) => {
          if (res.success && res.data) {
            setReviewsList(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingReviews(false));
    }
  }, [activity.hoatDongId]);

  const isOwner = currentUserId != null && activity.nguoiToChucId === currentUserId;

  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    setActionMsg('');
    setActionError(false);
    try {
      const res = await joinActivityApi(activity.hoatDongId);
      if (res.success) {
        setTrangThaiYeuCau('PENDING');
        setActionMsg('Đã gửi yêu cầu tham gia thành công! Người tổ chức sẽ xem xét và phê duyệt.');
        onDataChanged?.();
      } else {
        setActionMsg(res.message || 'Gửi yêu cầu thất bại.');
        setActionError(true);
      }
    } catch (err: any) {
      setActionMsg(err?.response?.data?.message || 'Không thể gửi yêu cầu tham gia.');
      setActionError(true);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (leaving || !window.confirm('Bạn có chắc muốn rời khỏi hoạt động này?')) return;
    setLeaving(true);
    setActionMsg('');
    setActionError(false);
    try {
      const res = await leaveActivityApi(activity.hoatDongId);
      if (res.success) {
        setIsMember(false);
        setTrangThaiYeuCau(null);
        setActionMsg('Đã rời khỏi hoạt động.');
        onDataChanged?.();
      } else {
        setActionMsg(res.message || 'Rời hoạt động thất bại.');
        setActionError(true);
      }
    } catch (err: any) {
      setActionMsg(err?.response?.data?.message || 'Không thể rời hoạt động.');
      setActionError(true);
    } finally {
      setLeaving(false);
    }
  };

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
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {(() => {
                if (isOwner) {
                  return <span style={{ background: '#2e7d32', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>owner</span>;
                }
                if (isMember) {
                  return <span style={{ background: '#1565c0', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>member</span>;
                }
                if (trangThaiYeuCau === 'PENDING') {
                  return <span style={{ background: '#e65100', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>đã gửi yêu cầu</span>;
                }
                return null;
              })()}
              <span className="cam-detail-status" style={{ background: statusColor }}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Yêu cầu 3: Hiện người tạo hoạt động */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 12, padding: '8px 12px', background: '#f5f7fa', borderRadius: 8 }}>
            <img
              src={activity.anhDaiDienNguoiToChuc || `https://i.pravatar.cc/100?u=${activity.nguoiToChucId}`}
              alt={activity.nguoiToChuc || 'Người tạo'}
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <span style={{ fontSize: 11, color: '#78909c', display: 'block' }}>Người tạo hoạt động</span>
              <strong style={{ fontSize: 13, color: '#263238' }}>{activity.nguoiToChuc || 'Ẩn danh'}</strong>
            </div>
          </div>

          {activity.tenDanhMuc && (
            <p className="cam-detail-cat">{activity.tenDanhMuc}</p>
          )}

          {activity.thoiGianBatDau && (
            <p className="cam-review-time">
              {new Date(activity.thoiGianBatDau).toLocaleString('vi-VN')}
              {activity.thoiGianKetThuc && ` — ${new Date(activity.thoiGianKetThuc).toLocaleString('vi-VN')}`}
            </p>
          )}

          {activity.hinhThuc && (
            <p className="cam-review-place" style={{ marginTop: 4 }}>
              Hình thức: {activity.hinhThuc === 'online' ? 'Online' : 'Offline'}
            </p>
          )}

          {activity.hanDangKy && (
            <p className="cam-review-place" style={{ marginTop: 4 }}>
              Hạn đăng ký: {new Date(activity.hanDangKy).toLocaleString('vi-VN')}
            </p>
          )}

          {activity.tenDiaDiem && (
            <p className="cam-review-place">
              {activity.tenDiaDiem}{activity.diaChi ? `, ${activity.diaChi}` : ''}
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
              {activity.soLuongToiDa != null && (
                <p style={{ fontSize: 13, color: '#607d8b', marginTop: 4 }}>
                  {activity.soLuongToiDa - activity.soLuongThanhVien} chỗ trống (tối đa {activity.soLuongToiDa})
                </p>
              )}
            </div>
          )}

          {/* Yêu cầu 6: Danh sách đánh giá của các thành viên với hoạt động */}
          <div className="cam-detail-section" style={{ marginTop: 20 }}>
            <h5 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>⭐ Đánh giá từ thành viên ({reviewsList.length})</span>
            </h5>
            {loadingReviews ? (
              <p style={{ fontSize: 13, color: '#90a4ae' }}>Đang tải đánh giá...</p>
            ) : reviewsList.length === 0 ? (
              <p style={{ fontSize: 13, color: '#90a4ae' }}>Chưa có đánh giá nào cho hoạt động này.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {reviewsList.map((r) => (
                  <div key={r.danhGiaId} style={{ background: '#fafafa', border: '1px solid #eeeeee', borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={r.anhDaiDienNguoiDanhGia || `https://i.pravatar.cc/100?u=${r.nguoiDanhGiaId}`}
                          alt={r.nguoiDanhGia || 'User'}
                          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{r.nguoiDanhGia || 'Thành viên'}</span>
                        {r.loaiDanhGia === 'HOAT_DONG' ? (
                          <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Đánh giá Hoạt động</span>
                        ) : (
                          <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                            Đánh giá người dùng: {r.nguoiDuocDanhGia || ''}
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#ff9800', fontWeight: 700, fontSize: 13 }}>{'★'.repeat(r.diemTong || 5)} ({r.diemTong || 5}/5)</span>
                    </div>
                    {r.nhanXet && <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#37474f' }}>{r.nhanXet}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isCancelled && isOwner && (() => {
          const isOngoing = activity.trangThai === 'dang_dien_ra' || Boolean(activity.thoiGianBatDau && new Date(activity.thoiGianBatDau) <= new Date());
          return (
            <div className="cam-detail-actions">
              {activity.trangThai === 'da_ket_thuc' && (
                <button className="cam-btn-outline" onClick={() => setShowReview(true)}>
                  ⭐ Đánh giá
                </button>
              )}
              <button className="cam-btn-outline" onClick={() => setShowAttendance(true)}>
                📋 Điểm danh
              </button>
              <button className="cam-btn-outline" onClick={() => setShowRequests(true)}>
                📋 Yêu cầu
              </button>
              <button className="cam-btn-outline" onClick={() => setShowChat(true)}>
                💬 Trò chuyện
              </button>
              <button
                className="cam-btn-outline cam-btn-danger"
                onClick={() => setShowCancelConfirm(true)}
              >
                Hủy
              </button>
              <button className="cam-btn-outline" onClick={() => setShowCriteria(true)}>
                Tiêu chí
              </button>
              <button
                className="cam-btn-primary"
                disabled={isOngoing}
                title={isOngoing ? 'Hoạt động đang diễn ra không thể chỉnh sửa' : ''}
                onClick={() => !isOngoing && setShowEdit(true)}
              >
                {isOngoing ? 'Đang diễn ra (không thể sửa)' : 'Chỉnh sửa'}
              </button>
            </div>
          );
        })()}

        {!isCancelled && !isOwner && (
          <div className="cam-detail-actions">
            {actionMsg && (
              <div style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                background: actionError ? '#ffebee' : '#e8f5e9',
                color: actionError ? '#c62828' : '#2e7d32',
                border: actionError ? '1px solid #ffcdd2' : '1px solid #c8e6c9',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                {actionError ? '⚠️ ' : '✅ '}{actionMsg}
              </div>
            )}
            <button className="cam-btn-outline" onClick={() => setShowReport(true)} style={{ color: '#d32f2f', borderColor: '#ffcdd2' }}>
              🚩 Báo cáo
            </button>
            {isMember && (
              <button className="cam-btn-outline" onClick={() => setShowReview(true)}>
                ⭐ Đánh giá
              </button>
            )}
            {isMember && (
              <button className="cam-btn-outline" onClick={() => setShowCheckIn(true)}>
                📲 Check-in
              </button>
            )}
            <button className="cam-btn-outline" onClick={() => setShowChat(true)}>
              💬 Trò chuyện
            </button>
            {(() => {
              const isFull = activity.soLuongToiDa != null && activity.soLuongThanhVien != null && activity.soLuongThanhVien >= activity.soLuongToiDa;
              const isExpired = activity.hanDangKy != null && new Date(activity.hanDangKy) < new Date();
              if (isMember) {
                return (
                  <button
                    className="cam-btn-outline"
                    onClick={handleLeave}
                    disabled={leaving}
                    style={{ color: '#d32f2f', borderColor: '#ffcdd2' }}
                  >
                    {leaving ? 'Đang rời...' : 'Rời hoạt động'}
                  </button>
                );
              }
              if (trangThaiYeuCau === 'PENDING') {
                return (
                  <span style={{ color: '#ff9800', fontSize: 13, fontWeight: 600, padding: '10px 16px', background: '#fff3e0', borderRadius: 12, border: '1px solid #ffe0b2' }}>
                    ⏳ Đã gửi yêu cầu (đang chờ)
                  </span>
                );
              }
              if (trangThaiYeuCau === 'REJECTED') {
                return (
                  <span style={{ color: '#d32f2f', fontSize: 13, fontWeight: 600, padding: '10px 16px', background: '#ffebee', borderRadius: 12, border: '1px solid #ffcdd2' }}>
                    ❌ Yêu cầu bị từ chối
                  </span>
                );
              }
              if (isFull) {
                return <span style={{ color: '#f44336', fontSize: 13, fontWeight: 600 }}>Đã đầy</span>;
              }
              if (isExpired) {
                return <span style={{ color: '#ff9800', fontSize: 13, fontWeight: 600 }}>Hết hạn</span>;
              }
              return (
                <button className="cam-btn-primary" onClick={handleJoin} disabled={joining}>
                  {joining ? 'Đang gửi...' : 'Đăng ký tham gia'}
                </button>
              );
            })()}
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

        {showReport && (
          <ReportModal
            nguoiBiBaoCaoId={activity.nguoiToChucId}
            tenNguoiBiBaoCao={typeof activity.nguoiToChuc === 'object' ? (activity.nguoiToChuc as any)?.hoTen : typeof activity.nguoiToChuc === 'string' ? activity.nguoiToChuc : `Người tổ chức #${activity.nguoiToChucId}`}
            onClose={() => setShowReport(false)}
          />
        )}

        {showReview && (
          <SubmitReviewModal
            hoatDongId={activity.hoatDongId}
            tenHoatDong={activity.tenHoatDong}
            currentUserId={currentUserId || null}
            organizerId={activity.nguoiToChucId}
            onClose={() => setShowReview(false)}
          />
        )}

        {showCheckIn && (
          <CheckInModal
            hoatDongId={activity.hoatDongId}
            tenHoatDong={activity.tenHoatDong}
            onClose={() => setShowCheckIn(false)}
          />
        )}

        {showAttendance && (
          <AttendanceManagerModal
            hoatDongId={activity.hoatDongId}
            tenHoatDong={activity.tenHoatDong}
            onClose={() => setShowAttendance(false)}
          />
        )}

        {showChat && (
          <ActivityChatModal
            hoatDongId={activity.hoatDongId}
            tenHoatDong={activity.tenHoatDong}
            currentUserId={currentUserId || null}
            onClose={() => setShowChat(false)}
          />
        )}

        {showCriteria && (
          <CriteriaManagerModal
            hoatDongId={activity.hoatDongId}
            onClose={() => setShowCriteria(false)}
          />
        )}

        {showRequests && (
          <RequestManagerModal
            hoatDongId={activity.hoatDongId}
            tenHoatDong={activity.tenHoatDong}
            onClose={() => setShowRequests(false)}
            onProcessed={() => {
              setShowRequests(false);
              onEdited();
            }}
          />
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
