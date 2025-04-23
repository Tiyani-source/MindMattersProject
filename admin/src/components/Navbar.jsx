import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { SupplyManagerContext } from '../context/SupplyManagerContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const { smToken, setSMToken } = useContext(SupplyManagerContext) || {}
 
  const navigate = useNavigate()

  // Determine current user type
  const getUserType = () => {
    if (aToken) return 'Admin'
    if (dToken) return 'Doctor'
    if (smToken) return 'Supply Manager'
    return 'Guest'
  }

  const logout = () => {
    navigate('/')
    
    // Logout Doctor
    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }
    
    // Logout Admin
    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }
    
    // Logout Supply Manager
    if (smToken && setSMToken) {
      setSMToken('')
      localStorage.removeItem('smToken')
    }
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>
          {getUserType()}
        </p>
      </div>
      <button 
        onClick={() => logout()} 
        className='bg-primary text-white text-sm px-10 py-2 rounded-full'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar