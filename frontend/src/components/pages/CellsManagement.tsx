import { useState, useEffect } from 'react';
import ApiService, { type Cell } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CellsManagement = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<{ [key: number]: boolean }>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { user } = useAuth();

  // Mặc định tủ có 2 cell
  const defaultCells = [
    { id: 1, name: 'Cell 1' },
    { id: 2, name: 'Cell 2' }
  ];

  useEffect(() => {
    loadCells();
    
    // Auto refresh every 20 seconds
    const interval = setInterval(() => {
      loadCells();
      setLastUpdate(new Date());
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);

  const loadCells = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCells();
      
      // Nếu chưa có cell nào, tạo 2 cell mặc định
      if (data.length === 0) {
        await initializeDefaultCells();
      } else {
        setCells(data.slice(0, 2)); // Ensure only 2 cells
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cells');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultCells = async () => {
    try {
      const createdCells = [];
      for (const cellData of defaultCells) {
        try {
          const cell = await ApiService.createCell({
            name: cellData.name,
            status: 'closed'
          });
          createdCells.push(cell);
        } catch (error) {
          console.warn(`Cell ${cellData.name} might already exist`);
        }
      }
      
      // Reload cells after initialization
      const allCells = await ApiService.getCells();
      setCells(allCells.slice(0, 2)); // Ensure only 2 cells
    } catch (error) {
      console.error('Error initializing default cells:', error);
      // Fallback: just reload existing cells
      const existingCells = await ApiService.getCells();
      setCells(existingCells);
    }
  };

  const handleCellOperation = async (cellId: number, operation: 'open' | 'close') => {
    try {
      setOperationLoading(prev => ({ ...prev, [cellId]: true }));
      setError(null);

      if (operation === 'open') {
        await ApiService.openCell(cellId);
      } else {
        await ApiService.closeCell(cellId);
      }

      // Show success message with better styling
      showNotification(`Cell ${operation} command sent successfully!`, 'success');
      
      // Reload cells to get updated status
      setTimeout(loadCells, 2000); // Wait 2 seconds for ESP32 to respond
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${operation} cell`;
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [cellId]: false }));
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      font-size: 14px;
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      background: ${type === 'success' 
        ? 'linear-gradient(135deg, #10B981, #059669)' 
        : 'linear-gradient(135deg, #EF4444, #DC2626)'};
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };

  const getStatusInfo = (status: string) => {
    const isOpen = status === 'open';
    return {
      bg: isOpen ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : 'linear-gradient(135deg, #FEE2E2, #FECACA)',
      borderColor: isOpen ? '#10B981' : '#EF4444',
      textColor: isOpen ? '#065F46' : '#991B1B',
      text: isOpen ? 'OPEN' : 'CLOSED',
      icon: isOpen ? '🔓' : '🔒'
    };
  };

  const getLockInfo = (isLocked: string) => {
    const locked = isLocked === 'locked';
    return {
      bg: locked ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : 'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
      borderColor: locked ? '#F59E0B' : '#3B82F6',
      textColor: locked ? '#92400E' : '#1E40AF',
      text: locked ? 'LOCKED' : 'UNLOCKED',
      icon: locked ? '🔐' : '🔓'
    };
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '500px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        margin: '20px',
        color: 'white'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading Cell Management...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🏠 Smart Cell Management System
          </h1>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Last Updated: {lastUpdate.toLocaleTimeString('vi-VN')}
            </div>
            
            <button 
              onClick={loadCells}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🔄 Refresh Status
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '12px 20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Cells</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{cells.length}</div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '12px 20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Open Cells</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {cells.filter(cell => cell.status === 'open').length}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '12px 20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Closed Cells</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {cells.filter(cell => cell.status === 'closed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
          border: '2px solid #EF4444',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          color: '#991B1B',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 25px rgba(239, 68, 68, 0.2)'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>Error</div>
            <div style={{ fontSize: '14px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Cells Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: cells.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {cells.map((cell) => {
          const statusInfo = getStatusInfo(cell.status);
          const lockInfo = getLockInfo(cell.is_locked);
          
          return (
            <div key={cell.id} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
              border: '2px solid #F3F4F6',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '0 20px 0 100px',
                opacity: 0.1
              }}></div>

              {/* Cell ID Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                ID: {cell.id}
              </div>

              {/* Cell Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '28px'
              }}>
                <div style={{
                  fontSize: '72px',
                  transition: 'all 0.3s ease',
                  filter: cell.status === 'open' ? 'hue-rotate(120deg) brightness(1.2)' : 'none'
                }}>
                  {statusInfo.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    margin: '0 0 12px 0',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1F2937',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {cell.name}
                  </h2>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      background: statusInfo.bg,
                      border: `2px solid ${statusInfo.borderColor}`,
                      color: statusInfo.textColor,
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {statusInfo.icon} {statusInfo.text}
                    </div>
                    
                    <div style={{
                      background: lockInfo.bg,
                      border: `2px solid ${lockInfo.borderColor}`,
                      color: lockInfo.textColor,
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {lockInfo.icon} {lockInfo.text}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '28px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  border: '2px solid #22C55E',
                  padding: '16px',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#166534',
                    marginBottom: '6px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🔓 Last Opened
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#14532D',
                    fontWeight: '700'
                  }}>
                    {formatDateTime(cell.last_open_at)}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                  border: '2px solid #EF4444',
                  padding: '16px',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#991B1B',
                    marginBottom: '6px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🔒 Last Closed
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#7F1D1D',
                    fontWeight: '700'
                  }}>
                    {formatDateTime(cell.last_close_at)}
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: user?.role === 'admin' ? '20px' : '0'
              }}>
                <button
                  onClick={() => handleCellOperation(cell.id, 'open')}
                  disabled={operationLoading[cell.id] || cell.status === 'open'}
                  style={{
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: cell.status === 'open' || operationLoading[cell.id] ? 'not-allowed' : 'pointer',
                    background: cell.status === 'open' 
                      ? 'linear-gradient(135deg, #E5E7EB, #D1D5DB)' 
                      : 'linear-gradient(135deg, #10B981, #059669)',
                    color: cell.status === 'open' ? '#6B7280' : 'white',
                    transition: 'all 0.3s ease',
                    opacity: operationLoading[cell.id] ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transform: 'translateY(0)',
                    boxShadow: cell.status !== 'open' ? '0 8px 20px rgba(16, 185, 129, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (cell.status !== 'open' && !operationLoading[cell.id]) {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = cell.status !== 'open' ? '0 8px 20px rgba(16, 185, 129, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {operationLoading[cell.id] ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Opening...
                    </>
                  ) : (
                    <>🔓 Open Cell</>
                  )}
                </button>

                <button
                  onClick={() => handleCellOperation(cell.id, 'close')}
                  disabled={operationLoading[cell.id] || cell.status === 'closed'}
                  style={{
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: cell.status === 'closed' || operationLoading[cell.id] ? 'not-allowed' : 'pointer',
                    background: cell.status === 'closed' 
                      ? 'linear-gradient(135deg, #E5E7EB, #D1D5DB)' 
                      : 'linear-gradient(135deg, #EF4444, #DC2626)',
                    color: cell.status === 'closed' ? '#6B7280' : 'white',
                    transition: 'all 0.3s ease',
                    opacity: operationLoading[cell.id] ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transform: 'translateY(0)',
                    boxShadow: cell.status !== 'closed' ? '0 8px 20px rgba(239, 68, 68, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (cell.status !== 'closed' && !operationLoading[cell.id]) {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(239, 68, 68, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = cell.status !== 'closed' ? '0 8px 20px rgba(239, 68, 68, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {operationLoading[cell.id] ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Closing...
                    </>
                  ) : (
                    <>🔒 Close Cell</>
                  )}
                </button>
              </div>

              {/* Admin Controls */}
              {user?.role === 'admin' && (
                <div style={{
                  paddingTop: '20px',
                  borderTop: '2px dashed #E5E7EB',
                  marginTop: '4px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    marginBottom: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    👑 Admin Controls
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => {
                        ApiService.updateCell(cell.id, { status: 'open' }).then(() => loadCells());
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #E5E7EB, #D1D5DB)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #F3F4F6, #E5E7EB)';
                      }}
                    >
                      Force Open
                    </button>
                    <button
                      onClick={() => {
                        ApiService.updateCell(cell.id, { status: 'closed' }).then(() => loadCells());
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #E5E7EB, #D1D5DB)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #F3F4F6, #E5E7EB)';
                      }}
                    >
                      Force Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {cells.length === 0 && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '24px',
            filter: 'grayscale(0.3)'
          }}>
            🏠
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '12px'
          }}>
            No Cells Available
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            The smart locker system will automatically initialize 2 default cells for your convenience.
          </p>
          <button 
            onClick={initializeDefaultCells}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
            }}
          >
            🚀 Initialize Default Cells
          </button>
        </div>
      )}

      {/* Styles */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideInRight {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutRight {
            0% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CellsManagement;
