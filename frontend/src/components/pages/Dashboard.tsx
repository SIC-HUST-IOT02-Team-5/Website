import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';
import type { DashboardStats, Cell } from '../../services/api';
import CellControl from '../CellControl';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, cellsData] = await Promise.all([
          ApiService.getDashboardStats(),
          ApiService.getCells()
        ]);
        setStats(statsData);
        setCells(cellsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCellColor = (status: string) => {
    switch (status) {
      case 'open': return '#C4F8E2'; // Light green for open cells
      case 'closed': return '#E6F3FF'; // Light blue for closed cells
      default: return '#F5F5F5'; // Light gray for unknown status
    }
  };

  const getCellTextColor = (status: string) => {
    switch (status) {
      case 'open': return '#06A561'; // Dark green text for open cells
      case 'closed': return '#1890FF'; // Blue text for closed cells
      default: return '#666666'; // Gray text for unknown status
    }
  };

  if (loading) {
    return (
      <main style={{ padding: '2rem', background: '#F5F6FA', minHeight: '100vh' }}>
        <div>Loading dashboard...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: '2rem', background: '#F5F6FA', minHeight: '100vh' }}>
        <div style={{ color: 'red' }}>Error: {error}</div>
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
      
      {/* Stats Cards Row */}
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
        }}
      >
        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '24px',
          minWidth: 200,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: 14 }}>Total Users</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: 32, fontWeight: 700, color: '#333' }}>
            {stats?.total_users || 0}
          </p>
        </div>
        
        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '24px',
          minWidth: 200,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: 14 }}>Total Items</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: 32, fontWeight: 700, color: '#333' }}>
            {stats?.total_items || 0}
          </p>
        </div>
        
        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '24px',
          minWidth: 200,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: 14 }}>Available Items</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: 32, fontWeight: 700, color: '#28a745' }}>
            {stats?.available_items || 0}
          </p>
        </div>
        
        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '24px',
          minWidth: 200,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: 14 }}>Active Borrowings</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: 32, fontWeight: 700, color: '#dc3545' }}>
            {stats?.active_borrowings || 0}
          </p>
        </div>
      </div>

      {/* Cell Status Card */}
      <div style={{
        width: '100%',
        maxWidth: 800,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        padding: '24px',
        marginBottom: 32,
      }}>
        <h3 style={{
          fontWeight: 700,
          fontSize: 20,
          color: '#131523',
          marginBottom: 20,
        }}>Cell Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
          {cells.map((cell) => (
            <div key={cell.id} style={{
              background: getCellColor(cell.status),
              borderRadius: 8,
              padding: '16px',
              textAlign: 'center',
              minHeight: 80,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border: `1px solid ${getCellTextColor(cell.status)}20`,
            }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: getCellTextColor(cell.status) }}>
                {cell.name}
              </div>
              <div style={{ fontSize: 12, color: getCellTextColor(cell.status), marginTop: 4, textTransform: 'capitalize' }}>
                {cell.status}
              </div>
              {/* lock status removed */}
            </div>
          ))}
        </div>
      </div>

      {/* Cell Control Panel */}
      <div style={{
        width: '100%',
        marginBottom: 40,
      }}>
        <CellControl compact={true} />
      </div>

      {/* Recent Activities Table */}
      {stats?.recent_activities && stats.recent_activities.length > 0 && (
        <div style={{
          width: '100%',
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
            Recent Activities
          </div>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              minWidth: 600, 
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
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Item</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Borrowed At</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Expected Return</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_activities.map((activity, index) => (
                  <tr key={activity.id} style={{ 
                    borderBottom: index < stats!.recent_activities.length - 1 ? '1px solid #F5F6FA' : 'none'
                  }}>
                    <td style={{ padding: '16px 24px', fontWeight: 500, color: '#131523' }}>
                      {activity.user_name}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                      {activity.item_name}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                      {new Date(activity.borrowed_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                      {new Date(activity.expected_return_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        background: activity.status === 'returned' ? '#C4F8E2' : '#FFF2CC',
                        color: activity.status === 'returned' ? '#06A561' : '#B7791F',
                        borderRadius: 6,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard; 