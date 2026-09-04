import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import TestArea from './pages/TestArea';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fee2e2', minHeight: '100vh' }}>
          <h2>Đã xảy ra lỗi nghiêm trọng (App Crashed)</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Chi tiết lỗi (Bấm để xem)</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.href='/'} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Quay lại Trang chủ
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div style={{ color: 'white', padding: '2rem' }}>Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

import { Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="app-layout">
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            
            <Route path="/" element={<Layout><Home /></Layout>} />
            
            <Route path="/test" element={
              <PrivateRoute>
                <Layout><TestArea /></Layout>
              </PrivateRoute>
            } />
            <Route path="/history" element={
              <PrivateRoute>
                <Layout><History /></Layout>
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute>
                <Layout><Admin /></Layout>
              </PrivateRoute>
            } />
            <Route path="*" element={<Layout><div style={{padding: '2rem', color: 'white'}}>Đường dẫn không tồn tại</div></Layout>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
