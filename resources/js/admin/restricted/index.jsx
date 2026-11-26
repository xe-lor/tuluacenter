import React, { useEffect, useState } from "react";
import API from "../../api.js";
import TableSkeleton from "../../TableSkeleton.jsx";
import styles from "../../shared.module.css";

const MONTHS = [
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
];

const ENDPOINT = "/admin/restricted-data";

const SecretaryRow = ({ secretary }) => {
    const [restricted, setRestricted] = useState(Boolean(secretary.restricted));
    const [blockedMonths, setBlockedMonths] = useState(secretary.blocked_months ?? "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const save = () => {
        setSaving(true);
        setMessage("");
        setError("");

        API.put(`${ENDPOINT}/${secretary.id}`, {
            restricted,
            blocked_months: blockedMonths === "" ? null : Number(blockedMonths),
        })
            .then(() => setMessage("Enregistré"))
            .catch((err) => {
                console.error(err);
                setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
            })
            .finally(() => setSaving(false));
    };

    return (
        <tr className={styles.admin_niveaux_index_dataRow}>
            <td>
                <span className={styles.admin_niveaux_index_nameText}>
                    {secretary.name}
                </span>
            </td>

            <td>
                <input
                    type="checkbox"
                    checked={restricted}
                    onChange={(e) => setRestricted(e.target.checked)}
                />
            </td>

            <td>
                <select
                    className={styles.admin_niveaux_index_tableInput}
                    value={blockedMonths}
                    disabled={!restricted}
                    onChange={(e) => setBlockedMonths(e.target.value)}
                >
                    <option value="">No month blocked</option>
                    {MONTHS.map((m, i) => (
                        <option key={m.value} value={m.value}>
                            {i === 0 ? "September only" : `September to ${m.label}`}
                        </option>
                    ))}
                </select>
            </td>

            <td>
                <div className={styles.admin_niveaux_index_actionGroup}>
                    <button
                        className={styles.admin_niveaux_index_saveButton}
                        onClick={save}
                        disabled={saving}
                    >
                        Enregistrer
                    </button>
                    {message && (
                        <span className={styles.admin_niveaux_index_averageText}>
                            {message}
                        </span>
                    )}
                    {error && (
                        <span className={styles.admin_niveaux_index_averageText}>
                            {error}
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
};

const Restricted = () => {
    const [secretaries, setSecretaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        API.get(ENDPOINT)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : res.data?.secretaries;

                if (!Array.isArray(data)) {
                    setLoadError("Réponse inattendue du serveur.");
                    return;
                }

                setSecretaries(data);
            })
            .catch((err) => {
                console.error(err);
                setLoadError(
                    `Erreur ${err.response?.status ?? ""} en chargeant ${ENDPOINT}`
                );
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className={styles.admin_niveaux_index_pageContainer}>
            <div className={styles.admin_niveaux_index_managementCard}>
                <div className={styles.admin_niveaux_index_cardHeader}>
                    <img
                        src="/images/neonImage.png"
                        alt=""
                        className={styles.admin_niveaux_index_headerBackground}
                    />
                    <div className={styles.admin_niveaux_index_headerOverlay}></div>

                    <div className={styles.admin_niveaux_index_headerContent}>
                        <span className={styles.admin_niveaux_index_headerLabel}>
                            ACADEMIC ADMINISTRATION
                        </span>
                        <h1 className={styles.admin_niveaux_index_headerTitle}>
                            Mois bloqués par secrétaire
                        </h1>
                        <p className={styles.admin_niveaux_index_headerSubtitle}>
                            Les mois de septembre jusqu'au mois choisi ne pourront plus être
                            modifiés par les secrétaires restreintes.
                        </p>
                    </div>
                </div>

                <div className={styles.admin_niveaux_index_tableContainer}>
                    <table className={styles.admin_niveaux_index_table}>
                        <thead>
                            <tr>
                                <th style={{merginLeft: 100}}>Assistant</th>
                                <th style={{merginLeft: 100}}>Restrict</th>
                                <th style={{merginLeft: 100}}>Blocked Months</th>
                                <th style={{merginLeft: 100}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <TableSkeleton rows={6} columns={4} widths={["60%", "20px", "80%", "90px"]} />
                        ) : loadError ? (
                                <tr>
                                    <td colSpan="4">
                                        <span className={styles.admin_niveaux_index_averageText}>
                                            {loadError}
                                        </span>
                                    </td>
                                </tr>
                            ) : secretaries.length > 0 ? (
                                secretaries.map((s) => (
                                    <SecretaryRow key={s.id} secretary={s} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">
                                        <span className={styles.admin_niveaux_index_averageText}>
                                            Aucune secrétaire trouvée.
                                        </span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Restricted;