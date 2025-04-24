import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { TherapistContext } from '../context/TherapistContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'

const Login = () => {
  const [state, setState] = useState('Admin') // Default login type: Admin
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)
  const { setTToken } = useContext(TherapistContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    let loginUrl = '';
    let setToken = null;
    let storageKey = '';

    if (state === 'Admin') {
      loginUrl = '/api/admin/login';
      setToken = setAToken;
      storageKey = 'aToken';
    } else if (state === 'Doctor') {
      loginUrl = '/api/doctor/login';
      setToken = setDToken;
      storageKey = 'dToken';
    } else if (state === 'Therapist') {
      loginUrl = '/api/therapist/login';
      setToken = setTToken;
      storageKey = 'tToken';
    }

    try {
      const { data } = await axios.post(`${backendUrl}${loginUrl}`, { email, password });

      if (data.success) {
        setToken(data.token);
        localStorage.setItem(storageKey, data.token);
        toast.success("Login Successful");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'>
          <span className='text-primary'>{state}</span> Login
        </p>
        <div className='w-full'>
          <p>Email</p>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="email" 
            required 
          />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="password" 
            required 
          />
        </div>
        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>
          Login
        </button>

        <div className='text-center w-full mt-2'>
          {state === 'Admin' && (
            <p>
              Doctor or Therapist Login? 
              <span onClick={() => setState('Doctor')} className='text-primary underline cursor-pointer'> Doctor</span> | 
              <span onClick={() => setState('Therapist')} className='text-primary underline cursor-pointer'> Therapist</span>
            </p>
          )}
          {state === 'Doctor' && (
            <p>
              Admin or Therapist Login? 
              <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer'> Admin</span> | 
              <span onClick={() => setState('Therapist')} className='text-primary underline cursor-pointer'> Therapist</span>
            </p>
          )}
          {state === 'Therapist' && (
            <p>
              Admin or Doctor Login? 
              <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer'> Admin</span> | 
              <span onClick={() => setState('Doctor')} className='text-primary underline cursor-pointer'> Doctor</span>
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

export default Login