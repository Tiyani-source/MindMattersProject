import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [state, setState] = useState('Sign Up')
  const [step, setStep] = useState('selection')
  const [userType, setUserType] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate();

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (state === 'Login') {
      console.log('Logging in:', { email, password });
    }else if (userType === 'university') {
      navigate('/university-signup');
    } else if (userType === 'organization') {
      navigate('/doctor-signup');
    } else {
      console.log('Normal student signup:', { name, email, password });
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>

        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment</p>
 {/* Login Form */}
 {state === 'Login' && (
          <>
            <div className='w-full'>
              <p>Email</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" required />
            </div>
            <div className='w-full'>
              <p>Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" required />
            </div>
            <button type="submit" className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
          </>
        )}
        {state === 'Sign Up' && step === 'selection' ? (
          <>
            <p>Are you a university student or an organization?</p>
            <button type="button" className='bg-primary text-white w-full py-2 rounded-md text-base' onClick={() => { setUserType('university'); navigate('/university-signup'); }}>
              Yes, I am a University Student
            </button>
            <button type="button" className='bg-primary text-white w-full py-2 rounded-md text-base' onClick={() => { setUserType('normal');setStep('form') }}>
              No, I am a Normal Student
            </button>
            <button type="button" className='bg-primary text-white w-full py-2 rounded-md text-base' onClick={() => { setUserType('organization'); navigate('/doctor-signup'); }}>
              Yes, I am an Organization Member
            </button>
            
          </>
        ) : (
          state === 'Sign Up' && userType === 'normal' && step==='form' && (
            <>
              <div className='w-full'>
                <p>Full Name</p>
                <input onChange={(e) => setName(e.target.value)} value={name} className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" required />
              </div>
              <div className='w-full'>
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" required />
              </div>
              <div className='w-full'>
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" required />
              </div>
              <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Create account</button>
            </>
          )
        )}

        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => { setState('Login'); setStep('selection'); setUserType(''); }} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  );
};

export default Login;
