import React from "react";
import { useState } from "react";
import axios from "axios";
import './create.css';

const CreateNiveau=()=>{
    const [niveau,setNiveau]=useState('');
    const [avrage,setAvrage]=useState(0);
    const [message,setMessage]=useState('');
    const [type,setType]=useState('');

    const handleSubmit=(e)=>{
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/admin/storeNiveau',{niveau: niveau, avrage: avrage},{withCredentials: true}).then(res=>{
            setMessage(res.data.message);
            setType(res.data.type);
        });
    }

    return(
        <>
            <form className="createForm" onSubmit={handleSubmit}>
                <div>
                    <h3 className='text-warning text-center'>Levels Form</h3>
                    <br />
                    <input className="form form-control" type="text" onChange={(e)=>setNiveau(e.target.value)} placeholder="Enter level..."/>
                    <br />
                    <input className="form form-control" type="number" onChange={(e)=>setAvrage(e.target.value)} placeholder="Enter average..."/>
                    <br />
                    <input className="btn btn-warning mb-4" type="submit" value='Add Level' />
                    <br />
                    {message && <div onClick={()=>{setType('d-none')}} className={type}>{message}</div>}
                </div>
            </form>
        </>
    );
}
export default CreateNiveau;