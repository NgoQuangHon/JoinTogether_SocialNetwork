import { useState, useEffect } from 'react';
import { createReviewApi, getAllTieuChiApi } from '../../services/review.service';
import { getMembersApi } from '../../services/activity.service';
import type { TieuChiDanhGia } from '../../types/review';
import './CreateActivity.css';

interface SubmitReviewModalProps {
  hoatDongId: number;
  tenHoatDong: string;
  currentUserId: number | null;
  organizerId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubmitReviewModal({
  hoatDongId,
  tenHoatDong,
  currentUserId,
  organizerId,
  onClose,
  onSuccess,
}: SubmitReviewModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [tieuChiList, setTieuChiList] = useState<TieuChiDanhGia[]>([]);
  const [selectedRevieweeId, setSelectedRevieweeId] = useState<number | null>(null);
  const [diemTong, setDiemTong] = useState<number>(5);
  const [nhanXet, setNhanXet] = useState<string>('');
  const [chiTietScores, setChiTietScores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMembersApi(hoatDongId).catch(() => ({ success: false, data: [] })),
      getAllTieuChiApi().catch(() => ({ success: false, data: [] })),
    ])
      .then(([memRes, tcRes]) => {
        if (memRes.success && memRes.data) {
          // Filter out current user (Luồng 5c: Self review prevention)
          const validMembers = memRes.data.filter((m: any) => m.nguoiDungId !== currentUserId);
          setMembers(validMembers);
          if (validMembers.length > 0) {
            setSelectedRevieweeId(validMembers[0].nguoiDungId);
          } else if (organizerId && organizerId !== currentUserId) {
            setSelectedRevieweeId(organizerId);
          }
        }

        if (tcRes.success && tcRes.data) {
          setTieuChiList(tcRes.data);
          const initialScores: Record<number, number> = {};
          tcRes.data.forEach((tc: TieuChiDanhGia) => {
            initialScores[tc.tieuChiDanhGiaId] = 5;
          });
          setChiTietScores(initialScores);
        }
      })
      .finally(() => setLoading(false));
  }, [hoatDongId, currentUserId, organizerId]);

  const handleSubmit = async () => {
    if (!selectedRevieweeId) {
      setError('Vui lòng chọn người cần đánh giá.');
      return;
    }

    if (selectedRevieweeId === currentUserId) {
      setError('Bạn không được phép tự đánh giá chính mình.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const chiTiet = Object.entries(chiTietScores).map(([id, score]) => ({
        tieuChiDanhGiaId: Number(id),
        diem: score,
      }));

      const res = await createReviewApi({
        hoatDongId,
        nguoiDuocDanhGiaId: selectedRevieweeId,
        diemTong,
        nhanXet: nhanXet.trim() || undefined,
        chiTiet,
      });

      if (res.success) {
        setSuccessMsg('Gửi đánh giá thành công! Điểm uy tín của đối tượng đã được cập nhật.');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        setError(res.message || 'Gửi đánh giá thất bại.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gửi đánh giá thất bại. Vui lòng kiểm tra lại điều kiện tham dự.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cam-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="cam-header">
          <h2>⭐ Gửi đánh giá uy tín sau hoạt động</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px 0', fontWeight: 600, color: '#3d7d43', fontSize: 15 }}>
            Hoạt động: {tenHoatDong}
          </p>

          {successMsg && (
            <div style={{ padding: '12px 16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
              ✅ {successMsg}
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', background: '#ffebee', color: '#c62828', borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', color: '#90a4ae', padding: 24 }}>Đang tải thông tin thành viên...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Đối tượng đánh giá */}
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, color: '#37474f', display: 'block', marginBottom: 6 }}>
                  1. Chọn thành viên cần đánh giá <span style={{ color: '#f44336' }}>*</span>
                </label>
                <select
                  value={selectedRevieweeId || ''}
                  onChange={(e) => setSelectedRevieweeId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #cfd8dc',
                    fontSize: 14,
                    outline: 'none',
                  }}
                >
                  {members.length === 0 ? (
                    <option value="">Chưa có thành viên khả dụng để đánh giá</option>
                  ) : (
                    members.map((m) => (
                      <option key={m.nguoiDungId} value={m.nguoiDungId}>
                        {m.hoTen || `Thành viên #${m.nguoiDungId}`} {m.nguoiDungId === organizerId ? '(Người tổ chức)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Chấm điểm tổng quan */}
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, color: '#37474f', display: 'block', marginBottom: 6 }}>
                  2. Chấm điểm tổng quan (1 - 5 sao)
                </label>
                <div style={{ display: 'flex', gap: 8, fontSize: 24, cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setDiemTong(star)}
                      style={{ color: star <= diemTong ? '#ffb300' : '#cfd8dc', transition: 'color 0.15s' }}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ fontSize: 14, color: '#546e7a', alignSelf: 'center', marginLeft: 8, fontWeight: 600 }}>
                    {diemTong}/5 sao
                  </span>
                </div>
              </div>

              {/* Tiêu chí chi tiết */}
              {tieuChiList.length > 0 && (
                <div>
                  <label style={{ fontWeight: 600, fontSize: 13, color: '#37474f', display: 'block', marginBottom: 8 }}>
                    3. Đánh giá theo từng tiêu chí
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f7f9f8', padding: 12, borderRadius: 12 }}>
                    {tieuChiList.map((tc) => (
                      <div key={tc.tieuChiDanhGiaId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#37474f', fontWeight: 500 }}>{tc.tenTieuChi}</span>
                        <div style={{ display: 'flex', gap: 4, fontSize: 18, cursor: 'pointer' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              onClick={() => setChiTietScores((prev) => ({ ...prev, [tc.tieuChiDanhGiaId]: s }))}
                              style={{ color: s <= (chiTietScores[tc.tieuChiDanhGiaId] || 5) ? '#ffb300' : '#cfd8dc' }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nhận xét */}
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, color: '#37474f', display: 'block', marginBottom: 6 }}>
                  4. Nhận xét & Đóng góp ý kiến
                </label>
                <textarea
                  rows={3}
                  value={nhanXet}
                  onChange={(e) => setNhanXet(e.target.value)}
                  placeholder="Viết nhận xét trải nghiệm tham gia cùng thành viên này..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #cfd8dc',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button className="cam-btn-outline" onClick={onClose}>
                  Hủy
                </button>
                <button
                  className="save-btn"
                  onClick={handleSubmit}
                  disabled={submitting || !selectedRevieweeId}
                  style={{ borderRadius: 20, padding: '10px 24px' }}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
