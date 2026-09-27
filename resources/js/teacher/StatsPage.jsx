import React, { useEffect, useState } from "react";
import API from "../api.js";
import "./stats.css";

export default function StatsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/teacher/stats").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) {
    return (
      <div className="stats-page stats-loading">
        <span>CHARGEMENT DES DONNÉES</span>
      </div>
    );
  }

  return (
    <div className="stats-page">
      {/* Header */}
      <header className="stats-header">
        <div>
          <span className="stats-eyebrow">ESPACE ENSEIGNANT</span>
          <h1>Statistiques</h1>
          <div className="gold-line"></div>
        </div>

        <div className="stats-header-meta">
          <span>RAPPORT FINANCIER</span>
          <strong>ANNÉE SCOLAIRE</strong>
        </div>
      </header>

      {/* Monthly section */}
      <section className="stats-section">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <div>
              <span className="section-label">APERÇU</span>
              <h2>Statistiques mensuelles</h2>
            </div>
          </div>

          <span className="section-description">
            ÉVOLUTION DES REVENUS ET DES EFFECTIFS
          </span>
        </div>

        <div className="table-wrapper">
          <table className="cinematic-table">
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
                  <tr key={num}>
                    <td className="month-name">{name}</td>
                    <td>{m.student_count || 0}</td>
                    <td>{m.total_price || 0} DH</td>
                    <td className="net-value">
                      {m.nette || 0} DH
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Class section */}
      <section className="stats-section class-section">
        <div className="section-heading">
          <div>
            <span className="section-number">02</span>
            <div>
              <span className="section-label">RÉPARTITION</span>
              <h2>Résumé par classe</h2>
            </div>
          </div>

          <span className="section-description">
            DÉTAIL PAR MATIÈRE ET NIVEAU
          </span>
        </div>

        <div className="table-wrapper">
          <table className="cinematic-table">
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
              {data.classStats.map((c, i) => (
                <tr key={i}>
                  <td className="subject-name">
                    {c.matiere_name}
                  </td>
                  <td>{c.niveau_name}</td>
                  <td>{c.student_count}</td>
                  <td>{c.total_price} DH</td>
                  <td className="net-value">
                    {c.nette} DH
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="4">
                  <span className="total-label">TOTAL NETTE</span>
                </td>

                <td className="grand-total">
                  {data.totalNet} DH
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}