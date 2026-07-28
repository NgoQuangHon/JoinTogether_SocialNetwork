import { useNavigate } from 'react-router-dom';
import './ReportResult.css';

const ReportResult = () => {
    const navigate = useNavigate();

    const report = {
        reportId: 'RP-2026-000128',
        createdAt: '29/07/2026 - 10:35',
        reason: 'Quấy rối',
        status: 'Đang xử lý',
        expected: '24 - 72 giờ',
    };

    const timeline = [
        {
            title: 'Báo cáo đã gửi',
            time: '10:35',
            completed: true,
        },
        {
            title: 'Đã tiếp nhận',
            time: '10:36',
            completed: true,
        },
        {
            title: 'Đang xem xét',
            time: '--:--',
            completed: true,
        },
        {
            title: 'Hoàn tất xử lý',
            time: '--:--',
            completed: false,
        },
    ];

    return (
        <div className="report-result-page">
            <header className="result-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    ←
                </button>

                <h1>Trạng thái báo cáo</h1>
            </header>

            <main className="result-container">
                <section className="status-card">
                    <div className="status-icon">🛡️</div>

                    <div>
                        <h2>{report.status}</h2>

                        <p>Báo cáo của bạn đang được đội ngũ quản trị xem xét.</p>
                    </div>
                </section>

                <section className="information-card">
                    <h3>Thông tin báo cáo</h3>

                    <div className="info-row">
                        <span>Mã báo cáo</span>

                        <strong>{report.reportId}</strong>
                    </div>

                    <div className="info-row">
                        <span>Ngày gửi</span>

                        <strong>{report.createdAt}</strong>
                    </div>

                    <div className="info-row">
                        <span>Lý do</span>

                        <strong>{report.reason}</strong>
                    </div>

                    <div className="info-row">
                        <span>Dự kiến xử lý</span>

                        <strong>{report.expected}</strong>
                    </div>
                </section>

                <section className="timeline-card">
                    <h3>Tiến trình xử lý</h3>

                    <div className="timeline">
                        {timeline.map((item, index) => (
                            <div className="timeline-item" key={index}>
                                <div className={item.completed ? 'timeline-dot active' : 'timeline-dot'} />

                                <div className="timeline-content">
                                    <h4>{item.title}</h4>

                                    <span>{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="notice-card">
                    <span>📩</span>

                    <p>Bạn sẽ nhận được thông báo khi trạng thái báo cáo thay đổi hoặc đã có kết quả xử lý.</p>
                </section>

                <div className="button-group">
                    <button className="secondary-button" onClick={() => navigate('/report/reason')}>
                        Báo cáo mới
                    </button>

                    <button className="primary-button" onClick={() => navigate('/')}>
                        Về trang chủ
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ReportResult;
