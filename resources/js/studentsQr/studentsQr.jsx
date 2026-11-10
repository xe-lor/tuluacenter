import React, { useState, useEffect, useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import API from "../api.js";
import styles from "../shared.module.css";

const StudentsQr = () => {
  const [students, setStudents] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [matieres, setMatieres] = useState([]);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [exportingId, setExportingId] = useState(null);

  const cardRefs = useRef({});
  const fallbackImage = "/images/noImage.png";

  useEffect(() => {
    API.get("/payment/students/Qr")
      .then((res) => {
        setStudents(res.data.students);
        setNiveaux(res.data.niveaux || []);
        setMatieres(res.data.matieres || []);
      })
      .catch((err) => console.error("Failed to fetch students:", err));
  }, []);

  // Live filtering: runs on every keystroke / filter change
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((s) => {
      if (q) {
        const haystack = `${s.student_name} ${s.student_lastname} ${s.student_id}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (levelFilter && !s.niveaux.some((n) => String(n.id) === levelFilter)) return false;
      if (subjectFilter && !s.matieres.some((m) => String(m.id) === subjectFilter)) return false;
      return true;
    });
  }, [students, search, levelFilter, subjectFilter]);

  const resetFilters = () => {
    setSearch("");
    setLevelFilter("");
    setSubjectFilter("");
  };

  const exportCardPdf = async (student) => {
    const node = cardRefs.current[student.student_id];
    if (!node) return;

    try {
      setExportingId(student.student_id);

      const canvas = await html2canvas(node, {
        scale: 3, // sharper QR + text
        useCORS: true, // needed for student images served from another origin
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");

      // PDF page sized to the card itself (in mm), so no white margins
      const widthMm = 90;
      const heightMm = (canvas.height * widthMm) / canvas.width;

      const pdf = new jsPDF({
        orientation: heightMm > widthMm ? "portrait" : "landscape",
        unit: "mm",
        format: [widthMm, heightMm],
      });

      pdf.addImage(imgData, "PNG", 0, 0, widthMm, heightMm);

      const safeName = `${student.student_name}_${student.student_lastname}`
        .replace(/[^a-z0-9]+/gi, "_")
        .toLowerCase();
      pdf.save(`student_card_${student.student_id}_${safeName}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className={styles.studentsQr_studentsQr_pageContainer}>
      <div className={styles.studentsQr_studentsQr_managementCard}>
        {/* HEADER */}
        <div className={styles.studentsQr_studentsQr_cardHeader}>
          <img
            src="/images/neonImage.png"
            alt=""
            aria-hidden="true"
            className={styles.studentsQr_studentsQr_headerBackground}
          />
          <div className={styles.studentsQr_studentsQr_headerOverlay}></div>

          <div className={styles.studentsQr_studentsQr_headerContent}>
            <span className={styles.studentsQr_studentsQr_headerLabel}>Student Management</span>
            <div>
              <h1 className={styles.studentsQr_studentsQr_headerTitle}>
                <span style={{ color: "#ffc107" }}>Student</span> Cards
              </h1>
            </div>
            <p className={styles.studentsQr_studentsQr_headerSubtitle}>
              Student identification cards with secure QR access.
            </p>
          </div>

          <div className={styles.studentsQr_studentsQr_headerDecoration}>
            <span>QR</span>
            <div />
          </div>
        </div>

        {/* BODY */}
        <div className={styles.studentsQr_studentsQr_contentLayout}>
          <section className={styles.studentsQr_studentsQr_cardsSection}>
            <div className={styles.studentsQr_studentsQr_sectionHeading}>
              <span className={styles.studentsQr_studentsQr_sectionNumber}>01</span>
              <div>
                <span className={styles.studentsQr_studentsQr_sectionLabel}>Cards</span>
                <h2>Student identification</h2>
              </div>
            </div>

            {/* TOOLBAR: search + filters */}
            <div className={styles.studentsQr_studentsQr_toolbar}>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ID"
                aria-label="Search students"
                className={styles.studentsQr_studentsQr_searchInput}
              />

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                aria-label="Filter by level"
                className={styles.studentsQr_studentsQr_filterSelect}
              >
                <option value="">All levels</option>
                {niveaux.map((n) => (
                  <option key={n.id} value={String(n.id)}>
                    {n.name}
                  </option>
                ))}
              </select>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                aria-label="Filter by subject"
                className={styles.studentsQr_studentsQr_filterSelect}
              >
                <option value="">All subjects</option>
                {matieres.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name}
                  </option>
                ))}
              </select>

              {(search || levelFilter || subjectFilter) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className={styles.studentsQr_studentsQr_resetButton}
                >
                  Clear filters
                </button>
              )}

              <span className={styles.studentsQr_studentsQr_resultCount}>
                {filteredStudents.length} of {students.length} students
              </span>
            </div>

            {filteredStudents.length === 0 && students.length > 0 && (
              <p className={styles.studentsQr_studentsQr_emptyState}>
                No students match these filters. Try a different name or clear the filters.
              </p>
            )}

            <div className={styles.studentsQr_studentsQr_cardsGrid}>
              {filteredStudents.map((s) => (
                <div key={s.student_id} className={styles.studentsQr_studentsQr_cardWrapper}>
                  {/* Only this node is captured in the PDF */}
                  <div
                    ref={(el) => (cardRefs.current[s.student_id] = el)}
                    className={`${styles.studentsQr_studentsQr_card} ${
                      s.payment_reduction
                        ? styles.studentsQr_studentsQr_reductionCard
                        : styles.studentsQr_studentsQr_standardCard
                    }`}
                  >
                    <div
                      className={
                        s.payment_reduction
                          ? styles.studentsQr_studentsQr_reductionBanner
                          : styles.studentsQr_studentsQr_standardBanner
                      }
                    >
                      <span>{s.payment_reduction ? "Reduced Payment" : "Student"}</span>
                      <span className={styles.studentsQr_studentsQr_bannerMark}>
                        {String(s.student_id)}
                      </span>
                    </div>

                    <div className={styles.studentsQr_studentsQr_cardContent}>
                      <div className={styles.studentsQr_studentsQr_imageWrapper}>
                        <img
                          src={s.student_image || fallbackImage}
                          alt={s.student_name}
                          crossOrigin="anonymous"
                          className={styles.studentsQr_studentsQr_studentImage}
                        />
                      </div>

                      <p className={styles.studentsQr_studentsQr_studentId}>
                        ID: <span>{s.student_id}</span>
                      </p>

                      <h3 className={styles.studentsQr_studentsQr_studentName}>
                        {s.student_name} {s.student_lastname}
                      </h3>

                      <div className={styles.studentsQr_studentsQr_infoBlock}>
                        <p className={styles.studentsQr_studentsQr_infoLabel}>Level</p>
                        <p className={styles.studentsQr_studentsQr_infoValue}>
                          {s.niveaux.map((n) => n.name).join(", ")}
                        </p>
                      </div>

                      <div className={styles.studentsQr_studentsQr_qrWrapper}>
                        <QRCodeCanvas
                          value={JSON.stringify({ student_id: s.student_id })}
                          size={120}
                          level="H"
                          className={styles.studentsQr_studentsQr_qrCode}
                        />
                      </div>

                      <div className={styles.studentsQr_studentsQr_infoBlock}>
                        <p className={styles.studentsQr_studentsQr_infoLabel}>Enrollment date</p>
                        <p className={styles.studentsQr_studentsQr_infoValue}>{s.payment_date}</p>
                      </div>
                    </div>

                    <div className={styles.studentsQr_studentsQr_cardFooter}>
                      <span>Student Identification</span>
                      <span>TULUA CENTER</span>
                    </div>
                  </div>

                  {/* Outside the captured node so it never appears in the PDF */}
                  <button
                    type="button"
                    onClick={() => exportCardPdf(s)}
                    disabled={exportingId === s.student_id}
                    className={styles.studentsQr_studentsQr_exportButton}
                  >
                    {exportingId === s.student_id ? "Exporting…" : "Export PDF"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentsQr;