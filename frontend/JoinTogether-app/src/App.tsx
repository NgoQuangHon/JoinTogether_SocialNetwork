import { useState } from 'react';
import './App.css';

type AuthMode = 'login' | 'register';

function App() {
    const [mode, setMode] = useState<AuthMode>('login');

    return (
        <div className="app">
            {/* LEFT SIDE */}
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

            {/* RIGHT SIDE */}

            <div className="auth-panel">
                <div className="auth-card">
                    <h2>{mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản'}</h2>

                    <p className="subtitle">
                        {mode === 'login'
                            ? 'Đăng nhập để tiếp tục hành trình cùng JoinTogether.'
                            : 'Bắt đầu hành trình kết nối của bạn.'}
                    </p>

                    {mode === 'register' && (
                        <div className="row">
                            <input type="text" placeholder="Họ" />

                            <input type="text" placeholder="Tên" />
                        </div>
                    )}

                    <input type="email" placeholder="Email" />

                    {mode === 'register' && <input type="tel" placeholder="Số điện thoại" />}

                    {mode === 'register' && (
                        <>
                            <label>Ngày sinh</label>

                            <input type="date" />

                            <label>Giới tính</label>

                            <select>
                                <option>Nam</option>

                                <option>Nữ</option>

                                <option>Khác</option>
                            </select>
                        </>
                    )}

                    <input type="password" placeholder="Mật khẩu" />

                    {mode === 'register' && <input type="password" placeholder="Xác nhận mật khẩu" />}

                    {mode === 'register' && (
                        <div className="checkbox">
                            <input type="checkbox" />

                            <span>Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật.</span>
                        </div>
                    )}

                    <button className="primary-btn">{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>

                    {mode === 'login' && (
                        <>
                            <button className="google-btn">
                                <img
                                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                                    alt=""
                                />
                                Đăng nhập với Google
                            </button>

                            <button className="facebook-btn">Facebook</button>
                        </>
                    )}

                    <div className="divider">
                        <span>Hoặc</span>
                    </div>

                    {mode === 'login' ? (
                        <button className="outline-btn" onClick={() => setMode('register')}>
                            Tham gia JoinTogether
                        </button>
                    ) : (
                        <button className="outline-btn" onClick={() => setMode('login')}>
                            Tôi đã có tài khoản
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
