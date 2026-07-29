import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPendingRequestsApi } from '../services/connection.service';
import { getNotificationsApi } from '../services/notification.service';

export default function NavItems({ onClose, onNavigate }: { onClose?: () => void; onNavigate?: (href: string) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestCount, setRequestCount] = useState<number>(0);
  const [notifCount, setNotifCount] = useState<number>(0);

  useEffect(() => {
    getPendingRequestsApi()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setRequestCount(res.data.length);
        }
      })
      .catch(() => {});

    getNotificationsApi(10)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setNotifCount(res.data.length);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      if (onNavigate) onNavigate(href);
    } else {
      navigate(href);
    }
    onClose?.();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="nav-items-list">
      <a href="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={go('/dashboard')}>
        <span>Trang chủ</span>
        {notifCount > 0 && <span className="nav-badge-red">{notifCount}</span>}
      </a>
      <a href="/activities" className={`nav-item ${isActive('/activities') ? 'active' : ''}`} onClick={go('/activities')}>
        <span>Hoạt động</span>
      </a>
      <a href="/requests" className={`nav-item ${isActive('/requests') ? 'active' : ''}`} onClick={go('/requests')}>
        <span>Yêu cầu kết nối</span>
        {requestCount > 0 && <span className="nav-badge-red">{requestCount}</span>}
      </a>
      <a href="/connections" className={`nav-item ${isActive('/connections') ? 'active' : ''}`} onClick={go('/connections')}>
        <span>Bạn bè & Kết nối</span>
      </a>
      <a href="/ai-match" className={`nav-item ${isActive('/ai-match') ? 'active' : ''}`} onClick={go('/ai-match')}>
        <span>AI Ghép đôi</span>
      </a>
      <a href="/chat" className={`nav-item ${isActive('/chat') ? 'active' : ''}`} onClick={go('/chat')}>
        <span>Tin nhắn nhóm</span>
      </a>
      <a href="/reviews" className={`nav-item ${isActive('/reviews') ? 'active' : ''}`} onClick={go('/reviews')}>
        <span>Đánh giá uy tín</span>
      </a>
      <a href="/report" className={`nav-item ${isActive('/report') ? 'active' : ''}`} onClick={go('/report')}>
        <span>Báo cáo vi phạm</span>
      </a>
    </nav>
  );
}
