import React, { useEffect, useState } from "react";
import API from "../../api.js";
import TableSkeleton from "../../TableSkeleton.jsx";
import styles from '../../shared.module.css';

const ACTION_LABELS = {
    create: "Create",
    update: "Update",
    delete: "Delete",
};

const History = () => {
    const [histories, setHistories] = useState([]);
    const [secretaries, setSecretaries] = useState([]);
    const [loading, setLoading] = useState(true);

    // FILTERS
    const [showFilters, setShowFilters] = useState(false);
    const [filterSecretary, setFilterSecretary] = useState("");
    const [filterAction, setFilterAction] = useState("");

    // ADD
    const [newName, setNewName] = useState("");
    const [newSecretaryId, setNewSecretaryId] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Reload from the server every time a filter changes
    useEffect(() => {
        const params = {};
        if (filterSecretary) params.secretary_id = filterSecretary;
        if (filterAction) params.action = filterAction;

        setLoading(true);

        API.get("/admin/histories", { params })
            .then((res) => {
                setHistories(res.data.histories);
                setSecretaries(res.data.secretaries);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [filterSecretary, filterAction]);

    const formatDate = (value) => {
        if (!value) return "-";
        const d = new Date(value);
        return isNaN(d) ? value : d.toLocaleString();
    };

    const resetFilters = () => {
        setFilterSecretary("");
        setFilterAction("");
    };

    // ADD
    const handleAdd = () => {
        const name = newName.trim();
        if (!name) return alert("Name is required");
        if (!newSecretaryId) return alert("Secretary is required");

        API.post("/admin/storeHistory", {
            name,
            secretary_id: newSecretaryId,
        })
            .then((res) => {
                const created = res.data.history;

                // Only show the new row if it matches the active filters
                const matchesSecretary =
                    !filterSecretary ||
                    String(created.secretary_id) === String(filterSecretary);
                const matchesAction =
                    !filterAction || created.action === filterAction;

                if (matchesSecretary && matchesAction) {
                    setHistories((prev) => [created, ...prev]);
                }

                setNewName("");
                setNewSecretaryId("");
                setIsAdding(false);
            })
            .catch((err) => {
                console.error(err);
                alert("Error adding history");
            });
    };

    // DELETE
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        API.post("/admin/histories/delete", { id })
            .then(() => {
                setHistories((prev) => prev.filter((h) => h.id !== id));
            })
            .catch((err) => {
                console.error(err);
                alert("Error deleting history");
            });
    };

    // ---- Filter bar styles (inline) -------------------------------------
    const HEADER_OPEN_MIN_HEIGHT = "280px";

    const filterRowStyle = {
        position: "relative",
        zIndex: 5,
        marginTop: "18px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "10px",
    };

    const filterToggleStyle = {
        position: "relative",
        zIndex: 5,
        height: "26px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "0 12px",
        margin: "-6px 0 -6px 14px",
        borderRadius: "999px",
        border: "1px solid rgba(255, 255, 255, 0.28)",
        background: showFilters ? "rgba(255, 255, 255, 0.22)" : "rgba(10, 12, 24, 0.55)",
        color: "#fff",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
    };

    const filterBadgeStyle = {
        minWidth: "16px",
        height: "16px",
        padding: "0 4px",
        borderRadius: "8px",
        background: "#fff",
        color: "#14172b",
        fontSize: "11px",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const filterBarStyle = {
        width: "fit-content",
        maxWidth: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "14px",
        background: "rgba(10, 12, 24, 0.55)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
    };

    const filterSelectStyle = {
        height: "38px",
        minWidth: "160px",
        padding: "0 12px",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        background: "rgba(255, 255, 255, 0.10)",
        color: "#fff",
        fontSize: "14px",
        outline: "none",
        cursor: "pointer",
    };

    const filterOptionStyle = {
        background: "#14172b",
        color: "#fff",
    };

    const filterResetStyle = {
        height: "38px",
        padding: "0 16px",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.35)",
        background: "transparent",
        color: "#fff",
        fontSize: "14px",
        cursor: "pointer",
    };

    return (
        <div className={styles.admin_matieres_index_pageContainer}>
            <div className={styles.admin_matieres_index_managementCard}>
                {/* HEADER */}
                <div
                    className={styles.admin_matieres_index_cardHeader}
                    style={
                        showFilters
                            ? { position: "relative", height: "auto", minHeight: HEADER_OPEN_MIN_HEIGHT }
                            : { position: "relative" }
                    }
                >
                    {/* Header background image */}
                    <img
                        src="/images/neonImage.png"
                        alt=""
                        aria-hidden="true"
                        className={styles.admin_matieres_index_headerBackground}
                    />

                    {/* Dark overlay over the image */}
                    <div className={styles.admin_matieres_index_headerOverlay}></div>

                    <div className={styles.admin_matieres_index_headerContent}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span className={styles.admin_matieres_index_headerLabel}>
                                ACADEMIC ADMINISTRATION
                            </span>

                            <button
                                type="button"
                                style={filterToggleStyle}
                                onClick={() => setShowFilters((v) => !v)}
                                aria-expanded={showFilters}
                            >
                                Filters
                                {(filterSecretary || filterAction) && (
                                    <span style={filterBadgeStyle}>
                                        {(filterSecretary ? 1 : 0) + (filterAction ? 1 : 0)}
                                    </span>
                                )}
                                <span aria-hidden="true">{showFilters ? "\u25B4" : "\u25BE"}</span>
                            </button>
                        </div>

                        <h1 className={styles.admin_matieres_index_headerTitle}>History</h1>

                        <p className={styles.admin_matieres_index_headerSubtitle}>
                            Follow the actions done by the secretaries.
                        </p>

                        {/* FILTERS (toggle + panel, under the subtitle) */}
                        {showFilters && (
                            <div style={filterRowStyle}>
                                <div style={filterBarStyle}>
                                    <select
                                        style={filterSelectStyle}
                                        value={filterSecretary}
                                        onChange={(e) => setFilterSecretary(e.target.value)}
                                    >
                                        <option value="" style={filterOptionStyle}>All assistants</option>
                                        {secretaries.map((s) => (
                                            <option key={s.id} value={s.id} style={filterOptionStyle}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        style={filterSelectStyle}
                                        value={filterAction}
                                        onChange={(e) => setFilterAction(e.target.value)}
                                    >
                                        <option value="" style={filterOptionStyle}>All actions</option>
                                        <option value="create" style={filterOptionStyle}>Create</option>
                                        <option value="update" style={filterOptionStyle}>Update</option>
                                        <option value="delete" style={filterOptionStyle}>Delete</option>
                                    </select>

                                    {(filterSecretary || filterAction) && (
                                        <button style={filterResetStyle} onClick={resetFilters}>
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className={styles.admin_matieres_index_addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        <span className={styles.admin_matieres_index_addIcon}>+</span>
                        Add History
                    </button>
                </div>

                {/* TABLE */}
                <div className={styles.admin_matieres_index_tableContainer}>
                    <table className={styles.admin_matieres_index_table}>
                        <thead>
                            <tr>
                                <th className={styles.admin_matieres_index_idHeader}>ID</th>
                                <th>Action</th>
                                <th>Type</th>
                                <th>Secretary</th>
                                <th>Date</th>
                                <th className={styles.admin_matieres_index_actionsHeader}>
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* ADD ROW */}
                            {isAdding && (
                                <tr className={styles.admin_matieres_index_addRow}>
                                    <td>
                                        <span className={styles.admin_matieres_index_newBadge}>
                                            NEW
                                        </span>
                                    </td>

                                    <td>
                                        <input
                                            className={styles.admin_matieres_index_tableInput}
                                            placeholder="Action description"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />
                                    </td>

                                    <td>
                                        <span className={styles.admin_matieres_index_nameText}>
                                            -
                                        </span>
                                    </td>

                                    <td>
                                        <select
                                            className={styles.admin_matieres_index_tableInput}
                                            value={newSecretaryId}
                                            onChange={(e) => setNewSecretaryId(e.target.value)}
                                        >
                                            <option value="">Select secretary</option>
                                            {secretaries.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td>
                                        <span className={styles.admin_matieres_index_nameText}>
                                            -
                                        </span>
                                    </td>

                                    <td>
                                        <div className={styles.admin_matieres_index_actionGroup}>
                                            <button
                                                className={styles.admin_matieres_index_saveButton}
                                                onClick={handleAdd}
                                            >
                                                Save
                                            </button>

                                            <button
                                                className={styles.admin_matieres_index_cancelButton}
                                                onClick={() => setIsAdding(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* DATA ROWS */}
                            {loading ? (
                                <TableSkeleton
                                    rows={6}
                                    widths={["30px", "60%", "50%", "50%", "70%", "90px"]}
                                />
                            ) : histories.length > 0 ? (
                                histories.map((h) => (
                                    <tr key={h.id} className={styles.admin_matieres_index_dataRow}>
                                        <td>
                                            <span className={styles.admin_matieres_index_idNumber}>
                                                {h.id}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={styles.admin_matieres_index_nameText}>
                                                {h.name}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={styles.admin_matieres_index_nameText}>
                                                {ACTION_LABELS[h.action] || "-"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={styles.admin_matieres_index_nameText}>
                                                {h.secretary_name}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={styles.admin_matieres_index_nameText}>
                                                {formatDate(h.created_at)}
                                            </span>
                                        </td>

                                        <td>
                                            <div className={styles.admin_matieres_index_actionGroup}>
                                                <button
                                                    className={styles.admin_matieres_index_deleteButton}
                                                    onClick={() => handleDelete(h.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className={styles.admin_matieres_index_emptyRow}>
                                    <td colSpan="6">
                                        <div className={styles.admin_matieres_index_emptyState}>
                                            <span className={styles.admin_matieres_index_emptyAccent}></span>

                                            <span className={styles.admin_matieres_index_emptyTitle}>
                                                No History Found
                                            </span>

                                            <span className={styles.admin_matieres_index_emptySubtitle}>
                                                {filterSecretary || filterAction
                                                    ? "No action matches the selected filters."
                                                    : "Actions done by secretaries will appear here."}
                                            </span>
                                        </div>
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

export default History;