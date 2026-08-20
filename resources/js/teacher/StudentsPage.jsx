import React, { useEffect, useState } from "react";
import axios from "axios";
import API from '../api.js';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    class_id: "",
    month: "",
    status: "",
    search: "",
  });

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalNette, setTotalNette] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [filters]);

  const fetchData = async () => {
    const res = await API.get("/teacher/students", {
      params: filters,
    });

    setStudents(res.data.students);
    setClasses(res.data.classes);
    setTotalStudents(res.data.totalStudents);
    setTotalNette(res.data.totalNette);
  };

  return (
    <div className="container my-5">
      <h2>Liste des élèves affectés</h2>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            onChange={(e) =>
              setFilters({ ...filters, class_id: e.target.value })
            }
          >
            <option value="">Toutes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.matiere} - {c.niveau}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            onChange={(e) =>
              setFilters({ ...filters, month: e.target.value })
            }
          >
            <option value="">Tous</option>
            {[9,10,11,12,1,2,3,4,5,6].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="">Tous</option>
            <option value="payé">Payé</option>
            <option value="impayé">Impayé</option>
            <option value="annulé">Annulé</option>
          </select>
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Search..."
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
        </div>
      </div>

      {/* Table */}
      <table className="table table-dark table-bordered text-center">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Téléphone</th>
            <th>Date</th>
            <th>Statut</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.student_id}>
              <td>{s.student_id}</td>
              <td>{s.name}</td>
              <td>{s.lastname}</td>
              <td>{s.studentphone}</td>
              <td>{s.payment_date}</td>
              <td>
                <span className={`badge ${s.status_class}`}>
                  {s.status_label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan="6">
              Total: {totalStudents} | Nette: {totalNette} DH
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}