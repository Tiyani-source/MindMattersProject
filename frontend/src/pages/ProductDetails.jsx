import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ProductDetails = () => {
  const { prodId } = useParams();
  const navigate = useNavigate();
  const { products } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (products.length > 0) {
      const foundProduct = products.find(p => p._id === prodId);
      setProduct(foundProduct);
      if (foundProduct) {
        setReviews(foundProduct.reviews || []);
        setRelatedProducts(products.filter(p => p.category === foundProduct.category && p._id !== foundProduct._id));
      }
    }
  }, [products, prodId]);

  const handleAddReview = () => {
    if (newReview.trim() === '') return;
    const updatedReviews = [...reviews, { user: 'Anonymous', comment: newReview, rating: newRating }];
    setReviews(updatedReviews);
    setNewReview('');
    setNewRating(5);
  };

  if (!product) {
    return <p className='text-center text-gray-500'>Product not found.</p>;
  }

  return (
    <div className='p-6 sm:p-12'>
      <div className='flex flex-col sm:flex-row gap-6'>
        {/* Product Image */}
          <img
            className='max-w-md w-full h-auto object-contain rounded-xl self-start'
            src={product.image}
            alt={product.name}
          />


        {/* Product Details */}
        <div className='flex-1 bg-white border p-6 rounded-xl shadow-sm'>
          <h1 className='text-3xl font-semibold text-gray-900'>{product.name}</h1>
          <p className='text-sm text-gray-600 mt-1'>{product.category}</p>

          <hr className='my-4' />

          {/* Price & Stock Status */}
          <p className='text-xl text-primary mt-4 font-medium'>${product.price}</p>
          <p className={`text-sm mt-1 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {product.stock > 0 ? 'Available' : 'Sold Out'}
          </p>

          {/* Star Rating */}
          <div className='flex items-center mt-2'>
            <p className='text-yellow-500 text-lg'>
              {"★".repeat(Math.round(product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length))}
              {"☆".repeat(5 - Math.round(product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length))}
            </p>
            <p className='text-sm text-gray-500 ml-2'>({product.reviews.length} reviews)</p>
          </div>

          {/* Description */}
          <div className='mt-4'>
            <p className='font-medium text-gray-800'>Description</p>
            <p className='text-sm text-gray-600 mt-1'>{product.description}</p>
          </div>

          <hr className='my-4' />

          {/* Color Selection */}
          <div className='mt-4'>
            <p className='font-medium text-gray-800'>Colors:</p>
            <div className='flex gap-3 mt-2'>
              {['#ef4444', '#3b82f6', '#22c55e','#122620'].map((color, index) => (
                <div
                  key={index}
                  className={`w-7 h-7 rounded-full cursor-pointer border-2 flex items-center justify-center transition ${
                    selectedColor === color ? 'border-gray-700' : 'border-gray-300'
                  }`}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <span className='text-white text-xs font-bold'>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

         {/* Size Selection (only for T-Shirt and Hoodie) */}
        {['T-Shirt', 'Hoodie'].includes(product.name) && (
          <div className='mt-4'>
            <p className='font-medium text-gray-800'>Size:</p>
            <div className='flex gap-3 mt-2'>
              {['S', 'M', 'L', 'XL', 'XXL'].map((size, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 border rounded cursor-pointer flex items-center justify-center text-sm ${
                    selectedSize === size ? 'border-gray-700 bg-gray-100' : 'border-gray-300'
                  }`}
                >
                  {size}
                  {selectedSize === size && <span className='ml-1 text-xs text-green-600 font-bold'>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}


          {/* Quantity Selector */}
          <div className='mt-6'>
            <p className='font-medium text-gray-800 mb-2'>QTY:</p>
            <div className='flex items-center gap-2'>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className='border px-3 py-1 text-lg rounded'>-</button>
              <span className='border px-4 py-1 rounded'>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className='border px-3 py-1 text-lg rounded'>+</button>
            </div>
          </div>

          <hr className='my-4' />

          {/* Delivery Details */}
          <div className='mt-4'>
            <p className='font-medium text-gray-800'>Delivery Period</p>
            <p className='text-sm text-gray-600 mt-1'>{product.deliveryPeriod || 'Not specified'}</p>
          </div>

          {/* Courier Company */}
          <div className='mt-4'>
            <p className='font-medium text-gray-800'>Courier Company</p>
            <p className='text-sm text-gray-600 mt-1'>{product.courier || 'Not specified'}</p>
          </div>

          <hr className='my-4' />

          {/* Action Buttons */}
          <div className='mt-6 flex gap-3'>
            <button className='bg-blue-500 text-white px-5 py-2 rounded-full text-sm'>Buy Now</button>
            <button className='bg-primary text-white px-4 py-2 rounded-full text-sm'>Add to Cart</button>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className='mt-12'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, index) => (
              <div key={index} className='bg-white border p-4 rounded-lg shadow-sm'>
                <p className='font-medium text-gray-900'>{review.user}</p>
                <p className='text-md text-gray-600'>{review.comment}</p>
                <p className='text-yellow-500 text-lg'>
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-md text-gray-500'>No reviews yet.</p>
        )}

        {reviews.length > 3 && (
          <div className='flex justify-center mt-4'>
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className='bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium'
            >
              {showAllReviews ? 'Show Less' : 'More Reviews'}
            </button>
          </div>
        )}

        {/* Add Review Form */}
        <div className='mt-6 p-4 border rounded-lg bg-gray-50'>
          <h3 className='text-lg font-semibold'>Leave a Review</h3>
          <textarea 
            className='w-full p-2 border rounded mt-2' 
            placeholder='Write your review...' 
            value={newReview} 
            onChange={(e) => setNewReview(e.target.value)}
          />
          <select 
            className='w-full p-2 border rounded mt-2' 
            value={newRating} 
            onChange={(e) => setNewRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{'★'.repeat(num)}{'☆'.repeat(5 - num)}</option>
            ))}
          </select>
          <button onClick={handleAddReview} className='mt-4 bg-primary text-white px-4 py-2 rounded text-sm'>
            Submit Review
          </button>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className='mt-10'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Related Products</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {relatedProducts.map((related, index) => (
              <div key={index} 
                onClick={() => { navigate(`/product/${related._id}`); window.scrollTo(0, 0); }} 
                className='border border-indigo-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>

                <img className='bg-indigo-50 w-full h-48 object-cover' src={related.image} alt={related.name} />

                <div className='p-4'>
                  <p className='text-neutral-800 text-lg font-medium'>{related.name}</p>
                  <p className='text-zinc-600 text-sm'>{related.category}</p>
                  <p className='text-green-500 font-semibold'>${related.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
