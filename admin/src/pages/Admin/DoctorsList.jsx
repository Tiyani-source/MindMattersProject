import React, { useEffect, useState } from 'react';
import { assets } from '../../../../frontend/src/assets/assets';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const imageList = [
  assets.doc1, assets.doc2, assets.doc3, assets.doc4, assets.doc5,
  assets.doc6, assets.doc7, assets.doc8, assets.doc9, assets.doc10,
  assets.doc11, assets.doc12, assets.doc13, assets.doc14, assets.doc15,
];

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filterDoc, setFilterDoc] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/doctor/list");
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;
    if (filterType === 'university') {
      filtered = filtered.filter(doc => doc.universityId);
    } else if (filterType === 'private') {
      filtered = filtered.filter(doc => !doc.universityId);
    }

    if (search.trim()) {
      filtered = filtered.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));
    }

    setFilterDoc(filtered);
  }, [doctors, filterType, search]);

  const getImageForDoctor = (id) => {
    const hash = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return imageList[hash % imageList.length];
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:4000/api/doctor/delete/${id}`);
      if (res.data.success) {
        setDoctors(doctors.filter(doc => doc._id !== id));
        setSelectedDoctor(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className='max-w-7xl mx-auto py-10 px-4 sm:px-8'>
      <h2 className='text-4xl font-extrabold mb-10 text-center text-indigo-600 drop-shadow'>👩‍⚕️ Doctor Directory</h2>

      <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl shadow-lg mb-10 border border-indigo-100'>
        <div className='flex gap-4 flex-wrap justify-center sm:justify-start'>
          {['all', 'university', 'private'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2 rounded-full transition text-sm font-semibold shadow-sm ${
                filterType === type ? 'bg-indigo-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {type === 'all' && '🩺 All Doctors'}
              {type === 'university' && '🎓 University Doctors'}
              {type === 'private' && '🏥 Private Practice'}
            </button>
          ))}
        </div>

        <div className='w-full sm:w-[300px] mx-auto sm:mx-0'>
          <input
            type="text"
            placeholder="🔍 Search doctor by name..."
            className='p-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow text-sm'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
        {filterDoc.map((item) => {
          const img = getImageForDoctor(item._id);
          return (
            <div
              key={item._id}
              onClick={() => setSelectedDoctor({ ...item, image: img })}
              className='border border-indigo-200 rounded-xl overflow-hidden cursor-pointer bg-white hover:shadow-xl transition-shadow duration-300 max-w-56 mx-auto'
            >
              <img className='bg-indigo-50 w-full h-48 object-cover' src={img} alt={item.name} />
              <div className='p-4'>
                <div className={`flex items-center gap-2 text-sm ${item.available ? 'text-green-500' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <p>{item.available ? 'Available' : 'Not Available'}</p>
                </div>
                <p className='text-gray-800 text-lg font-bold mt-1'>{item.name}</p>
                <p className='text-gray-500 text-sm'>{item.speciality}</p>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4 }}
            className='fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-xl z-50 p-6 overflow-y-auto'
          >
            <button onClick={() => setSelectedDoctor(null)} className='text-gray-500 hover:text-red-500 text-sm float-right'>✖️ Close</button>
            <h3 className='text-xl font-bold text-indigo-600 mb-4'>Doctor Profile</h3>
            <img src={selectedDoctor.image} alt='Doctor' className='w-full rounded-lg mb-4' />
            <p className='text-lg font-bold text-gray-800 mb-1'>{selectedDoctor.name}</p>
            <p className='text-sm text-gray-600 mb-2'>{selectedDoctor.speciality}</p>
            <p className='text-sm text-gray-500 mb-2'><strong>Email:</strong> {selectedDoctor.email}</p>
            <p className='text-sm text-gray-500 mb-2'><strong>Experience:</strong> {selectedDoctor.experience}</p>
            <p className='text-sm text-gray-500 mb-2'><strong>Degree:</strong> {selectedDoctor.degree}</p>
            <button onClick={() => handleDelete(selectedDoctor._id)} className='w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition mt-10'>🗑️ Delete Doctor</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorList;
