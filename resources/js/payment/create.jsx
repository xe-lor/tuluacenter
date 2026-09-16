import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api.js";

import styles from "./create.module.css";

const CreateStudent = () => {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [parentName, setParentName] = useState("");
    const [studentPhone, setStudentPhone] = useState("");
    const [parentPhone, setParentPhone] = useState("");

    const [classe, setClasse] = useState([]);
    const [niveau, setNiveau] = useState("");
    const [groupe, setGroupe] = useState(0);
    const [date, setDate] = useState("");
    const [reduction, setReduction] = useState({});
    const [state, setState] = useState("impaye");

    const [niveauMatieres, setNiveauMatieres] = useState([]);
    const [matieresNiveau, setMatieresNiveau] = useState([]);

    const [message, setMessage] = useState("");
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);

    const [duplicateStudent, setDuplicateStudent] = useState(null);
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        API.get("/payment/getClasses")
            .then((res) => {
                setNiveauMatieres(res.data.classes);
            })
            .catch((err) => console.error(err));
    }, []);

    const handleSubmit = async (e, forceCreate = false) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await API.post(
                "/payment/createStudent",
                {
                    name,
                    lastName,
                    parentName,
                    studentPhone,
                    parentPhone,
                    niveau,
                    date,
                    reduction,
                    groupe,
                    classe,
                    state,

                    /*
                     * false = normal creation/check
                     * true  = user confirmed duplicate
                     */
                    force_create: forceCreate,
                },
                {
                    withCredentials: true,
                },
            );

            /*
             * No duplicate.
             *
             * Student was created normally.
             */
            navigate("/payment/index");
        } catch (err) {
            /*
             * Laravel returns HTTP 409 when it finds
             * a possible duplicate.
             */
            if (err.response?.status === 409 && err.response?.data?.duplicate) {
                setDuplicateStudent(err.response.data.existing_student);

                setShowDuplicateWarning(true);

                return;
            }

            console.error(err);

            setMessage(
                err.response?.data?.message || "Failed to create student.",
            );

            setType("error");
        } finally {
            setLoading(false);
        }
    };

    const confirmStudentCreation = () => {
        /*
         * Close the warning first.
         */
        setShowDuplicateWarning(false);

        /*
         * Send the SAME information again,
         * but force_create = true.
         */
        handleSubmit(
            {
                preventDefault: () => {},
            },
            true,
        );
    };

    const cancelStudentCreation = () => {
        /*
         * Only close the warning.
         *
         * We DO NOT reset any input.
         */
        setShowDuplicateWarning(false);

        setDuplicateStudent(null);
    };

    const handleSelectedNiveau = (e) => {
        const niveauId = Number(e.target.value);

        const selectedNiveau = niveauMatieres.find(
            (nm) => nm.niveau_id === niveauId,
        );

        setMatieresNiveau(selectedNiveau ? selectedNiveau.matieres : []);
        setNiveau(selectedNiveau ? selectedNiveau.niveau_id : "");
    };

    const handleMatiereChange = (id) => {
        setClasse((prev) =>
            prev.includes(id)
                ? prev.filter((mid) => mid !== id)
                : [...prev, id],
        );
    };

    const handleChange = (id, e) => {
        setReduction((prev) => ({
            ...prev,
            [id]: Number(e.target.value),
        }));
    };

    return (
        <form className={styles.studentForm} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
                <div className={styles.headerContent}>
                    <span className={styles.eyebrow}>Student Registration</span>

                    <h1 className={styles.title}>
                        Create
                        <span> Student.</span>
                    </h1>

                    <p className={styles.subtitle}>
                        Register a student, assign their academic level and
                        subjects, then configure individual pricing.
                    </p>
                </div>

                <div className={styles.headerDecoration} aria-hidden="true">
                    <span>01</span>
                    <div />
                </div>
            </div>

            <div className={styles.formLayout}>
                <section className={styles.personalSection}>
                    <div className={styles.sectionHeading}>
                        <span className={styles.sectionNumber}>01</span>

                        <div>
                            <span className={styles.sectionLabel}>
                                Personal Details
                            </span>
                            <h2>Student information</h2>
                        </div>
                    </div>

                    <div className={styles.inputGrid}>
                        <div className={styles.inputGroup}>
                            <label
                                style={{ color: "white" }}
                                htmlFor="studentName"
                            >
                                First name
                            </label>

                            <input
                                id="studentName"
                                type="text"
                                className={styles.inputField}
                                placeholder="Enter first name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                style={{ color: "white" }}
                                htmlFor="studentLastName"
                            >
                                Last name
                            </label>

                            <input
                                id="studentLastName"
                                type="text"
                                className={styles.inputField}
                                placeholder="Enter last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                style={{ color: "white" }}
                                htmlFor="parentName"
                            >
                                Parent name
                            </label>

                            <input
                                id="parentName"
                                type="text"
                                className={styles.inputField}
                                placeholder="Enter parent name"
                                value={parentName}
                                onChange={(e) => setParentName(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                style={{ color: "white" }}
                                htmlFor="studentPhone"
                            >
                                Student phone
                            </label>

                            <input
                                id="studentPhone"
                                type="text"
                                className={styles.inputField}
                                placeholder="+212..."
                                value={studentPhone}
                                onChange={(e) =>
                                    setStudentPhone(e.target.value)
                                }
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                style={{ color: "white" }}
                                htmlFor="parentPhone"
                            >
                                Parent phone
                            </label>

                            <input
                                id="parentPhone"
                                type="tel"
                                className={styles.inputField}
                                placeholder="+212..."
                                value={parentPhone}
                                onChange={(e) => setParentPhone(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label style={{ color: "white" }} htmlFor="group">
                                Group
                            </label>

                            <input
                                id="group"
                                type="number"
                                className={styles.inputField}
                                placeholder="Group number"
                                value={groupe || ""}
                                onChange={(e) =>
                                    setGroupe(Number(e.target.value))
                                }
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                style={{ color: "white" }}
                                htmlFor="registrationDate"
                            >
                                Registration date
                            </label>

                            <input
                                id="registrationDate"
                                type="date"
                                className={styles.inputField}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className={styles.statusGroup}>
                            <span
                                style={{ color: "white" }}
                                className={styles.statusLabel}
                            >
                                Payment status
                            </span>

                            <label
                                style={{ color: "white" }}
                                className={styles.statusControl}
                            >
                                <input
                                    type="checkbox"
                                    checked={state === "paye"}
                                    onChange={(e) =>
                                        setState(
                                            e.target.checked
                                                ? "paye"
                                                : "impaye",
                                        )
                                    }
                                />

                                <span className={styles.customCheckbox}>
                                    <span />
                                </span>

                                <span
                                    className={
                                        state === "paye"
                                            ? styles.statusPaid
                                            : styles.statusUnpaid
                                    }
                                >
                                    {state === "paye" ? "Paid" : "Unpaid"}
                                </span>
                            </label>
                        </div>
                    </div>
                </section>

                <section className={styles.academicSection}>
                    <div className={styles.sectionHeading}>
                        <span className={styles.sectionNumber}>02</span>

                        <div>
                            <span className={styles.sectionLabel}>
                                Academic Setup
                            </span>
                            <h2>Classes & pricing</h2>
                        </div>
                    </div>

                    <div className={styles.levelGroup}>
                        <label style={{ color: "white" }} htmlFor="niveau">
                            Academic level
                        </label>

                        <div className={styles.selectWrapper}>
                            <select
                                id="niveau"
                                className={styles.niveauSelect}
                                value={niveau}
                                onChange={handleSelectedNiveau}
                            >
                                <option value="">Select a level</option>

                                {niveauMatieres.map((n) => (
                                    <option
                                        key={n.niveau_id}
                                        value={n.niveau_id}
                                    >
                                        {n.niveau_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.subjectsContainer}>
                        {matieresNiveau.length === 0 ? (
                            <div className={styles.emptySubjects}>
                                <span>Subjects</span>
                                <p>
                                    Select an academic level to display its
                                    available subjects.
                                </p>
                            </div>
                        ) : (
                            matieresNiveau.map((m, index) => {
                                const price = Number(m.matiere_price);
                                const red = Number(
                                    reduction[m.matiere_id] || 0,
                                );
                                const finalDiscount = price - red;
                                const selected = classe.includes(m.class_id);
                                const discounted = finalDiscount < price;

                                return (
                                    <div
                                        className={`${styles.matiereItem} ${
                                            selected
                                                ? styles.matiereSelected
                                                : ""
                                        }`}
                                        key={m.class_id}
                                    >
                                        <div className={styles.subjectIdentity}>
                                            <span
                                                className={styles.subjectIndex}
                                            >
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </span>

                                            <div>
                                                <label
                                                    style={{ color: "white" }}
                                                    className={
                                                        styles.subjectName
                                                    }
                                                    htmlFor={`subject-${m.class_id}`}
                                                >
                                                    {m.matiere_name}
                                                </label>

                                                <span
                                                    className={
                                                        styles.originalPrice
                                                    }
                                                >
                                                    Base price: {price}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.subjectControls}>
                                            <label
                                                style={{ color: "white" }}
                                                className={styles.subjectCheck}
                                            >
                                                <input
                                                    id={`subject-${m.class_id}`}
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() =>
                                                        handleMatiereChange(
                                                            m.class_id,
                                                        )
                                                    }
                                                />

                                                <span
                                                    className={
                                                        styles.subjectCheckBox
                                                    }
                                                />
                                            </label>

                                            <div
                                                className={
                                                    styles.reductionGroup
                                                }
                                            >
                                                <label
                                                    style={{ color: "white" }}
                                                    htmlFor={`reduction-${m.matiere_id}`}
                                                >
                                                    Reduction
                                                </label>

                                                <input
                                                    id={`reduction-${m.matiere_id}`}
                                                    type="number"
                                                    className={
                                                        styles.reductionInput
                                                    }
                                                    value={
                                                        reduction[
                                                            m.matiere_id
                                                        ] || ""
                                                    }
                                                    placeholder="0"
                                                    min="0"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            m.matiere_id,
                                                            e,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className={styles.priceGroup}>
                                                <span>Final</span>

                                                <strong
                                                    className={
                                                        discounted
                                                            ? styles.discountedPrice
                                                            : styles.normalPrice
                                                    }
                                                >
                                                    {selected
                                                        ? finalDiscount
                                                        : "—"}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>

            <div className={styles.formFooter}>
                <div className={styles.footerRule}>
                    <span />
                    <p>
                        Complete the information before registering the student.
                    </p>
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className={styles.spinner} />
                            <span>Creating...</span>
                        </>
                    ) : (
                        <>
                            <span>Add Student</span>
                            <span className={styles.buttonArrow}>→</span>
                        </>
                    )}
                </button>
            </div>
{showDuplicateWarning && duplicateStudent && (
    <div className={styles.duplicateOverlay}>

        <div className={styles.duplicateModal}>

            {/* HEADER */}

            <div className={styles.duplicateHeader}>

                <div className={styles.duplicateEyebrow}>
                    <span className={styles.duplicateEyebrowLine} />
                    <span>Registration / Verification</span>
                </div>

                <div className={styles.duplicateTitleRow}>

                    <h2 className={styles.duplicateTitle}>
                        Possible
                        <br />
                        <span>Duplicate.</span>
                    </h2>

                    <span className={styles.duplicateNumber}>
                        02
                    </span>

                </div>

                <p className={styles.duplicateSubtitle}>
                    A student with matching information has
                    been found in the records.
                </p>

            </div>


            {/* MATCHING PERCENTAGE */}

            <div className={styles.matchPercentage}>

                <div className={styles.matchPercentageHeader}>

                    <div className={styles.matchingInfo}>

                        <span className={styles.matchingLabel}>
                            Similarity analysis
                        </span>

                        <span className={styles.matchingDescription}>
                            Based on name, last name & subjects
                        </span>

                    </div>

                    <strong className={styles.matchingScore}>
                        {duplicateStudent.matching_percentage}%
                    </strong>

                </div>

                <div className={styles.matchPercentageBar}>
                    <span
                        className={styles.matchPercentageFill}
                        style={{
                            width: `${duplicateStudent.matching_percentage}%`,
                        }}
                    />
                </div>

            </div>


            {/* EXISTING STUDENT */}

            <div className={styles.existingStudent}>

                <span className={styles.existingStudentLabel}>
                    Existing student
                </span>

                <div className={styles.existingStudentInfo}>

                    <div className={styles.studentInitial}>
                        {duplicateStudent.name
                            ?.charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className={styles.studentIdentity}>

                        <strong>
                            {duplicateStudent.name}{" "}
                            {duplicateStudent.lastname}
                        </strong>

                        <span>
                            Student record #
                            {duplicateStudent.student_id}
                        </span>

                    </div>

                </div>


                {/* SUBJECTS */}

                {duplicateStudent.subjects?.length > 0 && (

                    <div className={styles.existingSubjects}>

                        <span className={styles.subjectsLabel}>
                            Registered subjects
                        </span>

                        <div className={styles.subjectTags}>

                            {duplicateStudent.subjects.map(
                                (subject, index) => (

                                    <span
                                        key={index}
                                        className={styles.subjectTag}
                                    >
                                        {subject}
                                    </span>

                                )
                            )}

                        </div>

                    </div>

                )}

            </div>


            {/* QUESTION */}

            <div className={styles.duplicateQuestion}>

                <span className={styles.questionLabel}>
                    Confirmation required
                </span>

                <p>
                    Do you want to register this student anyway?
                </p>

            </div>


            {/* BUTTONS */}

            <div className={styles.duplicateActions}>

                <button
                    type="button"
                    className={styles.cancelDuplicateButton}
                    onClick={cancelStudentCreation}
                >
                    <span>
                        Cancel registration
                    </span>

                    <span className={styles.buttonArrow}>
                        ↗
                    </span>
                </button>


                <button
                    type="button"
                    className={styles.confirmDuplicateButton}
                    onClick={confirmStudentCreation}
                    disabled={loading}
                >
                    <span>
                        {loading
                            ? "Creating..."
                            : "Confirm registration"}
                    </span>

                    <span className={styles.buttonArrow}>
                        →
                    </span>
                </button>

            </div>

        </div>

    </div>
)}
            {message && (
                <div
                    onClick={() => {
                        setType("");
                        setMessage("");
                    }}
                    className={`${styles.message} ${
                        type === "error"
                            ? styles.messageError
                            : styles.messageSuccess
                    }`}
                >
                    {message}
                </div>
            )}
        </form>
    );
};

export default CreateStudent;
