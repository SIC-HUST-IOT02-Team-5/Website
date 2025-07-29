import React from 'react'
import styles from './MainLayout.module.css'

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div>&copy; {new Date().getFullYear()} ToiDaDen. All rights reserved.</div>
      <div style={{ marginTop: '0.5rem' }}>
        <a href="#" style={{ marginRight: '1rem' }}>Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </footer>
  )
}

export default Footer 