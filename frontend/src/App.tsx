import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Dashboard from './components/pages/Dashboard'
import UsersManagement from './components/pages/UsersManagement'
import Categories from './components/pages/Categories'
import ActionsLog from './components/pages/ActionsLog'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="categories" element={<Categories />} />
          <Route path="actions" element={<ActionsLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
