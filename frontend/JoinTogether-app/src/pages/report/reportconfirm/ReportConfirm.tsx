import { useLocation, useNavigate } from 'react-router-dom';
import './ReportConfirm.css';

const reasonMap: Record<number, string> = {
    1: 'Quấy rối',
    2: 'Giả mạo',
    3: 'Lừa đảo',
    4: 'Nội dung không phù hợp',
    5: 'Spam',
    6: 'Khác',
};

const ReportConfirm = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const { reasonId, description, images, hoatDongId, thanhVienId, nguoiBiBaoCaoId, targetUserName } = location.state || {};

    const handleConfirm = () => {
        navigate('/report/loading', {
            state: {
                reasonId,
                description,
                images,
                hoatDongId,
                thanhVienId,
                nguoiBiBaoCaoId,
                targetUserName,
            },
        });
    };

    return (
        <div className="report-confirm-page">
            <header className="confirm-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ←
                </button>

                <h1>Xác nhận báo cáo</h1>
            </header>

            <main className="confirm-container">
                <section className="confirm-banner">
                    <div className="banner-icon">🛡️</div>

                    <div>
                        <h2>Kiểm tra lại thông tin</h2>

                        <p>Sau khi gửi, báo cáo sẽ được chuyển đến đội ngũ quản trị để xem xét.</p>
                    </div>
                </section>

                <section className="confirm-card">
                    {targetUserName && (
                        <div className="confirm-row">
                            <label>Người bị báo cáo</label>
                            <span className="reason-tag">👤 {targetUserName}</span>
                        </div>
                    )}

                    <div className="confirm-row">
                        <label>Lý do báo cáo</label>

                        <span className="reason-tag">{reasonMap[reasonId] || 'Không xác định'}</span>
                    </div>

                    <div className="confirm-row">
                        <label>Mô tả</label>

                        <div className="description-box">{description || 'Không có mô tả.'}</div>
                    </div>

                    <div className="confirm-row">
                        <label>Hình ảnh minh chứng</label>

                        <div className="image-list">
                            {images &&
                                images.map((image: string, index: number) => (
                                    <img key={index} src={image} alt={`report-${index}`} />
                                ))}

                            {(!images || images.length === 0) && <p className="empty-image">Chưa có hình ảnh</p>}
                        </div>
                    </div>
                    <div className="confirm-warning">
                        <div className="warning-icon">⚠️</div>

                        <div>
                            <h3>Lưu ý</h3>

                            <p>
                                Báo cáo sẽ được đội ngũ quản trị xem xét. Việc gửi báo cáo sai sự thật hoặc lạm dụng
                                chức năng có thể dẫn đến hạn chế tài khoản.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="button-group">
                    <button className="edit-button" onClick={() => navigate(-1)}>
                        Chỉnh sửa
                    </button>

                    <button className="confirm-button" onClick={handleConfirm}>
                        Xác nhận gửi báo cáo
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ReportConfirm;
