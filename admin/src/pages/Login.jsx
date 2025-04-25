import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { SupplyManagerContext } from '../context/SupplyManagerContext.jsx'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  // Add Supply Manager to the possible states
  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)
  const { setSMToken } = useContext(SupplyManagerContext)
  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
          toast.success('Admin login successful')
          navigate('/admin-dashboard')
        } else {
          toast.error(data.message)
        }
      } else if (state === 'Doctor') {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
          toast.success('Doctor login successful')
          navigate('/doctor-dashboard')
        } else {
          toast.error(data.message)
        }
      } else if (state === 'Supply Manager') {
        const { data } = await axios.post(backendUrl + '/api/supplymanager/login', { email, password })
        if (data.success) {
          console.log('Navigating to /s-dashboard');
          setSMToken(data.token)
          localStorage.setItem('smToken', data.token)
          toast.success('Supply Manager login successful')
          navigate('/supplier-dashboard')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
      console.error('Login error:', error)
    }
  }

  // Function to toggle between different login types
  const switchLoginType = (type) => {
    setState(type)
    setEmail('')
    setPassword('')
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state}</span> Login</p>
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
        </div>
        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
        
        {/* Login type switcher options */}
        <div className='w-full flex flex-col gap-1'>
          {state !== 'Admin' && (
            <p>Admin Login? <span onClick={() => switchLoginType('Admin')} className='text-primary underline cursor-pointer'>Click here</span></p>
          )}
          
          {state !== 'Doctor' && (
            <p>Doctor Login? <span onClick={() => switchLoginType('Doctor')} className='text-primary underline cursor-pointer'>Click here</span></p>
          )}
          
          {state !== 'Supply Manager' && (
            <p>Supply Manager Login? <span onClick={() => switchLoginType('Supply Manager')} className='text-primary underline cursor-pointer'>Click here</span></p>
          )}
        </div>
      </div>
    </form>
  )
}

export default Login