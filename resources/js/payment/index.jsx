import React, { useEffect, useState } from "react";
import { exportTableToExcel } from "../utils/exportExcel";
import { exportTableToPdf } from "../utils/exportPdf";
import { useNavigate } from "react-router-dom";
import API from "../api.js";
import styles from "../shared.module.css";

const Index = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [toggleRows, setToggleRows] = useState({});
    const [stateButtonColor, setStateButtonColor] = useState({});
    const [canceledMonth, setCanceledMonth] = useState({});
    const [monthFilter, setMonthFilter] = useState(0);
    const [isOpen, setIsOpen] = useState({});
    const [search, setSearch] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [matiereFilter, setMatiereFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [classColor, setClasscolor] = useState({});
    const [classTextColor, setClassTextcolor] = useState({});
    const [studentClasses, setStudentClasses] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        API.get("/payment/getStudents").then((res) => {
            setStudents(res.data.students);

            const map = {};
            res.data.students.forEach((s) => {
                map[s.student_id] = s.payments.map((p) => p.class_id);
            });
            setStudentClasses(map);
        });
    }, []);

    useEffect(() => {
        API.get("/payment/getClasses").then((res) => {
            (setClasses(res.data.classes), console.log(res.data.classes));
        });
    }, []);

    const setStateToPayed = async (paymentId, classId, month, studentId) => {
        const res = await API.post("/payment/setPayment", {
            paymentId,
            classId,
            month,
            studentId,
        });

        if (res.data.updated) {
            setStateButtonColor((prev) => {
                const next = { ...prev };
                res.data.updated.forEach((u) => {
                    next[u.payment_id] = u.status;
                });
                return next;
            });
        }
    };

    const setStateToPayAll = async (studentId, month) => {
        const res = await API.post("/payment/setPaymentAll", {
            studentId,
            month,
        });

        if (res.data.updated) {
            setStateButtonColor((prev) => {
                const next = { ...prev };
                res.data.updated.forEach((u) => {
                    next[u.payment_id] = u.status;
                });
                return next;
            });
        }
    };

    const Delete = async (Id) => {
        const ok = window.confirm(
            "Are you sure you want to delete this student?",
        );
        if (!ok) return;

        try {
            await API.delete(`/payment/deleteStudent/${Id}`).then((res) => {
                setStudents(students.filter((t) => t.student_id !== Id));
            });
        } catch (err) {
            console.error(err);
            alert("Error deleting student");
        }
    };

    //cancel methods

    const setStateToCanceled = async (month, studentId, classId) => {
        const res = await API.post("/payment/setPaymentToCanceled", {
            studentId,
            classId,
            month,
        });

        if (res.data.updated) {
            setStateButtonColor((prev) => {
                const next = { ...prev };
                res.data.updated.forEach((u) => {
                    next[u.payment_id] = u.status;
                });
                return next;
            });
        }
    };

    const setStateToCanceledAll = async (month, studentId) => {
        const res = await API.post("/payment/setPaymentToCanceledAll", {
            studentId,
            month,
        });

        if (res.data.allUpdated) {
            setStateButtonColor((prev) => {
                const next = { ...prev };
                res.data.allUpdated.forEach((u) => {
                    next[u.payment_id] = u.status;
                });
                return next;
            });
        }
    };

    //filters methods

    const statusToColors = (status) => {
        switch (status) {
            case "paye":
                return {
                    backgroundColor: "#198754",
                    borderColor: "#FFFFFF",
                    color: "#fff",
                };

            case "canceled":
                return {
                    backgroundColor: "#ffc107",
                    borderColor: "#FFFFFF",
                    color: "#000",
                };

            default:
                return {
                    backgroundColor: "#dc3545",
                    borderColor: "#FFFFFF",
                    color: "#fff",
                };
        }
    };

    const getMonthStatus = (paymentId, fallbackStatus) => {
        return stateButtonColor[paymentId] !== undefined
            ? stateButtonColor[paymentId]
            : fallbackStatus;
    };



    
    const resolveMonthStatus = (payments, month) => {
        let MONTH = payments.map((p) => p.months).flat();
        let day = MONTH.find((p) => String(p.month) === String(month))?.day;
        let previousMonth = month === 1 ? 12 : month - 1;
        const prevMonthRecord = MONTH.find(
            (p) => Number(p.month) === previousMonth,
        );
        let today = new Date().getDate();

        if (!month) return { status: "—", color: "btn btn-secondary" };

        const statuses = payments
            .map((p) => p.months)
            .flat()
            .filter((m) => String(m.month) === String(month))
            .map((m) => m.status);
        if (!statuses.length)
            return { status: "—", color: "btn btn-secondary" };

        let status = "";

        if (
            statuses.includes("impaye") &&
            Number(day) > Number(today) &&
            prevMonthRecord.status === "paye"
        ) {
            status = "paye";
        } else if (statuses.includes("impaye")) {
            status = "impaye";
        } else if (statuses.includes("paye")) {
            status = "paye";
        } else {
            status = "annule";
        }

        const color =
            status === "impaye"
                ? "btn btn-danger"
                : status === "paye"
                  ? "btn btn-success"
                  : "btn btn-warning";
        return { status, color };
    };

    const studentStateFilter = (student, stateFilter, month) => {
        if (!stateFilter) return true;

        if (month) {
            const monthToCheck = Number(month) || 0;
            const monthStatus = resolveMonthStatus(
                student.payments,
                monthToCheck,
            );
            return monthStatus.status === stateFilter;
        } else if (!month) {
            const curMonth = new Date().getMonth() + 1 || 0;
            const monthStatus = resolveMonthStatus(student.payments, curMonth);
            return monthStatus.status === stateFilter;
        }
    };

    const studentMatchesSearch = (student, search) => {
        if (!search) return true;

        const q = search.toLowerCase();

        return (
            student.student_name.toLowerCase().includes(q) ||
            student.student_lastname.toLowerCase().includes(q)
        );
    };

    const studentClassFilter = (student, matiereFilter) => {
        if (!matiereFilter) return true;
        const selectedMatiere = matiereFilter;
        return student.payments.some((p) => p.class_name === selectedMatiere);
    };

    const studentNiveauFilter = (student, levelFilter) => {
        if (!levelFilter) return true;
        const selectedLevel = levelFilter;
        return student.payments.some((p) => p.class_niveau === selectedLevel);
    };

    const classesSelect = (studentId, value, classIds) => {
        setCanceledMonth((prev) => ({
            ...prev,
            [studentId]: value,
        }));

        classIds.forEach((classId) => {
            const student = students.find((s) => s.student_id == studentId);
            const monthRecord = student?.payments
                .find((p) => p.class_id === classId)
                ?.months.find((m) => String(m.month) === String(value));

            // Read the latest React state first, then fall back to the original API data.
            const paymentState = monthRecord
                ? getMonthStatus(monthRecord.payment_id, monthRecord.status)
                : undefined;

            let color;
            let text;
            switch (paymentState) {
                case "paye":
                    color = { backgroundColor: "#198754", color: "#fff" };
                    text = { color: "white" };
                    break;
                case "canceled":
                    color = { backgroundColor: "#ffc107", color: "#000" };
                    text = { color: "white" };
                    break;
                case "impaye":
                    color = { backgroundColor: "#dc3545", color: "#fff" };
                    text = { color: "white" };
                    break;
                default:
                    color = { backgroundColor: "#d1cece", color: "#fff" };
                    text = { color: "black" };
            }

            setClassTextcolor((prev) => ({
                ...prev,
                [classId]: text,
            }));

            setClasscolor((prev) => ({
                ...prev,
                [classId]: color,
            }));
        });
    };

    // Keep the subject cards in sync when a payment status changes through the API.
    useEffect(() => {
        const nextClassColors = {};
        const nextClassTextColors = {};

        students.forEach((student) => {
            const selectedMonth = canceledMonth[student.student_id];

            // A student with no month selection should keep the default card styling.
            if (selectedMonth === undefined) return;

            student.payments.forEach((payment) => {
                const monthRecord = payment.months.find(
                    (m) => String(m.month) === String(selectedMonth),
                );
                const paymentState = monthRecord
                    ? getMonthStatus(monthRecord.payment_id, monthRecord.status)
                    : undefined;

                switch (paymentState) {
                    case "paye":
                        nextClassColors[payment.class_id] = {
                            backgroundColor: "#198754",
                            color: "#fff",
                        };
                        nextClassTextColors[payment.class_id] = {
                            color: "white",
                        };
                        break;
                    case "canceled":
                        nextClassColors[payment.class_id] = {
                            backgroundColor: "#ffc107",
                            color: "#000",
                        };
                        nextClassTextColors[payment.class_id] = {
                            color: "white",
                        };
                        break;
                    case "impaye":
                        nextClassColors[payment.class_id] = {
                            backgroundColor: "#dc3545",
                            color: "#fff",
                        };
                        nextClassTextColors[payment.class_id] = {
                            color: "white",
                        };
                        break;
                    default:
                        nextClassColors[payment.class_id] = {
                            backgroundColor: "#d1cece",
                            color: "#fff",
                        };
                        nextClassTextColors[payment.class_id] = {
                            color: "black",
                        };
                }
            });
        });

        setClasscolor(nextClassColors);
        setClassTextcolor(nextClassTextColors);
    }, [students, canceledMonth, stateButtonColor]);

    const toggleClasses = (studentId, classId) => {
        const key = `${studentId}-${classId}`;

        setIsOpen((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const filtredStudentsNumber = students.filter(
        (s) =>
            studentMatchesSearch(s, search) &&
            studentStateFilter(s, stateFilter, monthFilter) &&
            studentClassFilter(s, matiereFilter) &&
            studentNiveauFilter(s, levelFilter),
    );

    return (
        <div className={styles.payment_index_pageContainer}>
            <div className={styles.payment_index_managementCard}>
                {/* HEADER */}
                <div className={styles.payment_index_cardHeader}>
                    {/* Header background image */}
                    <img
                        src="/images/neonImage.png"
                        alt=""
                        aria-hidden="true"
                        className={styles.payment_index_headerBackground}
                    />

                    {/* Dark overlay over the image */}
                    <div className={styles.payment_index_headerOverlay}></div>

                    <div className={styles.payment_index_headerContent}>
                        <span className={styles.payment_index_headerLabel}>
                            Student Management
                        </span>

                        <h1 className={styles.payment_index_headerTitle}>
                            All
                            <span> Students.</span>
                        </h1>

                        <p className={styles.payment_index_headerSubtitle}>
                            Manage students, payments and monthly enrollment
                            status.
                        </p>
                    </div>

                    <div className={styles.payment_index_studentCounter}>
                        <span>Students Number</span>
                        <strong>
                            {students.length}
                            <small> / {filtredStudentsNumber.length}</small>
                        </strong>
                    </div>
                </div>

                {/* BODY */}
                <div className={styles.payment_index_contentLayout}>
                    {/* FILTERS */}
                    <section className={styles.payment_index_filtersSection}>
                        <div className={styles.payment_index_sectionHeading}>
                            <span
                                className={styles.payment_index_sectionNumber}
                            >
                                01
                            </span>

                            <div>
                                <span
                                    className={
                                        styles.payment_index_sectionLabel
                                    }
                                >
                                    Filters
                                </span>
                                <h2>Refine the list</h2>
                            </div>
                        </div>

                        <div className={styles.payment_index_filtersContainer}>
                            <input
                                type="text"
                                className={styles.payment_index_filterInput}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search student..."
                            />

                            <div className={styles.payment_index_selectWrapper}>
                                <select
                                    onChange={(e) =>
                                        setMonthFilter(e.target.value)
                                    }
                                    className={
                                        styles.payment_index_filterSelect
                                    }
                                    name="month"
                                    id="month"
                                >
                                    <option value="">Select a Month</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                </select>
                            </div>

                            <div className={styles.payment_index_selectWrapper}>
                                <select
                                    onChange={(e) =>
                                        setStateFilter(e.target.value)
                                    }
                                    className={
                                        styles.payment_index_filterSelect
                                    }
                                    name="state"
                                    id="state"
                                >
                                    <option value="">Select a State</option>
                                    <option value="paye">payed</option>
                                    <option value="impaye">unpayed</option>
                                    <option value="annule">canceled</option>
                                </select>
                            </div>

                            <div className={styles.payment_index_selectWrapper}>
                                <select
                                    onChange={(e) =>
                                        setMatiereFilter(e.target.value)
                                    }
                                    className={
                                        styles.payment_index_filterSelect
                                    }
                                >
                                    <option value="">Select a Subject</option>

                                    {classes
                                        .flatMap((c) => c.matieres)
                                        .map((m) => (
                                            <option
                                                key={m.matiere_id}
                                                value={m.matiere_name}
                                            >
                                                {m.matiere_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className={styles.payment_index_selectWrapper}>
                                <select
                                    onChange={(e) =>
                                        setLevelFilter(e.target.value)
                                    }
                                    className={
                                        styles.payment_index_filterSelect
                                    }
                                >
                                    <option value="">Select a Level</option>

                                    {classes.map((n) => (
                                        <option
                                            key={n.niveau_id}
                                            value={n.niveau_name}
                                        >
                                            {n.niveau_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* STUDENTS TABLE */}
                    <section className={styles.payment_index_tableSection}>
                        <div className={styles.payment_index_sectionHeading}>
                            <span
                                className={styles.payment_index_sectionNumber}
                            >
                                02
                            </span>

                            <div>
                                <span
                                    className={
                                        styles.payment_index_sectionLabel
                                    }
                                >
                                    Records
                                </span>
                                <h2>Student list</h2>
                            </div>
                        </div>

                        <div className={styles.payment_index_actionsRow}>
                            <div className={styles.payment_index_actionsInfo}>
                                <span>Export Data</span>
                                <div
                                    className={styles.payment_index_actionLine}
                                ></div>
                            </div>

                            <div className={styles.payment_index_exportButtons}>
                                <button
                                    className={`${styles.payment_index_actionButton} ${styles.payment_index_excelButton}`}
                                    onClick={() =>
                                        exportTableToExcel(
                                            "main-table",
                                            "table.xlsx",
                                        )
                                    }
                                >
                                    <span>Excel</span>
                                    <span
                                        className={
                                            styles.payment_index_buttonArrow
                                        }
                                    >
                                        →
                                    </span>
                                </button>

                                <button
                                    className={`${styles.payment_index_actionButton} ${styles.payment_index_pdfButton}`}
                                    onClick={() =>
                                        exportTableToPdf(
                                            "main-table",
                                            "Table Export",
                                        )
                                    }
                                >
                                    <span>PDF</span>
                                    <span
                                        className={
                                            styles.payment_index_buttonArrow
                                        }
                                    >
                                        →
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className={styles.payment_index_tableWrapper}>
                            <table
                                className={styles.payment_index_table}
                                id="main-table"
                            >
                                <thead className={styles.payment_index_thead}>
                                    <tr>
                                        <th>Name</th>
                                        <th>LastName</th>
                                        <th>Date</th>
                                        <th>State</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody className={styles.payment_index_tbody}>
                                    {students.map((s) => {
                                        if (
                                            !studentMatchesSearch(s, search) ||
                                            !studentStateFilter(
                                                s,
                                                stateFilter,
                                                monthFilter,
                                            ) ||
                                            !studentClassFilter(
                                                s,
                                                matiereFilter,
                                            ) ||
                                            !studentNiveauFilter(s, levelFilter)
                                        ) {
                                            return null;
                                        } else {
                                            return (
                                                <React.Fragment
                                                    key={s.student_id}
                                                >
                                                    <tr
                                                        onClick={() =>
                                                            setToggleRows(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [s.student_id]:
                                                                        !prev[
                                                                            s
                                                                                .student_id
                                                                        ],
                                                                }),
                                                            )
                                                        }
                                                        className={
                                                            styles.payment_index_studentRow
                                                        }
                                                    >
                                                        <td>
                                                            {s.student_name}
                                                        </td>
                                                        <td>
                                                            {s.student_lastname}
                                                        </td>
                                                        <td>
                                                            {s.payment_date}
                                                        </td>

                                                        <td>
                                                            <div
                                                                className={`${styles.payment_index_monthStatus} ${
                                                                    resolveMonthStatus(
                                                                        s.payments,
                                                                        monthFilter,
                                                                    ).color
                                                                }`}
                                                            >
                                                                {
                                                                    resolveMonthStatus(
                                                                        s.payments,
                                                                        monthFilter,
                                                                    ).status
                                                                }
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div
                                                                className={
                                                                    styles.payment_index_rowActions
                                                                }
                                                            >
                                                                <button
                                                                    className={`${styles.payment_index_smallButton} ${styles.payment_index_updateButton}`}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/student/update/${s.student_id}`,
                                                                        )
                                                                    }
                                                                >
                                                                    Update
                                                                </button>

                                                                <button
                                                                    className={`${styles.payment_index_smallButton} ${styles.payment_index_deleteButton}`}
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        Delete(
                                                                            s.student_id,
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {toggleRows[
                                                        s.student_id
                                                    ] && (
                                                        <tr
                                                            className={
                                                                styles.payment_index_expandedRow
                                                            }
                                                        >
                                                            <td
                                                                colSpan={5}
                                                                className={
                                                                    styles.payment_index_expandedCell
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.payment_index_expandedControls
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles.payment_index_selectWrapper
                                                                        }
                                                                    >
                                                                        <select
                                                                            className={
                                                                                styles.payment_index_monthSelect
                                                                            }
                                                                            value={
                                                                                canceledMonth[
                                                                                    s
                                                                                        .student_id
                                                                                ] ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                classesSelect(
                                                                                    s.student_id,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                    studentClasses[
                                                                                        s
                                                                                            .student_id
                                                                                    ],
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                Select
                                                                                month
                                                                            </option>
                                                                            <option value="9">
                                                                                September
                                                                            </option>
                                                                            <option value="10">
                                                                                October
                                                                            </option>
                                                                            <option value="11">
                                                                                November
                                                                            </option>
                                                                            <option value="12">
                                                                                December
                                                                            </option>
                                                                            <option value="1">
                                                                                January
                                                                            </option>
                                                                            <option value="2">
                                                                                February
                                                                            </option>
                                                                            <option value="3">
                                                                                March
                                                                            </option>
                                                                            <option value="4">
                                                                                April
                                                                            </option>
                                                                            <option value="5">
                                                                                May
                                                                            </option>
                                                                            <option value="6">
                                                                                June
                                                                            </option>
                                                                        </select>
                                                                    </div>

                                                                    <button
                                                                        className={`${styles.payment_index_smallButton} ${styles.payment_index_cancelAllButton}`}
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();

                                                                            if (
                                                                                !canceledMonth[
                                                                                    s
                                                                                        .student_id
                                                                                ]
                                                                            )
                                                                                return alert(
                                                                                    "Select a month first!",
                                                                                );

                                                                            const ok =
                                                                                window.confirm(
                                                                                    "Confirm cancelling months from the selected month to june for all the classes!",
                                                                                );

                                                                            if (
                                                                                !ok
                                                                            )
                                                                                return;

                                                                            setStateToCanceledAll(
                                                                                canceledMonth[
                                                                                    s
                                                                                        .student_id
                                                                                ],
                                                                                s.student_id,
                                                                            );
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                        all
                                                                    </button>

                                                                    <button
                                                                        style={{
                                                                            color: "white",
                                                                        }}
                                                                        className={`${styles.payment_index_smallButton} ${styles.payment_index_payAllButton}`}
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();

                                                                            if (
                                                                                !canceledMonth[
                                                                                    s
                                                                                        .student_id
                                                                                ]
                                                                            )
                                                                                return alert(
                                                                                    "Select a month first!",
                                                                                );

                                                                            const ok =
                                                                                window.confirm(
                                                                                    "Confirm paying months from the selected month to June for all classes?",
                                                                                );

                                                                            if (
                                                                                !ok
                                                                            )
                                                                                return;

                                                                            setStateToPayAll(
                                                                                s.student_id,
                                                                                canceledMonth[
                                                                                    s
                                                                                        .student_id
                                                                                ],
                                                                            );
                                                                        }}
                                                                    >
                                                                        Pay all
                                                                    </button>
                                                                </div>

                                                                <div
                                                                    className={
                                                                        styles.payment_index_classesGrid
                                                                    }
                                                                >
                                                                    {s.payments.map(
                                                                        (p) => (
                                                                            <div
                                                                                onClick={() =>
                                                                                    toggleClasses(
                                                                                        s.student_id,
                                                                                        p.class_id,
                                                                                    )
                                                                                }
                                                                                key={
                                                                                    p.class_id
                                                                                }
                                                                                className={
                                                                                    styles.payment_index_classCard
                                                                                }
                                                                                style={{
                                                                                    ...(classColor[
                                                                                        p
                                                                                            .class_id
                                                                                    ] ||
                                                                                        {}),
                                                                                }}
                                                                            >
                                                                                <h4
                                                                                    className={
                                                                                        styles.payment_index_classTitle
                                                                                    }
                                                                                    style={{
                                                                                        ...classTextColor[
                                                                                            p
                                                                                                .class_id
                                                                                        ],
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        p.class_name
                                                                                    }
                                                                                </h4>

                                                                                {isOpen[
                                                                                    `${s.student_id}-${p.class_id}`
                                                                                ] && (
                                                                                    <div
                                                                                        className={
                                                                                            styles.payment_index_classDetails
                                                                                        }
                                                                                    >
                                                                                        <div>
                                                                                            <button
                                                                                                className={`${styles.payment_index_smallButton} ${styles.payment_index_cancelButton}`}
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    e.stopPropagation();

                                                                                                    if (
                                                                                                        !canceledMonth[
                                                                                                            s
                                                                                                                .student_id
                                                                                                        ]
                                                                                                    )
                                                                                                        return alert(
                                                                                                            "Select a month first!",
                                                                                                        );

                                                                                                    const ok =
                                                                                                        window.confirm(
                                                                                                            `Confirm canceling months from the selected month to june!`,
                                                                                                        );

                                                                                                    if (
                                                                                                        !ok
                                                                                                    )
                                                                                                        return;

                                                                                                    setStateToCanceled(
                                                                                                        canceledMonth[
                                                                                                            s
                                                                                                                .student_id
                                                                                                        ],
                                                                                                        s.student_id,
                                                                                                        p.class_id,
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                Cancel
                                                                                            </button>
                                                                                        </div>

                                                                                        <div
                                                                                            className={
                                                                                                styles.payment_index_monthGrid
                                                                                            }
                                                                                        >
                                                                                            {p.months.map(
                                                                                                (
                                                                                                    m,
                                                                                                ) => {
                                                                                                    const syMonths =
                                                                                                        {
                                                                                                            1: "January",
                                                                                                            2: "February",
                                                                                                            3: "March",
                                                                                                            4: "April",
                                                                                                            5: "May",
                                                                                                            6: "June",
                                                                                                            7: "July",
                                                                                                            8: "August",
                                                                                                            9: "September",
                                                                                                            10: "October",
                                                                                                            11: "November",
                                                                                                            12: "December",
                                                                                                        };

                                                                                                    const status =
                                                                                                        getMonthStatus(
                                                                                                            m.payment_id,
                                                                                                            m.status,
                                                                                                        );

                                                                                                    const colors =
                                                                                                        statusToColors(
                                                                                                            status,
                                                                                                        );

                                                                                                    return (
                                                                                                        <button
                                                                                                            key={
                                                                                                                m.payment_id
                                                                                                            }
                                                                                                            className={
                                                                                                                styles.payment_index_monthButton
                                                                                                            }
                                                                                                            style={{
                                                                                                                ...colors,
                                                                                                            }}
                                                                                                            onClick={(
                                                                                                                e,
                                                                                                            ) => {
                                                                                                                e.stopPropagation();

                                                                                                                const ok =
                                                                                                                    window.confirm(
                                                                                                                        `Confirm payment update for ${syMonths[m.month]} ?`,
                                                                                                                    );

                                                                                                                if (
                                                                                                                    !ok
                                                                                                                )
                                                                                                                    return;

                                                                                                                setStateToPayed(
                                                                                                                    m.payment_id,
                                                                                                                    p.class_id,
                                                                                                                    m.month,
                                                                                                                    s.student_id,
                                                                                                                );
                                                                                                            }}
                                                                                                        >
                                                                                                            {
                                                                                                                syMonths[
                                                                                                                    m
                                                                                                                        .month
                                                                                                                ]
                                                                                                            }
                                                                                                        </button>
                                                                                                    );
                                                                                                },
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        }
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Index;
