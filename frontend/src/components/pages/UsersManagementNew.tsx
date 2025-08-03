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
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{
            background: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px 24px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Add User
        </button>
      </div>

      {error && (
        <div style={{
          width: '100%',
          background: '#fee',
          color: '#c33',
          padding: '1rem',
          borderRadius: 8,
          marginBottom: 16,
          border: '1px solid #fcc'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', color: '#c33' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Users Table */}
      <div style={{
        width: '100%',
        margin: 0,
        background: '#fff',
        border: '1px solid #E6E9F4',
        borderRadius: 12,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 40,
        overflowX: 'auto',
      }}>
        <div style={{ 
          fontWeight: 700, 
          fontSize: 20, 
          color: '#131523', 
          padding: '24px 24px 0 24px' 
        }}>
          All Users ({users.length})
        </div>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            minWidth: 700, 
            borderCollapse: 'collapse', 
            marginTop: 16 
          }}>
            <thead>
              <tr style={{ 
                color: '#5A607F', 
                fontWeight: 500, 
                fontSize: 14,
                borderBottom: '1px solid #E6E9F4'
              }}>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Username</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Full Name</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Created At</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ 
                  borderBottom: index < users.length - 1 ? '1px solid #F5F6FA' : 'none'
                }}>
                  <td style={{ padding: '16px 24px', color: '#5A607F' }}>{user.id}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 500, color: '#131523' }}>
                    {user.username}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                    {user.full_name}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      background: user.role === 'admin' ? '#FFE8E8' : '#E8F4FF',
                      color: user.role === 'admin' ? '#D63031' : '#0984E3',
                      borderRadius: 6,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(user)}
                        style={{
                          background: '#FFF2CC',
                          color: '#B7791F',
                          border: 'none',
                          borderRadius: 4,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            background: '#FFE8E8',
                            color: '#D63031',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '2rem',
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: 0, marginBottom: '1.5rem' }}>
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {!editingUser && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: 8,
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  style={{
                    background: '#E6E9F4',
                    color: '#5A607F',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default UsersManagement;
