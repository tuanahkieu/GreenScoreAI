import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Modal from '../components/Modal';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setModalConfig({
        isOpen: true,
        title: "Lỗi",
        message: "Mật khẩu xác nhận không khớp.",
        type: "alert",
        confirmText: "Đóng",
        onConfirm: () => setModalConfig({ isOpen: false })
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Không thể đăng ký tài khoản');
      }

      setModalConfig({
        isOpen: true,
        title: "Đăng ký thành công",
        message: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
        type: "alert",
        confirmText: "Đến trang Đăng nhập",
        onConfirm: () => {
          setModalConfig({ isOpen: false });
          navigate('/login');
        }
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        title: "Đăng ký thất bại",
        message: error.message || "Có lỗi xảy ra, vui lòng thử lại.",
        type: "alert",
        confirmText: "Đóng",
        onConfirm: () => setModalConfig({ isOpen: false })
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Đăng ký</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Tạo tài khoản GreenScore cá nhân</p>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-select"
              style={{ backgroundImage: 'none', paddingRight: '1.25rem', textAlign: 'left' }}
            />
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Tên đăng nhập" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-select"
              style={{ backgroundImage: 'none', paddingRight: '1.25rem', textAlign: 'left' }}
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-select"
              style={{ backgroundImage: 'none', paddingRight: '1.25rem', textAlign: 'left' }}
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Xác nhận mật khẩu" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-select"
              style={{ backgroundImage: 'none', paddingRight: '1.25rem', textAlign: 'left' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '1rem', padding: '1rem' }}>
            {isLoading ? 'Đang xử lý...' : <><UserPlus size={18} style={{ marginRight: '0.5rem' }} /> Đăng ký tài khoản</>}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}><ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Trở về Đăng nhập</Link>
        </div>
      </div>
      <Modal {...modalConfig} />
    </div>
  );
};

export default Register;
