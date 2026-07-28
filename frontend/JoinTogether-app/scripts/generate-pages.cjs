const fs = require('fs');
const path = require('path');

const base = 'src/pages';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ==================== REVIEW PAGE ====================
ensureDir(base + '/review');

const reviewPageContent = `import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getReviewsForUserApi, getReputationApi, getReputationHistoryApi, getAllTieuChiApi } from '../../services/review.service';
import type { DiemUyTin, LichSuDiemUyTin, DanhGia, TieuChiDanhGia } from '../../types/review';
import './ReviewPage.css';

export default function ReviewPage() {
  const { logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();

  const [reputation, setReputation] = useState<DiemUyTin | null>(null);
  const [history, setHistory] = useState<LichSuDiemUyTin[]>([]);
  const [reviews, setReviews] = useState<DanhGia[]>([]);
  const [tieuChi, setTieuChi] = useState<TieuChiDanhGia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nguoiDungId) return;
    Promise.all([
      getReputationApi(nguoiDungId),
      getReputationHistoryApi(nguoiDungId),
      getReviewsForUserApi(nguoiDungId),
      getAllTieuChiApi(),
    ]).then(function (values) {
      if (values[0].success && values[0].data) setReputation(values[0].data);
      if (values[1].success && values[1].data) setHistory(values[1].data);
      if (values[2].success && values[2].data) setReviews(values[2].data);
      if (values[3].success && values[3].data) setTieuChi(values[3].data);
    }).catch(function () {}).finally(function () { setLoading(false); });
  }, [nguoiDungId]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  if (loading) {
    return (
      <div className="rev-page">
        <div className="rev-loading"><p>Dang tai...</p></div>
    );
  }

  const diem = reputation ? reputation.tongDiem || 0 : 0;
  const rank = diem >= 50 ? 'Vang' : diem >= 20 ? 'Bac' : diem >= 5 ? 'Dong' : 'Moi';

  return (
    <div className="rev-page">
      <header className="rev-header">
        <Link to="/dashboard" className="rev-back">&larr; Quay lai</Link>
        <h1>Danh gia &amp; Uy tin</h1>
        <button className="rev-logout" onClick={handleLogout}>🚪</button>
      </header>

      <section className="rev-rep-card">
        <div className="rev-rep-badge">
          <span className="rev-rank-icon">\u2B50</span>
          <h2>{rank}</h2>
        </div>
        <div className="rev-rep-score">
          <span className="rev-score-num">{diem}</span>
          <span className="rev-score-label">diem uy tin</span>
        </div>
        <div className="rev-rep-progress">
          <div className="rev-rep-bar" style={{ width: Math.min(100, (diem / 100) * 100) + '%' }} />
        </div>
      </section>

      <section className="rev-section">
        <h3>Danh gia da nhan</h3>
        {reviews.length === 0 && <p className="rev-empty">Chua co danh gia nao.</p>}
        {reviews.length > 0 && reviews.slice(0, 10).map(function (dg) {
          return (
            <div key={dg.danhGiaId} className="rev-item">
              <div className="rev-item-header">
                <strong>{dg.nguoiDanhGia || 'Nguoi dung'}</strong>
                {dg.diemTong !== null && dg.diemTong !== undefined && (
                  <span className="rev-diem">{dg.diemTong}/5</span>
                )}
              </div>
              <p className="rev-item-nhanxet">{dg.nhanXet || 'Khong co nhan xet'}</p>
              <span className="rev-item-date">
                {dg.thoiGianTao ? new Date(dg.thoiGianTao).toLocaleDateString('vi-VN') : ''}
              </span>
            </div>
          );
        })}
      </section>

      <section className="rev-section">
        <h3>Lich su diem uy tin</h3>
        {history.length === 0 && <p className="rev-empty">Chua co lich su thay doi.</p>}
        {history.length > 0 && history.map(function (ls) {
          return (
            <div key={ls.lichSuId} className="rev-history-item">
              <span className={ls.diemThayDoi >= 0 ? 'rev-up' : 'rev-down'}>
                {ls.diemThayDoi > 0 ? '+' : ''}{ls.diemThayDoi}
              </span>
              <span className="rev-history-reason">{ls.lyDoThayDoi}</span>
              <span className="rev-history-date">
                {ls.thoiGian ? new Date(ls.thoiGian).toLocaleDateString('vi-VN') : ''}
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
`;

fs.writeFileSync(base + '/review/ReviewPage.tsx', reviewPageContent);

