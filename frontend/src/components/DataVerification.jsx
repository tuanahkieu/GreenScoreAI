import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';

const DataVerification = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleVerify = () => {
    if (!file) return;
    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      // Randomly select a verification result for MVP purpose
      const results = [
        { status: 'Verified', label: 'Có cơ sở xác minh', color: 'var(--color-primary)' },
        { status: 'Partially Verified', label: 'Xác minh một phần', color: 'var(--color-info)' },
        { status: 'Needs Review', label: 'Cần kiểm tra', color: 'var(--color-warning)' }
      ];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      setVerificationResult(randomResult);
    }, 2000);
  };

  const handleSkip = () => {
    setVerificationResult({ status: 'Self-reported', label: 'Tự khai báo', color: 'var(--color-text-muted)' });
    onComplete('Self-reported');
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.5rem' }}>
        Xác minh dữ liệu (Không bắt buộc)
      </h3>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Để có kết quả đánh giá sức khỏe tài chính chính xác hơn, bạn có thể tải lên tài liệu hỗ trợ (VD: sao kê ngân hàng, bảng lương) để hệ thống đối chiếu.
      </p>

      {!verificationResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            border: '2px dashed rgba(255,255,255,0.2)', 
            borderRadius: '12px', 
            padding: '2rem',
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'rgba(0,0,0,0.2)'
          }}>
            <input 
              type="file" 
              id="file-upload" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {file ? (
                <>
                  <FileText size={48} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
                  <span style={{ color: 'var(--color-text-main)' }}>{file.name}</span>
                </>
              ) : (
                <>
                  <Upload size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
                  <span style={{ color: 'var(--color-text-muted)' }}>Nhấn để chọn tệp tài liệu</span>
                </>
              )}
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleSkip}
              disabled={isVerifying}
            >
              Bỏ qua (Tự khai báo)
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={!file || isVerifying}
              style={{ minWidth: '150px' }}
            >
              {isVerifying ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Đối chiếu dữ liệu'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1.5rem 2rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderLeft: `4px solid ${verificationResult.color}`
          }}>
            {verificationResult.status === 'Verified' ? (
              <CheckCircle size={32} color={verificationResult.color} />
            ) : (
              <AlertCircle size={32} color={verificationResult.color} />
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Kết quả đối chiếu</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: verificationResult.color }}>
                {verificationResult.label}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => onComplete(verificationResult.status)}
            style={{ marginTop: '1rem' }}
          >
            Hoàn thành & Xem kết quả
          </button>
        </div>
      )}
    </div>
  );
};

export default DataVerification;
