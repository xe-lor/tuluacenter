import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api.js";

import styles from '../shared.module.css';

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
        <div className={styles.payment_create_pageContainer}>
            <form className={styles.payment_create_managementCard} onSubmit={handleSubmit}>
                {/* HEADER */}
                <div className={styles.payment_create_cardHeader}>
                    {/* Header background image */}
                    <img
                        src="/images/neonImage.png"
                        alt=""
                        aria-hidden="true"
                        className={styles.payment_create_headerBackground}
                    />

                    {/* Dark overlay over the image */}
                    <div className={styles.payment_create_headerOverlay}></div>

                    <div className={styles.payment_create_headerContent}>
                        <span className={styles.payment_create_headerLabel}>
                            STUDENT REGISTRATION
                        </span>

                        <h1 className={styles.payment_create_headerTitle}>
                            Create
                            <span> Student.</span>
                        </h1>

                        <p className={styles.payment_create_headerSubtitle}>
                            Register a student, assign their academic level and
                            subjects, then configure individual pricing.
                        </p>
                    </div>

                </div>

                {/* FORM BODY */}
                <div className={styles.payment_create_formLayout}>
                    <section className={styles.payment_create_personalSection}>
                        <div className={styles.payment_create_sectionHeading}>
                            <span className={styles.payment_create_sectionNumber}>01</span>

                            <div>
                                <span className={styles.payment_create_sectionLabel}>
                                    Personal Details
                                </span>
                                <h2>Student information</h2>
                            </div>
                        </div>

                        <div className={styles.payment_create_inputGrid}>
                            <div className={styles.payment_create_inputGroup}>
                                <label htmlFor="studentName">First name</label>
                                <input
                                    id="studentName"
                                    type="text"
                                    className={styles.payment_create_inputField}
                                    placeholder="Enter first name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className={styles.payment_create_inputGroup}>
                                <label htmlFor="studentLastName">Last name</label>
                                <input
                                    id="studentLastName"
                                    type="text"
                                    className={styles.payment_create_inputField}
                                    placeholder="Enter last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>

                            <div className={styles.payment_create_inputGroup}>
                                <label htmlFor="parentName">Parent name</label>
                                <input
                                    id="parentName"
                                    type="text"
                                    className={styles.payment_create_inputField}
                                    placeholder="Enter parent name"
                                    value={parentName}
                                    onChange={(e) => setParentName(e.target.value)}
                                />
                            </div>

                            <div className={styles.payment_create_inputGroup}>
                                <label htmlFor="studentPhone">Student phone</label>
                                <input
                                    id="studentPhone"
                                    type="text"
                                    className={styles.payment_create_inputField}
                                    placeholder="+212..."
                                    value={studentPhone}
                                    onChange={(e) => setStudentPhone(e.target.value)}
                                />
                            </div>

                            <div className={styles.payment_create_inputGroup}>
                                <label htmlFor="parentPhone">Parent phone</label>
                                <input
                                    id="parentPhone"
                                    type="tel"
                                    className={styles.payment_create_inputField}
                                    placeholder="+212..."
                                    value={parentPhone}
                                    onChange={(e) => setParentPhone(e.target.value)}
                                />
                            </div>

                            <div className={styles.payment_create_inputGroup}>
                                <label htmlFor="group">Group</label>
                                <input
                                    id="group"
                                    type="number"
                                    className={styles.payment_create_inputField}
                                    placeholder="Group number"
                                    value={groupe || ""}
                                    onChange={(e) => setGroupe(Number(e.target.value))}
                                />
                            </div>

                            <div className={styles.payment_create_inputGroup}>
                                <label htmlFor="registrationDate">
                                    Registration date
                                </label>
                                <input
                                    id="registrationDate"
                                    type="date"
                                    className={styles.payment_create_inputField}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div className={styles.payment_create_statusGroup}>
                                <span className={styles.payment_create_statusLabel}>
                                    Payment status
                                </span>

                                <label className={styles.payment_create_statusControl}>
                                    <input
                                        type="checkbox"
                                        checked={state === "paye"}
                                        onChange={(e) =>
                                            setState(e.target.checked ? "paye" : "impaye")
                                        }
                                    />

                                    <span className={styles.payment_create_customCheckbox}>
                                        <span />
                                    </span>

                                    <span
                                        className={
                                            state === "paye"
                                                ? styles.payment_create_statusPaid
                                                : styles.payment_create_statusUnpaid
                                        }
                                    >
                                        {state === "paye" ? "Paid" : "Unpaid"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <section className={styles.payment_create_academicSection}>
                        <div className={styles.payment_create_sectionHeading}>
                            <span className={styles.payment_create_sectionNumber}>02</span>

                            <div>
                                <span className={styles.payment_create_sectionLabel}>
                                    Academic Setup
                                </span>
                                <h2>Classes & pricing</h2>
                            </div>
                        </div>

                        <div className={styles.payment_create_levelGroup}>
                            <label htmlFor="niveau">Academic level</label>

                            <div className={styles.payment_create_selectWrapper}>
                                <select
                                    id="niveau"
                                    className={styles.payment_create_niveauSelect}
                                    value={niveau}
                                    onChange={handleSelectedNiveau}
                                >
                                    <option value="">Select a level</option>

                                    {niveauMatieres.map((n) => (
                                        <option key={n.niveau_id} value={n.niveau_id}>
                                            {n.niveau_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.payment_create_subjectsContainer}>
                            {matieresNiveau.length === 0 ? (
                                <div className={styles.payment_create_emptySubjects}>
                                    <span>Subjects</span>
                                    <p>
                                        Select an academic level to display its
                                        available subjects.
                                    </p>
                                </div>
                            ) : (
                                matieresNiveau.map((m, index) => {
                                    const price = Number(m.matiere_price);
                                    const red = Number(reduction[m.matiere_id] || 0);
                                    const finalDiscount = price - red;
                                    const selected = classe.includes(m.class_id);
                                    const discounted = finalDiscount < price;

                                    return (
                                        <div
                                            className={`${styles.payment_create_matiereItem} ${
                                                selected ? styles.payment_create_matiereSelected : ""
                                            }`}
                                            key={m.class_id}
                                        >
                                            <div className={styles.payment_create_subjectIdentity}>
                                                <span className={styles.payment_create_subjectIndex}>
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>

                                                <div>
                                                    <label
                                                        className={styles.payment_create_subjectName}
                                                        htmlFor={`subject-${m.class_id}`}
                                                    >
                                                        {m.matiere_name}
                                                    </label>

                                                    <span className={styles.payment_create_originalPrice}>
                                                        Base price: {price}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={styles.payment_create_subjectControls}>
                                                <label className={styles.payment_create_subjectCheck}>
                                                    <input
                                                        id={`subject-${m.class_id}`}
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() =>
                                                            handleMatiereChange(m.class_id)
                                                        }
                                                    />
                                                    <span className={styles.payment_create_subjectCheckBox} />
                                                </label>

                                                <div className={styles.payment_create_reductionGroup}>
                                                    <label htmlFor={`reduction-${m.matiere_id}`}>
                                                        Reduction
                                                    </label>

                                                    <input
                                                        id={`reduction-${m.matiere_id}`}
                                                        type="number"
                                                        className={styles.payment_create_reductionInput}
                                                        value={reduction[m.matiere_id] || ""}
                                                        placeholder="0"
                                                        min="0"
                                                        onChange={(e) =>
                                                            handleChange(m.matiere_id, e)
                                                        }
                                                    />
                                                </div>

                                                <div className={styles.payment_create_priceGroup}>
                                                    <span>Final</span>

                                                    <strong
                                                        className={
                                                            discounted
                                                                ? styles.payment_create_discountedPrice
                                                                : styles.payment_create_normalPrice
                                                        }
                                                    >
                                                        {selected ? finalDiscount : "—"}
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

                {/* FOOTER */}
                <div className={styles.payment_create_formFooter}>
                    <div className={styles.payment_create_footerRule}>
                        <span />
                        <p>Complete the information before registering the student.</p>
                    </div>

                    <button
                        type="submit"
                        className={styles.payment_create_submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className={styles.payment_create_spinner} />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <span>Add Student</span>
                                <span className={styles.payment_create_buttonArrow}>→</span>
                            </>
                        )}
                    </button>
                </div>

                {/* DUPLICATE WARNING */}
                {showDuplicateWarning && duplicateStudent && (
                    <div className={styles.payment_create_duplicateOverlay}>
                        <div className={styles.payment_create_duplicateModal}>
                            <div className={styles.payment_create_duplicateHeader}>
                                <div className={styles.payment_create_duplicateEyebrow}>
                                    <span className={styles.payment_create_duplicateEyebrowLine} />
                                    <span>Registration / Verification</span>
                                </div>

                                <div className={styles.payment_create_duplicateTitleRow}>
                                    <h2 className={styles.payment_create_duplicateTitle}>
                                        Possible
                                        <br />
                                        <span>Duplicate.</span>
                                    </h2>

                                    <span className={styles.payment_create_duplicateNumber}>02</span>
                                </div>

                                <p className={styles.payment_create_duplicateSubtitle}>
                                    A student with matching information has been
                                    found in the records.
                                </p>
                            </div>

                            <div className={styles.payment_create_matchPercentage}>
                                <div className={styles.payment_create_matchPercentageHeader}>
                                    <div className={styles.payment_create_matchingInfo}>
                                        <span className={styles.payment_create_matchingLabel}>
                                            Similarity analysis
                                        </span>
                                        <span className={styles.payment_create_matchingDescription}>
                                            Based on name, last name & subjects
                                        </span>
                                    </div>

                                    <strong className={styles.payment_create_matchingScore}>
                                        {duplicateStudent.matching_percentage}%
                                    </strong>
                                </div>

                                <div className={styles.payment_create_matchPercentageBar}>
                                    <span
                                        className={styles.payment_create_matchPercentageFill}
                                        style={{
                                            width: `${duplicateStudent.matching_percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className={styles.payment_create_existingStudent}>
                                <span className={styles.payment_create_existingStudentLabel}>
                                    Existing student
                                </span>

                                <div className={styles.payment_create_existingStudentInfo}>
                                    <div className={styles.payment_create_studentInitial}>
                                        {duplicateStudent.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className={styles.payment_create_studentIdentity}>
                                        <strong>
                                            {duplicateStudent.name}{" "}
                                            {duplicateStudent.lastname}
                                        </strong>
                                        <span>
                                            Student record #{duplicateStudent.student_id}
                                        </span>
                                    </div>
                                </div>

                                {duplicateStudent.subjects?.length > 0 && (
                                    <div className={styles.payment_create_existingSubjects}>
                                        <span className={styles.payment_create_subjectsLabel}>
                                            Registered subjects
                                        </span>

                                        <div className={styles.payment_create_subjectTags}>
                                            {duplicateStudent.subjects.map((subject, index) => (
                                                <span key={index} className={styles.payment_create_subjectTag}>
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.payment_create_duplicateQuestion}>
                                <span className={styles.payment_create_questionLabel}>
                                    Confirmation required
                                </span>
                                <p>Do you want to register this student anyway?</p>
                            </div>

                            <div className={styles.payment_create_duplicateActions}>
                                <button
                                    type="button"
                                    className={styles.payment_create_cancelDuplicateButton}
                                    onClick={cancelStudentCreation}
                                >
                                    <span>Cancel registration</span>
                                    <span className={styles.payment_create_buttonArrow}>↗</span>
                                </button>

                                <button
                                    type="button"
                                    className={styles.payment_create_confirmDuplicateButton}
                                    onClick={confirmStudentCreation}
                                    disabled={loading}
                                >
                                    <span>
                                        {loading ? "Creating..." : "Confirm registration"}
                                    </span>
                                    <span className={styles.payment_create_buttonArrow}>→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MESSAGE */}
                {message && (
                    <div
                        onClick={() => {
                            setType("");
                            setMessage("");
                        }}
                        className={`${styles.payment_create_message} ${
                            type === "error" ? styles.payment_create_messageError : styles.payment_create_messageSuccess
                        }`}
                    >
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreateStudent;
