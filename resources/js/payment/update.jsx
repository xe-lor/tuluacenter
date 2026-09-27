import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./update.module.css";
import API from "../api.js";

const UpdateStudent = () => {
  const { id } = useParams(); 

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [parentname, setParentname] = useState("");
  const [studentphone, setStudentphone] = useState("");
  const [parentphone, setParentphone] = useState("");
  const [groupe, setGroupe] = useState("");
  const [date, setDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [classes, setClasses] = useState([]);
  const [existingPayments, setExistingPayments] = useState([]);
  const [paymentUpdates, setPaymentUpdates] = useState({});
  const [applyNextMonths, setApplyNextMonths] = useState({});

  const [newClasses, setNewClasses] = useState([]);
  const [newClassesPrices, setNewClassesPrices] = useState({});
  const [newClassesDates, setNewClassesDates] = useState({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");


  const navigate=useNavigate();




  
useEffect(() => {
  API.get(`/payment/getClassesForUpdate/${id}`)
    .then((res) => {
      setClasses(res.data.classes || []);
    })
    .catch((err) => {
      console.error("Error fetching classes:", err);
    });
}, [id]);





  useEffect(() => {
    API
      .get(`/payment/getStudent/${id}`)
      .then((res) => {
        console.log(res.data.student)
        const s = res.data.student;
        if (!s) {
          console.error(`No student found for id: ${id}`);
          return;
        }

        setName(s.student_name || "");
        setLastname(s.student_lastname || "");
        setParentname(s.parent_name || "");
        setStudentphone(s.student_phone || "");
        setParentphone(s.parent_phone || "");
        setGroupe(s.groupe || "");
        setDate(s.payment_date || "");
        setExistingPayments(s.payments || []);
      })
      .catch((err) => {
        console.error("Error fetching student:", err);
      });
  }, [id]);

const changePayment = (paymentId, field, value) => {
  console.log("Editing payment:", paymentId, field, value);

  setPaymentUpdates((prev) => ({
    ...prev,
    [paymentId]: {
      ...prev[paymentId],
      [field]: field === "price" ? Number(value) : value,
    },
  }));
};

const toggleNextMonths = (paymentId) => {
  console.log("Apply next months for payment:", paymentId);

  setApplyNextMonths((prev) => ({
    ...prev,
    [paymentId]: !prev[paymentId],
  }));
};

  const toggleClass = (id) => {
    setNewClasses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const changePrice = (id, value) => {
    setNewClassesPrices((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const changeDate = (id, value) => {
    setNewClassesDates((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);

const paymentsArray = existingPayments.map((p) => {
  const selectedPayment = p.months.find(
    (m) => m.month === Number(selectedMonth)
  );

  if (!selectedPayment) return null;

  const update = paymentUpdates[selectedPayment.payment_id] || {};

  return {
    id: selectedPayment.payment_id, 
    price:
      update.price !== undefined
        ? Number(update.price)
        : Number(selectedPayment.payment_price),
    status: update.status || selectedPayment.status || "impaye",
  };
}).filter(Boolean);

    API
      .post(
        `/payment/updateStudent/${id}`,
        {
          name: String(name || ""),
          lastname: String(lastname || ""),
          parentname: String(parentname || ""),
          studentphone: String(studentphone || ""),
          parentphone: String(parentphone || ""),
          groupe: groupe ? Number(groupe) : null,
          date: date || null,
          selected_month: selectedMonth ? Number(selectedMonth) : null,
          payments: paymentsArray,
          apply_next_months: applyNextMonths,
          new_classes: newClasses,
          new_classes_prices: newClassesPrices,
          new_classes_dates: newClassesDates,
        },
        { withCredentials: true }
      )
      .then((res) => {
        navigate('/payment/index')
      })
      .catch((err) => {
        console.error("Update error response:", err.response?.data || err);
        setMessage("Update failed");
        setType("error");
      })
      .finally(() => setLoading(false));
  };

  return (
  <form className={styles.page} onSubmit={submit}>
    <div className={styles.header}>
      <div>
        <span className={styles.eyebrow}>STUDENT MANAGEMENT</span>
        <h1>Update Student</h1>
      </div>

      <div className={styles.headerLine}></div>
    </div>

    <section className={styles.studentSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>01</span>

        <div>
          <span className={styles.sectionLabel}>PROFILE</span>
          <h2>Student Information</h2>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Name</label>
          <input
            value={name}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Last Name</label>
          <input
            value={lastname}
            placeholder="Last Name"
            onChange={(e) => setLastname(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Parent Name</label>
          <input
            value={parentname}
            placeholder="Parent Name"
            onChange={(e) => setParentname(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Student Phone</label>
          <input
            value={studentphone}
            placeholder="Student Phone"
            onChange={(e) => setStudentphone(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Parent Phone</label>
          <input
            value={parentphone}
            placeholder="Parent Phone"
            onChange={(e) => setParentphone(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Group</label>
          <input
            type="number"
            value={groupe}
            placeholder="Groupe"
            onChange={(e) => setGroupe(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Payment Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
    </section>

    <section className={styles.paymentSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>02</span>

        <div>
          <span className={styles.sectionLabel}>PAYMENTS</span>
          <h2>Enrolled Classes</h2>
        </div>
      </div>

      <div className={styles.monthSelector}>
        <label>Payment Month</label>

        <select
          value={selectedMonth}
          onChange={(e) => {
            console.log(
              "Selected month changed:",
              e.target.value
            );
            setSelectedMonth(e.target.value);
          }}
        >
          <option>Select Month</option>

          {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.paymentGrid}>
        {existingPayments.map((p) => {
          const selectedPayment = p.months.find(
            (m) => m.month === Number(selectedMonth)
          );

          if (!selectedPayment) return null;

          const updated =
            paymentUpdates[selectedPayment.payment_id] || {};

          return (
            <div
              key={`existing-${p.class_id}`}
              className={styles.paymentCard}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardIndex}>
                  {String(p.class_id).padStart(2, "0")}
                </span>

                <span className={styles.monthTag}>
                  MONTH {selectedMonth}
                </span>
              </div>

              <h3>{p.class_name}</h3>

              <div className={styles.cardField}>
                <label>Price</label>

                <input
                  type="number"
                  value={
                    updated.price !== undefined
                      ? updated.price
                      : selectedPayment.payment_price || ""
                  }
                  placeholder="Price"
                  onChange={(e) =>
                    changePayment(
                      selectedPayment.payment_id,
                      "price",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className={styles.cardField}>
                <label>Payment Status</label>

                <select
                  value={
                    updated.status !== undefined
                      ? updated.status
                      : selectedPayment.status || ""
                  }
                  onChange={(e) =>
                    changePayment(
                      selectedPayment.payment_id,
                      "status",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select a state</option>
                  <option value="paye">Payed</option>
                  <option value="impaye">Unpaid</option>
                  <option value="canceled">
                    Canceled
                  </option>
                </select>
              </div>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={
                    applyNextMonths[
                      selectedPayment.payment_id
                    ] || false
                  }
                  onChange={() =>
                    toggleNextMonths(
                      selectedPayment.payment_id
                    )
                  }
                />

                <span className={styles.checkmark}></span>

                <span>
                  Apply to following months
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </section>

    <section className={styles.newClassesSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>03</span>

        <div>
          <span className={styles.sectionLabel}>
            ENROLLMENT
          </span>

          <h2>Add New Subjects</h2>
        </div>
      </div>

      <div className={styles.newClassesGrid}>
        {classes
          .filter(
            (c) =>
              !existingPayments.some(
                (p) => p.class_id === c.class_id
              )
          )
          .map((c) => {
            const price = Number(c.matiere_price);
            const reduction = Number(
              newClassesPrices[c.class_id] || 0
            );
            const finalPrice = price - reduction;

            return (
              <div
                key={`new-${c.class_id}`}
                className={styles.newClassCard}
              >
                <div className={styles.newClassHeader}>
                  <div>
                    <span className={styles.subjectLevel}>
                      {c.niveau_name}
                    </span>

                    <h3>{c.matiere_name}</h3>
                  </div>

                  <span className={styles.subjectNumber}>
                    {String(c.class_id).padStart(2, "0")}
                  </span>
                </div>

                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={newClasses.includes(
                      c.class_id
                    )}
                    onChange={() =>
                      toggleClass(c.class_id)
                    }
                  />

                  <span className={styles.checkmark}></span>

                  <span>Enroll</span>
                </label>

                <div className={styles.cardField}>
                  <label>Reduction</label>

                  <input
                    type="number"
                    placeholder="Reduction"
                    onChange={(e) =>
                      changePrice(
                        c.class_id,
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className={styles.cardField}>
                  <label>Start Date</label>

                  <input
                    type="date"
                    onChange={(e) =>
                      changeDate(
                        c.class_id,
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className={styles.finalPrice}>
                  <span>FINAL PRICE</span>

                  <strong>{finalPrice}</strong>
                </div>
              </div>
            );
          })}
      </div>
    </section>

    <div className={styles.actions}>
      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        <span>
          {loading ? "Updating..." : "Update Student"}
        </span>

        {!loading && (
          <span className={styles.arrow}>→</span>
        )}
      </button>
    </div>

    {message && (
      <div
        className={`${styles.message} ${
          type === "success"
            ? styles.success
            : styles.error
        }`}
      >
        {message}
      </div>
    )}
  </form>
);
};

export default UpdateStudent;