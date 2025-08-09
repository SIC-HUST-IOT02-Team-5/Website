import React, { useEffect, useState } from 'react';
import KioskLogin from './KioskLogin';
import KioskActions from './KioskActions';
import type { User } from '../../services/api';

interface ToastMessage {
  type: 'success' | 'error';
  message: string;
  timestamp: number;
}

const KioskView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    const newToast = {
      type,
      message,
      timestamp: Date.now()
    };
    setToast(newToast);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(current => 
        current?.timestamp === newToast.timestamp ? null : current
      );
    }, 5000);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    showToast('success', `Welcome ${loggedInUser.full_name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setToast(null);
    showToast('success', 'Logged out successfully');
  };

  const handleError = (error: string) => {
    showToast('error', error);
  };

  const handleSuccess = (message: string) => {
    showToast('success', message);
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
    }}>
      {/* Main Content */}
      {user ? (
        <KioskActions
          user={user}
          onLogout={handleLogout}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      ) : (
        <KioskLogin
          onLoginSuccess={handleLogin}
          onError={handleError}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: toast.type === 'success' ? '#C4F8E2' : '#FFE8E8',
            color: toast.type === 'success' ? '#06A561' : '#D63031',
            border: `2px solid ${toast.type === 'success' ? '#06A561' : '#D63031'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            minWidth: '300px',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '1.4',
            wordBreak: 'break-word',
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <div style={{
              fontSize: '16px',
              marginTop: '1px',
            }}>
              {toast.type === 'success' ? '✅' : '❌'}
            </div>
            <div style={{ flex: 1 }}>
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '0',
                margin: '0',
                lineHeight: '1',
                marginTop: '1px',
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Global Styles for Animation */}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          /* Touch-friendly scrollbars for mobile */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
          
          /* Ensure touch targets are at least 44px */
          button, input, select, textarea {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Prevent text selection in kiosk mode */
          body.kiosk-mode {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
          
          /* Allow text selection only in inputs */
          body.kiosk-mode input,
          body.kiosk-mode textarea {
            user-select: text;
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
          }
        `}
      </style>
    </div>
  );
};

// Add kiosk mode class to body when component mounts
const KioskViewWithEffect: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('kiosk-mode');
    return () => {
      document.body.classList.remove('kiosk-mode');
    };
  }, []);

  return <KioskView />;
};

export default KioskViewWithEffect;
