import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Store = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Define available categories
  const categories = ['All Products', 'Apparel And Accessories', 'Self-Care And Relaxation', 'Books And Journals', 'Productivity And Mental Focus', 'Sleep And Wellness Essentials'];

  // Base URL from .env file
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';


  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products`);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  // Function to filter products based on category
  useEffect(() => {
    if (products.length > 0) {
      if (category && category !== 'All Products') {
        // Since products don't have a category field, we need to filter differently
        // This is a placeholder - you'll need to decide how to determine product categories
        // For example, you might have tags or types or another field that can be used instead
        
        // Option 1: Set all products if filtering is not possible
        setFilteredProducts(products);
        
        // Option 2: If you have some other field to filter by, use that instead
        // For example, if products have a 'type' field instead of 'category':
        // setFilteredProducts(products.filter(product => product.type === category));
      } else {
        setFilteredProducts(products); // Show all products
      }
    }
  }, [products, category]);

  return (
    <div>
      <p className='text-gray-600'>Browse through our mental wellness products.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        
        {/* Toggle Filter Button for Mobile */}
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}>
          Filters
        </button>

        {/* Category Filters */}
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          {categories.map((cat, index) => (
            <p key={index} 
              onClick={() => navigate(`/store/${cat}`)} 
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${category === cat ? 'bg-indigo-100 text-black' : ''}`}>
              {cat}
            </p>
          ))}
        </div>

        {/* Product List */}
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
          {loading ? (
            <p className='text-gray-500'>Loading products...</p>
          ) : error ? (
            <p className='text-red-500'>{error}</p>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div 
                key={product._id || index} 
                onClick={() => { navigate(`/product/${product._id}`); window.scrollTo(0, 0); }} 
                className='border border-indigo-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>

                {/* Product Image */}
                <img className='bg-indigo-50 w-full h-48 object-cover' src={API_URL+"/"+product.image} alt={product.name} />

                {/* Product Details */}
                <div className='p-4'>
                  <p className='text-neutral-800 text-lg font-medium'>{product.name}</p>
                  {/* Removed category display */}
                  <p className='text-green-500 font-semibold'>${product.price}</p>
                </div>
              </div>
            ))
          ) : (
            <p className='text-gray-500'>No products found in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Store;