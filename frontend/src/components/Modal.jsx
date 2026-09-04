import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Đồng ý", cancelText = "Hủy", type = "confirm" }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '90%',
        maxWidth: '400px',
        padding: '2rem',
        textAlign: 'center',
        transform: 'translateY(0)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '1.25rem' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {type === 'confirm' && (
            <button 
              className="btn btn-secondary" 
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              {cancelText}
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
            style={{ 
              flex: 1, 
              background: type === 'alert' ? 'var(--color-primary)' : 'var(--color-danger)',
              boxShadow: 'none'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal outside of the main app container to avoid CSS transform containing block issues
  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
