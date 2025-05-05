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
          <span style={styles.productName}>{item.name}</span>
        </div>
      </td>

      <td style={styles.priceCell}>
        <div style={styles.priceInfo}>
          LKR {item.price}
        </div>
      </td>

      <td style={styles.actionsCell}>
        <div style={styles.actionsContainer}>
          <MDBBtn
            className='bg-indigo-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2'
            size="sm"
            onClick={handleAddToCart}
            disabled={isLoading}
            style={{ 
              minWidth: '120px',
              transition: 'none',
              '&:hover': { transform: 'none' }
            }}
          >
            <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
          </MDBBtn>
        </div>
      </td>

      <td style={styles.actionsCell}>
        <div style={styles.actionsContainer}>
          <MDBBtn
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded-full text-sm flex items-center gap-2"
            size="sm"
            onClick={handleRemove}
            disabled={isLoading}
            style={{ 
              minWidth: '40px',
              width: '40px',
              height: '40px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'none',
              '&:hover': { transform: 'none' }
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </MDBBtn>
        </div>
      </td>
    </tr>
  );
};

WishlistItem.propTypes = {
  item: PropTypes.shape({
    productId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  styles: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default WishlistItem;