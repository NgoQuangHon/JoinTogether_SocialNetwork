import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavItems from '../../components/NavItems';
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
  const { nguoiDungId, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
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
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ tieuChiDanhGiaId: parseInt(k, 10), diem: v }));

    const diemTong =
      chiTiet.length > 0
        ? chiTiet.reduce((s, c) => s + c.diem, 0) / chiTiet.length
        : undefined;

    setLoading(true);
    try {
      const res = await createReviewApi({
        hoatDongId: hdId,
        nguoiDuocDanhGiaId: targetId,
        nhanXet: nhanXet || undefined,
        diemTong,
        chiTiet: chiTiet.length ? chiTiet : undefined,
      });
      if (res.success) {
        setMsg({ type: 'ok', text: 'Đã gửi đánh giá thành công!' });
        setHoatDongId('');
        setNguoiDuocDanhGiaId('');
        setNhanXet('');
        const reset: Record<number, number> = {};
        criteria.forEach((c) => {
          reset[c.tieuChiDanhGiaId] = 0;
        });
        setScores(reset);
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
    <div className="desktop-view" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          borderRight: '1px solid var(--border)',
          padding: '20px 12px',
          background: '#fff',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 8px' }}>
            <div className="brand-icon">🌿</div>
          </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItems />
        </nav>
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          <span className="nav-icon">L</span> Đăng xuất
        </button>
      </aside>

      <main style={{ flex: 1, background: 'var(--background)' }}>
        <div className="review-page">
          <div className="review-header">
            <h1>⭐ Đánh giá & Độ tin cậy</h1>
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
                </div>
                <div className="rep-meta">
                  <h2>Điểm uy tín của bạn</h2>
                  <p style={{ fontSize: 13.5, color: 'var(--text-light)' }}>
                    Điểm càng cao, độ tin cậy của bạn trong cộng đồng càng lớn.
                  </p>
                  <div className="rep-stats">
                    <div className="rep-stat">
                      <div className="rep-stat-label">Lượt đánh giá</div>
                      <div className="rep-stat-value">{rep?.soLuotDanhGia ?? 0}</div>
                    </div>
                    <div className="rep-stat">
                      <div className="rep-stat-label">Cảnh báo</div>
                      <div
                        className={`rep-stat-value ${
                          (rep?.soLanCanhBao ?? 0) > 0 ? 'warn' : ''
                        }`}
                      >
                        {rep?.soLanCanhBao ?? 0}
                      </div>
                    </div>
                    <div className="rep-stat">
                      <div className="rep-stat-label">Mức độ</div>
                      <div className="rep-stat-value">
                        {(rep?.diemHienTai ?? 100) >= 90
                          ? 'Xuất sắc'
                          : (rep?.diemHienTai ?? 100) >= 70
                            ? 'Tốt'
                            : (rep?.diemHienTai ?? 100) >= 50
                              ? 'Khá'
                              : 'Cần cải thiện'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'history' && (
            <div className="history-list">
              {loading && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Đang tải...</p>}
              {!loading && history.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📜</div>
                  <p>Chưa có lịch sử thay đổi điểm uy tín.</p>
                </div>
              )}
              {history.map((h) => (
                <div key={h.lichSuId} className="history-item">
                  <div className={`history-delta ${h.diemThayDoi >= 0 ? 'plus' : 'minus'}`}>
                    {h.diemThayDoi >= 0 ? `+${h.diemThayDoi}` : h.diemThayDoi}
                  </div>
                  <div className="history-body">
                    <div className="history-reason">{h.lyDoThayDoi || 'Cập nhật điểm'}</div>
                    <div className="history-time">
                      {h.thoiGianCapNhat
                        ? new Date(h.thoiGianCapNhat).toLocaleString('vi-VN')
                        : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'received' && (
            <div className="review-list">
              {loading && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Đang tải...</p>}
              {!loading && reviews.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <p>Bạn chưa nhận đánh giá nào.</p>
                </div>
              )}
              {reviews.map((r) => (
                <div key={r.danhGiaId} className="review-item">
                  <div className="review-item-header">
                    <Avatar
                      mau="var(--primary)"
                      chu={(r.nguoiDanhGia?.hoTen || '?')[0].toUpperCase()}
                    />
                    <span className="review-item-name">
                      {r.nguoiDanhGia?.hoTen || `Người dùng #${r.nguoiDanhGiaId}`}
                    </span>
                    {r.diemTong != null && (
                      <span className="review-item-score">{r.diemTong.toFixed(1)} ★</span>
                    )}
                  </div>
                  {r.nhanXet && <p className="review-item-comment">{r.nhanXet}</p>}
                </div>
              ))}
            </div>
          )}

          {tab === 'write' && (
            <div className="review-form-card">
              <h3>Gửi đánh giá sau hoạt động</h3>
              {msg && (
                <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'}>{msg.text}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label>ID hoạt động *</label>
                  <input
                    type="number"
                    value={hoatDongId}
                    onChange={(e) => setHoatDongId(e.target.value)}
                    placeholder="Nhập ID hoạt động đã tham gia"
                    required
                  />
                </div>
                <div className="form-row">
                  <label>ID người được đánh giá *</label>
                  <input
                    type="number"
                    value={nguoiDuocDanhGiaId}
                    onChange={(e) => setNguoiDuocDanhGiaId(e.target.value)}
                    placeholder="ID người dùng cần đánh giá"
                    required
                  />
                </div>

                {criteria.length > 0 && (
                  <div className="form-row">
                    <label>Đánh giá theo tiêu chí</label>
                    <div className="criteria-list">
                      {criteria.map((c) => (
                        <div key={c.tieuChiDanhGiaId} className="criteria-item">
                          <span className="criteria-name">
                            {c.tenTieuChi}
                            {c.trongSo != null && (
                              <span style={{ color: 'var(--text-light)', fontSize: 12 }}>
                                {' '}
                                (trọng số {c.trongSo})
                              </span>
                            )}
                          </span>
                          <div className="criteria-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                className={`star-btn ${
                                  (scores[c.tieuChiDanhGiaId] || 0) >= s ? 'active' : ''
                                }`}
                                onClick={() =>
                                  setScores((prev) => ({
                                    ...prev,
                                    [c.tieuChiDanhGiaId]: s,
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
      </main>
    </div>
  );
}
