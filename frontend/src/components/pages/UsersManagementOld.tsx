import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import type { User } from '../../services/api';

const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'user' as 'admin' | 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await ApiService.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createUser(formData);
      await fetchUsers();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      await ApiService.updateUser(editingUser.id, {
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role
      });
      await fetchUsers();
      setEditingUser(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await ApiService.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'user'
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name,
      role: user.role
    });
  };

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <main style={{ padding: '2rem', background: '#F5F6FA', minHeight: '100vh' }}>
        <div style={{ color: 'red' }}>Access denied. Admin privileges required.</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main style={{ padding: '2rem', background: '#F5F6FA', minHeight: '100vh' }}>
        <div>Loading users...</div>
      </main>
    );
  }
  return (
    <main
      style={{
        background: '#F5F6FA',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        position: 'relative',
        padding: '0 2vw',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
      }}
    >
      {/* Page Title */}
      <div style={{
        width: '100%',
        margin: 0,
        marginTop: 32,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '36px',
          color: '#131523',
          margin: 0,
        }}>Users Management</h1>
        <button style={{
          background: '#7ec0e9',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '12px 24px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div style={{
        width: '100%',
        margin: 0,
        background: '#fff',
        border: '1px solid #E6E9F4',
        borderRadius: 6,
        boxSizing: 'border-box',
        marginBottom: 40,
        overflowX: 'auto',
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#131523', padding: '26px 36px 0 36px', lineHeight: '24px' }}>All Users</div>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', background: 'none', marginTop: 16 }}>
            <thead>
              <tr style={{ color: '#5A607F', fontWeight: 400, fontSize: 14, lineHeight: '20px', height: 44 }}>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderTop: '1px solid #E6E9F4', fontSize: 14, color: '#131523', height: 52 }}>
                  <td style={{ padding: '8px' }}>{user.id}</td>
                  <td style={{ padding: '8px', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '8px' }}>{user.email}</td>
                  <td style={{ padding: '8px' }}>{user.role}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ 
                      background: user.status === 'Active' ? '#C4F8E2' : '#E6E9F4', 
                      color: user.status === 'Active' ? '#06A561' : '#5A607F', 
                      borderRadius: 4, 
                      padding: '2px 14px', 
                      fontWeight: 400, 
                      fontSize: 14, 
                      display: 'inline-block', 
                      minWidth: 54, 
                      textAlign: 'center' 
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button style={{
                      background: 'none',
                      border: '1px solid #7ec0e9',
                      borderRadius: 4,
                      padding: '4px 12px',
                      color: '#7ec0e9',
                      cursor: 'pointer',
                      marginRight: 8,
                    }}>
                      Edit
                    </button>
                    <button style={{
                      background: 'none',
                      border: '1px solid #ff6b6b',
                      borderRadius: 4,
                      padding: '4px 12px',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                    }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default UsersManagement 