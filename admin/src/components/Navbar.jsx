import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { UniversityContext } from '../context/UniversityContext'
import { SupplyManagerContext } from '../context/SupplyManagerContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const { uToken, setUToken } = useContext(UniversityContext)
  const { smToken, setSMToken } = useContext(SupplyManagerContext) || {}
 
  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
    uToken && setUToken('')
    uToken && localStorage.removeItem('uToken')
  }

  return (
    
    <div className='fixed top-0 left-0 w-full bg-white shadow-md border-b flex justify-between items-center px-4 sm:px-10 py-3 z-50'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.logo11} alt="Admin Logo" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : ( dToken ? 'Doctor' : 'University')}</p>
      </div>
      <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Logout</button>
    </div>
  )
}

export default Navbar
