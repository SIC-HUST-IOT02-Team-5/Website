import React from 'react'

const boxStatus = [
  { label: 'N1', color: '#F2C879' },
  { label: 'N2', color: '#F2C879' },
  { label: 'N3', color: '#C5F280' },
  { label: 'N4', color: '#C5F280' },
]

const actions = [
  { name: 'Tablet', box: 'N1', user: '12345678', date: '20.07.2025', status: 'OK' },
  { name: 'Tablet', box: 'N2', user: '87654321', date: '21.07.2025', status: 'Pending' },
  { name: 'Tablet', box: 'N1', user: '12345678', date: '20.07.2025', status: 'OK' },
  { name: 'Tablet', box: 'N4', user: '87654321', date: '21.07.2025', status: 'Pending' },
  { name: 'Tablet', box: 'N4', user: '12345678', date: '20.07.2025', status: 'OK' },
  { name: 'Tablet', box: 'N2', user: '87654321', date: '21.07.2025', status: 'Pending' },
]

const Dashboard: React.FC = () => {
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
      {/* Dashboard Title */}
      <div style={{
        width: '100%',
        margin: 0,
        marginTop: 32,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <h1 style={{
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '36px',
          color: '#131523',
          margin: 0,
        }}>Dashboard</h1>
      </div>
      {/* Cards Row */}
      <div
        style={{
          width: '100%',
          margin: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
          marginBottom: 32,
          flexWrap: 'wrap',
          overflowX: 'hidden',
        }}
      >
        {/* Item Card */}
        <div style={{
          width: '100%',
          maxWidth: 320,
          minWidth: 180,
          height: 212,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0px 1px 4px rgba(21, 34, 50, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1px 12px',
          gap: 10,
          flex: '1 1 208px',
          margin: '0.5rem',
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '28px',
            color: '#111111',
            marginBottom: 16,
          }}>Item</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 400, fontSize: 16, color: '#5A607F' }}>Available</span>
              <span style={{ background: '#ECF2FF', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, fontSize: 10, color: '#5A607F' }}>i</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 400, fontSize: 16, color: '#5A607F' }}>Pending</span>
              <span style={{ background: '#ECF2FF', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, fontSize: 10, color: '#5A607F' }}>i</span>
            </div>
          </div>
        </div>
        {/* Box Status Card */}
        <div style={{
          width: '100%',
          maxWidth: 320,
          minWidth: 180,
          height: 212,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0px 1px 4px rgba(21, 34, 50, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1px 12px',
          gap: 10,
          flex: '1 1 208px',
          margin: '0.5rem',
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '20px',
            color: '#111110',
            marginBottom: 16,
          }}>Box Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', marginTop: 12 }}>
            {boxStatus.map((b, i) => (
              <div key={b.label} style={{
                background: b.color,
                borderRadius: 6,
                width: '100%',
                minWidth: 48,
                height: 68,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 400,
                fontSize: 16,
                color: '#5A607F',
              }}>{b.label}</div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent Actions Table */}
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
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', background: 'none', marginTop: 16 }}>
            <thead>
              <tr style={{ color: '#5A607F', fontWeight: 400, fontSize: 14, lineHeight: '20px', height: 44 }}>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Item's Name</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Box</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>User ID</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a, i) => (
                <tr key={i} style={{ borderTop: '1px solid #E6E9F4', fontSize: 14, color: '#131523', height: 52 }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>{a.name}</td>
                  <td style={{ padding: '8px' }}>{a.box}</td>
                  <td style={{ padding: '8px' }}>{a.user}</td>
                  <td style={{ padding: '8px' }}>{a.date}</td>
                  <td style={{ padding: '8px' }}>
                    {a.status === 'OK' ? (
                      <span style={{ background: '#C4F8E2', color: '#06A561', borderRadius: 4, padding: '2px 14px', fontWeight: 400, fontSize: 14, display: 'inline-block', minWidth: 29, textAlign: 'center' }}>OK</span>
                    ) : (
                      <span style={{ background: '#E6E9F4', color: '#5A607F', borderRadius: 4, padding: '2px 14px', fontWeight: 400, fontSize: 14, display: 'inline-block', minWidth: 54, textAlign: 'center' }}>Pending</span>
                    )}
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

export default Dashboard 