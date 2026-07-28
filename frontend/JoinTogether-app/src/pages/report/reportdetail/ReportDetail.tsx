import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportDetail.css';

interface UserInfo {
    id: number;
    name: string;
    avatar: string;
    location: string;
    age: number;
    joined: string;
    activities: number;
    friends: number;
    status: 'Online' | 'Offline';
    bio: string;
}

const ReportDetail = () => {
    const navigate = useNavigate();

    const [user] = useState<UserInfo>({
        id: 1,
        name: 'Nguyễn Văn A',
        avatar: 'https://i.pravatar.cc/300?img=11',
        location: 'Hà Nội',
        age: 22,
        joined: 'Tháng 02/2025',
        activities: 38,
        friends: 145,
        status: 'Online',
        bio: 'Yêu thích các hoạt động thiện nguyện, chạy bộ và du lịch khám phá.',
    });

    const handleBack = () => {
        navigate(-1);
    };

    const handleReport = () => {
        navigate('/report/reason');
    };

    return (
        <div className="report-detail-page">
            <header className="report-header">
                <button className="back-btn" onClick={handleBack}>
                    ←
                </button>

                <h1>Báo cáo & Khiếu nại</h1>
            </header>

            <main className="report-container">
                <section className="profile-card">
                    <div className="avatar-wrapper">
                        <img src={user.avatar} alt={user.name} />

                        <span className={user.status === 'Online' ? 'status online' : 'status offline'} />
                    </div>

                    <div className="profile-info">
                        <h2>{user.name}</h2>

                        <p>
                            {user.age} tuổi • {user.location}
                        </p>

                        <span className="join-date">Tham gia {user.joined}</span>
                    </div>
                </section>

                <section className="bio-card">
                    <h3>Giới thiệu</h3>

                    <p>{user.bio}</p>
                </section>

                <section className="statistics-card">
                    <div className="stat-item">
                        <h2>{user.activities}</h2>

                        <span>Hoạt động</span>
                    </div>

                    <div className="divider" />

                    <div className="stat-item">
                        <h2>{user.friends}</h2>

                        <span>Bạn đồng hành</span>
                    </div>
                </section>

                <section className="warning-card">
                    <div className="warning-icon">⚠</div>

                    <div>
                        <h3>Lưu ý</h3>

                        <p>
                            Hãy chỉ gửi báo cáo khi phát hiện người dùng vi phạm tiêu chuẩn cộng đồng hoặc có hành vi
                            không phù hợp.
                        </p>
                    </div>
                </section>
                <section className="report-policy">
                    <h3>Tiêu chuẩn cộng đồng</h3>

                    <ul>
                        <li>Không quấy rối hoặc xúc phạm người khác.</li>
                        <li>Không đăng tải nội dung lừa đảo.</li>
                        <li>Không giả mạo danh tính.</li>
                        <li>Không chia sẻ thông tin sai sự thật.</li>
                    </ul>
                </section>

                <section className="report-action">
                    <button className="report-button" onClick={handleReport}>
                        Báo cáo người dùng
                    </button>
                </section>
            </main>

            <nav className="bottom-navigation">
                <button className="nav-item active">
                    <span>🏠</span>

                    <p>Trang chủ</p>
                </button>

                <button className="nav-item">
                    <span>🔍</span>

                    <p>Khám phá</p>
                </button>

                <button className="nav-item">
                    <span>➕</span>

                    <p>Tạo</p>
                </button>

                <button className="nav-item">
                    <span>💬</span>

                    <p>Tin nhắn</p>
                </button>

                <button className="nav-item">
                    <span>👤</span>

                    <p>Cá nhân</p>
                </button>
            </nav>
        </div>
    );
};

export default ReportDetail;
