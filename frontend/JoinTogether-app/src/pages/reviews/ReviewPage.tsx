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
  replyToReviewApi,
} from '../../services/review.service';
import { getMyActivitiesApi, getMembersApi } from '../../services/activity.service';
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

  // Reply state
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Form state
  const [hoatDongId, setHoatDongId] = useState('');
  const [nguoiDuocDanhGiaId, setNguoiDuocDanhGiaId] = useState('');
  const [nhanXet, setNhanXet] = useState('');
  const [scores, setScores] = useState<Record<number, number>>({});

  // Dropdown options
  const [completedActivities, setCompletedActivities] = useState<any[]>([]);
  const [activityMembers, setActivityMembers] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'write') {
      getMyActivitiesApi().then((res) => {
        if (res.success && res.data) {
          setCompletedActivities(res.data);
          if (res.data.length > 0) {
            const firstId = res.data[0].hoatDongId;
            setHoatDongId(String(firstId));
            loadMembersForActivity(firstId);
          }
        }
      }).catch(() => {});
    }
  }, [tab]);

  const loadMembersForActivity = (actId: number) => {
    getMembersApi(actId).then((res) => {
      if (res.success && res.data) {
        const filtered = res.data.filter((m: any) => m.nguoiDungId !== nguoiDungId);
        setActivityMembers(filtered);
        if (filtered.length > 0) {
          setNguoiDuocDanhGiaId(String(filtered[0].nguoiDungId));
        } else {
          setNguoiDuocDanhGiaId('');
        }
      }
    }).catch(() => setActivityMembers([]));
  };

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
          init[c.tieuChiDanhGiaId] = 5;
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
      setMsg({ type: 'err', text: 'Vui lòng chọn Hoạt động và Thành viên cần đánh giá hợp lệ.' });
      return;
    }
    const chiTiet = criteria.map((c) => ({
      tieuChiDanhGiaId: c.tieuChiDanhGiaId,
      diem: scores[c.tieuChiDanhGiaId] || 5,
    }));
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

  const handleSendReply = async (danhGiaId: number) => {
    if (!replyText.trim() || submittingReply) return;
    setSubmittingReply(true);
    setMsg(null);
    try {
      const res = await replyToReviewApi(danhGiaId, replyText.trim());
      if (res.success) {
        setMsg({ type: 'ok', text: 'Đã gửi phản hồi đánh giá thành công!' });
        setReplyingId(null);
        setReplyText('');
        loadReviews();
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Gửi phản hồi thất bại.';
      setMsg({ type: 'err', text: errorMsg });
    } finally {
      setSubmittingReply(false);
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
            {(rep as any)?.isPrivate ? (
              <div style={{ padding: 24, background: '#fff3e0', color: '#e65100', borderRadius: 16, border: '1px solid #ffe0b2', textAlign: 'center', fontWeight: 600 }}>
                🔒 {(rep as any)?.message || 'Hồ sơ này bị giới hạn quyền xem theo thiết lập quyền riêng tư của người dùng.'}
              </div>
            ) : (rep as any)?.status === 'DANG_KIEM_DUYET' ? (
              <div style={{ padding: 24, background: '#fff8e1', color: '#f57f17', borderRadius: 16, border: '1px solid #ffecb3', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>⏳ Trạng thái: Đang xem xét khiếu nại</h3>
                <p style={{ margin: 0, fontSize: 14 }}>{(rep as any)?.message}</p>
              </div>
            ) : (rep as any)?.status === 'CHUA_DU_DU_LIEU' ? (
              <div style={{ padding: 24, background: '#e3f2fd', color: '#1565c0', borderRadius: 16, border: '1px solid #bbdefb', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>📊 Trạng thái: Chưa đủ dữ liệu</h3>
                <p style={{ margin: 0, fontSize: 14 }}>{(rep as any)?.message}</p>
                <span style={{ fontSize: 12, marginTop: 8, display: 'block', color: '#5c6bc0' }}>
                  Hiện tại mới có {(rep as any)?.reviewCount || 0} lượt đánh giá.
                </span>
              </div>
            ) : (
              <>
                {(rep as any)?.canhBaoCongKhai && (
                  <div style={{ padding: '12px 16px', background: '#ffebee', color: '#c62828', borderRadius: 12, border: '1px solid #ffcdd2', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
                    ⚠️ {(rep as any).canhBaoCongKhai}
                  </div>
                )}

                <div className="rep-card" style={{ ['--pct' as string]: pct }}>
                  <div className="rep-score-ring">
                    <span className="rep-score-value">{rep?.diemHienTai ?? '—'}</span>
                    <span className="rep-score-max">/100</span>
                  </div>
                  <div className="rep-info">
                    <span className="rep-badge rank-dong" style={{ background: 'var(--primary-100)', color: 'var(--primary-800)', fontWeight: 700 }}>
                      {(rep as any)?.rankLabel || 'Uy tín tốt'}
                    </span>
                    <div className="rep-stats">
                      <div>
                        <strong>{(rep as any)?.reviewCount ?? rep?.soLuotDanhGia ?? 0}</strong>
                        <span>Tổng lượt đánh giá</span>
                      </div>
                      <div>
                        <strong>{(rep as any)?.avgScore ? `${(rep as any).avgScore}★` : '—'}</strong>
                        <span>Điểm trung bình</span>
                      </div>
                      <div>
                        <strong>{rep?.soLanCanhBao ?? 0}</strong>
                        <span>Số lần cảnh báo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tiêu chí tổng hợp */}
                {(rep as any)?.criteriaBreakdown && (rep as any).criteriaBreakdown.length > 0 && (
                  <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '1px solid var(--border)', marginTop: 16 }}>
                    <h4 style={{ margin: '0 0 14px 0', fontSize: 15, color: 'var(--primary-800)' }}>
                      📈 Đánh giá tổng hợp theo tiêu chí
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {(rep as any).criteriaBreakdown.map((item: any, idx: number) => (
                        <div key={idx} style={{ background: '#f7f9f8', padding: '10px 14px', borderRadius: 10, border: '1px solid #e4ece6' }}>
                          <span style={{ fontSize: 12, color: '#546e7a', display: 'block', marginBottom: 4 }}>{item.tenTieuChi}</span>
                          <strong style={{ fontSize: 16, color: '#2e7d32' }}>{item.diemTrungBinh} / 5★</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rep-guide" style={{ marginTop: 16 }}>
                  <h4>Quy tắc điểm uy tín</h4>
                  <ul>
                    <li>Điểm khởi đầu mặc định là <strong>100 điểm</strong>.</li>
                    <li>Tham gia hoạt động tích cực & nhận đánh giá tốt: <strong>+đểm</strong>.</li>
                    <li>Hủy tham gia muộn hoặc bị báo cáo vi phạm: <strong>-điểm</strong>.</li>
                    <li>Xếp hạng: Rất uy tín (&gt;=90), Uy tín tốt (70-89), Trung bình (50-69), Cần cải thiện (&lt;50).</li>
                  </ul>
                </div>
              </>
            )}
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
            {msg && (
              <div className={`msg-banner ${msg.type === 'ok' ? 'msg-ok' : 'msg-err'}`} style={{ marginBottom: 16 }}>
                {msg.text}
              </div>
            )}
            {loading ? (
              <p className="loading-txt">Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
              <p className="empty-txt">Bạn chưa nhận được đánh giá nào.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((r) => {
                  const authorName = typeof r.nguoiDanhGia === 'object' ? (r.nguoiDanhGia as any)?.hoTen : `Người dùng #${r.nguoiDanhGiaId}`;
                  const phanHoiText = (r as any).phanHoi;
                  const thoiGianPhanHoi = (r as any).thoiGianPhanHoi;
                  const isReplyingThis = replyingId === r.danhGiaId;

                  return (
                    <div key={r.danhGiaId} className="review-item" style={{ background: '#fff', borderRadius: 16, padding: 18, border: '1px solid #e4ece6', marginBottom: 14 }}>
                      <div className="review-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="review-author" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <Avatar
                            mau="#6fbf73"
                            chu={authorName ? authorName.charAt(0).toUpperCase() : 'U'}
                          />
                          <div>
                            <strong style={{ fontSize: 14, color: '#263238' }}>{authorName}</strong>
                            <span style={{ fontSize: 12, color: '#78909c', display: 'block' }}>
                              {(r as any).tenHoatDong ? `Hoạt động: ${(r as any).tenHoatDong}` : ''}
                            </span>
                          </div>
                        </div>
                        {r.diemTong && (
                          <span className="review-avg" style={{ fontSize: 14, fontWeight: 700, color: '#f57c00', background: '#fff3e0', padding: '4px 10px', borderRadius: 12 }}>
                            ★ {Number(r.diemTong).toFixed(1)}
                          </span>
                        )}
                      </div>

                      {r.nhanXet && <p className="review-text" style={{ marginTop: 10, fontSize: 14, color: '#37474f', lineHeight: 1.5 }}>{r.nhanXet}</p>}

                      {r.chiTiet && r.chiTiet.length > 0 && (
                        <div className="review-details" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {r.chiTiet.map((ct) => (
                            <span key={ct.tieuChiDanhGiaId} className="detail-tag" style={{ background: '#f7f9f8', padding: '4px 10px', borderRadius: 8, fontSize: 12, border: '1px solid #e4ece6', color: '#546e7a' }}>
                              {ct.tenTieuChi || `Tiêu chí ${ct.tieuChiDanhGiaId}`}: {ct.diem}★
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Phản hồi từ trước (Luồng 5c notice - Mỗi đánh giá 1 phản hồi) */}
                      {phanHoiText ? (
                        <div style={{ marginTop: 14, padding: '12px 14px', background: '#f1f8e9', borderRadius: 12, border: '1px solid #c8e6c9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <strong style={{ fontSize: 12, color: '#2e7d32' }}>💬 Phản hồi của bạn (Chính thức)</strong>
                            <span style={{ fontSize: 11, color: '#78909c' }}>
                              {thoiGianPhanHoi ? new Date(thoiGianPhanHoi).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: '#33691e' }}>{phanHoiText}</p>
                        </div>
                      ) : isReplyingThis ? (
                        <div style={{ marginTop: 14, padding: 14, background: '#f7f9f8', borderRadius: 12, border: '1px solid #cfd8dc' }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#37474f', display: 'block', marginBottom: 6 }}>
                            Nhập nội dung phản hồi đánh giá này:
                          </label>
                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Viết lời cảm ơn hoặc làm rõ thông tin..."
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cfd8dc', fontSize: 13, outline: 'none' }}
                          />
                          <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="cam-btn-outline"
                              onClick={() => { setReplyingId(null); setReplyText(''); }}
                              style={{ padding: '6px 14px', fontSize: 12 }}
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              className="save-btn"
                              onClick={() => handleSendReply(r.danhGiaId)}
                              disabled={submittingReply || !replyText.trim()}
                              style={{ padding: '6px 16px', fontSize: 12, borderRadius: 16 }}
                            >
                              {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: 12, textAlign: 'right' }}>
                          <button
                            type="button"
                            className="cam-btn-outline"
                            onClick={() => { setReplyingId(r.danhGiaId); setReplyText(''); setMsg(null); }}
                            style={{ padding: '6px 14px', fontSize: 12, borderRadius: 16 }}
                          >
                            💬 Phản hồi đánh giá này
                          </button>
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
                <label>1. Chọn Hoạt động đã tham gia <span style={{ color: '#f44336' }}>*</span></label>
                <select
                  value={hoatDongId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setHoatDongId(id);
                    if (id) loadMembersForActivity(Number(id));
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cfd8dc', fontSize: 14 }}
                  required
                >
                  {completedActivities.length === 0 ? (
                    <option value="">Chưa có hoạt động đã tham gia</option>
                  ) : (
                    completedActivities.map((a) => (
                      <option key={a.hoatDongId} value={a.hoatDongId}>
                        #{a.hoatDongId} - {a.tenHoatDong} ({a.trangThai === 'da_ket_thuc' ? 'Đã kết thúc' : 'Đang diễn ra'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-row">
                <label>2. Chọn Thành viên cùng tham gia cần đánh giá <span style={{ color: '#f44336' }}>*</span></label>
                <select
                  value={nguoiDuocDanhGiaId}
                  onChange={(e) => setNguoiDuocDanhGiaId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cfd8dc', fontSize: 14 }}
                  required
                >
                  {activityMembers.length === 0 ? (
                    <option value="">Không có thành viên nào khác trong hoạt động này</option>
                  ) : (
                    activityMembers.map((m) => (
                      <option key={m.nguoiDungId} value={m.nguoiDungId}>
                        {m.hoTen || `Thành viên #${m.nguoiDungId}`} (ID #{m.nguoiDungId})
                      </option>
                    ))
                  )}
                </select>
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
                                (scores[c.tieuChiDanhGiaId] ?? 5) >= star ? 'selected' : ''
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
