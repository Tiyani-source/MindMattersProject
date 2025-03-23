import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';

const Store = () => {
  const { category } = useParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const { products } = useContext(AppContext);

  // Function to filter products based on category
  const applyFilter = () => {
    if (category && category !== 'All Products') {
      setFilteredProducts(products.filter(product => product.category === category));
    } else {
      setFilteredProducts(products); // Show all products if "All Products" is selected
    }
  };

  useEffect(() => {
    applyFilter();
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
          {['All Products', 'Apparel And Accessories', 'Self-Care And Relaxation', 'Books And Journals', 'Productivity And Mental Focus', 'Sleep And Wellness Essentials']
            .map((cat, index) => (
              <p key={index} 
                onClick={() => navigate(`/store/${cat}`)} 
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${category === cat ? 'bg-indigo-100 text-black' : ''}`}>
                {cat}
              </p>
          ))}
        </div>

        {/* Product List */}
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div 
                key={index} 
                onClick={() => { navigate(`/product/${product._id}`); window.scrollTo(0, 0); }} 
                className='border border-indigo-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>

                {/* Product Image */}
                <img className='bg-indigo-50 w-full h-48 object-cover' src={product.image} alt={product.name} />

                {/* Product Details */}
                <div className='p-4'>
                  <p className='text-neutral-800 text-lg font-medium'>{product.name}</p>
                  <p className='text-zinc-600 text-sm'>{product.category}</p>
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