const reviewCssContent = `.rev-page {
  min-height: 100vh;
  background: #f7f9f8;
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}
.rev-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #6FBF73;
}
.rev-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  margin-bottom: 8px;
}
.rev-back {
  text-decoration: none;
  color: #6FBF73;
  font-weight: 600;
  font-size: 14px;
}
.rev-header h1 {
  font-size: 20px;
  font-weight: 800;
  color: #263238;
}
.rev-logout {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}
.rev-rep-card {
  background: linear-gradient(160deg, #1c1f1e, #0c0d0d);
  color: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
}
.rev-rep-badge {
  margin-bottom: 12px;
}
.rev-rank-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 4px;
}
.rev-rep-badge h2 {
  font-size: 18px;
  font-weight: 800;
}
.rev-rep-score {
  margin-bottom: 16px;
}
.rev-score-num {
  font-size: 42px;
  font-weight: 800;
  display: block;
  line-height: 1;
}
.rev-score-label {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}
.rev-rep-progress {
  height: 8px;
  background: rgba(255,255,255,0.12);
  border-radius: 999px;
  overflow: hidden;
}
.rev-rep-bar {
  height: 100%;
  background: linear-gradient(90deg, #6FBF73, #66C2B2);
  border-radius: 999px;
  transition: width 0.5s ease;
}
.rev-section {
  margin-bottom: 24px;
}
.rev-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #263238;
  margin-bottom: 12px;
}
.rev-empty {
  color: #607d8b;
  font-size: 14px;
  text-align: center;
  padding: 20px;
  background: #fff;
  border: 1px solid #e4ece6;
  border-radius: 12px;
}
.rev-item {
  background: #fff;
  border: 1px solid #e4ece6;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
}
.rev-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.rev-item-header strong {
  font-size: 14px;
  color: #263238;
}
.rev-diem {
  font-weight: 700;
  color: #6FBF73;
  font-size: 14px;
}
.rev-item-nhanxet {
  font-size: 13px;
  color: #546e7a;
  margin-bottom: 4px;
  line-height: 1.5;
}
.rev-item-date {
  font-size: 11px;
  color: #607d8b;
}
.rev-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e4ece6;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 6px;
}
.rev-up {
  font-weight: 700;
  color: #6FBF73;
  font-size: 15px;
  min-width: 40px;
}
.rev-down {
  font-weight: 700;
  color: #f44336;
  font-size: 15px;
  min-width: 40px;
}
.rev-history-reason {
  flex: 1;
  font-size: 12px;
  color: #546e7a;
  margin: 0 12px;
}
.rev-history-date {
  font-size: 11px;
  color: #607d8b;
  white-space: nowrap;
}
@media (min-width: 900px) {
  .rev-page { max-width: 1100px; padding: 24px 40px; }
}
`;

fs.writeFileSync(base + '/review/ReviewPage.css', reviewCssContent);

// ==================== REPORT PAGE ====================
ensureDir(base + '/report');

const reportPageContent = `import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createReportApi, getLoaiViPhamApi } from '../../services/report.service';
import type { LoaiViPham } from '../../types/report';
import './ReportPage.css';

export default function ReportPage() {
  const { logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();

  const [loaiViPham, setLoaiViPham] = useState<LoaiViPham[]>([]);
  const [nguoiBiBaoCaoId, setNguoiBiBaoCaoId] = useState<number>(0);
  const [loaiViPhamId, setLoaiViPhamId] = useState<number>(0);
  const [noiDung, setNoiDung] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    getLoaiViPhamApi().then(function (res) {
      if (res.success && res.data) setLoaiViPham(res.data);
    }).catch(function () {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nguoiBiBaoCaoId || !loaiViPhamId) return;
    setSubmitting(true);
    setResult(null);
    createReportApi({ nguoiBiBaoCaoId, loaiViPhamId, noiDung: noiDung || undefined })
      .then(function (res) {
        if (res.success) {
          setResult({ success: true, message: 'Bao cao da duoc gui. Cam on ban!' });
          setNguoiBiBaoCaoId(0);
          setLoaiViPhamId(0);
          setNoiDung('');
        } else {
          setResult({ success: false, message: res.message || 'Gui bao cao that bai.' });
        }
      })
      .catch(function () {
        setResult({ success: false, message: 'Loi ket noi.' });
      })
      .finally(function () { setSubmitting(false); });
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="rpt-page">
      <header className="rpt-header">
        <Link to="/dashboard" className="rpt-back">&larr; Quay lai</Link>
        <h1>Bao cao vi pham</h1>
        <button className="rpt-logout" onClick={handleLogout}>🚪</button>
      </header>

      <section className="rpt-form-section">
        <p className="rpt-desc">
          Su dung form nay de bao cao hanh vi vi pham cua nguoi dung khac.
          Thong tin cua ban se duoc bao mat.
        </p>

        {result && (
          <div className={result.success ? 'rpt-success' : 'rpt-error'}>
            {result.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rpt-form">
          <div className="rpt-field">
            <label>ID nguoi bi bao cao *</label>
            <input
              type="number"
              min="1"
              required
              value={nguoiBiBaoCaoId || ''}
              onChange={function (e) { setNguoiBiBaoCaoId(parseInt(e.target.value, 10) || 0); }}
              placeholder="Nhap ID nguoi dung"
            />
          </div>

          <div className="rpt-field">
            <label>Loai vi pham *</label>
            <select
              required
              value={loaiViPhamId || ''}
              onChange={function (e) { setLoaiViPhamId(parseInt(e.target.value, 10) || 0); }}
            >
              <option value="">Chon loai vi pham</option>
              {loaiViPham.map(function (lv) {
                return <option key={lv.loaiViPhamId} value={lv.loaiViPhamId}>{lv.tenLoai}</option>;
              })}
            </select>
          </div>

          <div className="rpt-field">
            <label>Noi dung chi tiet</label>
            <textarea
              rows={4}
              value={noiDung}
              onChange={function (e) { setNoiDung(e.target.value); }}
              placeholder="Mo ta chi tiet ve vi pham..."
            />
          </div>

          <button type="submit" className="rpt-submit" disabled={submitting}>
            {submitting ? 'Dang gui...' : 'Gui bao cao'}
          </button>
        </form>
      </section>
    </div>
  );
}
`;

