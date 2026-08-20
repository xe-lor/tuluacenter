import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import API from '../api.js';

const StudentsQr = () => {
  const [students, setStudents] = useState([]);
  const fallbackImage = "/images/noImage.png";

  useEffect(() => {
    API
      .get("/payment/students/Qr")
      .then((res) =>{ 
        setStudents(res.data.students)
        console.log(res.data.students)
      })
      .catch((err) => console.error("Failed to fetch students:", err));
  }, []);

  return (
    <div className="gap-6 p-6" style={{display: "flex", justifyContent: "center", alignItems: "center"}} >
      {students.map((s) => (
        <div
          key={s.student_id}
          style={{height: 400}}
          className="w-64 mt-5 p-3 bg-white rounded-xl shadow-md flex flex-col items-center transform transition-transform hover:scale-105"
        >
          {s.payment_reduction
          ?
            <div style={{backgroundColor: 'red', width: 250, height: 200, marginRight: 7,
              background: 'linear-gradient(to left, rgba(255,0,0,0), rgba(255,0,0,1))'}}></div>
          :
            <div style={{backgroundColor: 'yellow', width: 250, height: 200, marginRight: 7,
              background: 'linear-gradient(to left, rgba(255,0,0,0), rgb(255, 251, 0))'}}></div>
          }
          <img
            src={s.student_image || fallbackImage}
            alt={s.student_name}
            className="w-24 h-24 rounded-full object-cover mb-1 mt-2 border-2 border-gray-200"
          />

          <p className="text-sm text-gray-500 mb-1">ID: {s.student_id}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
            {s.student_name} {s.student_lastname}
          </h3>

          <p className="text-sm text-gray-600 mb-1">
            Niveau: <span className="font-medium text-black-800">{s.niveau_name}</span>
          </p>

          <QRCodeCanvas
            value={JSON.stringify({ student_id: s.student_id })}
            size={120}
            level="H"
            className="mb-3"
          />

          <p className="text-sm text-gray-600 mb-1" style={{width: 190,marginLeft: 5}}>
            Enrollement date: <span className="font-medium text-black-800">{s.payment_date}</span>
          </p>
        </div>
        
      ))}
    </div>
  );
};

export default StudentsQr;