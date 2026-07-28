import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app">
      <div className="hero">
        <div className="brand">
          <div className="brand-icon">🌿</div>
          <div className="brand-name">JoinTogether</div>
        </div>

        <div className="hero-content">
          <h1>
            Kết nối
            <span> Bạn Đồng Hành </span>
            cho mọi hành trình.
          </h1>

          <p>
            JoinTogether giúp bạn tìm kiếm những người có cùng sở thích, cùng tham gia hoạt động, cùng trải
            nghiệm và xây dựng cộng đồng.
          </p>

          <div className="hero-cards">
            <div className="feature-card">
              <div className="emoji">🤝</div>
              <div>
                <h3>Kết nối cộng đồng</h3>
                <p>Tìm kiếm bạn đồng hành phù hợp.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="emoji">🤖</div>
              <div>
                <h3>AI Matching</h3>
                <p>Gợi ý người phù hợp theo sở thích.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="emoji">🌍</div>
              <div>
                <h3>Hoạt động cộng đồng</h3>
                <p>Khám phá hàng trăm hoạt động mỗi ngày.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <Outlet />
      </div>
    </div>
  );
}
