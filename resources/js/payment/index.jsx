import React, { useEffect, useState } from "react";
import { exportTableToExcel } from "../utils/exportExcel";
import { exportTableToPdf } from "../utils/exportPdf";
import { useNavigate } from "react-router-dom";
import API from '../api.js';

const Index = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [toggleRows, setToggleRows] = useState({}); 
  const [stateButtonColor,setStateButtonColor] = useState({});
  const [canceledMonth,setCanceledMonth] = useState({});
  const [monthFilter,setMonthFilter] = useState(0);
  const [isOpen,setIsOpen] = useState(false);
  const [search,setSearch]=useState('');
  const [stateFilter,setStateFilter]=useState('');
  const [matiereFilter,setMatiereFilter]=useState('');
  const [levelFilter,setLevelFilter]=useState('');
  const [classColor,setClasscolor]=useState({});
  const [classTextColor,setClassTextcolor]=useState({});
  const [studentClasses, setStudentClasses] = useState({});

  const navigate = useNavigate();

const styles = {
  tbody: {
    display: "block",
    maxHeight: "389px",  
    overflowY: "auto",   
    overflowX: "hidden",  
  },
  row: {
    display: "table",
    width: "100%",
    tableLayout: "fixed"
  },
  thead: {
    display: "table",
    width: "100%"
  }
};


useEffect(() => {
  API.get("/payment/getStudents")
    .then(res => {
      setStudents(res.data.students);

      const map = {};
      res.data.students.forEach(s => {
        map[s.student_id] = s.payments.map(p => p.class_id);
      });
      setStudentClasses(map);
    });
}, []);



  useEffect(() => {
    API
      .get("/payment/getClasses")
      .then((res) =>{ setClasses(res.data.classes),console.log(res.data.classes)});
  }, []);




  
const setStateToPayed = async (paymentId, classId, month, studentId) => {
  const res = await API.post(
    "/payment/setPayment",
    { paymentId, classId, month, studentId }
  );

  if (res.data.updated) {
    setStateButtonColor(prev => {
      const next = { ...prev };
      res.data.updated.forEach(u => {
        next[u.payment_id] = u.status; 
      });
      return next;
    });
  }
};



const setStateToPayAll= async (studentId, month)=>{
  const res=await API.post(
    "/payment/setPaymentAll",
    {studentId, month}
  );

  if(res.data.updated){
    setStateButtonColor(prev=>{
      const next = {...prev};
      res.data.updated.forEach(u=>{
      next[u.payment_id] = u.status;

      })
        return next;
    })
  };
}

const Delete = async (Id) => {
  const ok = window.confirm("Are you sure you want to delete this student?");
  if (!ok) return;

  try {
    await API.delete(`/payment/deleteStudent/${Id}`).then(res=>{
                  setStudents(students.filter(t => t.student_id !== Id));
    })
    
  } catch (err) {
    console.error(err);
    alert("Error deleting student");
  }
}


//cancel methods

const setStateToCanceled = async (month, studentId, classId) => {
  const res = await API.post(
    "/payment/setPaymentToCanceled",
    { studentId, classId, month }
  );

    if (res.data.updated) {
      setStateButtonColor(prev => {
        const next = { ...prev };
        res.data.updated.forEach(u => {
          next[u.payment_id] = u.status;
        });
        return next;
      });
    }
  
};

const setStateToCanceledAll= async (month, studentId)=>{
  const res = await API.post(
    "/payment/setPaymentToCanceledAll",
    { studentId, month }
  );

  if(res.data.allUpdated){
    setStateButtonColor(prev => {

    const next={...prev};
    res.data.allUpdated.forEach(u=>{
      next[u.payment_id] = u.status;
    });
    return next;
    });
  }
};

//filters methods

const statusToColors = (status) => {
  switch (status) {
    case "paye":
      return { backgroundColor: "#198754", borderColor: "#198754", color: "#fff" }; 
    case "canceled":
      return { backgroundColor: "#ffc107", borderColor: "#ffc107", color: "#000" }; 
    default:
      return { backgroundColor: "#dc3545", borderColor: "#dc3545", color: "#fff" }; 
  }
};

