import { useState, useEffect } from 'react';
import ApiService, { type Cell } from '../services/api';

interface CellControlProps {
  compact?: boolean;
  showTitle?: boolean;
}

const CellControl = ({ compact = false, showTitle = true }: CellControlProps) => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCells();
    
    // Auto refresh every 15 seconds
    const interval = setInterval(loadCells, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadCells = async () => {
    try {
      const data = await ApiService.getCells();
      setCells(data.slice(0, 2)); // Ensure only 2 cells
      setError(null);
    } catch (error) {
      console.error('Error loading cells:', error);
      setError('Failed to load cells');
    } finally {
      setLoading(false);
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
      
      // Show success notification
      showNotification(`${operation.charAt(0).toUpperCase() + operation.slice(1)} command sent successfully`, 'success');
      
      // Reload cells after operation
      setTimeout(loadCells, 1500); // Wait for ESP32 to respond
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${operation} cell`;
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [cellId]: false }));
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Simple notification - you could use a toast library here
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      background: ${type === 'success' ? '#10B981' : '#EF4444'};
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    return status === 'open' ? '🔓' : '🔒';
  };

  const getStatusBadge = (status: string) => {
    const isOpen = status === 'open';
    return {
      bg: isOpen ? '#DCFCE7' : '#FEE2E2',
      color: isOpen ? '#166534' : '#991B1B',
      text: isOpen ? 'OPEN' : 'CLOSED'
    };
  };

  const getLockBadge = (isLocked: string) => {
    const locked = isLocked === 'locked';
    return {
      bg: locked ? '#FEF3C7' : '#D1FAE5',
      color: locked ? '#92400E' : '#065F46',
      text: locked ? 'LOCKED' : 'UNLOCKED',
      icon: locked ? '🔐' : '🔓'
    };
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: compact ? '2rem' : '4rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
    );
  }

  if (compact) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        color: 'white'
      }}>
        {showTitle && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏠 Cell Control Panel
            </h3>
            <button
              onClick={loadCells}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: cells.length === 1 ? '1fr' : '1fr 1fr',
          gap: '16px'
        }}>
          {cells.map((cell) => {
            const statusBadge = getStatusBadge(cell.status);
            const lockBadge = getLockBadge(cell.is_locked);
            
            return (
              <div key={cell.id} style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    {cell.name}
                  </div>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '12px',
                    filter: cell.status === 'open' ? 'hue-rotate(90deg)' : 'none'
                  }}>
                    {getStatusIcon(cell.status)}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      background: statusBadge.bg,
                      color: statusBadge.color,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {statusBadge.text}
                    </span>
                    
                    <span style={{
                      background: lockBadge.bg,
                      color: lockBadge.color,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {lockBadge.icon} {lockBadge.text}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleCellOperation(cell.id, 'open')}
                    disabled={operationLoading[cell.id] || cell.status === 'open'}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: cell.status === 'open' || operationLoading[cell.id] ? 'not-allowed' : 'pointer',
                      background: cell.status === 'open' 
                        ? 'rgba(107, 114, 128, 0.3)' 
                        : 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      opacity: operationLoading[cell.id] ? 0.7 : 1
                    }}
                  >
                    {operationLoading[cell.id] ? '⏳' : '🔓'} Open
                  </button>

                  <button
                    onClick={() => handleCellOperation(cell.id, 'close')}
                    disabled={operationLoading[cell.id] || cell.status === 'closed'}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: cell.status === 'closed' || operationLoading[cell.id] ? 'not-allowed' : 'pointer',
                      background: cell.status === 'closed' 
                        ? 'rgba(107, 114, 128, 0.3)' 
                        : 'linear-gradient(135deg, #EF4444, #DC2626)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      opacity: operationLoading[cell.id] ? 0.7 : 1
                    }}
                  >
                    {operationLoading[cell.id] ? '⏳' : '🔒'} Close
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {cells.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <div style={{ fontSize: '16px' }}>No cells available</div>
          </div>
        )}
      </div>
    );
  }

  // Full size version
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {showTitle && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🏠 Cell Control Panel
            </h2>
            <button
              onClick={loadCells}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
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
      )}

      <div style={{ padding: '32px' }}>
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span style={{ fontWeight: '500' }}>{error}</span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: cells.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {cells.map((cell) => {
            const statusBadge = getStatusBadge(cell.status);
            const lockBadge = getLockBadge(cell.is_locked);
            
            return (
              <div key={cell.id} style={{
                border: '2px solid #F3F4F6',
                borderRadius: '16px',
                padding: '28px',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  fontSize: '12px',
                  color: '#6B7280',
                  background: '#F9FAFB',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  ID: {cell.id}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    fontSize: '60px',
                    filter: cell.status === 'open' ? 'hue-rotate(90deg)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {getStatusIcon(cell.status)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#1F2937'
                    }}>
                      {cell.name}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {statusBadge.text}
                      </span>
                      
                      <span style={{
                        background: lockBadge.bg,
                        color: lockBadge.color,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {lockBadge.icon} {lockBadge.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: '#F9FAFB',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Last Opened
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      fontWeight: '600'
                    }}>
                      {cell.last_open_at 
                        ? new Date(cell.last_open_at).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Never'
                      }
                    </div>
                  </div>

                  <div style={{
                    background: '#F9FAFB',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Last Closed
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      fontWeight: '600'
                    }}>
                      {cell.last_close_at 
                        ? new Date(cell.last_close_at).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => handleCellOperation(cell.id, 'open')}
                    disabled={operationLoading[cell.id] || cell.status === 'open'}
                    style={{
                      padding: '14px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: cell.status === 'open' || operationLoading[cell.id] ? 'not-allowed' : 'pointer',
                      background: cell.status === 'open' 
                        ? '#E5E7EB' 
                        : 'linear-gradient(135deg, #10B981, #059669)',
                      color: cell.status === 'open' ? '#9CA3AF' : 'white',
                      transition: 'all 0.2s ease',
                      opacity: operationLoading[cell.id] ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transform: 'translateY(0)',
                      boxShadow: cell.status !== 'open' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (cell.status !== 'open' && !operationLoading[cell.id]) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = cell.status !== 'open' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none';
                    }}
                  >
                    {operationLoading[cell.id] ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid white',
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
                      padding: '14px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: cell.status === 'closed' || operationLoading[cell.id] ? 'not-allowed' : 'pointer',
                      background: cell.status === 'closed' 
                        ? '#E5E7EB' 
                        : 'linear-gradient(135deg, #EF4444, #DC2626)',
                      color: cell.status === 'closed' ? '#9CA3AF' : 'white',
                      transition: 'all 0.2s ease',
                      opacity: operationLoading[cell.id] ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transform: 'translateY(0)',
                      boxShadow: cell.status !== 'closed' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (cell.status !== 'closed' && !operationLoading[cell.id]) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = cell.status !== 'closed' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none';
                    }}
                  >
                    {operationLoading[cell.id] ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid white',
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
              </div>
            );
          })}
        </div>

        {cells.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              No Cells Available
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: 0
            }}>
              The system will automatically initialize 2 default cells.
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideIn {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CellControl;
