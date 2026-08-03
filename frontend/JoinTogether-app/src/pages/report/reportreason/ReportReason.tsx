import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ReportReason.css';

interface ReportReasonItem {
    id: number;
    title: string;
    description: string;
    icon: string;
}

const ReportReason = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { hoatDongId, thanhVienId, nguoiBiBaoCaoId, targetUserName } = location.state || {};

    const reasons: ReportReasonItem[] = [
        {
            id: 1,
            title: 'Quấy rối',
            description: 'Có hành vi xúc phạm, đe dọa hoặc làm phiền người khác.',
            icon: '🚫',
        },
        {
            id: 2,
            title: 'Giả mạo',
            description: 'Sử dụng danh tính hoặc hình ảnh của người khác.',
            icon: '👤',
        },
        {
            id: 3,
            title: 'Lừa đảo',
            description: 'Có dấu hiệu chiếm đoạt tài sản hoặc thông tin.',
            icon: '⚠️',
        },
        {
            id: 4,
            title: 'Nội dung không phù hợp',
            description: 'Đăng tải nội dung phản cảm hoặc trái quy định.',
            icon: '📵',
        },
        {
            id: 5,
            title: 'Spam',
            description: 'Gửi quá nhiều tin nhắn hoặc quảng cáo.',
            icon: '📢',
        },
        {
            id: 6,
            title: 'Khác',
            description: 'Lý do khác chưa được liệt kê.',
            icon: '📝',
        },
    ];

    const [selectedReason, setSelectedReason] = useState<number | null>(null);

    const handleContinue = () => {
        if (selectedReason === null) {
            alert('Vui lòng chọn lý do báo cáo.');
            return;
        }

        navigate('/report/description', {
            state: {
                reasonId: selectedReason,
                hoatDongId,
                thanhVienId,
                nguoiBiBaoCaoId,
                targetUserName,
            },
        });
    };

    return (
        <div className="report-reason-page">
            <header className="reason-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ←
                </button>

                <h1>Chọn lý do báo cáo</h1>
            </header>

            <main className="reason-container">
                <div className="title-box">
                    <h2>Lý do báo cáo</h2>

                    <p>Chọn lý do phù hợp nhất để chúng tôi có thể xử lý báo cáo của bạn nhanh chóng và chính xác.</p>
                </div>

                <div className="reason-list">
                    {reasons.map((item) => (
                        <div
                            key={item.id}
                            className={selectedReason === item.id ? 'reason-card selected' : 'reason-card'}
                            onClick={() => setSelectedReason(item.id)}
                        >
                            <div className="reason-icon">{item.icon}</div>

                            <div className="reason-content">
                                <h3>{item.title}</h3>

                                <p>{item.description}</p>
                            </div>

                            <div className="radio-circle">
                                {selectedReason === item.id && <div className="radio-dot" />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="report-note">
                    <div className="note-icon">💡</div>

                    <div>
                        <h4>Lưu ý</h4>

                        <p>
                            Báo cáo sai sự thật hoặc cố ý gây ảnh hưởng đến người khác có thể bị xử lý theo quy định của
                            hệ thống.
                        </p>
                    </div>
                </div>

                <div className="button-group">
                    <button className="cancel-button" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>

                    <button className="continue-button" onClick={handleContinue} disabled={selectedReason === null}>
                        Tiếp tục
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ReportReason;
