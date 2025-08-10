import React, { useState } from 'react';
import ApiService from '../../services/api';
import type { User } from '../../services/api';

interface KioskLoginProps {
  onLoginSuccess: (user: User) => void;
  onError: (error: string) => void;
}

const KioskLogin: React.FC<KioskLoginProps> = ({ onLoginSuccess, onError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      onError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.login(username, password);
      // Persist token for subsequent API calls from kiosk
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      
      // Create user object from login response
      const user: User = {
        id: response.id,
        username: response.username,
        full_name: response.full_name,
        role: response.role as 'admin' | 'user',
        created_at: '',
        updated_at: ''
      };
      
  onLoginSuccess(user);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '48px',
        minWidth: '400px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#131523',
            margin: '0 0 8px 0',
          }}>Smart Locker Kiosk</h1>
          <p style={{
            fontSize: '16px',
            color: '#5A607F',
            margin: 0,
          }}>Enter your credentials to access your items</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#131523',
              marginBottom: '8px',
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 16px',
                border: '2px solid #E6E9F4',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#E6E9F4'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#131523',
              marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 16px',
                border: '2px solid #E6E9F4',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#E6E9F4'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '52px',
              background: loading ? '#ccc' : '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#5a67d8';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#667eea';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KioskLogin;
