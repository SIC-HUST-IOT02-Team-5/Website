import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './MainLayout.module.css'

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header
      className={styles.header}
      style={{
        background: '#14213d',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        minHeight: 48,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>Smart Storage by SSIOT02 - Team 5</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: 14 }}>
          Welcome, {user?.full_name} ({user?.role})
        </div>
        <div style={{ fontSize: 22, cursor: 'pointer' }} title="Notifications">
          🔔
        </div>
        <button
          onClick={() => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
              logout();
            }
          }}
          style={{
            background: 'transparent',
            border: '1px solid #fff',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.color = '#14213d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#fff';
          }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  )
}

export default Header 