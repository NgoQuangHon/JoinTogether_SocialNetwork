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
    <>
      <a href="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={go('/dashboard')}>
        <span className="nav-icon">📊</span>
        Trang chủ
      </a>
      <a href="/my-profile" className={`nav-item ${isActive('/my-profile') ? 'active' : ''}`} onClick={go('/my-profile')}>
        <span className="nav-icon">👤</span>
        Hồ sơ
      </a>
      <a href="/activities" className={`nav-item ${isActive('/activities') ? 'active' : ''}`} onClick={go('/activities')}>
        <span className="nav-icon">🎯</span>
        Hoạt động
      </a>
      <a href="/ai-match" className={`nav-item ${isActive('/ai-match') ? 'active' : ''}`} onClick={go('/ai-match')}>
        <span className="nav-icon">✦</span>
        AI Match
      </a>
      <a href="/reviews" className={`nav-item ${isActive('/reviews') ? 'active' : ''}`} onClick={go('/reviews')}>
        <span className="nav-icon">⭐</span>
        Đánh giá
      </a>
      <a href="#" className="nav-item" onClick={go('#')}>
        <span className="nav-icon">💬</span>
        Tin nhắn
      </a>
    </>
  );
}
