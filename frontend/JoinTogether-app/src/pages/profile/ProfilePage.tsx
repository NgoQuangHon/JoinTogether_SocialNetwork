import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="profile-page">
            {/* ================= HEADER ================= */}

            <header className="profile-header">
                <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
                    ☰
                </button>

                <div className="logo">JoinTogether</div>

                <div className="header-user">
                    <span>🔔</span>

                    <img src="https://i.pravatar.cc/100" alt="avatar" />
                </div>
            </header>

            {/* ================= OVERLAY ================= */}

            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* ================= SIDEBAR ================= */}

            <aside
                className={`sidebar 
                    ${isSidebarOpen ? 'open' : ''}`}
            >
                <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>
                    ✕
                </button>

                <div className="sidebar-profile">
                    <img src="https://i.pravatar.cc/150" alt="avatar" />

                    <h3>Nguyễn Văn A</h3>

                    <span>@nguyenvana</span>
                </div>

                <ul className="sidebar-menu">
                    <li className="active">👤 Hồ sơ</li>

                    <li>📝 Thông tin cá nhân</li>

                    <li>🌱 Sở thích</li>

                    <li>📅 Hoạt động</li>

                    <li>⭐ Đánh giá</li>

                    <li>⚙ Cài đặt</li>
                </ul>

                <button className="logout-button">🚪 Đăng xuất</button>
            </aside>

            {/* ================= PROFILE CONTENT ================= */}

            <main className="profile-container">
                {/* PROFILE HEADER CARD */}

                <section className="profile-card profile-summary">
                    <img className="main-avatar" src="https://i.pravatar.cc/200" alt="avatar" />

                    <div className="user-info">
                        <h1>Nguyễn Văn A</h1>

                        <p>@nguyenvana</p>

                        <span className="verified">✓ Tài khoản xác thực</span>
                    </div>

                    <button className="edit-button">Chỉnh sửa thông tin</button>
                </section>

                {/* STATISTIC */}

                <section className="statistic-grid">
                    <div className="stat-card">
                        <h2>85%</h2>

                        <p>Hoàn thiện hồ sơ</p>

                        <div className="progress">
                            <span
                                style={{
                                    width: '85%',
                                }}
                            ></span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <h2>95%</h2>

                        <p>Độ tin cậy</p>

                        <div className="trust">⭐ Cao</div>
                    </div>
                </section>

                {/* PERSONAL INFORMATION */}

                <section className="profile-card">
                    <h2>Thông tin cá nhân</h2>

                    <div className="info-grid">
                        <div>
                            <label>Giới tính</label>

                            <p>Nam</p>
                        </div>

                        <div>
                            <label>Địa điểm</label>

                            <p>Hà Nội</p>
                        </div>
                    </div>
                </section>

                {/* ABOUT */}

                <section className="profile-card">
                    <h2>Giới thiệu bản thân</h2>

                    <p className="about">
                        Tôi yêu thích các hoạt động cộng đồng, du lịch và mong muốn kết nối với những người có chung sở
                        thích.
                    </p>
                </section>

                {/* INTEREST */}

                <section className="profile-card">
                    <h2>Sở thích</h2>

                    <div className="tags">
                        <span>🌱 Du lịch</span>

                        <span>🏕 Camping</span>

                        <span>📷 Photography</span>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
