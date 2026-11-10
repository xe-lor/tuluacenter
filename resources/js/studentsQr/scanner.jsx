import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../api.js";
import styles from '../shared.module.css';

const Scanner = () => {
  const [studentData, setStudentData] = useState(null);
  const [globalStatus, setGlobalStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const lastScanRef = useRef("");

  useEffect(() => {
    if (!scannerActive || !qrRef.current || studentData) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: {
        width: 300,
        height: 300,
      },
      aspectRatio: 1,
    };

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras || cameras.length === 0) {
          console.error("No cameras found");
          setScannerActive(false);
          return;
        }

        const backCamera = cameras.find(
          (cam) =>
            cam.label.toLowerCase().includes("back") ||
            cam.label.toLowerCase().includes("environment")
        );

        const cameraId = backCamera ? backCamera.id : cameras[0].id;

        html5QrCode
          .start(
            cameraId,
            config,
            async (decodedText) => {
              if (
                !decodedText ||
                decodedText === lastScanRef.current
              ) {
                return;
              }

              lastScanRef.current = decodedText;

              console.log("QR scanned:", decodedText);

              let qrData;

              try {
                qrData = JSON.parse(decodedText);
              } catch {
                qrData = { student_id: decodedText };
              }

              const student_id = qrData.student_id;

              if (!student_id) {
                console.log("No student_id found in QR code");
                return;
              }

              setLoading(true);

              try {
                const res = await API.post(
                  `/payment/students/details/${student_id}`
                );

                const student = res.data.student;
                const payments = res.data.payments;

                if (!student) {
                  console.log("No student found");
                  return;
                }

                let global = "unknown";

                if (!payments || payments.length === 0) {
                  global = "no data";
                } else {
                  const states = payments.flatMap((cls) =>
                    cls.months.map((m) => m.status)
                  );

                  if (states.length === 0) {
                    global = "no data";
                  } else if (
                    states.every((s) => s === "canceled")
                  ) {
                    global = "canceled";
                  } else if (states.includes("impaye")) {
                    global = "impaye";
                  } else if (
                    states.every(
                      (s) => s === "paye" || s === "canceled"
                    )
                  ) {
                    global = "paye";
                  }
                }

                setGlobalStatus(global);

                setStudentData({
                  ...student,
                  payments,
                });

                try {
                  if (html5QrCode.isScanning) {
                    await html5QrCode.stop();
                  }
                } catch (stopError) {
                  console.error(
                    "Error stopping scanner after scan:",
                    stopError
                  );
                }

                html5QrCodeRef.current = null;
                setScannerActive(false);
              } catch (err) {
                console.error(
                  "Error fetching student:",
                  err.response || err.message || err
                );

                // Allow another scan after an API error
                lastScanRef.current = "";
              } finally {
                setLoading(false);
              }
            },
            () => {}
          )
          .catch((err) => {
            console.error("Failed to start QR scanner:", err);
            html5QrCodeRef.current = null;
            setScannerActive(false);
          });
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        html5QrCodeRef.current = null;
        setScannerActive(false);
      });

    return () => {
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch((err) => {
            console.error("Scanner cleanup error:", err);
          });
        }

        if (html5QrCodeRef.current === html5QrCode) {
          html5QrCodeRef.current = null;
        }
      }
    };
  }, [scannerActive, studentData]);

  const handleStartScanner = () => {
    lastScanRef.current = "";
    setLoading(false);
    setScannerActive(true);
  };

  const handleCancelScanning = async () => {
    const scanner = html5QrCodeRef.current;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }

    html5QrCodeRef.current = null;
    lastScanRef.current = "";

    setLoading(false);
    setScannerActive(false);
  };

  const handleScanNext = () => {
    setStudentData(null);
    setGlobalStatus("");
    lastScanRef.current = "";
    setLoading(false);
    setScannerActive(false);
  };

   return (
    <div className={styles.studentsQr_scanner_pageContainer}>
      <div className={styles.studentsQr_scanner_managementCard}>
        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className={styles.studentsQr_scanner_cardHeader}>
          {/* Header background image */}
          <img
            src="/images/neonImage.png"
            alt=""
            aria-hidden="true"
            className={styles.studentsQr_scanner_headerBackground}
          />

          {/* Dark overlay over the image */}
          <div className={styles.studentsQr_scanner_headerOverlay}></div>

          <div className={styles.studentsQr_scanner_headerContent}>
            <span className={styles.studentsQr_scanner_headerLabel}>
              STUDENT MANAGEMENT
            </span>

            <h2 className={styles.studentsQr_scanner_headerTitle}>
              QR <span>SCANNER</span>
            </h2>

            <p className={styles.studentsQr_scanner_headerSubtitle}>
              Scan a student's QR code to check their enrollment and
              payment status.
            </p>
          </div>
        </div>

        {/* =====================================================
            BODY
            ===================================================== */}

        <div className={styles.studentsQr_scanner_contentLayout}>
          {/* =====================================================
              START SCREEN
              ===================================================== */}

          {!studentData && !scannerActive && (
            <div className={styles.studentsQr_scanner_scannerStart}>
              <div className={styles.studentsQr_scanner_scannerStartNumber}>
                01
              </div>

              <div className={styles.studentsQr_scanner_scannerStartContent}>
                <span className={styles.studentsQr_scanner_eyebrow}>
                  IDENTIFICATION SYSTEM
                </span>

                <h3>READY TO SCAN</h3>

                <p>
                  Activate the camera and position the student's QR
                  code inside the scanning frame.
                </p>

                <button
                  type="button"
                  className={styles.studentsQr_scanner_startButton}
                  onClick={handleStartScanner}
                >
                  <span>START SCANNER</span>
                  <span className={styles.studentsQr_scanner_buttonArrow}>→</span>
                </button>
              </div>
            </div>
          )}

          {/* =====================================================
              CAMERA / SCANNER
              ===================================================== */}

          {!studentData && scannerActive && (
            <div className={styles.studentsQr_scanner_scannerSection}>
              <div className={styles.studentsQr_scanner_scannerLabel}>
                <span>01</span>

                <p>SCAN STUDENT IDENTIFICATION</p>
              </div>

              <div className={styles.studentsQr_scanner_scannerViewport}>
                <div
                  id="qr-reader"
                  ref={qrRef}
                  className={styles.studentsQr_scanner_qrReader}
                />

                <div className={styles.studentsQr_scanner_scanFrame}>
                  <span
                    className={styles.studentsQr_scanner_cornerTopLeft}
                  ></span>

                  <span
                    className={styles.studentsQr_scanner_cornerTopRight}
                  ></span>

                  <span
                    className={styles.studentsQr_scanner_cornerBottomLeft}
                  ></span>

                  <span
                    className={styles.studentsQr_scanner_cornerBottomRight}
                  ></span>

                  <span className={styles.studentsQr_scanner_scanLine}></span>
                </div>
              </div>

              <div className={styles.studentsQr_scanner_scannerHint}>
                Position the student's QR code inside the scanning
                frame
              </div>

              <button
                type="button"
                className={styles.studentsQr_scanner_cancelButton}
                onClick={handleCancelScanning}
              >
                <span>✕</span>
                <span>CANCEL SCANNING</span>
              </button>
            </div>
          )}

          {/* =====================================================
              LOADING
              ===================================================== */}

          {loading && (
            <div className={styles.studentsQr_scanner_loading}>
              <span className={styles.studentsQr_scanner_loadingLine}></span>

              <p>LOADING STUDENT DATA...</p>
            </div>
          )}

          {/* =====================================================
              STUDENT RESULT
              ===================================================== */}

          {studentData && (
            <div className={styles.studentsQr_scanner_studentResult}>
              {/* RESULT HEADER */}

              <div className={styles.studentsQr_scanner_resultHeader}>
                <div>
                  <span className={styles.studentsQr_scanner_eyebrow}>
                    STUDENT RECORD
                  </span>

                  <h3 className={styles.studentsQr_scanner_studentName}>
                    {studentData.student_name}{" "}
                    {studentData.student_lastname}
                  </h3>

                  <div className={styles.studentsQr_scanner_nameRule}></div>
                </div>

                <div
                  className={`${styles.studentsQr_scanner_globalStatus} ${
                    styles[
                      globalStatus.replace(/\s+/g, "-")
                    ]
                  }`}
                >
                  <span>GLOBAL STATUS</span>

                  <strong>{globalStatus}</strong>
                </div>
              </div>

              {/* STUDENT CONTENT */}

              <div className={styles.studentsQr_scanner_studentContent}>
                {/* IMAGE */}

                <div className={styles.studentsQr_scanner_imageColumn}>
                  {studentData.student_image ? (
                    <div className={styles.studentsQr_scanner_imageFrame}>
                      <img
                        src={studentData.student_image}
                        alt="Student"
                        className={styles.studentsQr_scanner_studentImage}
                      />

                      <div
                        className={styles.studentsQr_scanner_imageOverlay}
                      ></div>

                      <span className={styles.studentsQr_scanner_imageNumber}>
                        01
                      </span>
                    </div>
                  ) : (
                    <div className={styles.studentsQr_scanner_noImage}>
                      <span>NO IMAGE</span>
                    </div>
                  )}
                </div>

                {/* CLASSES */}

                <div className={styles.studentsQr_scanner_classesColumn}>
                  <div className={styles.studentsQr_scanner_sectionHeading}>
                    <span className={styles.studentsQr_scanner_sectionNumber}>02</span>

                    <div>
                      <span className={styles.studentsQr_scanner_sectionLabel}>
                        Payments
                      </span>

                      <h4>ENROLLED CLASSES</h4>
                    </div>
                  </div>

                  <div className={styles.studentsQr_scanner_classesList}>
                    {studentData.payments.map((cls) => (
                      <div
                        key={cls.class_id}
                        className={styles.studentsQr_scanner_classBlock}
                      >
                        <div className={styles.studentsQr_scanner_classHeader}>
                          <strong>
                            {cls.class_name}
                          </strong>

                          <span>
                            {cls.class_niveau}
                          </span>
                        </div>

                        <ul className={styles.studentsQr_scanner_monthList}>
                          {cls.months.map((m) => (
                            <li
                              key={m.month}
                              className={styles.studentsQr_scanner_monthItem}
                            >
                              <span
                                className={
                                  styles.studentsQr_scanner_monthNumber
                                }
                              >
                                {String(m.month).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <span
                                className={
                                  styles.studentsQr_scanner_monthName
                                }
                              >
                                MONTH
                              </span>

                              <span
                                className={`${
                                  styles.studentsQr_scanner_paymentStatus
                                } ${
                                  styles[
                                    m.status
                                      ?.toLowerCase()
                                      .replace(
                                        /\s+/g,
                                        "-"
                                      )
                                  ]
                                }`}
                              >
                                {m.status}
                              </span>

                              <span
                                className={
                                  styles.studentsQr_scanner_paymentPrice
                                }
                              >
                                {m.payment_price} DH
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RESULT FOOTER */}

              <div className={styles.studentsQr_scanner_resultFooter}>
                <button
                  type="button"
                  className={styles.studentsQr_scanner_scanButton}
                  onClick={handleScanNext}
                >
                  <span>SCAN NEXT STUDENT</span>

                  <span className={styles.studentsQr_scanner_buttonArrow}>
                    →
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;