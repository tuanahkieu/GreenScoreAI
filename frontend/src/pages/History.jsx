import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, X, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && user.username === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/history/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        
        // Sort data chronologically by monthYear (MM/YYYY)
        data.sort((a, b) => {
          if (!a.monthYear || !b.monthYear) return 0;
          const [monthA, yearA] = a.monthYear.split('/');
          const [monthB, yearB] = b.monthYear.split('/');
          if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
          return parseInt(monthA) - parseInt(monthB);
        });
        
        setHistory(data);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setModalConfig({
      isOpen: true,
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa toàn bộ lịch sử kiểm tra? Hành động này không thể hoàn tác.",
      type: "confirm",
      confirmText: "Xóa toàn bộ",
      cancelText: "Hủy bỏ",
      onConfirm: async () => {
        try {
          await fetch('http://localhost:8000/api/history/', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setHistory([]);
          setModalConfig({ isOpen: false });
        } catch (error) {
          console.error("Lỗi xóa lịch sử:", error);
        }
      },
      onCancel: () => setModalConfig({ isOpen: false })
    });
  };

  const requestDeleteItem = (id) => {
    setModalConfig({
      isOpen: true,
      title: "Xóa kết quả này?",
      message: "Kết quả kiểm tra này sẽ bị xóa vĩnh viễn.",
      type: "confirm",
      confirmText: "Xóa",
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/history/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            setHistory(prev => prev.filter(item => item.id !== id));
          }
        } catch (error) {
          console.error("Lỗi xóa kết quả:", error);
        }
        setModalConfig({ isOpen: false });
      },
      onCancel: () => setModalConfig({ isOpen: false })
    });
  };

  const chartData = history.map((record, index) => ({
    name: record.monthYear ? record.monthYear : `Lần ${index + 1}`,
    score: record.score,
    date: record.date.split(' ')[0], // only show time or date based on needs
    fullDate: record.date
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{payload[0].payload.fullDate}</p>
          <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Điểm: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="app-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Lịch sử kiểm tra</h1>
          <p className="app-subtitle">Theo dõi sự cải thiện điểm số của bạn qua thời gian</p>
        </div>
        
        {history.length > 0 && (
          <button className="btn btn-secondary" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleClearHistory}>
            <Trash2 size={18} style={{ marginRight: '0.5rem' }} /> Xóa lịch sử
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            width: '120px', height: '120px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <AlertCircle size={64} color="var(--color-primary)" opacity={0.8} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Chưa có dữ liệu</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '400px' }}>
            Bạn chưa thực hiện bài kiểm tra sức khỏe tài chính nào. Hãy làm bài test đầu tiên để khám phá GreenScore của bạn.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/test')} style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
            Làm bài test đầu tiên ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {history.length > 1 && (
            <div className="glass-panel" style={{ padding: '2rem', height: '350px' }}>
              <h3 style={{ color: 'var(--color-text-main)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Biểu đồ xu hướng điểm số</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 1000]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-bg-dark)', stroke: 'var(--color-primary)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: 'var(--color-primary)', stroke: 'var(--color-bg-dark)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ display: 'grid', gap: '1rem' }}>
            {history.slice().reverse().map((record) => (
              <div key={record.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {record.monthYear && (
                    <div style={{ color: 'var(--color-primary-light)', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Kỳ đánh giá: {record.monthYear}
                    </div>
                  )}
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{record.date}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    Điểm: <span style={{ color: record.color, fontSize: '1.5rem', marginLeft: '0.5rem' }}>{record.score}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    backgroundColor: `${record.color}20`, 
                    color: record.color, 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px', 
                    fontWeight: '600',
                    border: `1px solid ${record.color}50`
                  }}>
                    {record.tier}
                  </div>
                  
                  <button 
                    onClick={() => requestDeleteItem(record.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    title="Xóa mục này"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal {...modalConfig} />
    </div>
  );
};

export default History;
