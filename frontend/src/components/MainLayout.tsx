import React from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import styles from './MainLayout.module.css'

const MainLayout: React.FC = () => {
  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflowX = 'hidden';
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#F5F6FA',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
      maxWidth: '100vw',
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0, padding: 0, maxWidth: '100vw', overflowX: 'hidden' }}>
        <MainContent />
      </div>
    </div>
  )
}

export default MainLayout 