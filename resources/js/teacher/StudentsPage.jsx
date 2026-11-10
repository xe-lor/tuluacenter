import React, { useEffect, useState } from "react";
import API from "../api.js";
import styles from '../shared.module.css';

const getStatusClass = (statusClass = "") => {
  const c = String(statusClass).toLowerCase();

  if (c.includes("success") || c.includes("paye")) return styles.teacher_StudentsPage_statusPaid;
  if (c.includes("danger") || c.includes("impaye")) return styles.teacher_StudentsPage_statusUnpaid;
  if (c.includes("secondary") || c.includes("annule")) {
    return styles.teacher_StudentsPage_statusCancelled;
  }

  return "";
};

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
    <div className={styles.teacher_StudentsPage_pageContainer}>
      <div className={styles.teacher_StudentsPage_managementCard}>
        {/* HEADER */}
        <div className={styles.teacher_StudentsPage_cardHeader}>
          {/* Header background image */}
          <img
            src="/images/neonImage.png"
            alt=""
            className={styles.teacher_StudentsPage_headerBackground}
          />

          {/* Dark overlay over the image */}
          <div className={styles.teacher_StudentsPage_headerOverlay}></div>

          <div className={styles.teacher_StudentsPage_headerContent}>
            <span className={styles.teacher_StudentsPage_headerLabel}>
              ESPACE ENSEIGNANT / ARCHIVES
            </span>

            <h1 className={styles.teacher_StudentsPage_headerTitle}>Élèves</h1>

            <p className={styles.teacher_StudentsPage_headerSubtitle}>
              Registre académique des élèves affectés.
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className={styles.teacher_StudentsPage_cardBody}>
          {/* FILTER AREA */}
          <section className={styles.teacher_StudentsPage_section}>
            <div className={styles.teacher_StudentsPage_sectionHeading}>
              <div className={styles.teacher_StudentsPage_sectionLeft}>
                <span className={styles.teacher_StudentsPage_sectionNumber}>01</span>

                <div>
                  <span className={styles.teacher_StudentsPage_sectionLabel}>
                    RECHERCHE & FILTRAGE
                  </span>
                  <h2 className={styles.teacher_StudentsPage_sectionTitle}>
                    Affiner les résultats
                  </h2>
                </div>
              </div>
            </div>

            <div className={styles.teacher_StudentsPage_filters}>
              <div className={styles.teacher_StudentsPage_field}>
                <label className={styles.teacher_StudentsPage_fieldLabel}>CLASSE</label>

                <select
                  className={styles.teacher_StudentsPage_tableInput}
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

              <div className={styles.teacher_StudentsPage_field}>
                <label className={styles.teacher_StudentsPage_fieldLabel}>MOIS</label>

                <select
                  className={styles.teacher_StudentsPage_tableInput}
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

              <div className={styles.teacher_StudentsPage_field}>
                <label className={styles.teacher_StudentsPage_fieldLabel}>STATUT</label>

                <select
                  className={styles.teacher_StudentsPage_tableInput}
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

              <div className={styles.teacher_StudentsPage_field}>
                <label className={styles.teacher_StudentsPage_fieldLabel}>RECHERCHER</label>

                <input
                  type="text"
                  className={styles.teacher_StudentsPage_tableInput}
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
          <section className={styles.teacher_StudentsPage_section}>
            <div className={styles.teacher_StudentsPage_sectionHeading}>
              <div className={styles.teacher_StudentsPage_sectionLeft}>
                <span className={styles.teacher_StudentsPage_sectionNumber}>02</span>

                <div>
                  <span className={styles.teacher_StudentsPage_sectionLabel}>
                    LISTE DES INSCRIPTIONS
                  </span>
                  <h2 className={styles.teacher_StudentsPage_sectionTitle}>Élèves affectés</h2>
                </div>
              </div>

              <div className={styles.teacher_StudentsPage_recordsCount}>
                <strong>{totalStudents}</strong>
                <span>ÉLÈVES</span>
              </div>
            </div>

            <div className={styles.teacher_StudentsPage_tableContainer}>
              <table className={styles.teacher_StudentsPage_table}>
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
                  {students.length > 0 ? (
                    students.map((s) => (
                      <tr key={s.student_id} className={styles.teacher_StudentsPage_dataRow}>
                        <td>
                          <span className={styles.teacher_StudentsPage_idNumber}>
                            #{s.student_id}
                          </span>
                        </td>

                        <td>
                          <span className={styles.teacher_StudentsPage_nameText}>{s.name}</span>
                        </td>

                        <td>{s.lastname}</td>

                        <td>{s.studentphone}</td>

                        <td>{s.payment_date}</td>

                        <td>
                          <span
                            className={`${styles.teacher_StudentsPage_statusBadge} ${getStatusClass(
                              s.status_class
                            )}`}
                          >
                            {s.status_label}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className={styles.teacher_StudentsPage_emptyRow}>
                      <td colSpan="6">
                        <div className={styles.teacher_StudentsPage_emptyState}>
                          <span className={styles.teacher_StudentsPage_emptyAccent}></span>

                          <span className={styles.teacher_StudentsPage_emptyTitle}>
                            Aucun élève trouvé
                          </span>

                          <span className={styles.teacher_StudentsPage_emptySubtitle}>
                            Modifiez les filtres pour afficher des résultats.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr className={styles.teacher_StudentsPage_footRow}>
                    <td colSpan="5">
                      <span className={styles.teacher_StudentsPage_totalLabel}>TOTAL NETTE</span>
                    </td>

                    <td>
                      <span className={styles.teacher_StudentsPage_grandTotal}>
                        {totalNette} DH
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}