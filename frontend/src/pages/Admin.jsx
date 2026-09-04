import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShieldAlert, Users, AlertCircle, Eye, ArrowLeft } from 'lucide-react';
import Modal from '../components/Modal';
import AdminQuestionnaire from '../components/AdminQuestionnaire';
import { API_BASE_URL } from '../config';

const Admin = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [error, setError] = useState('');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    if (user && user.username === 'admin') {
      fetchUsers();
    } else {
      setError("Bạn không có quyền truy cập trang này.");
      setIsLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Sort so admin is always on top
        data.sort((a, b) => {
          if (a.username === 'admin') return -1;
          if (b.username === 'admin') return 1;
          return a.username.localeCompare(b.username);
        });
        setUsers(data);
      } else {
        setError("Không thể tải dữ liệu người dùng.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserHistory = async (userId, username) => {
    setSelectedUser({ id: userId, username });
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserHistory(data);
      } else {
        setModalConfig({
          isOpen: true,
          title: "Lỗi",
          message: "Không thể tải lịch sử người dùng.",
          type: "alert",
          confirmText: "Đóng",
          onConfirm: () => setModalConfig({ isOpen: false })
        });
      }
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: "Lỗi",
        message: "Lỗi kết nối máy chủ.",
        type: "alert",
        confirmText: "Đóng",
        onConfirm: () => setModalConfig({ isOpen: false })
      });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleDeleteUser = (userId, username) => {
    if (username === 'admin') {
      setModalConfig({
        isOpen: true,
        title: "Không thể thực hiện",
        message: "Bạn không thể xóa tài khoản Quản trị viên gốc (admin).",
        type: "alert",
        confirmText: "Đã hiểu",
        onConfirm: () => setModalConfig({ isOpen: false })
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Xóa người dùng này?",
      message: `Tài khoản '${username}' và TOÀN BỘ lịch sử kiểm tra của họ sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`,
      type: "confirm",
      confirmText: "Xóa vĩnh viễn",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setModalConfig({
              isOpen: true,
              title: "Thành công",
              message: "Đã xóa tài khoản và toàn bộ dữ liệu liên quan.",
              type: "alert",
              confirmText: "Đóng",
              onConfirm: () => setModalConfig({ isOpen: false })
            });
          } else {
            setModalConfig({
              isOpen: true,
              title: "Lỗi",
              message: "Không thể xóa người dùng này.",
              type: "alert",
              confirmText: "Đóng",
              onConfirm: () => setModalConfig({ isOpen: false })
            });
          }
        } catch (err) {
          console.error(err);
        }
      },
      onCancel: () => setModalConfig({ isOpen: false })
    });
  };

  const [activeTab, setActiveTab] = useState('users');

  if (error) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', border: '1px solid var(--color-danger)', flexDirection: 'column', alignItems: 'center' }}>
          <ShieldAlert size={64} color="var(--color-danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Truy cập bị từ chối</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const handleQuestionnaireError = (msg) => {
    setModalConfig({
      isOpen: true,
      title: "Thông báo",
      message: msg,
      type: "alert",
      confirmText: "Đóng",
      onConfirm: () => setModalConfig({ isOpen: false })
    });
  };

  const handleQuestionnaireSuccess = (msg) => {
    setModalConfig({
      isOpen: true,
      title: "Thành công",
      message: msg,
      type: "alert",
      confirmText: "Đóng",
      onConfirm: () => setModalConfig({ isOpen: false })
    });
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="app-header" style={{ marginBottom: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
          <Users size={32} color="var(--color-primary)" />
        </div>
        <div>
          <h1 className="app-title" style={{ fontSize: '2rem', marginBottom: '0.25rem', textAlign: 'left' }}>Quản trị hệ thống</h1>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={() => { setActiveTab('users'); setSelectedUser(null); }}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'users' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            padding: '0.75rem 1rem', fontSize: '1rem', fontWeight: activeTab === 'users' ? 'bold' : 'normal',
            borderBottom: activeTab === 'users' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Người dùng
        </button>
        <button 
          onClick={() => setActiveTab('questionnaire')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'questionnaire' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            padding: '0.75rem 1rem', fontSize: '1rem', fontWeight: activeTab === 'questionnaire' ? 'bold' : 'normal',
            borderBottom: activeTab === 'questionnaire' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Bộ câu hỏi
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {activeTab === 'users' ? (
          selectedUser ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedUser(null)}
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>
                  Lịch sử của: <span style={{ color: 'var(--color-primary)' }}>{selectedUser.username}</span>
                </h3>
              </div>
              
              {isHistoryLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Đang tải lịch sử...</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}>
                        <th style={{ padding: '1rem', fontWeight: '500' }}>Thời gian</th>
                        <th style={{ padding: '1rem', fontWeight: '500' }}>Điểm số</th>
                        <th style={{ padding: '1rem', fontWeight: '500' }}>Xếp loại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userHistory.map(h => (
                        <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1.25rem 1rem' }}>
                            {h.monthYear && (
                              <div style={{ color: 'var(--color-primary-light)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                Kỳ đánh giá: {h.monthYear}
                              </div>
                            )}
                            <div>{h.date}</div>
                          </td>
                          <td style={{ padding: '1.25rem 1rem', fontWeight: 'bold' }}>{h.score}/1000</td>
                          <td style={{ padding: '1.25rem 1rem' }}>
                            <span style={{ 
                              padding: '0.25rem 0.75rem', 
                              borderRadius: '20px', 
                              backgroundColor: `${h.color}20`, 
                              color: h.color,
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}>
                              {h.tier}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {userHistory.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      Người dùng này chưa có lịch sử đánh giá.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Đang tải dữ liệu...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '1rem', fontWeight: '500' }}>Tên đăng nhập</th>
                    <th style={{ padding: '1rem', fontWeight: '500' }}>Email</th>
                    <th style={{ padding: '1rem', fontWeight: '500', textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1.25rem 1rem', fontWeight: '500', color: u.username === 'admin' ? 'var(--color-primary)' : 'inherit' }}>
                        {u.username}
                        {u.username === 'admin' && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '2px 8px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '10px' }}>ADMIN</span>}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', color: 'var(--color-text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                        {u.username !== 'admin' && (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary"
                              onClick={() => fetchUserHistory(u.id, u.username)}
                              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                            >
                              <Eye size={16} style={{ marginRight: '0.5rem' }} /> Xem lịch sử
                            </button>
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                            >
                              <Trash2 size={16} style={{ marginRight: '0.5rem' }} /> Xóa
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  Không có dữ liệu người dùng.
                </div>
              )}
            </div>
          )
        ) : (
          <AdminQuestionnaire onError={handleQuestionnaireError} onSuccess={handleQuestionnaireSuccess} />
        )}
      </div>

      <Modal {...modalConfig} />
    </div>
  );
};

export default Admin;
