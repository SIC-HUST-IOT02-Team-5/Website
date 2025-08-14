import React, { useEffect, useState } from 'react';
import ApiService from '../../services/api';
import type { Borrowing, User, Cell } from '../../services/api';

interface KioskReturnProps {
  user: User;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

const KioskReturn: React.FC<KioskReturnProps> = ({ user, onSuccess, onError }) => {
  const [loading, setLoading] = useState(true);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // borrowing id
  const [cells, setCells] = useState<Cell[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [active, cellsData] = await Promise.all([
        ApiService.getMyActiveBorrowings(),
        ApiService.getCells()
      ]);
      setBorrowings(active);
      setCells(cellsData);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load active borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (b: Borrowing) => {
    try {
      setActionLoading(b.id);
      // Open the cell for returning the item, then immediately mark as returned (no extra confirm)
      const cellId = b.item?.cell_id;
      if (cellId) {
        await ApiService.openCell(cellId);
      }
      // Complete return in backend without additional confirmation
      await ApiService.returnBorrowing(b.id);
      
      onSuccess(`Returned "${b.item.name}" successfully.`);
      await loadData();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to return item');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#5A607F' }}>Loading your borrowed items...</div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0 }}>Your borrowed items</h2>
      {borrowings.length === 0 ? (
        <div style={{ color: '#5A607F' }}>You have no active borrowings.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      {borrowings.map((b: Borrowing) => (
            <div key={b.id} style={{ border: '1px solid #E6E9F4', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{b.item?.name || `Item ${b.item_id}`}</div>
              <div style={{ color: '#5A607F', margin: '8px 0' }}>{b.item?.description}</div>
              <div style={{ fontWeight: 600, color: '#667eea', marginBottom: 12 }}>
        📍 {cells.find((c: Cell) => c.id === (b.item?.cell_id || 0))?.name || `Cell ${b.item?.cell_id}`}
              </div>
              <button
                onClick={() => handleReturn(b)}
                disabled={actionLoading === b.id}
                style={{
                  width: '100%',
                  height: 48,
                  background: actionLoading === b.id ? '#ccc' : '#06A561',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: actionLoading === b.id ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoading === b.id ? 'Processing...' : 'Return Item'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KioskReturn;
