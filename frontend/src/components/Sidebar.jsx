import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, History, LogOut, LogIn, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const closeSidebar = () => {
    if (setIsOpen) setIsOpen(false);
  };

  const handleLogout = () => {
    setModalConfig({
      isOpen: true,
      title: "Xác nhận đăng xuất",
      message: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      type: "confirm",
      confirmText: "Đăng xuất",
      cancelText: "Hủy",
      onConfirm: () => {
        setModalConfig({ isOpen: false });
        logout();
        navigate('/login');
      },
      onCancel: () => setModalConfig({ isOpen: false })
    });
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-title">GreenScore AI</div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {(!user || user.username !== 'admin') && (
          <>
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Home size={20} /> Trang chủ
            </NavLink>
            
            <NavLink 
              to="/history" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <History size={20} /> Lịch sử
            </NavLink>
          </>
        )}
        
        {user && user.username === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <User size={20} /> Quản lý hệ thống
          </NavLink>
        )}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: 'var(--color-text-main)' }}>
              <User size={18} color="var(--color-primary)" /> 
              <span style={{ fontWeight: 'bold' }}>{user.username}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="nav-link" 
              style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--color-danger)' }}
            >
              <LogOut size={20} /> Đăng xuất
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { closeSidebar(); navigate('/login'); }} 
            className="nav-link" 
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--color-primary)' }}
          >
            <LogIn size={20} /> Đăng nhập
          </button>
        )}
      </div>
      <Modal {...modalConfig} />
    </div>
  );
};

export default Sidebar;
