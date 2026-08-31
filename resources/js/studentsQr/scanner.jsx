import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../api.js";
import styles from "./scanner.module.css";

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
    <div className={styles.scannerPage}>
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className={styles.scannerHeader}>
        <span className={styles.eyebrow}>
          STUDENT MANAGEMENT
        </span>

        <h2 className={styles.title}>
          QR <span>SCANNER</span>
        </h2>

        <div className={styles.headerRule}></div>
      </div>

      {/* =====================================================
          START SCREEN
          ===================================================== */}

      {!studentData && !scannerActive && (
        <div className={styles.scannerStart}>
          <div className={styles.scannerStartNumber}>
            01
          </div>

          <div className={styles.scannerStartContent}>
            <span className={styles.eyebrow}>
              IDENTIFICATION SYSTEM
            </span>

            <h3>READY TO SCAN</h3>

            <p>
              Activate the camera and position the student's QR
              code inside the scanning frame.
            </p>

            <button
              type="button"
              className={styles.startButton}
              onClick={handleStartScanner}
            >
              <span>START SCANNER</span>
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          CAMERA / SCANNER
          ===================================================== */}

      {!studentData && scannerActive && (
        <div className={styles.scannerSection}>
          <div className={styles.scannerLabel}>
            <span>01</span>

            <p>SCAN STUDENT IDENTIFICATION</p>
          </div>

          <div className={styles.scannerViewport}>
            <div
              id="qr-reader"
              ref={qrRef}
              className={styles.qrReader}
            />

            <div className={styles.scanFrame}>
              <span
                className={styles.cornerTopLeft}
              ></span>

              <span
                className={styles.cornerTopRight}
              ></span>

              <span
                className={styles.cornerBottomLeft}
              ></span>

              <span
                className={styles.cornerBottomRight}
              ></span>

              <span className={styles.scanLine}></span>
            </div>
          </div>

          <div className={styles.scannerHint}>
            Position the student's QR code inside the scanning
            frame
          </div>

          <button
            type="button"
            className={styles.cancelButton}
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
        <div className={styles.loading}>
          <span className={styles.loadingLine}></span>

          <p>LOADING STUDENT DATA...</p>
        </div>
      )}

      {/* =====================================================
          STUDENT RESULT
          ===================================================== */}

      {studentData && (
        <div className={styles.studentResult}>
          {/* RESULT HEADER */}

          <div className={styles.resultHeader}>
            <div>
              <span className={styles.eyebrow}>
                STUDENT RECORD
              </span>

              <h3 className={styles.studentName}>
                {studentData.student_name}{" "}
                {studentData.student_lastname}
              </h3>

              <div className={styles.nameRule}></div>
            </div>

            <div
              className={`${styles.globalStatus} ${
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

          <div className={styles.studentContent}>
            {/* IMAGE */}

            <div className={styles.imageColumn}>
              {studentData.student_image ? (
                <div className={styles.imageFrame}>
                  <img
                    src={studentData.student_image}
                    alt="Student"
                    className={styles.studentImage}
                  />

                  <div
                    className={styles.imageOverlay}
                  ></div>

                  <span className={styles.imageNumber}>
                    01
                  </span>
                </div>
              ) : (
                <div className={styles.noImage}>
                  <span>NO IMAGE</span>
                </div>
              )}
            </div>

            {/* CLASSES */}

            <div className={styles.classesColumn}>
              <div className={styles.sectionHeading}>
                <span>02</span>

                <h4>ENROLLED CLASSES</h4>
              </div>

              <div className={styles.classesList}>
                {studentData.payments.map((cls) => (
                  <div
                    key={cls.class_id}
                    className={styles.classBlock}
                  >
                    <div className={styles.classHeader}>
                      <strong>
                        {cls.class_name}
                      </strong>

                      <span>
                        {cls.class_niveau}
                      </span>
                    </div>

                    <ul className={styles.monthList}>
                      {cls.months.map((m) => (
                        <li
                          key={m.month}
                          className={styles.monthItem}
                        >
                          <span
                            className={
                              styles.monthNumber
                            }
                          >
                            {String(m.month).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <span
                            className={
                              styles.monthName
                            }
                          >
                            MONTH
                          </span>

                          <span
                            className={`${
                              styles.paymentStatus
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
                              styles.paymentPrice
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

          <div className={styles.resultFooter}>
            <button
              type="button"
              className={styles.scanButton}
              onClick={handleScanNext}
            >
              <span>SCAN NEXT STUDENT</span>

              <span className={styles.buttonArrow}>
                →
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;