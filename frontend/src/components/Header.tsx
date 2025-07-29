import React from 'react'
import styles from './MainLayout.module.css'

const Header: React.FC = () => {
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
      <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>Nhóm 5</div>
      <div style={{ fontSize: 22, cursor: 'pointer' }} title="Notifications">
        🔔
      </div>
    </header>
  )
}

export default Header 