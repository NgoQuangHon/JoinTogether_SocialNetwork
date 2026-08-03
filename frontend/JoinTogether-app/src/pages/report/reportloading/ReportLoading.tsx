import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createReportApi } from '../../../services/report.service';
import './ReportLoading.css';

const ReportLoading = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasSubmitted = useRef(false);

    useEffect(() => {
        if (hasSubmitted.current) return;
        hasSubmitted.current = true;

        const submitReport = async () => {
            const { reasonId, description, images, hoatDongId, thanhVienId, nguoiBiBaoCaoId } = location.state || {};

            // Prepare payload
            const bangChung = Array.isArray(images)
                ? images.map((url: string) => ({
                      loaiBangChung: 'HÌNH_ẢNH',
                      duongDan: url,
                  }))
                : [];

            const payload = {
                nguoiBiBaoCaoId: nguoiBiBaoCaoId || 1, // Fallback if direct report
                loaiViPhamId: reasonId || 1,
                noiDung: description ? description : 'Báo cáo từ người dùng qua hệ thống SUS',
                bangChung,
                hoatDongId,
                thanhVienId,
            };

            try {
                await createReportApi(payload);
                setTimeout(() => {
                    navigate('/report/success', {
                        state: location.state,
                    });
                }, 800);
            } catch (err: any) {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Không thể gửi báo cáo. Vui lòng thử lại sau.';
                setTimeout(() => {
                    navigate('/report/success', {
                        state: { ...(location.state || {}), submitError: msg },
                    });
                }, 800);
            }
        };

        submitReport();
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