const getMonthStatus = (paymentId, fallbackStatus) => {
  return stateButtonColor[paymentId] !== undefined
    ? stateButtonColor[paymentId]
    : fallbackStatus;
};

const resolveMonthStatus = (payments, month) => {
  let MONTH = payments.map(p=>p.months).flat();
  let day = MONTH.find(p=>String(p.month)===String(month))?.day;
  let previousMonth = month === 1 ? 12 : month - 1;
  const prevMonthRecord = MONTH.find(p => Number(p.month) === previousMonth);
  let today = new Date().getDate();

  if (!month) return { status: "—", color: "btn btn-secondary" };

  const statuses = payments
    .map(p => p.months)
    .flat()
    .filter(m => String(m.month) === String(month))
    .map(m => m.status);
  if (!statuses.length) return { status: "—", color: "btn btn-secondary" };

  let status = '';

  if(statuses.includes("impaye") && Number(day)>Number(today) && prevMonthRecord.status==='paye'){
    status = "paye"                                    
  }else if(statuses.includes("impaye")){
    status="impaye"
  }else if(statuses.includes("paye")){
    status="paye"
  }else{
    status="annule"
  }

  const color =
    status === "impaye"  
      ? "btn btn-danger"
      : status === "paye"
      ? "btn btn-success"
      : "btn btn-warning";
        return { status, color };
};

const studentStateFilter = (student, stateFilter, month) => {
  if (!stateFilter) return true;

  if(month){
    const monthToCheck = Number(month) || 0; 
    const monthStatus = resolveMonthStatus(student.payments, monthToCheck);
    return monthStatus.status === stateFilter;
  }else if(!month){
    const curMonth = new Date().getMonth() + 1 || 0; 
    const monthStatus = resolveMonthStatus(student.payments, curMonth);
    return monthStatus.status === stateFilter;
  }
};

const studentMatchesSearch = (student, search) => {
  if (!search) return true;

  const q = search.toLowerCase();

  return (
      student.student_name.toLowerCase().includes(q) ||
      student.student_lastname.toLowerCase().includes(q)
    );
};

const studentClassFilter=(student, matiereFilter)=>{
  if (!matiereFilter) return true;
  const selectedMatiere = matiereFilter;
  return(
    student.payments.some(p=>p.class_name===selectedMatiere)
  );
}

const studentNiveauFilter =(student, levelFilter)=>{
  if(!levelFilter) return true;
  const selectedLevel=levelFilter;
  return(
    student.payments.some(p=>p.class_niveau===selectedLevel)
  );
}

const classesSelect = (studentId, value, classIds) => {
  classIds.forEach(classId => {
  setCanceledMonth(prev => ({
    ...prev,
    [studentId]: value
  }));
  const student=students.find(s=>s.student_id==studentId);
  const paymentState =
  student.payments
    .find(p => p.class_id === classId)
    ?.months.find(m => String(m.month) === String(value))
    ?.status;

  let color;
  let text;
switch (paymentState) {
  case "paye":
    color = { backgroundColor: "#198754", color: "#fff" };
    text = {color: "white"};
    break;
  case "canceled":
    color = { backgroundColor: "#ffc107", color: "#000" };
    text = {color: "white"};
    break;
  case "impaye":
    color = { backgroundColor: "#dc3545", color: "#fff" };
    text = {color: "white"};
    break;
  default:
    color = { backgroundColor: "#d1cece", color: "#fff" };
    text = {color: "black"};
    
}
  setClassTextcolor(prev=>({
    ...prev,
    [classId]: text,
  }));

  setClasscolor(prev => ({
    ...prev,
    [classId]: color
  }));
});
};



const toggleClasses=(id)=>{
  setIsOpen(prev=>({
    ...prev,
    [id]: !prev[id]
  }))
}

