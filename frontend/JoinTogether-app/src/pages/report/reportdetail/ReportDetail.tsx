import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../../components/SidebarLayout';
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

    const handleReport = () => {
        navigate('/report/reason');
    };

    return (
        <SidebarLayout title="Báo cáo & Khiếu nại">
            <section className="profile-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="avatar-wrapper" style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        <span className={user.status === 'Online' ? 'status online' : 'status offline'} style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', border: '2px solid #fff', background: user.status === 'Online' ? '#4caf50' : '#bdbdbd' }} />
                    </div>
                    <div className="profile-info" style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: 18 }}>{user.name}</h2>
                        <p style={{ margin: '4px 0', color: '#607d8b', fontSize: 13 }}>{user.age} tuổi • {user.location}</p>
                        <span style={{ fontSize: 12, color: '#90a4ae' }}>Tham gia {user.joined}</span>
                    </div>
                </div>
            </section>

            <section className="bio-card" style={{ padding: 24, background: '#fff', borderRadius: 12, marginTop: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>Giới thiệu</h3>
                <p style={{ margin: 0, color: '#607d8b', fontSize: 13, lineHeight: 1.5 }}>{user.bio}</p>
            </section>

            <section className="statistics-card" style={{ display: 'flex', padding: 24, background: '#fff', borderRadius: 12, marginTop: 16 }}>
                <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 22, color: '#2e7d32' }}>{user.activities}</h2>
                    <span style={{ fontSize: 12, color: '#90a4ae' }}>Hoạt động</span>
                </div>
                <div style={{ width: 1, background: '#e0e0e0', margin: '0 16px' }} />
                <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 22, color: '#2e7d32' }}>{user.friends}</h2>
                    <span style={{ fontSize: 12, color: '#90a4ae' }}>Bạn đồng hành</span>
                </div>
            </section>

            <section className="warning-card" style={{ display: 'flex', gap: 12, padding: 24, background: '#fff8e1', borderRadius: 12, marginTop: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>⚠</span>
                <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Lưu ý</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#bf7a2b', lineHeight: 1.5 }}>
                        Hãy chỉ gửi báo cáo khi phát hiện người dùng vi phạm tiêu chuẩn cộng đồng hoặc có hành vi không phù hợp.
                    </p>
                </div>
            </section>

            <section className="report-policy" style={{ padding: 24, background: '#fff', borderRadius: 12, marginTop: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>Tiêu chuẩn cộng đồng</h3>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#607d8b', lineHeight: 1.8 }}>
                    <li>Không quấy rối hoặc xúc phạm người khác.</li>
                    <li>Không đăng tải nội dung lừa đảo.</li>
                    <li>Không giả mạo danh tính.</li>
                    <li>Không chia sẻ thông tin sai sự thật.</li>
                </ul>
            </section>

            <section className="report-action" style={{ marginTop: 20, textAlign: 'center' }}>
                <button className="report-button" onClick={handleReport} style={{ border: 'none', background: '#d32f2f', color: '#fff', padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                    Báo cáo người dùng
                </button>
            </section>
        </SidebarLayout>
    );
};

export default ReportDetail;
