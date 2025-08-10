import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import type { Item, Borrowing, Cell } from '../../services/api';

const UserItemsView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchUserItems();
  }, []);

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      
      // Fetch all data - backend returns all items, we filter on frontend for simplicity
      const [allItems, borrowingsData, cellsData] = await Promise.all([
        ApiService.getItems(),
        ApiService.getBorrowings(),
        ApiService.getCells()
      ]);

      // Filter items that this user has access to
      const accessibleItems: Item[] = [];
      for (const item of allItems) {
        try {
          const accessUsers = await ApiService.getItemAccess(item.id);
          // If access list is empty, item is accessible to all users
          // If access list exists and user is in it, item is accessible
          if (accessUsers.length === 0 || accessUsers.some((user: any) => user.id === currentUser?.id)) {
            accessibleItems.push(item);
          }
        } catch (err) {
          // If we can't get access info, assume item is accessible to all (fallback)
          console.warn(`Could not get access info for item ${item.id}, assuming accessible`);
          accessibleItems.push(item);
        }
      }

      setUserItems(accessibleItems);
      setBorrowings(borrowingsData);
      setCells(cellsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeItem = async (item: Item) => {
    if (!confirm(`Are you sure you want to take "${item.name}" from the locker?`)) return;
    
    try {
      if (!currentUser) {
        setError('User not logged in');
        return;
      }

      // Create borrowing record
      const expectedReturn = new Date();
      expectedReturn.setDate(expectedReturn.getDate() + 7); // Default 7 days
      
      await ApiService.createBorrowing({
        user_id: currentUser.id,
        item_id: item.id,
        expected_return_at: expectedReturn.toISOString()
      });

      // Open the cell containing this item
      await ApiService.openCell(item.cell_id);
      
      // Refresh data
      await fetchUserItems();
      
      alert(`Cell ${cells.find((c: Cell) => c.id === item.cell_id)?.name || item.cell_id} has been opened. Please take "${item.name}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to take item');
    }
  };

  const handleReturnItem = async (borrowingId: number) => {
    if (!confirm('Are you sure you want to return this item?')) return;
    
    try {
      await ApiService.returnBorrowing(borrowingId);
      await fetchUserItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return { bg: '#C4F8E2', color: '#06A561' };
      case 'borrowed': return { bg: '#FFF2CC', color: '#B7791F' };
      case 'maintenance': return { bg: '#FFE8E8', color: '#D63031' };
      default: return { bg: '#E6E9F4', color: '#5A607F' };
    }
  };

  // Filter items based on search query
  const filteredItems = userItems.filter((item: Item) => {
    const matchesQuery = `${item.name} ${item.description}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  if (loading) {
    return (
      <main style={{ padding: '2rem', background: '#F5F6FA', minHeight: '100vh' }}>
        <div>Loading your items...</div>
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
      {/* Header */}
      <div style={{
        width: '100%',
        margin: 0,
        marginTop: 32,
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <h1 style={{
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '36px',
          color: '#131523',
          margin: 0,
        }}>My Available Items</h1>
        
        <p style={{
          color: '#5A607F',
          fontSize: 14,
          margin: 0,
        }}>Items you have access to and can borrow from the smart locker</p>
      </div>

      {/* Search and Stats */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 12, 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 16 
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #E6E9F4', borderRadius: 8, minWidth: 220 }}
          />
          {lastUpdated && (
            <span style={{ color: '#5A607F', fontSize: 12 }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: '#F5F6FA', border: '1px solid #E6E9F4', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
            Total: <strong>{filteredItems.length}</strong>
          </div>
          <div style={{ background: '#C4F8E2', color: '#06A561', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
            Available: <strong>{filteredItems.filter((i: Item) => i.status === 'available').length}</strong>
          </div>
          <div style={{ background: '#FFF2CC', color: '#B7791F', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
            Borrowed: <strong>{filteredItems.filter((i: Item) => i.status === 'borrowed').length}</strong>
          </div>
          <button
            onClick={fetchUserItems}
            style={{
              background: '#E6E9F4', 
              color: '#5A607F', 
              border: 'none', 
              borderRadius: 6, 
              padding: '10px 14px', 
              fontWeight: 600, 
              cursor: 'pointer'
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

      {/* Items List */}
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
          Available Items ({filteredItems.length})
        </div>
        
        {filteredItems.length === 0 ? (
          <div style={{ 
            padding: '40px 24px', 
            textAlign: 'center', 
            color: '#5A607F' 
          }}>
            {searchQuery ? 'No items match your search.' : 'No items available for you at the moment.'}
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              minWidth: 600, 
              borderCollapse: 'collapse', 
              marginTop: 16 
            }}>
              <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                <tr style={{ 
                  color: '#5A607F', 
                  fontWeight: 500, 
                  fontSize: 14,
                  borderBottom: '1px solid #E6E9F4'
                }}>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Item</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: Item, index: number) => {
                  const statusStyle = getStatusColor(item.status);
                  const activeBorrowing = borrowings.find((b: Borrowing) => b.item_id === item.id && !b.returned_at);
                  const isBorrowedByCurrentUser = activeBorrowing?.user_id === currentUser?.id;
                  
                  return (
                    <tr key={item.id} style={{ 
                      borderBottom: index < filteredItems.length - 1 ? '1px solid #F5F6FA' : 'none'
                    }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <div style={{ fontWeight: 500, color: '#131523', marginBottom: 4 }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#5A607F' }}>
                            ID: {item.id}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                        {cells.find((cell: Cell) => cell.id === item.cell_id)?.name || `Cell ${item.cell_id}`}
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
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {item.status === 'available' && (
                            <button
                              onClick={() => handleTakeItem(item)}
                              style={{
                                background: '#667eea',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 16px',
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Take Item
                            </button>
                          )}
                          {isBorrowedByCurrentUser && (
                            <button
                              onClick={() => handleReturnItem(activeBorrowing.id)}
                              style={{
                                background: '#C4F8E2',
                                color: '#06A561',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 16px',
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Return Item
                            </button>
                          )}
                          {activeBorrowing && !isBorrowedByCurrentUser && (
                            <span style={{
                              background: '#FFF2CC',
                              color: '#B7791F',
                              borderRadius: 6,
                              padding: '8px 16px',
                              fontSize: 12,
                              fontWeight: 500,
                            }}>
                              Borrowed by others
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default UserItemsView;
