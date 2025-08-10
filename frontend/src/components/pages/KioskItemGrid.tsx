import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';
import type { Item, Cell, User } from '../../services/api';

interface KioskItemGridProps {
  user: User;
  onLogout: () => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface ConfirmDialogProps {
  item: Item;
  cell: Cell | undefined;
  onConfirm: (expectedReturnDate: string) => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ item, cell, onConfirm, onCancel }) => {
  const [expectedDate, setExpectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default date to 7 days from now
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setExpectedDate(defaultDate.toISOString().slice(0, 16));
  }, []);

  const handleConfirm = () => {
    if (!expectedDate) {
      alert('Please select an expected return date');
      return;
    }
    setLoading(true);
    onConfirm(expectedDate);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#131523',
          margin: '0 0 16px 0',
          textAlign: 'center',
        }}>
          Confirm Item Pickup
        </h2>

        <div style={{
          background: '#F5F6FA',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#131523',
            margin: '0 0 8px 0',
          }}>
            {item.name}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#5A607F',
            margin: '0 0 12px 0',
          }}>
            {item.description}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#667eea',
            margin: 0,
            fontWeight: 600,
          }}>
            📍 Location: {cell?.name || `Cell ${item.cell_id}`}
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#131523',
            marginBottom: '8px',
          }}>
            Expected Return Date & Time
          </label>
          <input
            type="datetime-local"
            value={expectedDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpectedDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            style={{
              width: '100%',
              height: '52px',
              padding: '0 16px',
              border: '2px solid #E6E9F4',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'row',
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              height: '52px',
              background: '#E6E9F4',
              color: '#5A607F',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              minWidth: '44px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 2,
              height: '52px',
              background: loading ? '#ccc' : '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              minWidth: '44px',
            }}
          >
            {loading ? 'Processing...' : 'Confirm & Open Cell'}
          </button>
        </div>
      </div>
    </div>
  );
};

const KioskItemGrid: React.FC<KioskItemGridProps> = ({ user, onLogout, onError, onSuccess }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserItems();
  }, []);

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [allItems, cellsData] = await Promise.all([
        ApiService.getItems(),
        ApiService.getCells()
      ]);

      // Filter items that this user has access to and are available
      const accessibleItems: Item[] = [];
      for (const item of allItems) {
        try {
          const accessUsers = await ApiService.getItemAccess(item.id);
          // If access list is empty or user is in it, item is accessible
          if (accessUsers.length === 0 || accessUsers.some((u: any) => u.id === user.id)) {
            accessibleItems.push(item);
          }
        } catch (err) {
          // Fallback: assume accessible
          accessibleItems.push(item);
        }
      }

      setItems(accessibleItems);
      setCells(cellsData);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeItem = async (expectedReturnDate: string) => {
    if (!selectedItem) return;
    
    try {
      setActionLoading(true);
      
      // Create borrowing record
      await ApiService.createBorrowing({
        user_id: user.id,
        item_id: selectedItem.id,
        expected_return_at: expectedReturnDate
      });

      // Open the cell
      await ApiService.openCell(selectedItem.cell_id);
      
      const cellName = cells.find((c: Cell) => c.id === selectedItem.cell_id)?.name || `Cell ${selectedItem.cell_id}`;
      onSuccess(`✅ ${cellName} has been opened! Please take "${selectedItem.name}" and close the cell when done.`);
      
      // Refresh items
      await fetchUserItems();
      setSelectedItem(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F6FA',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            color: '#5A607F',
          }}>
            Loading your items...
          </div>
        </div>
      </div>
    );
  }

  const availableItems = items.filter((item: Item) => item.status === 'available');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F6FA',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#131523',
            margin: '0 0 4px 0',
          }}>
            Welcome, {user.full_name}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#5A607F',
            margin: 0,
          }}>
            {availableItems.length} items available for pickup
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            height: '44px',
            padding: '0 24px',
            background: '#FFE8E8',
            color: '#D63031',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: '44px',
          }}
        >
          Logout
        </button>
      </div>

      {/* Items Grid */}
      {availableItems.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            fontSize: '18px',
            color: '#5A607F',
            marginBottom: '8px',
          }}>
            No items available for pickup
          </div>
          <div style={{
            fontSize: '14px',
            color: '#999',
          }}>
            Check back later or contact an administrator
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {availableItems.map((item: Item) => {
            const statusStyle = getStatusColor(item.status);
            const cell = cells.find((c: Cell) => c.id === item.cell_id);
            
            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#131523',
                    margin: 0,
                    flex: 1,
                  }}>
                    {item.name}
                  </h3>
                  <span style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    marginLeft: '12px',
                  }}>
                    {item.status}
                  </span>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#5A607F',
                  margin: '0 0 16px 0',
                  lineHeight: '1.5',
                }}>
                  {item.description}
                </p>

                <div style={{
                  fontSize: '14px',
                  color: '#667eea',
                  marginBottom: '20px',
                  fontWeight: 600,
                }}>
                  📍 {cell?.name || `Cell ${item.cell_id}`}
                </div>

                <button
                  onClick={() => setSelectedItem(item)}
                  disabled={actionLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: actionLoading ? '#ccc' : '#667eea',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                  }}
                >
                  Take Item
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      {selectedItem && (
        <ConfirmDialog
          item={selectedItem}
          cell={cells.find((c: Cell) => c.id === selectedItem.cell_id)}
          onConfirm={handleTakeItem}
          onCancel={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default KioskItemGrid;
