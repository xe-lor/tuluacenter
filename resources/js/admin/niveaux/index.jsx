import React, { useEffect, useState } from "react";
import API from "../../api.js";
import styles from '../../shared.module.css';

const IndexNiveaux = () => {
    const [niveaux, setNiveaux] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newAvrage, setNewAvrage] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editAvrage, setEditAvrage] = useState("");

    useEffect(() => {
        API.get("/admin/niveaux")
            .then((res) => setNiveaux(res.data.niveaux))
            .catch((err) => console.error(err));
    }, []);

    // ADD
    const handleAdd = () => {
        if (!newName.trim()) return alert("Name required");

        API.post("/admin/storeNiveau", {
            name: newName,
            avrage: newAvrage,
        })
            .then((res) => {
                setNiveaux([...niveaux, res.data.niveau]);
                setNewName("");
                setNewAvrage("");
                setIsAdding(false);
            })
            .catch((err) => console.error(err));
    };

    // EDIT
    const handleEdit = (niveau) => {
        setEditingId(niveau.id);
        setEditName(niveau.name);
        setEditAvrage(niveau.avrage || "");
    };

    const handleUpdate = (id) => {
        if (!editName.trim()) return alert("Name required");

        API.put(`/admin/niveaux/${id}`, {
            name: editName,
            avrage: editAvrage,
        })
            .then((res) => {
                const updated = res.data.niveau;

                setNiveaux(niveaux.map((n) => (n.id === id ? updated : n)));

                setEditingId(null);
            })
            .catch((err) => console.error(err));
    };

    // DELETE
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure?")) return;

        API.post("/admin/niveaux/delete", { id })
            .then(() => {
                setNiveaux(niveaux.filter((n) => n.id !== id));
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className={styles.admin_niveaux_index_pageContainer}>
            <div className={styles.admin_niveaux_index_managementCard}>
                {/* HEADER */}
                <div className={styles.admin_niveaux_index_cardHeader}>
                    {/* Header background image */}
                    <img
                        src="/images/neonImage.png"
                        alt=""
                        className={styles.admin_niveaux_index_headerBackground}
                    />

                    {/* Dark overlay */}
                    <div className={styles.admin_niveaux_index_headerOverlay}></div>

                    <div className={styles.admin_niveaux_index_headerContent}>
                        <span className={styles.admin_niveaux_index_headerLabel}>
                            ACADEMIC ADMINISTRATION
                        </span>

                        <h1 className={styles.admin_niveaux_index_headerTitle}>Niveaux</h1>

                        <p className={styles.admin_niveaux_index_headerSubtitle}>
                            Manage academic levels and their average values.
                        </p>
                    </div>

                    <button
                        className={styles.admin_niveaux_index_addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        Add Niveau
                    </button>
                </div>

                {/* TABLE BODY */}
                <div className={styles.admin_niveaux_index_tableContainer}>
                    <table className={styles.admin_niveaux_index_table}>
                        <thead>
                            <tr>
                                <th className={styles.admin_niveaux_index_idHeader}>ID</th>

                                <th>Name</th>

                                <th>Avrage</th>

                                <th className={styles.admin_niveaux_index_actionsHeader}>
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* ADD ROW */}
                            {isAdding && (
                                <tr className={styles.admin_niveaux_index_addRow}>
                                    <td>
                                        <span className={styles.admin_niveaux_index_newBadge}>
                                            NEW
                                        </span>
                                    </td>

                                    <td>
                                        <input
                                            className={styles.admin_niveaux_index_tableInput}
                                            placeholder="Name"
                                            value={newName}
                                            onChange={(e) =>
                                                setNewName(e.target.value)
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            className={styles.admin_niveaux_index_tableInput}
                                            placeholder="Avrage"
                                            value={newAvrage}
                                            onChange={(e) =>
                                                setNewAvrage(e.target.value)
                                            }
                                        />
                                    </td>

                                    <td>
                                        <div className={styles.admin_niveaux_index_actionGroup}>
                                            <button
                                                className={styles.admin_niveaux_index_saveButton}
                                                onClick={handleAdd}
                                            >
                                                Save
                                            </button>

                                            <button
                                                className={styles.admin_niveaux_index_cancelButton}
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
                            {niveaux.length > 0 ? (
                                niveaux.map((n) => (
                                    <tr key={n.id} className={styles.admin_niveaux_index_dataRow}>
                                        <td>
                                            <span className={styles.admin_niveaux_index_idNumber}>
                                                {n.id}
                                            </span>
                                        </td>

                                        <td>
                                            {editingId === n.id ? (
                                                <input
                                                    className={
                                                        styles.admin_niveaux_index_tableInput
                                                    }
                                                    value={editName}
                                                    onChange={(e) =>
                                                        setEditName(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <span
                                                    className={styles.admin_niveaux_index_nameText}
                                                >
                                                    {n.name}
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {editingId === n.id ? (
                                                <input
                                                    className={
                                                        styles.admin_niveaux_index_tableInput
                                                    }
                                                    value={editAvrage}
                                                    onChange={(e) =>
                                                        setEditAvrage(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <span
                                                    className={
                                                        styles.admin_niveaux_index_averageText
                                                    }
                                                >
                                                    {n.avrage}
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {editingId === n.id ? (
                                                <div
                                                    className={
                                                        styles.admin_niveaux_index_actionGroup
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles.admin_niveaux_index_saveButton
                                                        }
                                                        onClick={() =>
                                                            handleUpdate(n.id)
                                                        }
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        className={
                                                            styles.admin_niveaux_index_cancelButton
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
                                                        styles.admin_niveaux_index_actionGroup
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles.admin_niveaux_index_editButton
                                                        }
                                                        onClick={() =>
                                                            handleEdit(n)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className={
                                                            styles.admin_niveaux_index_deleteButton
                                                        }
                                                        onClick={() =>
                                                            handleDelete(n.id)
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
                                <tr className={styles.admin_niveaux_index_emptyRow}>
                                    <td colSpan="4">
                                        <div className={styles.admin_niveaux_index_emptyState}>
                                            <span
                                                className={styles.admin_niveaux_index_emptyAccent}
                                            ></span>

                                            <span className={styles.admin_niveaux_index_emptyTitle}>
                                                No Niveaux Found
                                            </span>

                                            <span
                                                className={styles.admin_niveaux_index_emptySubtitle}
                                            >
                                                Add a level to begin managing
                                                your academic structure.
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

export default IndexNiveaux;
