import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import type { Item, User, ItemUserAccess } from '../services/api';

interface UserAccessModalProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const UserAccessModal: React.FC<UserAccessModalProps> = ({ item, isOpen, onClose, onUpdate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [authorizedUsers, setAuthorizedUsers] = useState<ItemUserAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, item.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, accessData] = await Promise.all([
        ApiService.getUsers(),
        ApiService.getItemUserAccess(item.id)
      ]);
      setUsers(usersData);
      setAuthorizedUsers(accessData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedUserId) return;
    
    try {
      await ApiService.grantItemAccess(item.id, parseInt(selectedUserId));
      setSelectedUserId('');
      await fetchData();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant access');
    }
  };

  const handleRevokeAccess = async (userId: number) => {
    if (!confirm('Are you sure you want to revoke access for this user?')) return;
    
    try {
      await ApiService.revokeItemAccess(item.id, userId);
      await fetchData();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke access');
    }
  };

  const availableUsers = users.filter(user => 
    !authorizedUsers.some(access => access.user_id === user.id)
  );

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #F3F4F6'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#1F2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🔑 Manage User Access
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Item Info */}
        <div style={{
          background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
          border: '2px solid #0EA5E9',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#0C4A6E'
          }}>
            {item.name}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#075985'
          }}>
            {item.description}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
            border: '2px solid #EF4444',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#991B1B'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Error</div>
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #E5E7EB',
              borderTop: '4px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          <>
            {/* Grant Access Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ➕ Grant Access to User
              </h3>
              
              {availableUsers.length > 0 ? (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Select User
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#374151',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select a user...</option>
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.username}) - {user.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleGrantAccess}
                    disabled={!selectedUserId}
                    style={{
                      background: selectedUserId 
                        ? 'linear-gradient(135deg, #10B981, #059669)' 
                        : 'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
                      color: selectedUserId ? 'white' : '#6B7280',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: selectedUserId ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Grant Access
                  </button>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: '#6B7280',
                  fontStyle: 'italic'
                }}>
                  All users already have access to this item
                </div>
              )}
            </div>

            {/* Authorized Users Section */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👥 Authorized Users ({authorizedUsers.length})
              </h3>
              
              {authorizedUsers.length > 0 ? (
                <div style={{
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  {authorizedUsers.map((access, index) => (
                    <div
                      key={access.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        backgroundColor: index % 2 === 0 ? '#F9FAFB' : 'white',
                        borderBottom: index < authorizedUsers.length - 1 ? '1px solid #E5E7EB' : 'none'
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1F2937',
                          marginBottom: '4px'
                        }}>
                          {access.user.full_name}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6B7280'
                        }}>
                          @{access.user.username} • {access.user.role} • 
                          Granted: {new Date(access.granted_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRevokeAccess(access.user_id)}
                        style={{
                          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        🗑️ Revoke
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6B7280',
                  fontStyle: 'italic',
                  border: '2px dashed #E5E7EB',
                  borderRadius: '12px'
                }}>
                  No users have access to this item yet
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '16px',
          borderTop: '2px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #6B7280, #4B5563)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default UserAccessModal;
