import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';
import API from '../api.js';

const Login = () => {
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = (e) => {
  e.preventDefault();

  API.post(
    '/auth/login',
    { name, password },
    { withCredentials: true } // important for Laravel session cookies
  )
  .then(res => {
    if(res.data.success === true){
      const user = res.data.user;

      // Store role and user info in localStorage for global access
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('username', user.name);

      // Dispatch custom event so sidebar updates immediately
      window.dispatchEvent(new Event('updateRole'));

      // Navigate to classes page (or dashboard)
      navigate('/classes', { state: { user } });

    } else {
      setMessage('Invalid Credentials!');
    }
  })
  .catch(err => {
    if(err.response && err.response.status === 401){
      setMessage('Invalid Credentials!');
    } else {
      setMessage('Something went wrong. Please try again!');
    }
  });
};

  return(
    <div className='containerDiv shadow-lg'>
      <form className='formDiv' onSubmit={handleLogin}>
        <div>
          <input
            className='form form-control'
            type="text"
            onChange={(e)=>setUsername(e.target.value)}
            placeholder='Username'
            required
          />
          <br />
          <input
            className='form form-control'
            type="password"
            onChange={(e)=>setPassword(e.target.value)}
            placeholder='******'
            required
          />
          <br />
          <input className='btn btn-warning' type="submit" value='Login'/>
          <p style={{color: 'white',textAlign: 'center',marginTop: 10}}>© 2026-2027 Tulua</p>
          {message && <div id='messageBtn' className='btn btn-danger mt-2'>{message}</div>}
        </div>
      </form>
      <div className='imageDiv'>
        <img className='img' src="./images/tulua.png" alt="School Logo" />
      </div>
    </div>
  );
}

export default Login;