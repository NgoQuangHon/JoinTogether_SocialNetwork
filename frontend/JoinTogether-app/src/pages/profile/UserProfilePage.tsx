import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/profile.service';
import { getConnectionStatusApi, sendConnectionRequestApi, respondToRequestApi, blockUserApi, unblockUserApi, checkBlockedApi } from '../../services/connection.service';
import type { HoSoNguoiDung } from '../../types/profile';
import type { ConnectionStatus } from '../../types/connection';
import SidebarLayout from '../../components/SidebarLayout';
import './Profile.css';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { nguoiDungId } = useAuth();
  const [profile, setProfile] = useState<HoSoNguoiDung | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connStatus, setConnStatus] = useState<ConnectionStatus | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loiNhan, setLoiNhan] = useState('');
  const [sending, setSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const targetUserId = parseInt(id || '0', 10);

  useEffect(() => {
    if (!targetUserId || isNaN(targetUserId)) {
      setError('ID người dùng không hợp lệ.');
      setLoading(false);
      return;
    }
    if (targetUserId === nguoiDungId) {
      navigate('/my-profile', { replace: true });
      return;
    }

    Promise.all([
      getProfile(targetUserId),
      getConnectionStatusApi(targetUserId),
      checkBlockedApi(targetUserId),
    ])
      .then(([profileRes, statusRes, blockRes]) => {
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        } else {
          setError(profileRes.message || 'Không thể tải hồ sơ.');
        }
        if (statusRes.success && statusRes.data) {
          setConnStatus(statusRes.data);
        }
        if (blockRes.success && blockRes.data) {
          setIsBlocked(blockRes.data.blocked);
        }
      })
      .catch(() => setError('Lỗi tải hồ sơ.'))
      .finally(() => setLoading(false));
  }, [targetUserId, nguoiDungId, navigate]);

  const handleSendRequest = async () => {
    setSending(true);
    try {
      const res = await sendConnectionRequestApi(targetUserId, loiNhan.trim() || undefined);
      if (res.success) {
        setConnStatus({ status: 'PENDING_SENT', yeuCauId: res.data?.yeuCauKetNoiId });
        setShowRequestModal(false);
        setLoiNhan('');
      } else {
        alert(res.message || 'Gửi yêu cầu thất bại.');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi gửi yêu cầu.');
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (accept: boolean) => {
    if (!connStatus?.yeuCauId) return;
    try {
      const res = await respondToRequestApi(connStatus.yeuCauId, accept);
      if (res.success) {
        if (accept) {
          setConnStatus({ status: 'CONNECTED' });
        } else {
          setConnStatus(null);
        }
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi xử lý yêu cầu.');
    }
  };

  const handleToggleBlock = async () => {
    try {
      if (isBlocked) {
        await unblockUserApi(targetUserId);
        setIsBlocked(false);
      } else {
        await blockUserApi(targetUserId);
        setIsBlocked(true);
        setConnStatus(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi thao tác.');
    }
  };

  if (loading) {
    return (
      <SidebarLayout title="Hồ sơ">
        <div className="profile-loading">
          <div className="spinner" />
          <p>Đang tải hồ sơ...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !profile) {
    return (
      <SidebarLayout title="Hồ sơ">
        <div className="profile-loading">
          <p className="error-text">{error || 'Không tìm thấy người dùng.'}</p>
          <button className="edit-button" onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      </SidebarLayout>
    );
  }

  const user = profile.user;
  const hoTen = user?.hoTen || `Người dùng #${targetUserId}`;
  const anhDaiDien = profile.anhDaiDien || 'https://i.pravatar.cc/200';
  const soThich = profile.soThich || [];

  return (
    <>
      <SidebarLayout title={hoTen}>
        <section className="profile-card profile-summary">
          <img className="main-avatar" src={anhDaiDien} alt="avatar" />
          <div className="user-info">
            <h1>{hoTen}</h1>
            {profile.daXacThuc ? (
              <span className="verified">✓ Tài khoản xác thực</span>
            ) : (
              <span className="unverified-warning">
                ⚠️ Tài khoản chưa xác thực
              </span>
            )}
            
            {/* Tự giới thiệu / Tiểu sử */}
            <div style={{ marginTop: 12, padding: '12px 16px', background: '#f5f7fa', borderRadius: 10 }}>
              <strong style={{ fontSize: 13, color: '#37474f', display: 'block', marginBottom: 4 }}>📝 Tự giới thiệu bản thân</strong>
              <p style={{ margin: 0, fontSize: 14, color: '#263238', lineHeight: 1.5 }}>
                {profile.tieuSu || 'Người dùng chưa cập nhật tiểu sử giới thiệu bản thân.'}
              </p>
            </div>
          </div>
        </section>

        {/* Thông tin cá nhân chi tiết */}
        <section className="profile-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, color: '#78909c', display: 'block' }}>🎂 Tuổi</span>
            <strong style={{ fontSize: 14, color: '#263238' }}>{profile.tuoi ? `${profile.tuoi} tuổi` : 'Chưa cập nhật'}</strong>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#78909c', display: 'block' }}>👤 Giới tính</span>
            <strong style={{ fontSize: 14, color: '#263238' }}>
              {profile.gioiTinh === 'nam' ? 'Nam' : profile.gioiTinh === 'nu' ? 'Nữ' : profile.gioiTinh || 'Chưa cập nhật'}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#78909c', display: 'block' }}>📍 Khu vực</span>
            <strong style={{ fontSize: 14, color: '#263238' }}>{profile.khuVuc || 'Chưa cập nhật'}</strong>
          </div>
        </section>

        {/* Connection actions */}
        <section className="profile-card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {connStatus?.status === 'NONE' || !connStatus ? (
            <button className="edit-button" onClick={() => setShowRequestModal(true)}>
              + Gửi yêu cầu kết nối
            </button>
          ) : connStatus.status === 'PENDING_SENT' ? (
            <span style={{ padding: '8px 16px', background: '#fff8e1', borderRadius: 8, fontSize: 13, color: '#f57f17' }}>
              Đã gửi yêu cầu kết nối
            </span>
          ) : connStatus.status === 'PENDING_RECEIVED' ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="edit-button" onClick={() => handleRespond(true)}>Chấp nhận</button>
              <button className="edit-button" style={{ background: '#f44336' }} onClick={() => handleRespond(false)}>Từ chối</button>
            </div>
          ) : (
            <span style={{ padding: '8px 16px', background: '#e8f5e9', borderRadius: 8, fontSize: 13, color: '#2e7d32' }}>
              Đã kết nối
            </span>
          )}

          <button className="edit-button" style={{ background: '#fce4ec', color: '#c62828' }} onClick={handleToggleBlock}>
            {isBlocked ? 'Bỏ chặn' : 'Chặn'}
          </button>
        </section>

        {/* Interests */}
        {soThich.length > 0 && (
          <section className="profile-card">
            <h2>🌱 Sở thích ({soThich.length})</h2>
            <div className="tags">
              {soThich.map((st) => <span key={st.soThichId}>🌱 {st.tenSoThich}</span>)}
            </div>
          </section>
        )}
      </SidebarLayout>

      {/* Send request modal */}
      {showRequestModal && (
        <div className="sidebar-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="profile-card" style={{ maxWidth: 400, margin: '20vh auto', padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>Gửi yêu cầu kết nối</h2>
            <textarea
              placeholder="Nhập lời nhắn (không bắt buộc)..."
              value={loiNhan}
              onChange={(e) => setLoiNhan(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button className="edit-button" style={{ background: '#f5f5f5', color: '#333' }} onClick={() => setShowRequestModal(false)}>Hủy</button>
              <button className="edit-button" onClick={handleSendRequest} disabled={sending}>
                {sending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
