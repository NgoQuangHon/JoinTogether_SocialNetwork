import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/SidebarLayout';
import '../../styles/dashboard.css';
import './Review.css';
import {
  getReputationApi,
  getReputationHistoryApi,
  getReviewsForUserApi,
  getAllTieuChiApi,
  createReviewApi,
} from '../../services/review.service';
import type {
  DiemUyTin,
  LichSuDiemUyTin,
  DanhGia,
  TieuChiDanhGia,
} from '../../types/review';

function Avatar({ mau, chu, kichThuoc = 40 }: { mau: string; chu: string; kichThuoc?: number }) {
  return (
    <div
      className="avatar-tron"
      style={{ background: mau, width: kichThuoc, height: kichThuoc, fontSize: kichThuoc * 0.4 }}
    >
      {chu}
    </div>
  );
}

export default function ReviewPage() {
  const { nguoiDungId, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'reputation' | 'history' | 'write' | 'received'>('reputation');
  const [rep, setRep] = useState<DiemUyTin | null>(null);
  const [history, setHistory] = useState<LichSuDiemUyTin[]>([]);
  const [reviews, setReviews] = useState<DanhGia[]>([]);
  const [criteria, setCriteria] = useState<TieuChiDanhGia[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Form state
  const [hoatDongId, setHoatDongId] = useState('');
  const [nguoiDuocDanhGiaId, setNguoiDuocDanhGiaId] = useState('');
  const [nhanXet, setNhanXet] = useState('');
  const [scores, setScores] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!isAuthenticated || !nguoiDungId) return;
    loadReputation();
    loadCriteria();
  }, [isAuthenticated, nguoiDungId]);

  useEffect(() => {
    if (!nguoiDungId) return;
    if (tab === 'history') loadHistory();
    if (tab === 'received') loadReviews();
  }, [tab, nguoiDungId]);

  const loadReputation = async () => {
    if (!nguoiDungId) return;
    try {
      const res = await getReputationApi(nguoiDungId);
      if (res.success && res.data) setRep(res.data);
    } catch {
      /* silent */
    }
  };

  const loadHistory = async () => {
    if (!nguoiDungId) return;
    setLoading(true);
    try {
      const res = await getReputationHistoryApi(nguoiDungId);
      if (res.success && res.data) setHistory(res.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!nguoiDungId) return;
    setLoading(true);
    try {
      const res = await getReviewsForUserApi(nguoiDungId);
      if (res.success && res.data) setReviews(res.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const loadCriteria = async () => {
    try {
      const res = await getAllTieuChiApi();
      if (res.success && res.data) {
        setCriteria(res.data);
        const init: Record<number, number> = {};
        res.data.forEach((c) => {
          init[c.tieuChiDanhGiaId] = 0;
        });
        setScores(init);
      }
    } catch {
      /* silent */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const hdId = parseInt(hoatDongId, 10);
    const targetId = parseInt(nguoiDuocDanhGiaId, 10);
    if (isNaN(hdId) || isNaN(targetId)) {
      setMsg({ type: 'err', text: 'Vui lòng nhập ID hoạt động và ID người được đánh giá hợp lệ.' });
      return;
    }
    const chiTiet = Object.entries(scores)
      .filter(([, diem]) => diem > 0)
      .map(([id, diem]) => ({ tieuChiDanhGiaId: parseInt(id, 10), diem }));
    if (chiTiet.length === 0) {
      setMsg({ type: 'err', text: 'Vui lòng chấm điểm ít nhất một tiêu chí.' });
      return;
    }
    setLoading(true);
    try {
      const res = await createReviewApi({
        hoatDongId: hdId,
        nguoiDuocDanhGiaId: targetId,
        nhanXet: nhanXet.trim() || undefined,
        chiTiet,
      });
      if (res.success) {
        setMsg({ type: 'ok', text: 'Gửi đánh giá thành công!' });
        setHoatDongId('');
        setNguoiDuocDanhGiaId('');
        setNhanXet('');
        loadReputation();
      } else {
        setMsg({ type: 'err', text: res.message || 'Gửi đánh giá thất bại.' });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMsg({
        type: 'err',
        text: e?.response?.data?.message || 'Gửi đánh giá thất bại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const pct = Math.min(100, Math.max(0, ((rep?.diemHienTai ?? 100) / 100) * 100));

  return (
    <SidebarLayout title="Đánh giá & Độ tin cậy">
      <div className="review-page">
        <div className="review-header">
          <div className="review-tabs">
            <button
              className={`review-tab ${tab === 'reputation' ? 'active' : ''}`}
              onClick={() => setTab('reputation')}
            >
              Điểm uy tín
            </button>
            <button
              className={`review-tab ${tab === 'history' ? 'active' : ''}`}
              onClick={() => setTab('history')}
            >
              Lịch sử
            </button>
            <button
              className={`review-tab ${tab === 'received' ? 'active' : ''}`}
              onClick={() => setTab('received')}
            >
              Đánh giá nhận
            </button>
            <button
              className={`review-tab ${tab === 'write' ? 'active' : ''}`}
              onClick={() => setTab('write')}
            >
              Viết đánh giá
            </button>
          </div>
        </div>

        {tab === 'reputation' && (
          <>
            <div className="rep-card" style={{ ['--pct' as string]: pct }}>
              <div className="rep-score-ring">
                <span className="rep-score-value">{rep?.diemHienTai ?? '—'}</span>
                <span className="rep-score-max">/100</span>
              </div>
              <div className="rep-info">
                <span className="rep-badge rank-dong">
                  Cấp độ Uy tín
                </span>
                <div className="rep-stats">
                  <div>
                    <strong>{rep?.soLuotDanhGia ?? 0}</strong>
                    <span>Tổng lượt đánh giá</span>
                  </div>
                  <div>
                    <strong>{rep?.soLanCanhBao ?? 0}</strong>
                    <span>Số lần cảnh báo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rep-guide">
              <h4>Quy tắc điểm uy tín</h4>
              <ul>
                <li>Điểm khởi đầu mặc định là <strong>100 điểm</strong>.</li>
                <li>Tham gia hoạt động tích cực & nhận đánh giá tốt: <strong>+điểm</strong>.</li>
                <li>Hủy tham gia muộn hoặc bị báo cáo vi phạm: <strong>-điểm</strong>.</li>
                <li>Cấp độ: Đồng (0-100), Bạc (101-200), Vàng (201-300), Kim Cương (&gt;300).</li>
              </ul>
            </div>
          </>
        )}

        {tab === 'history' && (
          <div className="history-section">
            {loading ? (
              <p className="loading-txt">Đang tải lịch sử...</p>
            ) : history.length === 0 ? (
              <p className="empty-txt">Chưa có lịch sử thay đổi điểm nào.</p>
            ) : (
              <ul className="history-list">
                {history.map((h) => (
                  <li key={h.lichSuId} className="history-item">
                    <div className="history-left">
                      <span className={`history-delta ${h.diemThayDoi >= 0 ? 'pos' : 'neg'}`}>
                        {h.diemThayDoi >= 0 ? `+${h.diemThayDoi}` : h.diemThayDoi}
                      </span>
                      <div>
                        <p className="history-reason">{h.lyDoThayDoi || 'Thay đổi điểm'}</p>
                        <span className="history-date">
                          {h.thoiGianCapNhat ? new Date(h.thoiGianCapNhat).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'received' && (
          <div className="reviews-section">
            {loading ? (
              <p className="loading-txt">Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
              <p className="empty-txt">Bạn chưa nhận được đánh giá nào.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((r) => {
                  const authorName = typeof r.nguoiDanhGia === 'object' ? r.nguoiDanhGia?.hoTen : `Người dùng #${r.nguoiDanhGiaId}`;
                  return (
                    <div key={r.danhGiaId} className="review-item">
                      <div className="review-item-header">
                        <div className="review-author">
                          <Avatar
                            mau="#66c2b2"
                            chu={authorName ? authorName.charAt(0).toUpperCase() : 'U'}
                          />
                          <div>
                            <strong>{authorName}</strong>
                          </div>
                        </div>
                        {r.diemTong && (
                          <span className="review-avg">★ {Number(r.diemTong).toFixed(1)}</span>
                        )}
                      </div>
                      {r.nhanXet && <p className="review-text">{r.nhanXet}</p>}
                      {r.chiTiet && r.chiTiet.length > 0 && (
                        <div className="review-details">
                          {r.chiTiet.map((ct) => (
                            <span key={ct.tieuChiDanhGiaId} className="detail-tag">
                              {ct.tenTieuChi || `Tiêu chí ${ct.tieuChiDanhGiaId}`}: {ct.diem}★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'write' && (
          <div className="write-review-section">
            {msg && (
              <div className={`msg-banner ${msg.type === 'ok' ? 'msg-ok' : 'msg-err'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-row">
                <label>ID Hoạt động</label>
                <input
                  type="number"
                  value={hoatDongId}
                  onChange={(e) => setHoatDongId(e.target.value)}
                  placeholder="Nhập ID hoạt động nhóm..."
                  required
                />
              </div>

              <div className="form-row">
                <label>ID Người được đánh giá</label>
                <input
                  type="number"
                  value={nguoiDuocDanhGiaId}
                  onChange={(e) => setNguoiDuocDanhGiaId(e.target.value)}
                  placeholder="Nhập ID thành viên..."
                  required
                />
              </div>

              {criteria.length > 0 && (
                <div className="form-row">
                  <label>Chấm điểm tiêu chí (1 đến 5 sao)</label>
                  <div className="criteria-scores">
                    {criteria.map((c) => (
                      <div key={c.tieuChiDanhGiaId} className="criteria-score-item">
                        <span>{c.tenTieuChi}</span>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              className={`star-btn ${
                                (scores[c.tieuChiDanhGiaId] || 0) >= star ? 'selected' : ''
                              }`}
                              onClick={() =>
                                setScores((prev) => ({
                                  ...prev,
                                  [c.tieuChiDanhGiaId]: star,
                                }))
                              }
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-row">
                <label>Nhận xét</label>
                <textarea
                  value={nhanXet}
                  onChange={(e) => setNhanXet(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                />
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
