import React, { useState, useEffect } from "react";
import axios from "axios";
import './payment.css';

const CreateStudent = () => {
  const [name, setName] = useState(""); 
  const [lastName, setLastName] = useState("");
  const [parentName, setParentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [classe,setClasse] = useState([]);
  const [niveau,setNiveau]=useState('');
  const [groupe,setGroupe] = useState(0);
  const [date,setDate] = useState('');
  const [reduction,setReduction] = useState({});
  const [state,setState]=useState('impaye');

  const [niveauMatieres, setNiveauMatieres] = useState([]);
  const [matieresNiveau,setMatieresNiveau] = useState([]);

  const [message,setMessage]=useState('');
  const [type,setType]=useState('');
  const [loading,setLoading]=useState(false);
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/payment/getClasses")
      .then((res) => {
        setNiveauMatieres(res.data.classes);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post("http://127.0.0.1:8000/payment/createStudent",{
        name,
        lastName,
        parentName,
        studentPhone,
        parentPhone,
        niveau,
        date,
        reduction,
        groupe,
        classe,
        state,
      },{ withCredentials: true }
    ).then(res=>{
      setMessage(res.data.message);
      setType(res.data.type);
    }).finally(()=>{
        setLoading(false)
      }
    );
  };

  const handleSelectedNiveau=(e)=>{
    const niveauId = Number(e.target.value);
    const niveau = niveauMatieres.find(nm=>nm.niveau_id===niveauId);
    setMatieresNiveau(niveau ? niveau.matieres : []);
    setNiveau(niveau ? niveau.niveau_id : '');
  }

  const handleMatiereChange = (id) => {
    setClasse(prev =>
      prev.includes(id)
        ? prev.filter(mid => mid !== id)
        : [...prev, id]
    );
  };

  const handleChange=(id,e)=>{
    setReduction(prev=>({
      ...prev,
      [id] : Number(e.target.value),
    }));
  }

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <h1 className="student-form-title text-warning text-center">Student Form</h1>

      <div className="student-form-inputs">
        <input type="text" className="form-control input-field" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input type="text" className="form-control input-field" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
        <input type="text" className="form-control input-field" placeholder="Parent Name" onChange={(e) => setParentName(e.target.value)} />
        <input type="text" className="form-control input-field" placeholder="Student Phone" onChange={(e) => setStudentPhone(e.target.value)} />
        <input type="tel" className="form-control input-field" placeholder="Parent Phone" onChange={(e) => setParentPhone(e.target.value)} />
        <input type="number" className="form-control input-field" placeholder="Groupe" onChange={(e) => setGroupe(Number(e.target.value))} />
        <input type="date" className="form-control input-field" onChange={e=>setDate(e.target.value)} />
        <div className="checkDiv">
          <label style={{marginLeft: 5}}>State:</label>
          <input type="checkbox" checked={state==='paye'} onChange={e=>setState(e.target.checked ? 'paye' : 'impaye')} />
        </div>
      </div>

      <div className="subjects-container">
        <select className="form form-select niveau-select" onChange={handleSelectedNiveau}>
          <option value="">Select a subject</option>
          {niveauMatieres.map(n => (
            <option key={n.niveau_id} value={n.niveau_id}>{n.niveau_name}</option>
          ))}
        </select>

        {matieresNiveau && matieresNiveau.map(m =>{ 
            const price=Number(m.matiere_price);
            const red=Number(reduction[m.matiere_id] || 0);
            const finalDiscount=price-red;
            const priceColor=finalDiscount < price ? 'text-danger' : 'text-success'; 
          
            return(
              <div className="matiere-item" key={m.class_id}>
                <label>{m.matiere_name}</label>
                <input type="checkbox" value={m.class_id} onChange={() => handleMatiereChange(m.class_id)} />
                <input 
                  type="number" 
                  className="reduction-input" 
                  value={reduction[m.matiere_id] || ''}
                  onChange={e =>handleChange(m.matiere_id,e)}            
                />
                <div className={priceColor}>
                  {classe.includes(m.class_id) ? finalDiscount : ''}
                </div>
              </div>
            )
          }
        )}
      </div>
      <button type="submit" className="btn btn-warning submit-btn" disabled={loading}>
        {loading ? <span className="spinner-border spinner-border-sm text-dark" role="status"></span> : 'Add Student'}
      </button>
      {message && 
        <div onClick={()=>setType('d-none')} className={`message ${type}`}>
          {message}
        </div>
      }
    </form>
  );
};

export default CreateStudent;
