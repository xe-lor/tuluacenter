import React, { useEffect, useState } from "react";
import API from "../api.js";
import styles from '../shared.module.css';

export default function StatsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/teacher/stats").then((res) => {
      setData(res.data);
    });
  }, []);

  const renderHeader = () => (
    <div className={styles.teacher_StatsPage_cardHeader}>
      {/* Header background image */}
      <img
        src="/images/neonImage.png"
        alt=""
        className={styles.teacher_StatsPage_headerBackground}
      />

      {/* Dark overlay over the image */}
      <div className={styles.teacher_StatsPage_headerOverlay}></div>

      <div className={styles.teacher_StatsPage_headerContent}>
        <span className={styles.teacher_StatsPage_headerLabel}>ESPACE ENSEIGNANT</span>

        <h1 className={styles.teacher_StatsPage_headerTitle}>Statistiques</h1>

        <p className={styles.teacher_StatsPage_headerSubtitle}>
          Rapport financier de l'année scolaire.
        </p>
      </div>
    </div>
  );

  if (!data) {
    return (
      <div className={styles.teacher_StatsPage_pageContainer}>
        <div className={styles.teacher_StatsPage_managementCard}>
          {renderHeader()}

          <div className={styles.teacher_StatsPage_cardBody}>
            <div className={styles.teacher_StatsPage_emptyState}>
              <span className={styles.teacher_StatsPage_emptyAccent}></span>
              <span className={styles.teacher_StatsPage_emptyTitle}>
                Chargement des données
              </span>
              <span className={styles.teacher_StatsPage_emptySubtitle}>
                Veuillez patienter...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.teacher_StatsPage_pageContainer}>
      <div className={styles.teacher_StatsPage_managementCard}>
        {renderHeader()}

        <div className={styles.teacher_StatsPage_cardBody}>
          {/* Monthly section */}
          <section className={styles.teacher_StatsPage_section}>
            <div className={styles.teacher_StatsPage_sectionHeading}>
              <div className={styles.teacher_StatsPage_sectionLeft}>
                <span className={styles.teacher_StatsPage_sectionNumber}>01</span>

                <div>
                  <span className={styles.teacher_StatsPage_sectionLabel}>APERÇU</span>
                  <h2 className={styles.teacher_StatsPage_sectionTitle}>
                    Statistiques mensuelles
                  </h2>
                </div>
              </div>

              <span className={styles.teacher_StatsPage_sectionDescription}>
                ÉVOLUTION DES REVENUS ET DES EFFECTIFS
              </span>
            </div>

            <div className={styles.teacher_StatsPage_tableContainer}>
              <table className={styles.teacher_StatsPage_table}>
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th>Élèves</th>
                    <th>Total</th>
                    <th>Nette</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(data.orderedMonths).map(([num, name]) => {
                    const m = data.monthlyStats[name] || {};

                    return (
                      <tr key={num} className={styles.teacher_StatsPage_dataRow}>
                        <td>
                          <span className={styles.teacher_StatsPage_nameText}>{name}</span>
                        </td>
                        <td>{m.student_count || 0}</td>
                        <td>{m.total_price || 0} DH</td>
                        <td>
                          <span className={styles.teacher_StatsPage_netValue}>
                            {m.nette || 0} DH
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Class section */}
          <section className={styles.teacher_StatsPage_section}>
            <div className={styles.teacher_StatsPage_sectionHeading}>
              <div className={styles.teacher_StatsPage_sectionLeft}>
                <span className={styles.teacher_StatsPage_sectionNumber}>02</span>

                <div>
                  <span className={styles.teacher_StatsPage_sectionLabel}>RÉPARTITION</span>
                  <h2 className={styles.teacher_StatsPage_sectionTitle}>Résumé par classe</h2>
                </div>
              </div>

              <span className={styles.teacher_StatsPage_sectionDescription}>
                DÉTAIL PAR MATIÈRE ET NIVEAU
              </span>
            </div>

            <div className={styles.teacher_StatsPage_tableContainer}>
              <table className={styles.teacher_StatsPage_table}>
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Niveau</th>
                    <th>Élèves</th>
                    <th>Total</th>
                    <th>Nette</th>
                  </tr>
                </thead>

                <tbody>
                  {data.classStats.length > 0 ? (
                    data.classStats.map((c, i) => (
                      <tr key={i} className={styles.teacher_StatsPage_dataRow}>
                        <td>
                          <span className={styles.teacher_StatsPage_nameText}>
                            {c.matiere_name}
                          </span>
                        </td>
                        <td>{c.niveau_name}</td>
                        <td>{c.student_count}</td>
                        <td>{c.total_price} DH</td>
                        <td>
                          <span className={styles.teacher_StatsPage_netValue}>
                            {c.nette} DH
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className={styles.teacher_StatsPage_emptyRow}>
                      <td colSpan="5">
                        <div className={styles.teacher_StatsPage_emptyState}>
                          <span className={styles.teacher_StatsPage_emptyAccent}></span>
                          <span className={styles.teacher_StatsPage_emptyTitle}>
                            Aucune donnée
                          </span>
                          <span className={styles.teacher_StatsPage_emptySubtitle}>
                            Aucune classe à afficher pour le moment.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr className={styles.teacher_StatsPage_footRow}>
                    <td colSpan="4">
                      <span className={styles.teacher_StatsPage_totalLabel}>TOTAL NETTE</span>
                    </td>

                    <td>
                      <span className={styles.teacher_StatsPage_grandTotal}>
                        {data.totalNet} DH
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