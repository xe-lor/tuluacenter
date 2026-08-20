import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import API from '../api.js';

const Scanner = () => {
  const [studentData, setStudentData] = useState(null);
  const [globalStatus, setGlobalStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const lastScanRef = useRef("");

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((cameras) => console.log("Available cameras:", cameras))
      .catch((err) => console.error("Camera error:", err));
  }, []);

  useEffect(() => {
    if (!qrRef.current || studentData) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 350, height: 350 },
    };

    // ✅ FIX: use camera ID instead of facingMode
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras || cameras.length === 0) {
          console.error("No cameras found");
          return;
        }

        const backCamera = cameras.find((cam) =>
          cam.label.toLowerCase().includes("back") ||
          cam.label.toLowerCase().includes("environment")
        );

        const cameraId = backCamera ? backCamera.id : cameras[0].id;

        html5QrCode
          .start(
            cameraId,
            config,
            async (decodedText) => {
              if (!decodedText || decodedText === lastScanRef.current) return;

              lastScanRef.current = decodedText;
              console.log("QR scanned:", decodedText);

              let qrData;
              try {
                qrData = JSON.parse(decodedText);
              } catch {
                qrData = { student_id: decodedText };
              }

              const student_id = qrData.student_id;
              if (!student_id) return;

              setLoading(true);

              try {
                const res = await API.post(
                  `/payment/students/details/${student_id}`
                );

                const student = res.data.student;
                const payments = res.data.payments;

                if (!student) {
                  console.log("No student found");
                  setLoading(false);
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
                  } else if (states.every((s) => s === "canceled")) {
                    global = "canceled";
                  } else if (states.includes("impaye")) {
                    global = "impaye";
                  } else if (
                    states.every((s) => s === "paye" || s === "canceled")
                  ) {
                    global = "paye";
                  }
                }

                setGlobalStatus(global);
                setStudentData({
                  ...student,
                  payments,
                });

                html5QrCode.stop().catch(() => {});
              } catch (err) {
                console.error(
                  "Error fetching student:",
                  err.response || err.message || err
                );
              } finally {
                setLoading(false);
              }
            },
            () => {}
          )
          .catch((err) => {
            console.error("Failed to start QR scanner:", err);
          });
      })
      .catch((err) => {
        console.error("Camera access error:", err);
      });

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [studentData]);

  const handleScanNext = () => {
    setStudentData(null);
    setGlobalStatus("");
    lastScanRef.current = "";
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>QR Scanner</h2>

      {!studentData && (
        <div
          id="qr-reader"
          ref={qrRef}
          style={{
            width: "400px",
            margin: "auto",
            border: "2px solid red",
          }}
        />
      )}

      {loading && <p>Loading student data...</p>}

      {studentData && (
        <div style={{ marginTop: 20 }}>
          <h3>
            {studentData.student_name} {studentData.student_lastname}
          </h3>

          {studentData.student_image && (
            <img
              src={studentData.student_image}
              alt="Student"
              width={100}
            />
          )}

          <h4>Global Status: {globalStatus}</h4>

          <h4>Classes:</h4>
          {studentData.payments.map((cls) => (
            <div key={cls.class_id}>
              <strong>
                {cls.class_name} ({cls.class_niveau})
              </strong>
              <ul>
                {cls.months.map((m) => (
                  <li key={m.month}>
                    Month {m.month}: {m.status} - ${m.payment_price}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <button onClick={handleScanNext}>
            Scan Next Student
          </button>
        </div>
      )}
    </div>
  );
};

export default Scanner;