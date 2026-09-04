import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck, Zap, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  React.useEffect(() => {
    if (user && user.username === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleStartTest = () => {
    if (!user) {
      setModalConfig({
        isOpen: true,
        title: "Yêu cầu đăng nhập",
        message: "Bạn cần đăng nhập để làm bài kiểm tra và lưu kết quả cho riêng mình.",
        type: "confirm",
        confirmText: "Đăng nhập ngay",
        cancelText: "Đóng",
        onConfirm: () => {
          setModalConfig({ isOpen: false });
          navigate('/login');
        },
        onCancel: () => setModalConfig({ isOpen: false })
      });
    } else {
      navigate('/test');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      {/* Top right login button if not logged in */}
      {!user && (
        <div style={{ position: 'absolute', top: '0', right: '0' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/login')}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '20px' }}
          >
            <LogIn size={16} style={{ marginRight: '0.5rem' }} /> Đăng nhập
          </button>
        </div>
      )}

      <div className="container animate-fade-in" style={{ maxWidth: '800px', textAlign: 'center', paddingTop: '4rem' }}>
        <h1 className="app-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>GreenScore AI</h1>
        <p className="app-subtitle" style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Hệ thống đánh giá sức khỏe tài chính thông minh dựa trên phân tích dòng tiền, thói quen chi tiêu và kỷ luật thanh toán của bạn.
        </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem', textAlign: 'left' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary)' }}>
            <Activity size={24} />
          </div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Đánh giá Toàn diện</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Đo lường chi tiết 4 nhóm chỉ số cốt lõi về tài chính cá nhân.</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-info)' }}>
            <Zap size={24} />
          </div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Kết quả Tức thì</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Nhận điểm GreenScore và lời khuyên tự động chỉ trong vài giây.</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-warning)' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Bảo mật Tối đa</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Mô hình được xử lý an toàn qua hệ thống Backend độc lập.</p>
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ fontSize: '1.25rem', padding: '1rem 2.5rem', borderRadius: '30px' }}
        onClick={handleStartTest}
      >
        Bắt đầu làm bài kiểm tra <ArrowRight style={{ marginLeft: '0.75rem' }} size={24} />
      </button>

      <Modal {...modalConfig} />
      </div>
    </div>
  );
};

export default Home;
