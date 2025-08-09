import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import type { Item, Borrowing, Cell, User } from '../../services/api';

const ItemsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessUsers, setAccessUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'cells'>('items');
  const [showCreateCellModal, setShowCreateCellModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cell_id: '',
    status: 'available' as 'available' | 'borrowed' | 'maintenance'
  });
  const [cellFormData, setCellFormData] = useState({
    name: '',
    status: 'closed' as 'closed' | 'open'
  });
  const [borrowData, setBorrowData] = useState({
    user_id: '',
    expected_return_at: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [cellFilter, setCellFilter] = useState<'all' | number>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, borrowingsData, cellsData, usersData] = await Promise.all([
        ApiService.getItems(),
        ApiService.getBorrowings(),
        ApiService.getCells(),
        ApiService.getUsers()
      ]);
      setItems(itemsData);
      setBorrowings(borrowingsData);
      setCells(cellsData);
      setAllUsers(usersData);
  setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createItem(formData);
      await fetchData();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      const updateData = {
        ...formData,
        cell_id: parseInt(formData.cell_id)
      };
      await ApiService.updateItem(editingItem.id, updateData);
      await fetchData();
      setEditingItem(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await ApiService.deleteItem(itemId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleBorrowItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    try {
      await ApiService.createBorrowing({
        user_id: parseInt(borrowData.user_id),
        item_id: selectedItem.id,
        expected_return_at: borrowData.expected_return_at
      });
      await fetchData();
      setShowBorrowModal(false);
      setSelectedItem(null);
      setBorrowData({ user_id: '', expected_return_at: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow item');
    }
  };

  const handleReturnItem = async (borrowingId: number) => {
    if (!confirm('Are you sure you want to return this item?')) return;
    
    try {
      await ApiService.returnBorrowing(borrowingId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cell_id: '',
      status: 'available'
    });
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      cell_id: item.cell_id?.toString() || '',
      status: item.status
    });
  };

  const openBorrowModal = (item: Item) => {
    setSelectedItem(item);
    setShowBorrowModal(true);
  };

  const openAccessModal = async (item: Item) => {
    try {
      setSelectedItem(item);
      const users = await ApiService.getItemAccess(item.id);
      setAccessUsers(users);
      setShowAccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load access list');
    }
  };

  const toggleUserAccess = (userId: number) => {
    const exists = accessUsers.some((u: User) => u.id === userId);
    if (exists) {
      setAccessUsers((prev: User[]) => prev.filter((u: User) => u.id !== userId));
    } else {
      const user = allUsers.find((u: User) => u.id === userId);
      if (user) setAccessUsers((prev: User[]) => [...prev, user]);
    }
  };

  const saveAccess = async () => {
    if (!selectedItem) return;
    try {
  const userIds = accessUsers.map((u: User) => u.id);
      await ApiService.setItemAccess(selectedItem.id, userIds);
      setShowAccessModal(false);
      setSelectedItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save access');
    }
  };

  const handleCreateCell = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createCell(cellFormData);
      await fetchData();
      setShowCreateCellModal(false);
      resetCellForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cell');
    }
  };

  const resetCellForm = () => {
    setCellFormData({
      name: '',
      status: 'closed'
    });
  };

  const getCellItems = (cellId: number) => {
    return items.filter((item: Item) => item.cell_id === cellId);
  };

  const getCellBorrowedItems = (cellId: number) => {
    const cellItems = getCellItems(cellId);
    return cellItems.filter((item: Item) => {
      const activeBorrowing = borrowings.find((b: Borrowing) => b.item_id === item.id && !b.returned_at);
      return activeBorrowing !== undefined;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return { bg: '#C4F8E2', color: '#06A561' };
      case 'borrowed': return { bg: '#FFF2CC', color: '#B7791F' };
      case 'maintenance': return { bg: '#FFE8E8', color: '#D63031' };
      default: return { bg: '#E6E9F4', color: '#5A607F' };
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  // Derived list based on search and cell filter
  const filteredItems = items.filter((item: Item) => {
    const matchesQuery = `${item.name} ${item.description}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCell = cellFilter === 'all' ? true : item.cell_id === cellFilter;
    return matchesQuery && matchesCell;
  });

  if (loading) {
    return (
      <main style={{ padding: '2rem', background: '#F5F6FA', minHeight: '100vh' }}>
        <div>Loading items...</div>
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
      {/* Page Title and Tabs */}
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
        }}>Items & Cells Management</h1>
        
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e0e0e0',
          gap: '0px',
        }}>
          <button
            onClick={() => setActiveTab('items')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'items' ? '#fff' : 'transparent',
              color: activeTab === 'items' ? '#131523' : '#5A607F',
              borderBottom: activeTab === 'items' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'items' ? 600 : 400,
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            Items Management
          </button>
          <button
            onClick={() => setActiveTab('cells')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'cells' ? '#fff' : 'transparent',
              color: activeTab === 'cells' ? '#131523' : '#5A607F',
              borderBottom: activeTab === 'cells' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'cells' ? 600 : 400,
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            Cells Management
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' && (
        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #E6E9F4', borderRadius: 8, minWidth: 220 }}
            />
            <select
              value={cellFilter === 'all' ? 'all' : String(cellFilter)}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCellFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              style={{ padding: '10px 12px', border: '1px solid #E6E9F4', borderRadius: 8 }}
            >
              <option value="all">All Cells</option>
              {cells.map((c: Cell) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {lastUpdated && (
              <span style={{ color: '#5A607F', fontSize: 12 }}>Updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#F5F6FA', border: '1px solid #E6E9F4', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>Total: <strong>{filteredItems.length}</strong></div>
            <div style={{ background: '#C4F8E2', color: '#06A561', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>Available: <strong>{filteredItems.filter((i: Item) => i.status === 'available').length}</strong></div>
            <div style={{ background: '#FFF2CC', color: '#B7791F', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>Borrowed: <strong>{filteredItems.filter((i: Item) => i.status === 'borrowed').length}</strong></div>
            <div style={{ background: '#FFE8E8', color: '#D63031', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>Maintenance: <strong>{filteredItems.filter((i: Item) => i.status === 'maintenance').length}</strong></div>
            <button
              onClick={fetchData}
              style={{
                background: '#E6E9F4', color: '#5A607F', border: 'none', borderRadius: 6, padding: '10px 14px', fontWeight: 600, cursor: 'pointer'
              }}
            >Refresh</button>
            {isAdmin && (
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Item
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'cells' && (
        <>
          {/* Add Cell Button */}
          {isAdmin && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button 
                onClick={() => setShowCreateCellModal(true)}
                style={{
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '12px 24px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Cell
              </button>
            </div>
          )}
        </>
      )}

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

      {/* Items Tab Content */}
      {activeTab === 'items' && (
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
          All Items ({filteredItems.length})
        </div>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            minWidth: 800, 
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
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Cell</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Created At</th>
                <th style={{ textAlign: 'left', padding: '16px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: Item, index: number) => {
                const statusStyle = getStatusColor(item.status);
                const activeBorrowing = borrowings.find((b: Borrowing) => b.item_id === item.id && !b.returned_at);
                
                return (
                  <tr key={item.id} style={{ 
                    borderBottom: index < filteredItems.length - 1 ? '1px solid #F5F6FA' : 'none'
                  }}>
                    <td style={{ padding: '16px 24px', color: '#5A607F' }}>{item.id}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 500, color: '#131523' }}>
                      {item.name}
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
                    <td style={{ padding: '16px 24px', color: '#5A607F' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(item)}
                              style={{
                                background: '#FFF2CC',
                                color: '#B7791F',
                                border: 'none',
                                borderRadius: 4,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              style={{
                                background: '#FFE8E8',
                                color: '#D63031',
                                border: 'none',
                                borderRadius: 4,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => openAccessModal(item)}
                              style={{
                                background: '#E6F7FF',
                                color: '#096DD9',
                                border: 'none',
                                borderRadius: 4,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Manage Access
                            </button>
                          </>
                        )}
                        {item.status === 'available' && (
                          <button
                            onClick={() => openBorrowModal(item)}
                            style={{
                              background: '#E8F4FF',
                              color: '#0984E3',
                              border: 'none',
                              borderRadius: 4,
                              padding: '6px 12px',
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Borrow
                          </button>
                        )}
                        {activeBorrowing && activeBorrowing.user_id === currentUser?.id && (
                          <button
                            onClick={() => handleReturnItem(activeBorrowing.id)}
                            style={{
                              background: '#C4F8E2',
                              color: '#06A561',
                              border: 'none',
                              borderRadius: 4,
                              padding: '6px 12px',
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Return
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Cells Tab Content */}
      {activeTab === 'cells' && (
        <div style={{
          width: '100%',
          margin: 0,
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{
            backgroundColor: '#667eea',
            color: '#fff',
            padding: '24px 24px',
            fontWeight: 600,
            fontSize: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>Cells Overview</span>

          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            padding: '24px',
          }}>
            {cells.map((cell) => {
              const cellItems = getCellItems(cell.id);
              const borrowedItems = getCellBorrowedItems(cell.id);
              
              return (
                <div key={cell.id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px',
                  background: '#f9f9f9',
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px' 
                  }}>
                    <h3 style={{ margin: 0, color: '#131523', fontSize: '16px', fontWeight: 600 }}>
                      {cell.name}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: cell.status === 'closed' ? '#E6F3FF' : '#C4F8E2',
                      color: cell.status === 'closed' ? '#1890FF' : '#06A561',
                    }}>
                      {cell.status}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#5A607F', fontSize: '12px' }}>Items in Cell:</strong>
                    <div style={{ marginTop: '4px' }}>
                      {cellItems.length === 0 ? (
                        <span style={{ color: '#999', fontSize: '12px' }}>No items</span>
                      ) : (
                        cellItems.map(item => (
                          <div key={item.id} style={{ 
                            fontSize: '12px', 
                            color: '#131523',
                            marginBottom: '2px',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <span>{item.name}</span>
                            <span style={{ 
                              color: item.status === 'available' ? '#52c41a' : '#fa8c16',
                              fontWeight: 500 
                            }}>
                              {item.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{ color: '#5A607F', fontSize: '12px' }}>Currently Borrowed:</strong>
                    <div style={{ marginTop: '4px' }}>
                      {borrowedItems.length === 0 ? (
                        <span style={{ color: '#999', fontSize: '12px' }}>No borrowed items</span>
                      ) : (
                        borrowedItems.map(item => (
                          <div key={item.id} style={{ 
                            fontSize: '12px', 
                            color: '#fa8c16',
                            marginBottom: '2px',
                            fontWeight: 500
                          }}>
                            {item.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create/Edit Item Modal */}
      {(showCreateModal || editingItem) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '2rem',
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: 0, marginBottom: '1.5rem' }}>
              {editingItem ? 'Edit Item' : 'Create New Item'}
            </h2>
            
            <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Cell
                </label>
                <select
                  value={formData.cell_id}
                  onChange={(e) => setFormData({ ...formData, cell_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    background: '#fff'
                  }}
                >
                  <option value="">Select a cell</option>
                  {cells.map(cell => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'borrowed' | 'maintenance' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  style={{
                    background: '#E6E9F4',
                    color: '#5A607F',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Item Modal */}
      {showBorrowModal && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '2rem',
            width: '90%',
            maxWidth: 400,
          }}>
            <h2 style={{ margin: 0, marginBottom: '1.5rem' }}>
              Borrow Item: {selectedItem.name}
            </h2>
            
            <form onSubmit={handleBorrowItem}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  User ID
                </label>
                <input
                  type="number"
                  value={borrowData.user_id}
                  onChange={(e) => setBorrowData({ ...borrowData, user_id: e.target.value })}
                  required
                  placeholder={`Your ID: ${currentUser?.id}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Expected Return Date
                </label>
                <input
                  type="datetime-local"
                  value={borrowData.expected_return_at}
                  onChange={(e) => setBorrowData({ ...borrowData, expected_return_at: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowBorrowModal(false);
                    setSelectedItem(null);
                    setBorrowData({ user_id: '', expected_return_at: '' });
                  }}
                  style={{
                    background: '#E6E9F4',
                    color: '#5A607F',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Borrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Cell Modal */}
      {showCreateCellModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            width: '90%',
            maxWidth: 400,
            padding: 0,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              background: '#667eea',
              color: '#fff',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              fontWeight: 600,
              fontSize: 18
            }}>
              Add New Cell
            </div>
            <form onSubmit={handleCreateCell} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: '#131523'
                }}>
                  Cell Name
                </label>
                <input
                  type="text"
                  value={cellFormData.name}
                  onChange={(e) => setCellFormData({ ...cellFormData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E6E9F4',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., cell 1, cell 2, cell 3, cell 4"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: '#131523'
                }}>
                  Status
                </label>
                <select
                  value={cellFormData.status}
                  onChange={(e) => setCellFormData({ ...cellFormData, status: e.target.value as 'closed' | 'open' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E6E9F4',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="closed">Closed</option>
                  <option value="open">Open</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCellModal(false);
                    setCellFormData({ name: '', status: 'closed' });
                  }}
                  style={{
                    background: '#E6E9F4',
                    color: '#5A607F',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Create Cell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Access Modal */}
      {showAccessModal && selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: '90%', maxWidth: 600 }}>
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>Manage Access: {selectedItem.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h3 style={{ margin: '8px 0' }}>All Users</h3>
                <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
                  {allUsers.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #f5f5f5' }}>
                      <input
                        type="checkbox"
                        checked={accessUsers.some(au => au.id === u.id)}
                        onChange={() => toggleUserAccess(u.id)}
                      />
                      <span>{u.full_name} ({u.username})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ margin: '8px 0' }}>Can Access</h3>
                <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
                  {accessUsers.length === 0 && (
                    <div style={{ padding: 12, color: '#999' }}>No users selected</div>
                  )}
                  {accessUsers.map(u => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #f5f5f5' }}>
                      <span>{u.full_name} ({u.username})</span>
                      <button onClick={() => toggleUserAccess(u.id)} style={{ background: 'transparent', border: 'none', color: '#d63031', cursor: 'pointer' }}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => { setShowAccessModal(false); setSelectedItem(null); }}
                style={{ background: '#E6E9F4', color: '#5A607F', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={saveAccess}
                style={{ background: '#52c41a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ItemsManagement;
