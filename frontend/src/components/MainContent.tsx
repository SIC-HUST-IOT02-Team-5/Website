import React from 'react'
import { Outlet } from 'react-router-dom'
import styles from './MainLayout.module.css'

const MainContent: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      <Outlet />
    </div>
  )
}

export default MainContent 