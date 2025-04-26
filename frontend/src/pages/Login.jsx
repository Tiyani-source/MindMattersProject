import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './backgroundcss/bg.css';

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const [step, setStep] = useState('selection');
  const [userType, setUserType] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Login') {
      try {
        const res = await fetch('http://localhost:4000/api/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || 'Login failed');
          return;
        }

        alert( 'Login Successful');
        localStorage.setItem('token', data.token);
        navigate('/');
        window.location.reload();
      } catch (err) {
        console.error('Login error:', err);
        alert('Something went wrong!');
      }
    } else if (userType === 'university') {
      navigate('/university-signup');
    } else if (userType === 'organization') {
      navigate('/organization-signup');
    } else {
      console.log('Normal student signup:', { name, email, password });
    }
  };

  return (
    <div id="container">
      <div id="container-inside">
        {/* Animated Background Circles */}
        <div id="circle-small"></div>
        <div id="circle-medium"></div>
        <div id="circle-large"></div>
        <div id="circle-xlarge"></div>
        <div id="circle-xxlarge"></div>

        {/* Login Box */}
        <form
          onSubmit={onSubmitHandler}
          className="login-box"
        >
          <p className="title">{state === 'Sign Up' ? 'Create Account' : 'Welcome Back!'}</p>
          <p className="subtitle">Please {state === 'Sign Up' ? 'sign up' : 'log in'} to continue</p>

          {state === 'Login' && (
            <>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              <button type="submit" className="btn blue">Sign In</button>
            </>
          )}

          {state === 'Sign Up' && step === 'selection' && (
            <>
            
              <button type="button" className="btn green" onClick={() => { setUserType('normal'); navigate('/student-signup'); }}>
                Student SignUp
              </button>
              <button type="button" className="btn purple" onClick={() => { setUserType('organization'); navigate('/doctor-signup'); }}>
                Doctor SignUp
              </button>
              <button type="button" className="btn blue" onClick={() => { setUserType('university'); navigate('/patient-signup'); }}>
                Patient SignUp
              </button>
            </>
          )}

          {state === 'Sign Up' && userType === 'normal' && step === 'form' && (
            <>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              <button className="btn blue">Create Account</button>
            </>
          )}

          <div className="footer">
            {state === 'Sign Up' ? (
              <p>Already have an account? <span className="link" onClick={() => { setState('Login'); setStep('selection'); setUserType(''); }}>Login here</span></p>
            ) : (
              <p>Don’t have an account? <span className="link" onClick={() => setState('Sign Up')}>Sign Up</span></p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
