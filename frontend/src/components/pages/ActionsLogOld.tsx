import React from 'react'

const actions = [
  { id: 1, action: 'User Login', user: 'john@example.com', timestamp: '2025-01-20 14:30:25', ip: '192.168.1.100', status: 'Success' },
  { id: 2, action: 'Item Created', user: 'jane@example.com', timestamp: '2025-01-20 14:25:10', ip: '192.168.1.101', status: 'Success' },
  { id: 3, action: 'Category Updated', user: 'admin@example.com', timestamp: '2025-01-20 14:20:45', ip: '192.168.1.102', status: 'Success' },
  { id: 4, action: 'User Deleted', user: 'admin@example.com', timestamp: '2025-01-20 14:15:30', ip: '192.168.1.102', status: 'Success' },
  { id: 5, action: 'Failed Login', user: 'unknown@example.com', timestamp: '2025-01-20 14:10:15', ip: '192.168.1.103', status: 'Failed' },
]

const ActionsLog: React.FC = () => {
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
        }}>Actions Log</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{
            background: 'none',
            border: '1px solid #7ec0e9',
            borderRadius: 6,
            padding: '12px 24px',
            color: '#7ec0e9',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Export
          </button>
          <button style={{
            background: '#7ec0e9',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px 24px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Clear Log
          </button>
        </div>
      </div>

      {/* Actions Table */}
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
        <div style={{ fontWeight: 700, fontSize: 16, color: '#131523', padding: '26px 36px 0 36px', lineHeight: '24px' }}>Recent Actions</div>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', background: 'none', marginTop: 16 }}>
            <thead>
              <tr style={{ color: '#5A607F', fontWeight: 400, fontSize: 14, lineHeight: '20px', height: 44 }}>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Action</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Timestamp</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>IP Address</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} style={{ borderTop: '1px solid #E6E9F4', fontSize: 14, color: '#131523', height: 52 }}>
                  <td style={{ padding: '8px' }}>{action.id}</td>
                  <td style={{ padding: '8px', fontWeight: 500 }}>{action.action}</td>
                  <td style={{ padding: '8px' }}>{action.user}</td>
                  <td style={{ padding: '8px' }}>{action.timestamp}</td>
                  <td style={{ padding: '8px' }}>{action.ip}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ 
                      background: action.status === 'Success' ? '#C4F8E2' : '#ffebee', 
                      color: action.status === 'Success' ? '#06A561' : '#d32f2f', 
                      borderRadius: 4, 
                      padding: '2px 14px', 
                      fontWeight: 400, 
                      fontSize: 14, 
                      display: 'inline-block', 
                      minWidth: 54, 
                      textAlign: 'center' 
                    }}>
                      {action.status}
                    </span>
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

export default ActionsLog 