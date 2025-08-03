import ItemsManagement from './ItemsManagement';

const Categories: React.FC = () => {
  return <ItemsManagement />;
};

export default Categories;
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
        }}>Categories</h1>
        <button style={{
          background: '#7ec0e9',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '12px 24px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 32,
      }}>
        {categories.map((category) => (
          <div key={category.id} style={{
            background: '#fff',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0px 1px 4px rgba(21, 34, 50, 0.08)',
            border: '1px solid #E6E9F4',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}>
              <h3 style={{
                fontWeight: 600,
                fontSize: 18,
                color: '#131523',
                margin: 0,
              }}>{category.name}</h3>
              <span style={{ 
                background: category.status === 'Active' ? '#C4F8E2' : '#E6E9F4', 
                color: category.status === 'Active' ? '#06A561' : '#5A607F', 
                borderRadius: 4, 
                padding: '2px 8px', 
                fontWeight: 400, 
                fontSize: 12, 
              }}>
                {category.status}
              </span>
            </div>
            <p style={{
              color: '#5A607F',
              fontSize: 14,
              margin: '0 0 16px 0',
              lineHeight: 1.5,
            }}>{category.description}</p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                color: '#7ec0e9',
                fontWeight: 600,
                fontSize: 14,
              }}>
                {category.itemCount} items
              </span>
              <div>
                <button style={{
                  background: 'none',
                  border: '1px solid #7ec0e9',
                  borderRadius: 4,
                  padding: '6px 12px',
                  color: '#7ec0e9',
                  cursor: 'pointer',
                  marginRight: 8,
                  fontSize: 12,
                }}>
                  Edit
                </button>
                <button style={{
                  background: 'none',
                  border: '1px solid #ff6b6b',
                  borderRadius: 4,
                  padding: '6px 12px',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  fontSize: 12,
                }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Categories 