import React, { useEffect, useState } from "react";
import axios from "axios";
import API from '../api.js';

export default function StatsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/teacher/stats").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="container mb-5" style={{margin: 100}}>
      <h2>Statistiques mensuelles</h2>

      <table className="table table-bordered table-dark text-center">
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
                <td>{name}</td>
                <td>{m.student_count || 0}</td>
                <td>{m.total_price || 0}</td>
                <td>{m.nette || 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 className="mt-5">Résumé par classe</h2>

      <table className="table table-bordered table-dark text-center">
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
              <td>{c.matiere_name}</td>
              <td>{c.niveau_name}</td>
              <td>{c.student_count}</td>
              <td>{c.total_price}</td>
              <td>{c.nette}</td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan="4">Total NETTE</td>
            <td>{data.totalNet}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}