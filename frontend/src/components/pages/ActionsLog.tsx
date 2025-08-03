import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import type { CellEvent, Borrowing } from '../../services/api';

const ActionsLog: React.FC = () => {
  // const { user: currentUser } = useAuth();
  const [cellEvents, setCellEvents] = useState<CellEvent[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'cell_events' | 'borrowings'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cellEventsData, borrowingsData] = await Promise.all([
        ApiService.getCellEvents(),
        ApiService.getBorrowings()
      ]);
      setCellEvents(cellEventsData);
      setBorrowings(borrowingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredActions = () => {
    const allActions: Array<{
      id: string;
      type: 'cell_event' | 'borrowing';
      action: string;
      user: string;
      timestamp: string;
      details: string;
      status: string;
    }> = [];

    if (filter === 'all' || filter === 'cell_events') {
      cellEvents.forEach(event => {
        allActions.push({
          id: `cell_${event.id}`,
          type: 'cell_event',
          action: `Cell ${event.event_type}`,
          user: event.user?.full_name || 'System',
          timestamp: event.timestamp,
          details: `Cell ${event.cell.cell_number}`,
          status: 'completed'
        });
      });
    }

    if (filter === 'all' || filter === 'borrowings') {
      borrowings.forEach(borrowing => {
        allActions.push({
          id: `borrow_${borrowing.id}`,
          type: 'borrowing',
          action: borrowing.returned_at ? 'Item Returned' : 'Item Borrowed',
          user: borrowing.user?.full_name || `User ${borrowing.user_id}`,
          timestamp: borrowing.returned_at || borrowing.borrowed_at,
          details: `${borrowing.item?.name || 'Unknown Item'} (Cell ${borrowing.cell?.cell_number || borrowing.item?.cell_id || 'Unknown'})`,
          status: borrowing.returned_at ? 'returned' : 'active'
        });
      });
    }

    // Sort by timestamp (newest first)
    return allActions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'cell_event') {
      return { bg: '#E8F4FF', color: '#0984E3' };
    }
    
    switch (status) {
      case 'active': return { bg: '#FFF2CC', color: '#B7791F' };
      case 'returned': return { bg: '#C4F8E2', color: '#06A561' };
      case 'completed': return { bg: '#E8F4FF', color: '#0984E3' };
      default: return { bg: '#E6E9F4', color: '#5A607F' };
    }
  };

  // const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <main style={{ padding: '2rem', background: '#F5F6FA', minHeight: '100vh' }}>
        <div>Loading actions log...</div>
      </main>
    );
  }

  const filteredActions = getFilteredActions();

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
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'cell_events' | 'borrowings')}
            style={{
              padding: '8px 16px',
              border: '1px solid #E6E9F4',
              borderRadius: 6,
              background: 'white',
              color: '#131523',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <option value="all">All Actions</option>
            <option value="cell_events">Cell Events</option>
            <option value="borrowings">Borrowings</option>
          </select>
          
          <button 
            onClick={fetchData}
            style={{
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
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

      {/* Actions Table */}
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
          System Actions ({filteredActions.length})
        </div>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            minWidth: 800, 
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
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Action</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Details</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Timestamp</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ 
                    padding: '40px 24px', 
                    textAlign: 'center', 
                    color: '#5A607F',
                    fontSize: 16
                  }}>
                    No actions found
                  </td>
                </tr>
              ) : (
                filteredActions.map((action, index) => {
                  const statusStyle = getStatusColor(action.status, action.type);
                  
                  return (
                    <tr key={action.id} style={{ 
                      borderBottom: index < filteredActions.length - 1 ? '1px solid #F5F6FA' : 'none'
                    }}>
                      <td style={{ padding: '16px 24px', fontWeight: 500, color: '#131523' }}>
                        {action.action}
                      </td>
                      <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                        {action.user}
                      </td>
                      <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                        {action.details}
                      </td>
                      <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                        {new Date(action.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          background: action.type === 'cell_event' ? '#F0F0FF' : '#FFF8E1',
                          color: action.type === 'cell_event' ? '#5C5CFF' : '#F57C00',
                          borderRadius: 6,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}>
                          {action.type === 'cell_event' ? 'Cell Event' : 'Borrowing'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderRadius: 6,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}>
                          {action.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 24,
        marginBottom: 40
      }}>
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: 14, marginBottom: 8 }}>
            Total Cell Events
          </h3>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#5C5CFF' }}>
            {cellEvents.length}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: 14, marginBottom: 8 }}>
            Total Borrowings
          </h3>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#F57C00' }}>
            {borrowings.length}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: 14, marginBottom: 8 }}>
            Active Borrowings
          </h3>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#B7791F' }}>
            {borrowings.filter(b => !b.returned_at).length}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: 0, color: '#666', fontSize: 14, marginBottom: 8 }}>
            Returned Items
          </h3>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#06A561' }}>
            {borrowings.filter(b => b.returned_at).length}
          </p>
        </div>
      </div>
    </main>
  );
};

export default ActionsLog;
