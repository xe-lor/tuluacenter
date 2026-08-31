import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import API from "../api.js";
import styles from "./studentsQr.module.css";

const StudentsQr = () => {
  const [students, setStudents] = useState([]);
  const fallbackImage = "/images/noImage.png";

  useEffect(() => {
    API
      .get("/payment/students/Qr")
      .then((res) => {
        setStudents(res.data.students);
        console.log(res.data.students);
      })
      .catch((err) => console.error("Failed to fetch students:", err));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Student Management</span>

          <div><h1 className={styles.title}><span style={{color: '#ffc107'}}>Student</span> Cards</h1></div>

          <p className={styles.subtitle}>
            Student identification cards with secure QR access.
          </p>
        </div>

        <div className={styles.headerDecoration}>
          <span>QR</span>
          <div />
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {students.map((s) => (
          <div
            key={s.student_id}
            className={`${styles.card} ${
              s.payment_reduction
                ? styles.reductionCard
                : styles.standardCard
            }`}
          >
            <div
              className={
                s.payment_reduction
                  ? styles.reductionBanner
                  : styles.standardBanner
              }
            >
              <span>
                {s.payment_reduction ? "Reduced Payment" : "Student"}
              </span>

              <span className={styles.bannerMark}>
                {String(s.student_id).padStart(3, "0")}
              </span>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.imageWrapper}>
                <img
                  src={s.student_image || fallbackImage}
                  alt={s.student_name}
                  className={styles.studentImage}
                />
              </div>

              <p className={styles.studentId}>
                ID: <span>{s.student_id}</span>
              </p>

              <h3 className={styles.studentName}>
                {s.student_name} {s.student_lastname}
              </h3>

              <div className={styles.infoBlock}>
                <p className={styles.infoLabel}>Niveau</p>
                <p className={styles.infoValue}>
                  {s.niveau_name}
                </p>
              </div>

              <div className={styles.qrWrapper}>
                <QRCodeCanvas
                  value={JSON.stringify({
                    student_id: s.student_id,
                  })}
                  size={120}
                  level="H"
                  className={styles.qrCode}
                />
              </div>

              <div className={styles.infoBlock}>
                <p className={styles.infoLabel}>Enrollement date</p>
                <p className={styles.infoValue}>
                  {s.payment_date}
                </p>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span>Student Identification</span>
              <span>TULUA CENTER</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsQr;