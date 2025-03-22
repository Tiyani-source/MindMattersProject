import React, { useContext, useState } from 'react';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import { UniversityContext } from '../context/UniversityContext';

const Login = () => {
  const [state, setState] = useState('Admin');
  const [adminType, setAdminType] = useState('System Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setDToken } = useContext(DoctorContext);
  const { setAToken } = useContext(AdminContext);
  const { setUToken } = useContext(UniversityContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // Bypassing authentication - Directly setting token
    const fakeToken = 'dummy_token_1234567';

    if (state === 'Admin') {

      if (adminType === 'University Admin') {
        
        console.log("Setting University Token...");  // Debugging
        setUToken(fakeToken);
        localStorage.setItem('uToken', fakeToken);
        console.log("University Token set..." + fakeToken);  // Debugging

      } else {
     
        console.log("Admin Token should not be set for non-University Admin.");
        setAToken(fakeToken);
        localStorage.setItem('aToken', fakeToken);
        
      }

      localStorage.setItem('adminType', adminType);
    } else {
      setDToken(fakeToken);
      localStorage.setItem('dToken', fakeToken);
    }
  };

  return (
    console.log("In Login.jsx..."),  // Debugging
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'>
          <span className='text-primary'>{state}</span> Login
        </p>
        
        <div className='w-full '>
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className='border border-[#DADADA] rounded w-full p-2 mt-1'
            type='email'
            required
          />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className='border border-[#DADADA] rounded w-full p-2 mt-1'
            type='password'
            required
          />
        </div>
        
        {state === 'Admin' && (
          <div className='w-full'>
            <p>Select Admin Type:</p>
            <div className='flex gap-4 mt-1'>
              <label className='flex items-center gap-2'>
                <input 
                  type='radio' 
                  name='adminType' 
                  value='System Admin' 
                  checked={adminType === 'System Admin'} 
                  onChange={(e) => setAdminType(e.target.value)} 
                />
                System Admin
              </label>
              <label className='flex items-center gap-2'>
                <input 
                  type='radio' 
                  name='adminType' 
                  value='University Admin' 
                  checked={adminType === 'University Admin'} 
                  onChange={(e) => setAdminType(e.target.value)} 
                />
                University Admin
              </label>
            </div>
          </div>
        )}
        
        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
        {
          state === 'Admin'
            ? <p>Doctor Login? <span onClick={() => setState('Doctor')} className='text-primary underline cursor-pointer'>Click here</span></p>
            : <p>Admin Login? <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  );
};

export default Login;

