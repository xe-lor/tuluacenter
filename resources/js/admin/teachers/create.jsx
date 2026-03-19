import React from "react";
import { useState } from "react";
import axios from "axios";
import './create.css';

const CreateTeacher=()=>{
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [type,setType]=useState('');
    const [message,setMessage]=useState('');

    const handleSubmit=(e)=>{
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/admin/storeTeacher',{username: username, password: password},{withCredentials: true}).then(res=>{
            setMessage(res.data.message);
            setType(res.data.type);
        });
    }

    return(
        <>
            <form className="createForm" onSubmit={handleSubmit}>
                <div>
                    <h3 className='text-warning text-center'>Teachers Form</h3>
                    <br />
                    <input className="form form-control" type="text" onChange={(e)=>setUsername(e.target.value)} placeholder="Enter username..."/>
                    <br />
                    <input className="form form-control" type="password" onChange={(e)=>setPassword(e.target.value)} placeholder="Enter password..."/>
                    <br />
                    <input className="btn btn-warning mb-4" type="submit" value='Add Teacher' />
                    <br />
                    {message && <div onClick={()=>{setType('d-none')}} className={type}>{message}</div>}
                </div>
            </form>
        </>
    );
}
export default CreateTeacher;