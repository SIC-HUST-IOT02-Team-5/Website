import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../../services/api';
import type { User, Item, Cell, Borrowing } from '../../services/api';

interface KioskActionsProps {
  user: User;
  onLogout: () => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const KioskActions: React.FC<KioskActionsProps> = ({ user, onLogout, onError, onSuccess }) => {
  // Shared
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);

  // Take state
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [takeLoading, setTakeLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [expectedDate, setExpectedDate] = useState<string>('');

  // Return state
  const [activeBorrowings, setActiveBorrowings] = useState<Borrowing[]>([]);
  const [returnLoadingId, setReturnLoadingId] = useState<number | null>(null);

  useEffect(() => {
    // Default expected return: +7 days
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setExpectedDate(d.toISOString().slice(0, 16));

    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cellsData, itemsData, myBorrowings] = await Promise.all([
        ApiService.getCells(),
        ApiService.getMyAccessibleItems(),
        ApiService.getMyActiveBorrowings(),
      ]);
      setCells(cellsData);
      setAvailableItems(itemsData.filter(i => i.status === 'available'));
      setActiveBorrowings(myBorrowings);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load kiosk data');
    } finally {
      setLoading(false);
    }
  };

  const cellName = (cellId: number) => cells.find(c => c.id === cellId)?.name || `Cell ${cellId}`;

  const takeItem = async () => {
    if (!selectedItem || !expectedDate) return;
    try {
      setTakeLoading(true);
      await ApiService.createBorrowing({
        user_id: user.id,
        item_id: selectedItem.id,
        expected_return_at: expectedDate,
      });
      await ApiService.openCell(selectedItem.cell_id);
      onSuccess(`Opened ${cellName(selectedItem.cell_id)} for ${selectedItem.name}.`);
      setSelectedItem(null);
      await loadAll();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to take item');
    } finally {
      setTakeLoading(false);
    }
  };

  const returnItem = async (b: Borrowing) => {
    try {
      setReturnLoadingId(b.id);
      const cid = b.item?.cell_id;
      if (cid) {
        await ApiService.openCell(cid);
      }
      await ApiService.returnBorrowing(b.id);
      onSuccess(`Returned ${b.item?.name || `Item ${b.item_id}`} successfully.`);
      await loadAll();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to return item');
    } finally {
      setReturnLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F6FA' }}>
        <div style={{ color: '#5A607F' }}>Loading kiosk...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F6FA', padding: 20 }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Hello, {user.full_name}</div>
          <div style={{ fontSize: 14, color: '#5A607F' }}>
            {availableItems.length} available • {activeBorrowings.length} to return
          </div>
        </div>
        <button onClick={onLogout} style={{ height: 44, padding: '0 16px', background: '#FFE8E8', color: '#D63031', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Two columns: Take and Return side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Take column */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Take Items</h2>
            <button onClick={loadAll} style={{ background: 'transparent', border: '1px solid #E6E9F4', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Refresh</button>
          </div>

          {availableItems.length === 0 ? (
            <div style={{ color: '#5A607F' }}>No items available.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {availableItems.map(item => (
                <div key={item.id} style={{ border: '1px solid #E6E9F4', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: '#5A607F', margin: '6px 0' }}>{item.description}</div>
                  <div style={{ fontWeight: 600, color: '#667eea', marginBottom: 8 }}>📍 {cellName(item.cell_id)}</div>
                  <button onClick={() => setSelectedItem(item)} style={{ width: '100%', height: 44, background: '#667eea', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                    Take
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Return column */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Return Items</h2>
            <button onClick={loadAll} style={{ background: 'transparent', border: '1px solid #E6E9F4', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Refresh</button>
          </div>

          {activeBorrowings.length === 0 ? (
            <div style={{ color: '#5A607F' }}>You have no active borrowings.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {activeBorrowings.map(b => (
                <div key={b.id} style={{ border: '1px solid #E6E9F4', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{b.item?.name || `Item ${b.item_id}`}</div>
                  <div style={{ color: '#5A607F', margin: '6px 0' }}>{b.item?.description}</div>
                  <div style={{ fontWeight: 600, color: '#667eea', marginBottom: 8 }}>📍 {cellName(b.item?.cell_id || 0)}</div>
                  <button
                    onClick={() => returnItem(b)}
                    disabled={returnLoadingId === b.id}
                    style={{ width: '100%', height: 44, background: returnLoadingId === b.id ? '#ccc' : '#06A561', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: returnLoadingId === b.id ? 'not-allowed' : 'pointer' }}
                  >
                    {returnLoadingId === b.id ? 'Processing...' : 'Return'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Take confirm modal */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, maxWidth: 440, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Confirm Pickup</div>
            <div style={{ marginBottom: 8 }}>{selectedItem.name}</div>
            <div style={{ color: '#5A607F', marginBottom: 12 }}>{selectedItem.description}</div>
            <div style={{ fontWeight: 600, color: '#667eea', marginBottom: 12 }}>📍 {cellName(selectedItem.cell_id)}</div>

            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>Expected return</label>
            <input
              type="datetime-local"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              style={{ width: '100%', height: 44, border: '1px solid #E6E9F4', borderRadius: 8, padding: '0 10px', marginBottom: 14 }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSelectedItem(null)} disabled={takeLoading} style={{ flex: 1, height: 44, background: '#E6E9F4', color: '#5A607F', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={takeItem} disabled={takeLoading} style={{ flex: 1, height: 44, background: '#667eea', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                {takeLoading ? 'Processing...' : 'Confirm & Open'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskActions;
