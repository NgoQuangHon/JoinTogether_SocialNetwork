import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ReportLoading.css';

const ReportLoading = () => {
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/report/success', {
                state: location.state,
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigate, location.state]);

    return (
        <div className="report-loading-page">
            <div className="loading-card">
                <div className="loading-icon">🛡️</div>

                <h1>Đang gửi báo cáo</h1>

                <p>Hệ thống đang tiếp nhận thông tin của bạn. Vui lòng chờ trong giây lát...</p>

                <div className="spinner" />

                <div className="progress">
                    <div className="progress-bar" />
                </div>

                <span>Vui lòng không đóng ứng dụng.</span>
            </div>
        </div>
    );
};

export default ReportLoading;
