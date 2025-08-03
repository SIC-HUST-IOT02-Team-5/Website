import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './MainLayout.module.css'

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/' },
  { label: 'Users Management', icon: '👤', path: '/users' },
  { label: 'Items & Cells Management', icon: '📦', path: '/categories' },
  { label: 'Actions Log', icon: '📝', path: '/actions' },
]

const Sidebar: React.FC = () => {
  const location = useLocation()

  return (
    <aside
      className={styles.sidebar}
      style={{
        background: '#7ec0e9',
        minWidth: 240,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '2rem 0 0 0',
        boxSizing: 'border-box',
        margin: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
    >
      <nav style={{ width: '100%' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  style={{
                    background: isActive ? '#fff' : 'none',
                    color: isActive ? '#222' : '#fff',
                    fontWeight: isActive ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '0.75rem 2rem',
                    borderRadius: 6,
                    margin: '0.5rem 1rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0px 1px 4px rgba(21, 34, 50, 0.08)' : 'none',
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar 