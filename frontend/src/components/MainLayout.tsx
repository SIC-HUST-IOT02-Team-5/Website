import React from 'react'
import Header from './Header'
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
      flexDirection: 'column',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
      maxWidth: '100vw',
    }}>
      <Header />
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        alignItems: 'flex-start',
        margin: 0,
        padding: 0,
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', margin: 0, padding: 0, maxWidth: '100vw', overflowX: 'hidden' }}>
          <MainContent />
        </div>
      </div>
    </div>
  )
}

export default MainLayout 