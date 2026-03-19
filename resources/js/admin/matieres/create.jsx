import React from "react";
import { useState } from "react";
import axios from "axios";
import './create.css';

const CreateMatiere=()=>{
    const [matiere,setMatiere]=useState('');
    const [message,setMessage]=useState('');
    const [type,setType]=useState('');

    const handleSubmit=(e)=>{
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/admin/storeMatiere',{matiere: matiere},{withCredentials: true}).then(res=>{
            setMessage(res.data.message);
            setType(res.data.type);
        });
    }

    return(
        <>
            <form className="createForm" onSubmit={handleSubmit}>
                <div>
                    <h3 className='text-warning text-center'>Subjects Form</h3>
                    <br />
                    <input className="form form-control" type="text" onChange={(e)=>setMatiere(e.target.value)} placeholder="Enter subject name..."/>
                    <br />
                    <input className="btn btn-warning mb-4" type="submit" value='Add Subject' />
                    <br />
                    {message && <div onClick={()=>{setType('d-none')}} className={type}>{message}</div>}
                </div>
            </form>
        </>
    );
}
export default CreateMatiere;