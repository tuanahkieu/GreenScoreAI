import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { LogIn, ArrowRight } from 'lucide-react';
import Modal from '../components/Modal';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Sai tài khoản hoặc mật khẩu');
      }

      const data = await response.json();
      login(data.access_token, username);
      if (username === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      setModalConfig({
        isOpen: true,
        title: "Đăng nhập thất bại",
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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Đăng nhập</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Chào mừng bạn quay lại với GreenScore</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '1rem', padding: '1rem' }}>
            {isLoading ? 'Đang đăng nhập...' : <><LogIn size={18} style={{ marginRight: '0.5rem' }} /> Đăng nhập</>}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký ngay <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/></Link>
        </div>
      </div>
      <Modal {...modalConfig} />
    </div>
  );
};

export default Login;
