import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUsersApi,
  lockAccountApi,
  unlockAccountApi,
  getAuditLogsApi,
  getSupportRequestsApi,
  processSupportRequestApi,
  type AdminUser,
  type SupportRequest,
} from '../../services/admin.service';
import {
  getReportsApi,
  processReportApi,
  getViolationStatsApi,
} from '../../services/report.service';
import type { BaoCaoViPham } from '../../types/report';
import './Admin.css';

type Tab = 'reports' | 'support' | 'users' | 'audit';

export default function AdminDashboard() {
  const { isAuthenticated, roles, role, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('reports');
  const [reports, setReports] = useState<BaoCaoViPham[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [apiError, setApiError] = useState('');
  
  // Report process modal state
  const [processId, setProcessId] = useState<number | null>(null);
  const [ketQua, setKetQua] = useState('');
  const [shouldWarnAndPenalty, setShouldWarnAndPenalty] = useState(false);
  
  // Support process modal state
  const [processSupportId, setProcessSupportId] = useState<number | null>(null);
  const [supportTrangThai, setSupportTrangThai] = useState('DA_XU_LY');
  const [ghiChuAdmin, setGhiChuAdmin] = useState('');

  const [msg, setMsg] = useState('');

  const isAdmin =
    (Array.isArray(roles) && roles.some((r: string) => r.toUpperCase() === 'ADMIN')) ||
    role?.toUpperCase() === 'ADMIN';

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadStats();
  }, [isAuthenticated]);

  useEffect(() => {
    if (tab === 'reports') loadReports();
    if (tab === 'support') loadSupportRequests();
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
    setApiError('');
    try {
      const res = await getReportsApi(filterStatus || undefined);
      if (res.success && res.data) setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setReports([]);
      setApiError(
        `Không tải được danh sách báo cáo (${err?.response?.status || err?.message || 'lỗi'}). Bạn cần đăng nhập bằng tài khoản quản trị.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSupportRequests = async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await getSupportRequestsApi(filterStatus || undefined);
      if (res.success && res.data) setSupportRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setSupportRequests([]);
      setApiError(
        `Không tải được danh sách yêu cầu hỗ trợ (${err?.response?.status || err?.message || 'lỗi'}). Bạn cần đăng nhập bằng tài khoản quản trị.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await getUsersApi(50, 0);
      if (res.success && res.data) {
        const rows = (res.data as any).rows || res.data;
        setUsers(Array.isArray(rows) ? rows : []);
      }
    } catch (err: any) {
      setUsers([]);
      setApiError(
        `Không tải được danh sách người dùng (${err?.response?.status || err?.message || 'lỗi'}). Bạn cần đăng nhập bằng tài khoản quản trị.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAudit = async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await getAuditLogsApi(50, 0);
      if (res.success && res.data) setAuditLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setAuditLogs([]);
      setApiError(
        `Không tải được nhật ký hoạt động (${err?.response?.status || err?.message || 'lỗi'}). Bạn cần đăng nhập bằng tài khoản quản trị.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReport = async () => {
    if (processId == null || !ketQua.trim()) return;
    setLoading(true);
    try {
      const res = await processReportApi(processId, {
        ketQua: ketQua.trim(),
        truDiem: shouldWarnAndPenalty,
      });
      if (res.success) {
        const data = res.data as any;
        if (data?.taiKhoanBiKhoa) {
          setMsg(`Đã xử lý báo cáo. Tài khoản vi phạm đã vượt quá 3 lần cảnh cáo và ĐÃ BỊ KHÓA VĨNH VIỄN.`);
        } else if (data?.soLanCanhBao) {
          setMsg(`Đã xử lý báo cáo. Đã tăng số lần cảnh cáo của người vi phạm lên ${data.soLanCanhBao}/3.`);
        } else {
          setMsg('Đã xử lý báo cáo thành công.');
        }
        setProcessId(null);
        setKetQua('');
        setShouldWarnAndPenalty(false);
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

  const handleProcessSupport = async () => {
    if (processSupportId == null) return;
    setLoading(true);
    try {
      const res = await processSupportRequestApi(processSupportId, {
        trangThai: supportTrangThai,
        ghiChuAdmin: ghiChuAdmin.trim() || undefined,
      });
      if (res.success) {
        setMsg(`Đã xử lý yêu cầu hỗ trợ #${processSupportId} thành công.`);
        setProcessSupportId(null);
        setGhiChuAdmin('');
        loadSupportRequests();
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
          onClick={() => { setTab('reports'); setFilterStatus(''); }}
        >
          🚨 Báo cáo vi phạm
        </button>
        <button
          className={`admin-nav-item ${tab === 'support' ? 'active' : ''}`}
          onClick={() => { setTab('support'); setFilterStatus(''); }}
        >
          🆘 Yêu cầu hỗ trợ (SUS)
        </button>
        <button
          className={`admin-nav-item ${tab === 'users' ? 'active' : ''}`}
          onClick={() => { setTab('users'); setFilterStatus(''); }}
        >
          👥 Quản lý tài khoản
        </button>
        <button
          className={`admin-nav-item ${tab === 'audit' ? 'active' : ''}`}
          onClick={() => { setTab('audit'); setFilterStatus(''); }}
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
            {tab === 'support' && 'Quản lý Yêu cầu hỗ trợ hệ thống (SUS)'}
            {tab === 'users' && 'Quản lý tài khoản'}
            {tab === 'audit' && 'Nhật ký quản trị'}
          </h1>
        </div>

        {msg && (
          <div
            style={{
              background: '#f0fdf4',
              color: '#166534',
              padding: '12px 16px',
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 13.5,
              border: '1px solid #bbf7d0',
              fontWeight: 600,
            }}
          >
            {msg}
            <button
              style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setMsg('')}
            >
              ✕
            </button>
          </div>
        )}

        {apiError && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 13.5,
              border: '1px solid #fecaca',
              fontWeight: 600,
            }}
          >
            {apiError}
            <button
              style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setApiError('')}
            >
              ✕
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
                <option value="CHUA_XU_LY">Chờ xử lý</option>
                <option value="DA_XU_LY">Đã xử lý</option>
              </select>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người báo cáo</th>
                    <th>Người bị báo cáo</th>
                    <th>Hoạt động</th>
                    <th>Loại</th>
                    <th>Nội dung</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>
                        Đang tải...
                      </td>
                    </tr>
                  )}
                  {!loading && reports.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#607d8b' }}>
                        Không có báo cáo nào.
                      </td>
                    </tr>
                  )}
                  {reports.map((r) => (
                    <tr key={r.baoCaoId}>
                      <td>#{r.baoCaoId}</td>
                      <td>{(r.nguoiBaoCao as any)?.hoTen || (r.nguoiBaoCao as any) || `#${r.nguoiBaoCaoId}`}</td>
                      <td>{(r.nguoiBiBaoCao as any)?.hoTen || (r.nguoiBiBaoCao as any) || `#${r.nguoiBiBaoCaoId}`}</td>
                      <td>{r.tenHoatDong || '—'}</td>
                      <td>{r.loaiViPham?.tenLoai || (r.tenLoaiViPham as any) || `#${r.loaiViPhamId}`}</td>
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
                            onClick={() => {
                              setProcessId(r.baoCaoId);
                              setKetQua('');
                              setShouldWarnAndPenalty(true);
                            }}
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

        {tab === 'support' && (
          <>
            <div className="filter-bar">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="CHO_XU_LY">Chờ xử lý</option>
                <option value="DA_XU_LY">Đã xử lý</option>
                <option value="DA_DONG">Đã đóng</option>
              </select>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người gửi</th>
                    <th>Loại hỗ trợ</th>
                    <th>Tiêu đề</th>
                    <th>Mô tả chi tiết</th>
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
                  {!loading && supportRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#607d8b' }}>
                        Không có yêu cầu hỗ trợ nào.
                      </td>
                    </tr>
                  )}
                  {supportRequests.map((s) => (
                    <tr key={s.hoTroId}>
                      <td>#{s.hoTroId}</td>
                      <td>
                        <strong>{s.nguoiGui || `User #${s.nguoiGuiId}`}</strong>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{s.emailNguoiGui}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#2563eb' }}>
                          {s.loaiHoTro === 'LOI_KY_THUAT' && '💻 Lỗi kỹ thuật'}
                          {s.loaiHoTro === 'TAI_KHOAN' && '👤 Tài khoản'}
                          {s.loaiHoTro === 'HOAT_DONG' && '🎯 Hoạt động'}
                          {s.loaiHoTro === 'GOP_Y' && '💡 Góp ý'}
                          {s.loaiHoTro === 'KHAC' && '❓ Khác'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.tieuDe}</td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.moTa}
                      </td>
                      <td>
                        <span className={`badge ${s.trangThai === 'DA_XU_LY' ? 'badge-processed' : s.trangThai === 'DA_DONG' ? 'badge-locked' : 'badge-pending'}`}>
                          {s.trangThai === 'CHO_XU_LY' && 'Chờ xử lý'}
                          {s.trangThai === 'DA_XU_LY' && 'Đã xử lý'}
                          {s.trangThai === 'DA_DONG' && 'Đã đóng'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-sm-primary"
                          onClick={() => {
                            setProcessSupportId(s.hoTroId);
                            setSupportTrangThai(s.trangThai === 'CHO_XU_LY' ? 'DA_XU_LY' : s.trangThai);
                            setGhiChuAdmin(s.ghiChuAdmin || '');
                          }}
                        >
                          Phản hồi / Xử lý
                        </button>
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
                  const statusStr = u.trangThai || u.taiKhoan?.trangThai || '';
                  const isPermLocked = statusStr === 'KHOA_VINH_VIEN';
                  const isTempLocked = statusStr === 'khoa' || statusStr === 'locked';

                  return (
                    <tr key={u.nguoiDungId}>
                      <td>#{u.nguoiDungId}</td>
                      <td>{u.hoTen}</td>
                      <td>{u.email}</td>
                      <td>{u.soDienThoai || '—'}</td>
                      <td>
                        <span className={`badge ${isPermLocked ? 'badge-locked' : isTempLocked ? 'badge-pending' : 'badge-active'}`}>
                          {isPermLocked ? '🚫 Đã khóa vĩnh viễn' : isTempLocked ? '🔒 Đã khóa' : '✅ Hoạt động'}
                        </span>
                      </td>
                      <td>
                        {isPermLocked || isTempLocked ? (
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

      {/* Modal xử lý Báo cáo vi phạm */}
      {processId != null && (
        <div className="process-modal-overlay" onClick={() => setProcessId(null)}>
          <div className="process-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🚨 Xử lý Báo cáo vi phạm #{processId}</h3>
            <label style={{ fontSize: 13, color: '#475569', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Nội dung quyết định / Kết quả xử lý *
            </label>
            <textarea
              value={ketQua}
              onChange={(e) => setKetQua(e.target.value)}
              placeholder="Ví dụ: Xác minh có hành vi quấy rối, cảnh cáo lần 1 và trừ điểm uy tín..."
              rows={3}
              style={{ width: '100%', borderRadius: 8, padding: 10, border: '1px solid #cbd5e1', marginBottom: 16 }}
            />

            <div style={{ background: '#fff7ed', padding: 12, borderRadius: 10, border: '1px solid #ffedd5', marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#c2410c' }}>
                <input
                  type="checkbox"
                  checked={shouldWarnAndPenalty}
                  onChange={(e) => setShouldWarnAndPenalty(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#ea580c' }}
                />
                ⚠️ Phạt cảnh cáo & Trừ 20 điểm uy tín
              </label>
              <p style={{ margin: '6px 0 0 26px', fontSize: 12, color: '#9a3412', lineHeight: 1.4 }}>
                <strong>Cơ chế tự động:</strong> Mỗi lần bị phạt cảnh cáo, số lần cảnh cáo của tài khoản bị báo cáo sẽ tăng +1. Khi bị cảnh cáo đủ <strong>3 lần</strong>, tài khoản đó sẽ lập tức bị <strong>KHÓA VĨNH VIỄN</strong>.
              </p>
            </div>

            <div className="process-actions">
              <button className="btn-sm btn-sm-outline" onClick={() => setProcessId(null)}>
                Hủy
              </button>
              <button className="btn-sm btn-sm-primary" onClick={handleProcessReport} disabled={loading || !ketQua.trim()}>
                {loading ? 'Đang lưu...' : 'Xác nhận xử lý'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xử lý Yêu cầu hỗ trợ (SUS) */}
      {processSupportId != null && (
        <div className="process-modal-overlay" onClick={() => setProcessSupportId(null)}>
          <div className="process-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🆘 Xử lý Yêu cầu hỗ trợ #{processSupportId}</h3>

            <label style={{ fontSize: 13, color: '#475569', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Trạng thái xử lý:
            </label>
            <select
              value={supportTrangThai}
              onChange={(e) => setSupportTrangThai(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 16, fontSize: 14 }}
            >
              <option value="CHO_XU_LY">⏳ Chờ xử lý</option>
              <option value="DA_XU_LY">✅ Đã xử lý / Đã hỗ trợ</option>
              <option value="DA_DONG">🔒 Đã đóng yêu cầu</option>
            </select>

            <label style={{ fontSize: 13, color: '#475569', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Ghi chú / Phản hồi của Admin gửi người dùng (tùy chọn):
            </label>
            <textarea
              value={ghiChuAdmin}
              onChange={(e) => setGhiChuAdmin(e.target.value)}
              placeholder="Nhập hướng dẫn xử lý hoặc phản hồi để người dùng biết..."
              rows={4}
              style={{ width: '100%', borderRadius: 8, padding: 10, border: '1px solid #cbd5e1', marginBottom: 20 }}
            />

            <div className="process-actions">
              <button className="btn-sm btn-sm-outline" onClick={() => setProcessSupportId(null)}>
                Hủy
              </button>
              <button className="btn-sm btn-sm-primary" onClick={handleProcessSupport} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu kết quả'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