const filtredStudentsNumber=students.filter(s=>
  studentMatchesSearch(s, search) &&
  studentStateFilter(s, stateFilter, monthFilter) &&
  studentClassFilter(s, matiereFilter) &&
  studentNiveauFilter(s, levelFilter)
);




  return (
    <div style={{ width: 900, tableLayout: "fixed",right: 75,top: 100, position: "absolute"}}>
      <div className="filters-container" style={{display: "flex",justifyContent: "start",alignItems: "center",gap: 10}}>
        <input type="text" className="form-control" style={{width: 200}} onChange={e=>setSearch(e.target.value)} placeholder="Search..."/>
        <select onChange={e=>setMonthFilter(e.target.value)} className='form-select' style={{width: 200}} name="month" id="month">
          <option value="">Select a Month</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
        </select>

        <select onChange={e=>setStateFilter(e.target.value)} className='form-select' style={{width: 200}} name="state" id="state">
          <option value="">Select a State</option>
          <option value="paye">payed</option>
          <option value="impaye">unpayed</option>
          <option value="annule">canceled</option>
        </select>

        <select onChange={e => setMatiereFilter(e.target.value)} className='form-select' style={{ width: 200 }}>
          <option value="">Select a Subject</option>
          {classes.flatMap(c => c.matieres).map(m => (
            <option key={m.matiere_id} value={m.matiere_name}>
              {m.matiere_name}
            </option>
          ))}
        </select>

        <select onChange={e => setLevelFilter(e.target.value)} className='form-select' style={{ width: 200 }}>
          <option value="">Select a Level</option>
          {classes.map(n => (
            <option key={n.niveau_id} value={n.niveau_name}>
              {n.niveau_name}
            </option>
          ))}
        </select>
      </div>
      <div className="border border-warning p-3" style={{width: 200,height: 40,borderRadius: 5,position: 'relative',left: 700,top: 40,display: "flex",justifyContent: "center",alignItems: "center"}}>
        <p className="text-warning" style={{marginBottom: 1,fontFamily: "sans-serif"}}>Students Number: {students.length}/{filtredStudentsNumber.length}</p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn btn-success"
          onClick={() => exportTableToExcel("main-table", "table.xlsx")}
        >
          Excel
        </button>
        <button
          className="btn btn-danger"
          onClick={() => exportTableToPdf("main-table", "Table Export")}
        >
          PDF
        </button>
      </div>
      <br />
      <table
        className="table table-light table-striped align-middle"
        id="main-table"
      >
        <thead className="table-light" style={styles.thead}>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>LastName</th>
            <th>Date</th>
            <th>State</th>
            <th>Action</th>
          </tr>
        </thead> 
        <tbody style={styles.tbody}>
          {students.map((s) => {
            if(!studentMatchesSearch(s, search) || !studentStateFilter(s, stateFilter, monthFilter) || !studentClassFilter(s, matiereFilter) || !studentNiveauFilter(s, levelFilter)){ 
              return null;
            }else{
            return (
              <React.Fragment key={s.student_id}>
                <tr
                  onClick={() =>
                    setToggleRows((prev) => ({
                      ...prev,
                      [s.student_id]: !prev[s.student_id],
                    }))
                  }
                  style={styles.row}
                >
                  <td>{s.student_id}</td>
                  <td>{s.student_name}</td>
                  <td>{s.student_lastname}</td>
                  <td>{s.payment_date}</td>
                  <td>
                    <div className={resolveMonthStatus(s.payments, monthFilter).color} style={{width: 100}}>
                    {resolveMonthStatus(s.payments, monthFilter).status}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "center", gap: "5px",marginRight: 20}}>
                      <button className="btn btn-warning" type="button" onClick={()=>navigate(`/student/update/${s.student_id}`)}>
                        Update
                      </button>
                      <button className="btn btn-danger" type="button" onClick={(e)=>Delete(s.student_id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {toggleRows[s.student_id] && (
                  <tr>
                    <td colSpan={5} style={{padding: "10px", backgroundColor: "#ddddddff", width: "900px",}}>
                        <div style={{display: 'flex',justifyContent: "start",gap: 10}}> 
                            <div key={studentClasses[s.student_id]}>
                              <select
                                className="form-select form-select-sm"
                                value={canceledMonth[s.student_id] || ""}
                                onChange={(e) =>
                                  classesSelect(
                                    s.student_id,
                                    e.target.value,
                                    studentClasses[s.student_id] 
                                  )
                                }
                              >
                                    <option value="">Select month</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                  </select>
                                </div>
                          <button className="btn btn-warning" onClick={(e)=>{
                            e.stopPropagation();
                            if(!canceledMonth[s.student_id]) return alert('Select a month first!');
                            const ok = window.confirm('Confirm cancelling months from the selected month to june for all the classes!');
                            if(!ok) return;
                            setStateToCanceledAll(canceledMonth[s.student_id], s.student_id);
                          }}>Cancel all</button>

                          <button
                            className="btn btn-success"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!canceledMonth[s.student_id]) return alert("Select a month first!");
                              const ok = window.confirm("Confirm paying months from the selected month to June for all classes?");
                              if (!ok) return;
                              setStateToPayAll(s.student_id, canceledMonth[s.student_id]);
                            }}
                          >
                            Pay all
                          </button>
                        </div>
                        <br />
                        <div style={{display: "flex", gap: "20px", flexWrap: "wrap" }}>
                        {/*this is the button clicked to change payment state*/}
                        {s.payments.map((p) => (
                          <div onClick={()=>toggleClasses(p.class_id)} key={p.class_id}
                            style={{
                              ...(classColor[p.class_id] || {}),
                              border: "1px solid #969696ff",
                              padding: "10px",
                              borderRadius: "6px",
                              minWidth: "100px",
                              maxWidth: "550px",
                            }}><br /> 
                              <h4 style={{ ...classTextColor[p.class_id],marginBottom: "8px"}}>{p.class_name}</h4>
                                {isOpen[p.class_id] && ( 
                                  <div>
                                  <div>
                                    <button 
                                      className="btn btn-warning mb-2"
                                      style={{border: "1px solid gray"}}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!canceledMonth[s.student_id]) return alert("Select a month first!");
                                          const ok = window.confirm(`Confirm canceling months from the selected month to june!`);
                                          if (!ok) return;
                                       setStateToCanceled(canceledMonth[s.student_id], s.student_id, p.class_id );              
                                      }}
                                    >Cancel</button>
                                  </div>
                                  <div  style={{display: "grid",gridTemplateColumns: "repeat(5, 1fr)",gap: "6px",}}>
                                    {p.months.map((m) => {
                                     const syMonths = {
                                       1: "January", 2: "February", 3: "March", 4: "April",
                                       5: "May", 6: "June", 7: "July", 8: "August",
                                       9: "September", 10: "October", 11: "November", 12: "December",
                                     };
                                     const status = getMonthStatus(m.payment_id, m.status);
                                     const colors = statusToColors(status);
                                   
                                     return (
                                       <button
                                         key={m.payment_id}
                                         className="btn"
                                         style={{
                                           ...colors,
                                           transition: "background-color 300ms ease, border-color 300ms ease, color 300ms ease",
                                           border: "1px solid white",
                                         }}
                                         onClick={(e) => {
                                           e.stopPropagation();
                                        
                                           const ok = window.confirm(
                                             `Confirm payment update for ${syMonths[m.month]} ?`
                                           );
                                         
                                           if (!ok) return;
                                         
                                           setStateToPayed(
                                             m.payment_id,
                                             p.class_id,
                                             m.month,
                                             s.student_id
                                           );
                                          }}
                                             >
                                               {syMonths[m.month]}
                                             </button>
                                           );
                                         })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) 
                              )    
                            }
                        </div>
                      </td>
                    </tr>
                  )
                }
              </React.Fragment>
            );
          }})}
        </tbody>
      </table>
    </div>
  );
};

export default Index;