fs.writeFileSync(base + '/report/ReportPage.tsx', reportPageContent);

const reportCssContent = `.rpt-page {
  min-height: 100vh;
  background: #f7f9f8;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}
.rpt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  margin-bottom: 8px;
}
.rpt-back {
  text-decoration: none;
  color: #6FBF73;
  font-weight: 600;
  font-size: 14px;
}
.rpt-header h1 { font-size: 20px; font-weight: 800; color: #263238; }
.rpt-logout { border: none; background: none; font-size: 20px; cursor: pointer; }
.rpt-form-section {
  background: #fff;
  border: 1px solid #e4ece6;
  border-radius: 20px;
  padding: 24px;
}
.rpt-desc { font-size: 13px; color: #607d8b; margin-bottom: 20px; line-height: 1.5; }
.rpt-success {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}
.rpt-error {
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}
.rpt-form { display: flex; flex-direction: column; gap: 16px; }
.rpt-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #263238;
  margin-bottom: 6px;
}
.rpt-field input, .rpt-field select, .rpt-field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e4ece6;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  background: #f7f9f8;
  color: #263238;
  box-sizing: border-box;
}
.rpt-field input:focus, .rpt-field select:focus, .rpt-field textarea:focus {
  outline: none;
  border-color: #6FBF73;
  box-shadow: 0 0 0 3px rgba(111,191,115,0.12);
}
.rpt-submit {
  background: linear-gradient(135deg, #6FBF73, #66C2B2);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}
.rpt-submit:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(111,191,115,0.35); }
.rpt-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
@media (min-width: 900px) { .rpt-page { padding: 24px 40px; } }
`;

fs.writeFileSync(base + '/report/ReportPage.css', reportCssContent);

// ==================== ADMIN DASHBOARD ====================
ensureDir(base + '/admin');

const adminCssContent = `.admin-page {
  min-height: 100vh;
  background: #f7f9f8;
}
.admin-header {
  background: #fff;
  border-bottom: 1px solid #e4ece6;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}
.admin-header h1 { font-size: 20px; font-weight: 800; color: #263238; }
.admin-header-left { display: flex; align-items: center; gap: 12px; }
.admin-back { text-decoration: none; color: #6FBF73; font-weight: 600; font-size: 14px; }
.admin-logout { border: none; background: none; font-size: 20px; cursor: pointer; }
.admin-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e4ece6;
  overflow-x: auto;
}
.admin-tab {
  border: none;
  background: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #607d8b;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}
.admin-tab:hover { background: #f4fbf5; color: #6FBF73; }
.admin-tab-active { background: #6FBF73; color: #fff; }
.admin-content { max-width: 1100px; margin: 0 auto; padding: 20px; }
.admin-card {
  background: #fff;
  border: 1px solid #e4ece6;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}
.admin-card h3 { font-size: 15px; font-weight: 700; color: #263238; margin-bottom: 16px; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th, .admin-table td {
  text-align: left;
  padding: 10px 8px;
  font-size: 13px;
  border-bottom: 1px solid #e4ece6;
}
.admin-table th { font-weight: 700; color: #607d8b; font-size: 11px; text-transform: uppercase; }
.admin-btn {
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.admin-btn-danger { background: #ffebee; color: #c62828; }
.admin-btn-danger:hover { background: #ffcdd2; }
.admin-btn-success { background: #e8f5e9; color: #2e7d32; }
.admin-btn-success:hover { background: #c8e6c9; }
.admin-btn-primary { background: #e3f2fd; color: #1565c0; }
.admin-btn-primary:hover { background: #bbdefb; }
.admin-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.admin-stat-card {
  background: #fff;
  border: 1px solid #e4ece6;
  border-radius: 14px;
  padding: 16px;
  text-align: center;
}
.admin-stat-num { font-size: 28px; font-weight: 800; color: #263238; display: block; }
.admin-stat-label { font-size: 11px; color: #607d8b; font-weight: 500; }
.admin-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
}
.admin-badge-pending { background: #fff8e1; color: #f57c00; }
.admin-badge-done { background: #e8f5e9; color: #2e7d32; }
.admin-badge-cancelled { background: #ffebee; color: #c62828; }
`;

fs.writeFileSync(base + '/admin/AdminDashboard.css', adminCssContent);

console.log('All page files generated successfully!');
