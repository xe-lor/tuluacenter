import React, { useEffect, useState } from "react";
import API from "../../api.js";
import styles from '../../shared.module.css';

const IndexMatieres = () => {
    const [matieres, setMatieres] = useState([]);
    const [newMatiere, setNewMatiere] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        API.get("/admin/matieres")
            .then((res) => setMatieres(res.data.matieres))
            .catch((err) => console.error(err));
    }, []);

    // ADD
    const handleAdd = () => {
        const name = newMatiere.trim();
        if (!name) return alert("Name is required");

        API.post("/admin/storeMatiere", { name })
            .then((res) => {
                setMatieres((prev) => [...prev, res.data.matiere]);
                setNewMatiere("");
                setIsAdding(false);
            })
            .catch((err) => {
                console.error(err);
                alert("Error adding matiere");
            });
    };

    // EDIT
    const handleEdit = (matiere) => {
        setEditingId(matiere.id);
        setEditValue(matiere.name);
    };

    const handleUpdate = (id) => {
        const name = editValue.trim();
        if (!name) return alert("Name is required");

        API.put(`/admin/matieres/${id}`, { name })
            .then((res) => {
                const updated = res.data.matiere;
                setMatieres((prev) =>
                    prev.map((m) => (m.id === id ? updated : m)),
                );
                setEditingId(null);
                setEditValue("");
            })
            .catch((err) => {
                console.error(err);
                alert("Error updating matiere");
            });
    };

    // DELETE
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        API.post("/admin/matieres/delete", { id })
            .then(() => {
                setMatieres((prev) => prev.filter((m) => m.id !== id));
            })
            .catch((err) => {
                console.error(err);
                alert("Error deleting matiere");
            });
    };

    return (
        <div className={styles.admin_matieres_index_pageContainer}>
            <div className={styles.admin_matieres_index_managementCard}>
                {/* HEADER */}
                <div className={styles.admin_matieres_index_cardHeader}>
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
                        <span className={styles.admin_matieres_index_headerLabel}>
                            ACADEMIC ADMINISTRATION
                        </span>

                        <h1 className={styles.admin_matieres_index_headerTitle}>Matieres</h1>

                        <p className={styles.admin_matieres_index_headerSubtitle}>
                            Manage subjects and their academic information.
                        </p>
                    </div>

                    <button
                        className={styles.admin_matieres_index_addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        <span className={styles.admin_matieres_index_addIcon}>+</span>
                        Add Matiere
                    </button>
                </div>

                {/* TABLE */}
                <div className={styles.admin_matieres_index_tableContainer}>
                    <table className={styles.admin_matieres_index_table}>
                        <thead>
                            <tr>
                                <th className={styles.admin_matieres_index_idHeader}>ID</th>
                                <th>Name</th>
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
                                            placeholder="Matiere name"
                                            value={newMatiere}
                                            onChange={(e) =>
                                                setNewMatiere(e.target.value)
                                            }
                                        />
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
                                                onClick={() =>
                                                    setIsAdding(false)
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* DATA ROWS */}
                            {matieres.length > 0 ? (
                                matieres.map((m) => (
                                    <tr key={m.id} className={styles.admin_matieres_index_dataRow}>
                                        <td>
                                            <span className={styles.admin_matieres_index_idNumber}>
                                                {m.id}
                                            </span>
                                        </td>

                                        <td>
                                            {editingId === m.id ? (
                                                <input
                                                    className={
                                                        styles.admin_matieres_index_tableInput
                                                    }
                                                    value={editValue}
                                                    onChange={(e) =>
                                                        setEditValue(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <span
                                                    className={styles.admin_matieres_index_nameText}
                                                >
                                                    {m.name}
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {editingId === m.id ? (
                                                <div
                                                    className={
                                                        styles.admin_matieres_index_actionGroup
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles.admin_matieres_index_saveButton
                                                        }
                                                        onClick={() =>
                                                            handleUpdate(m.id)
                                                        }
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        className={
                                                            styles.admin_matieres_index_cancelButton
                                                        }
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    className={
                                                        styles.admin_matieres_index_actionGroup
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles.admin_matieres_index_editButton
                                                        }
                                                        onClick={() =>
                                                            handleEdit(m)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className={
                                                            styles.admin_matieres_index_deleteButton
                                                        }
                                                        onClick={() =>
                                                            handleDelete(m.id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className={styles.admin_matieres_index_emptyRow}>
                                    <td colSpan="3">
                                        <div className={styles.admin_matieres_index_emptyState}>
                                            <span
                                                className={styles.admin_matieres_index_emptyAccent}
                                            ></span>

                                            <span className={styles.admin_matieres_index_emptyTitle}>
                                                No Matieres Found
                                            </span>

                                            <span
                                                className={styles.admin_matieres_index_emptySubtitle}
                                            >
                                                Add a subject to begin managing
                                                your academic data.
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

export default IndexMatieres;
