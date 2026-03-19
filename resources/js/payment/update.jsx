import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./payment.css";

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

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/payment/getClasses").then((res) => {
      const flattened = res.data.classes.flatMap((niveau) =>
        niveau.matieres.map((m) => ({
          ...m,
          niveau_name: niveau.niveau_name,
        }))
      );
      setClasses(flattened);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/payment/getStudent/${id}`)
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
    id: selectedPayment.payment_id, // ✅ FIX
    price:
      update.price !== undefined
        ? Number(update.price)
        : Number(selectedPayment.payment_price),
    status: update.status || selectedPayment.status || "impaye",
  };
}).filter(Boolean);
console.log("Submitting update with:");

console.log("Selected Month:", selectedMonth);

console.log("Payments Array:", paymentsArray);

console.log("Apply Next Months:", applyNextMonths);

console.log("Full Payload:", {
  name,
  lastname,
  groupe,
  selected_month: selectedMonth ? Number(selectedMonth) : null,
  payments: paymentsArray,
  apply_next_months: applyNextMonths,
});
    axios
      .post(
        `http://127.0.0.1:8000/payment/updateStudent/${id}`,
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
        setMessage(res.data.message);
        setType(res.data.type);
      })
      .catch((err) => {
        console.error("Update error response:", err.response?.data || err);
        setMessage("Update failed");
        setType("error");
      })
      .finally(() => setLoading(false));
  };

  return (
    <form
      className="student-form p-4"
      onSubmit={submit}
      style={{ maxWidth: "900px", margin: "auto" }}
    >
      <h1 className="text-warning text-center mb-4">Update Student</h1>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            className="form-control"
            value={name}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            value={lastname}
            placeholder="Last Name"
            onChange={(e) => setLastname(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            value={parentname}
            placeholder="Parent Name"
            onChange={(e) => setParentname(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            value={studentphone}
            placeholder="Student Phone"
            onChange={(e) => setStudentphone(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            value={parentphone}
            placeholder="Parent Phone"
            onChange={(e) => setParentphone(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            type="number"
            value={groupe}
            placeholder="Groupe"
            onChange={(e) => setGroupe(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <h3 className="text-warning mb-3">Enrolled Classes</h3>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => {
              console.log("Selected month changed:", e.target.value);
              setSelectedMonth(e.target.value);
            }}          >
            <option>Select Month</option>
            {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      <div className="row g-3 mb-4">
{existingPayments.map((p) => {
  // find the payment object for the selected month
  const selectedPayment = p.months.find(
    (m) => m.month === Number(selectedMonth)
  );

  // if no payment exists for that month, skip rendering
  if (!selectedPayment) return null;

  const updated = paymentUpdates[selectedPayment.payment_id] || {};

  return (
    <div key={`existing-${p.class_id}`} className="col-md-4">
      <div className="p-3 border border-warning rounded bg-transparent">
        <label className="form-label fw-bold text-white">
          {p.class_name} (Month {selectedMonth})
        </label>

        <input
          type="number"
          className="form-control mb-2"
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

        <select
          className="form-select mb-2"
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
          <option value="paye">payed</option>
          <option value="impaye">unpaid</option>
          <option value="canceled">canceled</option>
        </select>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={applyNextMonths[selectedPayment.payment_id] || false}
            onChange={() =>
              toggleNextMonths(selectedPayment.payment_id)
            }
          />
          <label className="form-check-label text-white">
            Apply to following months
          </label>
        </div>
      </div>
    </div>
  );
})}
      </div>


      <div className="row g-3 mb-4">
        {classes
          .filter((c) => !existingPayments.some((p) => p.class_id === c.class_id))
          .map((c) => {
            const price = Number(c.matiere_price);
            const reduction = Number(newClassesPrices[c.class_id] || 0);
            const finalPrice = price - reduction;

            return (
              
              <div key={`new-${c.class_id}`} className="col-md-4">
                <h3 className="text-warning mb-3">Add New Subjects</h3>
                <div className="p-3 border border-warning rounded bg-transparent">
                  <label className="form-label fw-bold text-white">
                    {c.matiere_name} ({c.niveau_name})
                  </label>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={newClasses.includes(c.class_id)}
                      onChange={() => toggleClass(c.class_id)}
                    />
                    <label className="form-check-label text-white">
                      Enroll
                    </label>
                  </div>

                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Reduction"
                    onChange={(e) =>
                      changePrice(c.class_id, e.target.value)
                    }
                  />

                  <input
                    type="date"
                    className="form-control mb-2"
                    onChange={(e) =>
                      changeDate(c.class_id, e.target.value)
                    }
                  />

                  <span className="fw-bold text-white">
                    Final Price: {finalPrice}
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-warning w-100"
      >
        {loading ? "Updating..." : "Update Student"}
      </button>

      {message && (
        <div
          className={`alert mt-3 ${
            type === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
};

export default UpdateStudent;