import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSupportRequestApi } from '../../services/admin.service';
import './SupportRequest.css';

export default function SupportRequestPage() {
  const navigate = useNavigate();
  const [loaiHoTro, setLoaiHoTro] = useState('LOI_KY_THUAT');
  const [tieuDe, setTieuDe] = useState('');
  const [moTa, setMoTa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tieuDe.trim()) {
      setError('Vui lòng nhập tiêu đề yêu cầu.');
      return;
    }
    if (!moTa.trim()) {
      setError('Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải.');
      return;
    }

    setLoading(true);
    try {
      const res = await createSupportRequestApi({
        loaiHoTro,
        tieuDe: tieuDe.trim(),
        moTa: moTa.trim(),
      });
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || 'Gửi yêu cầu thất bại.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="support-page">
        <div className="support-card support-success-card">
          <div className="success-icon">✅</div>
          <h2>Gửi yêu cầu hỗ trợ thành công!</h2>
          <p>
            Yêu cầu của bạn đã được chuyển tới Ban quản trị JoinTogether. Bạn sẽ nhận được thông báo ngay khi chúng tôi xem xét và phản hồi.
          </p>
          <div className="button-group">
            <button className="secondary-btn" onClick={() => navigate('/sus')}>
              Về trang SUS
            </button>
            <button className="primary-btn" onClick={() => navigate('/dashboard')}>
              Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="support-page">
      <div className="support-header">
        <button className="back-btn" onClick={() => navigate('/sus')}>
          ← Quay lại
        </button>
        <h1>🆘 Yêu cầu Hỗ trợ Sử dụng Hệ thống</h1>
      </div>

      <div className="support-card">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Loại hỗ trợ:</label>
            <select
              value={loaiHoTro}
              onChange={(e) => setLoaiHoTro(e.target.value)}
              className="form-control"
            >
              <option value="LOI_KY_THUAT">💻 Lỗi kỹ thuật / Giao diện hệ thống</option>
              <option value="TAI_KHOAN">👤 Vấn đề về tài khoản / Đăng nhập</option>
              <option value="HOAT_DONG">🎯 Thắc mắc về Hoạt động & Kết nối</option>
              <option value="GOP_Y">💡 Góp ý cải thiện hệ thống</option>
              <option value="KHAC">❓ Yêu cầu khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tiêu đề yêu cầu: <span className="required">*</span></label>
            <input
              type="text"
              placeholder="VD: Không tải được danh sách tin nhắn..."
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Mô tả chi tiết vấn đề: <span className="required">*</span></label>
            <textarea
              rows={5}
              placeholder="Mô tả cụ thể các bước gây ra lỗi hoặc câu hỏi của bạn để ban quản trị hỗ trợ chính xác hơn..."
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              className="form-control"
            ></textarea>
          </div>

          <div className="support-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate('/sus')}
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
