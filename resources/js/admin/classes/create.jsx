import React from 'react';
import { useEffect,useState } from 'react';
import axios from 'axios';
import './create.css';



const CreateClass = ()=>{

    //those are coming from backend:
    const [matieres,setMatieres]=useState([]);
    const [niveaux,setNiveaux]=useState([]);
    const [teachers,setTeachers]=useState([]);


    //those are going to the backend:
    const [matiere,setMatiere]=useState(0);
    const [niveau,setNiveau]=useState(0);
    const [teacher,setTeacher]=useState(0);
    const [price,setPrice]=useState(0);
    const [percentage,setPercentage]=useState(0);
    const [message,setMessage]=useState('');
    const [type,setType]=useState('');




    useEffect(function(){
        axios.get('http://127.0.0.1:8000/admin/classes').then(res=>{
            setMatieres(res.data.matieres);
            setNiveaux(res.data.niveaux);
            setTeachers(res.data.teachers);
        });
    },[]);

    const handleSubmit=(e)=>{
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/admin/classes',{matiere: matiere, niveau: niveau, teacher: teacher, price: price, percentage: percentage}, {withCredentials: true}).then(res=>{
            setMessage(res.data.message);
            setType(res.data.type);
        });
    }



    return(
        <>
            <form onSubmit={handleSubmit} className='classesForm'>
                <div>
                    <h3 className='text-warning text-center'>Classes Form</h3>
                    <br />
                    <div className='classesDiv'>
                        <div>
                            <select className='form form-select' onChange={e=>setMatiere(e.target.value)}>
                                <option>Select a subject</option>
                                {matieres&&matieres.map(m=>(
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select className='form form-select' onChange={e=>setNiveau(e.target.value)}>
                                <option>Select a level</option>
                                {niveaux&&niveaux.map(m=>(
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select className='form form-select' onChange={e=>setTeacher(e.target.value)}>
                                <option>Select a teacher</option>
                                {teachers&&teachers.map(m=>(
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <br />
                    <div><input className='form form-control' type="number" onChange={e=>setPrice(e.target.value)} placeholder='Price...' /></div>
                    <br />
                    <div><input className='form form-control' type="number" onChange={e=>setPercentage(e.target.value)} placeholder='Percentage...' /></div>
                    <br />
                    <div><input type="submit" className='btn btn-warning' value="Add class" /></div>
                    <br />
                    {message ? <div style={{marginLeft: '150px'}} onClick={()=>{setType('d-none')}} className={type}>{message}</div>  : ''}
                </div>
            </form>
        </>
    );
}
export default CreateClass;