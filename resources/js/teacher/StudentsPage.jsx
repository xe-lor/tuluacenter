import React, { useEffect, useState } from "react";
import API from "../api.js";
import "./students.css";

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
    <div className="students-page">

      {/* HEADER */}
      <header className="students-header">
        <div>
          <span className="students-eyebrow">
            ESPACE ENSEIGNANT / ARCHIVES
          </span>

          <h1>Élèves</h1>

          <div className="students-gold-line"></div>
        </div>

        <div className="students-header-info">
          <span>REGISTRE ACADÉMIQUE</span>
          <strong>ÉLÈVES AFFECTÉS</strong>
        </div>
      </header>

      {/* FILTER AREA */}
      <section className="student-filters-section">

        <div className="filter-title">
          <span>01</span>
          <div>
            <small>RECHERCHE & FILTRAGE</small>
            <h2>Affiner les résultats</h2>
          </div>
        </div>

        <div className="student-filters">

          <div className="cinematic-field">
            <label>CLASSE</label>

            <select
              value={filters.class_id}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  class_id: e.target.value,
                })
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

          <div className="cinematic-field">
            <label>MOIS</label>

            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  month: e.target.value,
                })
              }
            >
              <option value="">Tous</option>

              {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="cinematic-field">
            <label>STATUT</label>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value,
                })
              }
            >
              <option value="">Tous</option>
              <option value="payé">Payé</option>
              <option value="impayé">Impayé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>

          <div className="cinematic-field search-field">
            <label>RECHERCHER</label>

            <input
              type="text"
              value={filters.search}
              placeholder="Nom ou prénom..."
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />
          </div>

        </div>
      </section>

      {/* RECORDS */}
      <section className="students-records">

        <div className="records-heading">
          <div>
            <span className="records-number">02</span>

            <div>
              <span className="records-label">
                LISTE DES INSCRIPTIONS
              </span>

              <h2>Élèves affectés</h2>
            </div>
          </div>

          <div className="records-count">
            <strong>{totalStudents}</strong>
            <span>ÉLÈVES</span>
          </div>
        </div>

        <div className="students-table-wrapper">

          <table className="students-table">

            <thead>
              <tr>
                <th>ID</th>
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

                  <td className="student-id">
                    #{s.student_id}
                  </td>

                  <td className="student-name">
                    {s.name}
                  </td>

                  <td>
                    {s.lastname}
                  </td>

                  <td>
                    {s.studentphone}
                  </td>

                  <td>
                    {s.payment_date}
                  </td>

                  <td>
                    <span
                      className={`student-status ${s.status_class}`}
                    >
                      {s.status_label}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="5">
                  <span className="footer-total-label">
                    TOTAL NETTE
                  </span>
                </td>

                <td className="footer-total">
                  {totalNette} DH
                </td>
              </tr>
            </tfoot>

          </table>

        </div>
      </section>
    </div>
  );
}