import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUsersApi,
  lockAccountApi,
  unlockAccountApi,
  getAuditLogsApi,
  type AdminUser,
} from '../../services/admin.service';
import {
  getReportsApi,
  processReportApi,
  getViolationStatsApi,
} from '../../services/report.service';
import type { BaoCaoViPham } from '../../types/report';
import './Admin.css';

type Tab = 'reports' | 'users' | 'audit';

export default function AdminDashboard() {
  const { isAuthenticated, logout, role, roles } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('reports');
  const [reports, setReports] = useState<BaoCaoViPham[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [processId, setProcessId] = useState<number | null>(null);
  const [ketQua, setKetQua] = useState('');
  const [truDiem, setTruDiem] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadStats();
  }, [isAuthenticated]);

  useEffect(() => {
    if (tab === 'reports') loadReports();
    if (tab === 'users') loadUsers();
    if (tab === 'audit') loadAudit();
  }, [tab, filterStatus]);

  const loadStats = async () => {
    try {
      const res = await getViolationStatsApi();
      if (res.success) setStats(res.data);
    } catch {
      /* optional */
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await getReportsApi(filterStatus || undefined);
      if (res.success && res.data) setReports(Array.isArray(res.data) ? res.data : []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi(50, 0);
      if (res.success && res.data) {
        const rows = (res.data as any).rows || res.data;
        setUsers(Array.isArray(rows) ? rows : []);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAudit = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogsApi(50, 0);
      if (res.success && res.data) setAuditLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (processId == null || !ketQua.trim()) return;
    setLoading(true);
    try {
      const res = await processReportApi(processId, {
        ketQua: ketQua.trim(),
        truDiem: truDiem ? parseInt(truDiem, 10) : undefined,
      });
      if (res.success) {
        setMsg('Đã xử lý báo cáo thành công.');
        setProcessId(null);
        setKetQua('');
        setTruDiem('');
        loadReports();
        loadStats();
      } else {
        setMsg(res.message || 'Xử lý thất bại.');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMsg(e?.response?.data?.message || 'Xử lý thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: number) => {
    if (!confirm('Khóa tài khoản này?')) return;
    try {
      await lockAccountApi(id);
      loadUsers();
    } catch {
      alert('Không thể khóa tài khoản.');
    }
  };

  const handleUnlock = async (id: number) => {
    try {
      await unlockAccountApi(id);
      loadUsers();
    } catch {
      alert('Không thể mở khóa.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">🌿</div>
          <span className="admin-brand-name">JT Admin</span>
        </div>
        <button
          className={`admin-nav-item ${tab === 'reports' ? 'active' : ''}`}
          onClick={() => setTab('reports')}
        >
          🚩 Báo cáo vi phạm
        </button>
        <button
          className={`admin-nav-item ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          👥 Quản lý tài khoản
        </button>
        <button
          className={`admin-nav-item ${tab === 'audit' ? 'active' : ''}`}
          onClick={() => setTab('audit')}
        >
          📋 Nhật ký quản trị
        </button>
        <div style={{ flex: 1 }} />
        <button className="admin-nav-item" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>
            {tab === 'reports' && 'Quản lý báo cáo vi phạm'}
            {tab === 'users' && 'Quản lý tài khoản'}
            {tab === 'audit' && 'Nhật ký quản trị'}
          </h1>
        </div>

        {msg && (
          <div
            style={{
              background: 'var(--primary-100)',
              color: 'var(--primary-800)',
              padding: '12px 16px',
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 13.5,
            }}
          >
            {msg}
            <button
              style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => setMsg('')}
            >
              ×
            </button>
          </div>
        )}

        {tab === 'reports' && (
          <>
            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-label">Tổng báo cáo</div>
                <div className="admin-stat-value">{stats?.total ?? reports.length}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Chờ xử lý</div>
                <div className="admin-stat-value" style={{ color: '#f9a825' }}>
                  {stats?.pending ?? reports.filter((r) => !r.quyetDinh).length}
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Đã xử lý</div>
                <div className="admin-stat-value">
                  {stats?.processed ?? reports.filter((r) => !!r.quyetDinh).length}
                </div>
              </div>
            </div>

            <div className="filter-bar">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processed">Đã xử lý</option>
              </select>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người báo cáo</th>
                    <th>Người bị báo cáo</th>
                    <th>Loại</th>
                    <th>Nội dung</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>
                        Đang tải...
                      </td>
                    </tr>
                  )}
                  {!loading && reports.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#607d8b' }}>
                        Không có báo cáo nào.
                      </td>
                    </tr>
                  )}
                  {reports.map((r) => (
                    <tr key={r.baoCaoId}>
                      <td>#{r.baoCaoId}</td>
                      <td>{r.nguoiBaoCao?.hoTen || `#${r.nguoiBaoCaoId}`}</td>
                      <td>{r.nguoiBiBaoCao?.hoTen || `#${r.nguoiBiBaoCaoId}`}</td>
                      <td>{r.loaiViPham?.tenLoai || `#${r.loaiViPhamId}`}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.noiDung || '—'}
                      </td>
                      <td>
                        <span className={`badge ${r.quyetDinh ? 'badge-processed' : 'badge-pending'}`}>
                          {r.quyetDinh ? 'Đã xử lý' : 'Chờ xử lý'}
                        </span>
                      </td>
                      <td>
                        {!r.quyetDinh && (
                          <button
                            className="btn-sm btn-sm-primary"
                            onClick={() => setProcessId(r.baoCaoId)}
                          >
                            Xử lý
                          </button>
                        )}
                        {r.quyetDinh && (
                          <span style={{ fontSize: 12, color: '#607d8b' }}>{r.quyetDinh.ketQua}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                      Đang tải...
                    </td>
                  </tr>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#607d8b' }}>
                      Không có người dùng.
                    </td>
                  </tr>
                )}
                {users.map((u) => {
                  const locked =
                    u.trangThai === 'khoa' ||
                    u.trangThai === 'locked' ||
                    u.taiKhoan?.trangThai === 'khoa';
                  return (
                    <tr key={u.nguoiDungId}>
                      <td>#{u.nguoiDungId}</td>
                      <td>{u.hoTen}</td>
                      <td>{u.email}</td>
                      <td>{u.soDienThoai || '—'}</td>
                      <td>
                        <span className={`badge ${locked ? 'badge-locked' : 'badge-active'}`}>
                          {locked ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td>
                        {locked ? (
                          <button
                            className="btn-sm btn-sm-primary"
                            onClick={() => handleUnlock(u.nguoiDungId)}
                          >
                            Mở khóa
                          </button>
                        ) : (
                          <button
                            className="btn-sm btn-sm-danger"
                            onClick={() => handleLock(u.nguoiDungId)}
                          >
                            Khóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'audit' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Admin ID</th>
                  <th>Hành động</th>
                  <th>Đối tượng</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>
                      Đang tải...
                    </td>
                  </tr>
                )}
                {!loading && auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#607d8b' }}>
                      Chưa có nhật ký.
                    </td>
                  </tr>
                )}
                {auditLogs.map((log: any) => (
                  <tr key={log.nhatKyId || log.nhat_ky_id}>
                    <td>#{log.nhatKyId || log.nhat_ky_id}</td>
                    <td>#{log.nguoiQuanTriId || log.nguoi_quan_tri_id}</td>
                    <td>{log.hanhDong || log.hanh_dong}</td>
                    <td>{log.doiTuongTacDong || log.doi_tuong_tac_dong || '—'}</td>
                    <td>
                      {(log.thoiGianThucHien || log.thoi_gian_thuc_hien)
                        ? new Date(log.thoiGianThucHien || log.thoi_gian_thuc_hien).toLocaleString('vi-VN')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {processId != null && (
        <div className="process-modal-overlay" onClick={() => setProcessId(null)}>
          <div className="process-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Xử lý báo cáo #{processId}</h3>
            <label style={{ fontSize: 13, color: '#607d8b', display: 'block', marginBottom: 6 }}>
              Kết quả xử lý *
            </label>
            <textarea
              value={ketQua}
              onChange={(e) => setKetQua(e.target.value)}
              placeholder="Ví dụ: Cảnh cáo người dùng / Khóa tài khoản 7 ngày..."
              rows={3}
            />
            <label style={{ fontSize: 13, color: '#607d8b', display: 'block', marginBottom: 6 }}>
              Trừ điểm uy tín (tùy chọn)
            </label>
            <input
              type="number"
              value={truDiem}
              onChange={(e) => setTruDiem(e.target.value)}
              placeholder="0"
              min={0}
            />
            <div className="process-actions">
              <button className="btn-sm btn-sm-outline" onClick={() => setProcessId(null)}>
                Hủy
              </button>
              <button className="btn-sm btn-sm-primary" onClick={handleProcess} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
