import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';


const Login=()=>{
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [message,setMessage]=useState('');

    const navigate=useNavigate();


    const handleLogin=(e)=>{
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/auth/login',
    { username, password },
    { withCredentials: true }
)
.then(res => {
    if(res.data.success === true){
        const user = res.data.user;
        navigate('/classes',{state: {user}});
    } else {
        setMessage('Invalid Credentials!');
    }
})
.catch(err => {
    if(err.response && err.response.status === 401){
        setMessage('Invalid Credentials!');
    } else {
        setMessage('Invalid Credentials!');
    }
});


    }

    return(
        <>
            <div className='containerDiv shadow-lg'>
                <form className='formDiv' onSubmit={handleLogin}>
                    <div>
                        <input className='form form-control' type="text" onChange={(e)=>setUsername(e.target.value)} placeholder='Username'/>
                        <br />
                        <input className='form form-control' type="password" onChange={(e)=>setPassword(e.target.value)} placeholder='******'/>
                        <br />
                        <input className='btn btn-warning' type="submit" value='Login'/>
                        {message && <div id='messageBtn' className='btn btn-danger'>{message}</div>}
                    </div>
                </form>
                <div className='imageDiv'><img className='img' src="./images/tulua.png" alt="a regular image!" /></div>
            </div>
        </>
    );
}
export default Login;