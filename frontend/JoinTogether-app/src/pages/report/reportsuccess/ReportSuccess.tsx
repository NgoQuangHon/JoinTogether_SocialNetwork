import { useNavigate } from 'react-router-dom';
import './ReportSuccess.css';

const ReportSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="report-success-page">
            <div className="success-card">
                <div className="success-circle">
                    <svg viewBox="0 0 52 52" className="checkmark">
                        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />

                        <path className="checkmark-check" fill="none" d="M14 27 L22 35 L38 18" />
                    </svg>
                </div>

                <h1>Báo cáo đã được gửi</h1>

                <p>
                    Cảm ơn bạn đã giúp xây dựng cộng đồng an toàn. Báo cáo của bạn đã được ghi nhận và sẽ được đội ngũ
                    quản trị xem xét trong thời gian sớm nhất.
                </p>

                <div className="success-info">
                    <div className="info-item">
                        <span>🛡️</span>

                        <p>Thông tin báo cáo được bảo mật.</p>
                    </div>

                    <div className="info-item">
                        <span>⏱️</span>

                        <p>Thời gian xử lý từ 24–72 giờ.</p>
                    </div>

                    <div className="info-item">
                        <span>📩</span>

                        <p>Kết quả sẽ được thông báo trong ứng dụng.</p>
                    </div>
                </div>

                <div className="button-group">
                    <button className="secondary-button" onClick={() => navigate('/report/result')}>
                        Xem trạng thái
                    </button>

                    <button className="primary-button" onClick={() => navigate('/')}>
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportSuccess;
