import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'

const Therapist = () => {
const { speciality } = useParams()

  const [filterTherapist, setFilterTherapist] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate();

  const { therapist } = useContext(AppContext)

  const applyFilter = () => {
    if (speciality) {
      setFilterTherapist(therapist.filter(therapist => therapist.speciality === speciality))
    } else {
      setFilterTherapist(therapist)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [therapist, speciality])
  console.log("therapist data:", therapist);
  return (
    <div>
      <p className='text-gray-600'>Browse through the therapists specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button onClick={() => setShowFilter(!showFilter)} className={`py-1 px-3 border rounded text-sm  transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => speciality === 'Clinical Psychologist' ? navigate('/therapists') : navigate('/therapists/Clinical Psychologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Clinical Psychologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Clinical Psychologist</p>
          <p onClick={() => speciality === 'Counsellor' ? navigate('/therapists') : navigate('/therapists/Counsellor')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Counsellor' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Counsellor</p>
          <p onClick={() => speciality === 'Child & Adolosence Psychologist' ? navigate('/therapists') : navigate('/therapists/Child & Adolosence Psychologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Child & Adolosence Psychologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Child & Adolosence Psychologist</p>
          <p onClick={() => speciality === 'Trauma Psychologist' ? navigate('/therapists') : navigate('/therapists/Trauma Psychologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Trauma Psychologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Trauma Psychologist</p>
          <p onClick={() => speciality === 'Behavioural Psychologist' ? navigate('/therapists') : navigate('/therapists/Behavioural Psychologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Behavioural Psychologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Behavioural Psychologist</p>
          <p onClick={() => speciality === 'Drug & Addiction Psychologist' ? navigate('/therapists') : navigate('/therapists/Drug & Addiction Psychologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Drug & Addiction Psychologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Drug & Addiction Psychologist</p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterTherapist.map((item, index) => (
            <div onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
              <img className='bg-[#EAEFFF]' src={item.image} alt="" />
              <div className='p-4'>
                <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : "text-gray-500"}`}>
                  <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p><p>{item.available ? 'Available' : "Not Available"}</p>
                </div>
                <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
                <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


export default Therapist
