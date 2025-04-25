import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';

const imageList = [
  assets.doc1, assets.doc2, assets.doc3, assets.doc4, assets.doc5,
  assets.doc6, assets.doc7, assets.doc8, assets.doc9, assets.doc10,
  assets.doc11, assets.doc12, assets.doc13, assets.doc14, assets.doc15,
];

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const specialities = [
    'All',
    'Clinical Psychology',
    'Counselling Psychology',
    'Child Psychology',
    'General Psychology'
  ];

  const applyFilter = () => {
    if (speciality && speciality !== 'All') {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  const getImageForDoctor = (index) => {
    return imageList[index % imageList.length];
  };

  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>

      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>

        {/* Filter toggle button for small screens */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}
        >
          Filters
        </button>

        {/* Filters */}
        <div className={`flex flex-col sm:flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          {specialities.map((spec, idx) => (
            <p
              key={idx}
              onClick={() => navigate(spec === 'All' ? '/doctors' : `/doctors/${spec}`)}
              className={`whitespace-nowrap px-4 py-2 border rounded-md text-sm transition-all cursor-pointer
                ${speciality === spec 
                  ? 'bg-blue-100 text-blue-800 font-semibold border-blue-300' 
                  : 'bg-white text-gray-600 border-gray-300'}`}
            >
              {spec}
            </p>
          ))}
        </div>

        {/* Doctor List */}
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.map((item, index) => {
            const img = getImageForDoctor(index);
            return (
              <div
                key={index}
                onClick={() => {
                  navigate(`/appointment/${item._id}`, { state: { image: img } });
                  scrollTo(0, 0);
                }}
                className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
              >
                <img className='bg-[#EAEFFF]' src={img} alt={item.name} />
                <div className='p-4'>
                  <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : "text-gray-500"}`}>
                    <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p>
                    <p>{item.available ? 'Available' : "Not Available"}</p>
                  </div>
                  <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
                  <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
