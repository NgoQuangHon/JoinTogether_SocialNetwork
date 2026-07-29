import { useNavigate, useLocation } from 'react-router-dom';

export default function NavItems({ onClose, onNavigate }: { onClose?: () => void; onNavigate?: (href: string) => void }) {
  const navigate = useNavigate();
  const location = useLocation();

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
      </a>
      <a href="/activities" className={`nav-item ${isActive('/activities') ? 'active' : ''}`} onClick={go('/activities')}>
        <span>Hoạt động</span>
      </a>
      <a href="/requests" className={`nav-item ${isActive('/requests') ? 'active' : ''}`} onClick={go('/requests')}>
        <span>Yêu cầu kết nối</span>
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
