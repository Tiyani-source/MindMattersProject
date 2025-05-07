import React from 'react';
import PropTypes from 'prop-types';
import { MDBBtn } from 'mdb-react-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';

const WishlistItem = ({ item, styles, onRemove, onAddToCart, isLoading }) => {

  const handleAddToCart = async () => {
    try {
      await onAddToCart(item);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error; // Propagate error to parent
    }
  };

  const handleRemove = async () => {
    console.log('Trash icon clicked! About to call onRemove');
    try {
      await onRemove(item.productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error; // Propagate error to parent
    }
  };

  return (
    <tr style={styles.wishlistItemRow}>
      <td style={styles.productCell}>
        <div style={styles.productInfo}>
          <div>
            <span style={styles.productName}>{item.name}</span>
            {(item.color || item.size) && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                {item.color && <span style={{ marginRight: '0.375rem' }}>Color: {item.color}</span>}
                {item.size && <span>Size: {item.size}</span>}
              </div>
            )}
          </div>
        </div>
      </td>

      <td style={{...styles.priceCell, textAlign: 'center'}}>
        <div style={styles.priceInfo}>
          LKR {item.price.toLocaleString()}
        </div>
      </td>

      <td style={{...styles.actionsCell, textAlign: 'center'}}>
        <MDBBtn
          className='bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-300'
          size="sm"
          onClick={handleAddToCart}
          disabled={isLoading}
          style={{ 
            minWidth: '100px',
            boxShadow: '0 1px 2px rgba(99, 102, 241, 0.2)',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            '&:hover': { 
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
            }
          }}
        >
          <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: '0.75rem' }} /> Add to Cart
        </MDBBtn>
      </td>

      <td style={{...styles.actionsCell, textAlign: 'center'}}>
        <MDBBtn
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-300"
          size="sm"
          onClick={handleRemove}
          disabled={isLoading}
          style={{ 
            minWidth: '32px',
            width: '32px',
            height: '32px',
            padding: '0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(239, 68, 68, 0.2)',
            '&:hover': { 
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
            }
          }}
        >
          <FontAwesomeIcon icon={faTrash} style={{ fontSize: '0.75rem' }} />
        </MDBBtn>
      </td>
    </tr>
  );
};

WishlistItem.propTypes = {
  item: PropTypes.shape({
    productId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    color: PropTypes.string,
    size: PropTypes.string,
  }).isRequired,
  styles: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default WishlistItem;