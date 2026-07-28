import { useNavigate } from 'react-router-dom';

export default function NavItems({ onClose, onNavigate }: { onClose?: () => void; onNavigate?: (href: string) => void }) {
  const navigate = useNavigate();

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      if (onNavigate) onNavigate(href);
    } else {
      navigate(href);
    }
    onClose?.();
  };

  return (
    <>
      <a href="/dashboard" className="nav-item active" onClick={go('/dashboard')}>
        <span className="nav-icon">📊</span>
        Trang chủ
      </a>
      <a href="/my-profile" className="nav-item" onClick={go('/my-profile')}>
        <span className="nav-icon">👤</span>
        Hồ sơ
      </a>
      <a href="/activities" className="nav-item" onClick={go('/activities')}>
        <span className="nav-icon">🎯</span>
        Hoạt động
      </a>
      <a href="#" className="nav-item" onClick={go('#')}>
        <span className="nav-icon">🔗</span>
        Kết nối
      </a>
      <a href="#" className="nav-item" onClick={go('#')}>
        <span className="nav-icon">💬</span>
        Tin nhắn
      </a>
      <a href="#" className="nav-item" onClick={go('#')}>
        <span className="nav-icon">⭐</span>
        Đánh giá
      </a>
    </>
  );
}
