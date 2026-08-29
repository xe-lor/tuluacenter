import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import styles from './index.module.css';

const IndexMatieres = () => {
    const [matieres, setMatieres] = useState([]);
    const [newMatiere, setNewMatiere] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        API.get('/admin/matieres')
            .then(res => setMatieres(res.data.matieres))
            .catch(err => console.error(err));
    }, []);

    // ADD
    const handleAdd = () => {
        if (!newMatiere.trim()) return alert("Name is required");

        API.post('/admin/storeMatiere', { name: newMatiere })
            .then(res => {
                setMatieres([...matieres, res.data.matiere]);
                setNewMatiere("");
                setIsAdding(false);
            })
            .catch(err => console.error(err));
    };

    // EDIT
    const handleEdit = (matiere) => {
        setEditingId(matiere.id);
        setEditValue(matiere.name);
    };

    const handleUpdate = (id) => {
        if (!editValue.trim()) return alert("Name is required");

        API.put(`/admin/matieres/${id}`, { name: editValue })
            .then(res => {
                const updated = res.data.matiere;
                setMatieres(matieres.map(m => m.id === id ? updated : m));
                setEditingId(null);
                setEditValue("");
            })
            .catch(err => console.error(err));
    };

    // DELETE
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        API.post('/admin/matieres/delete', { id })
            .then(() => {
                setMatieres(matieres.filter(m => m.id !== id));
            })
            .catch(err => console.error(err));
    };

    return (
        <div className={styles.pageContainer}>

            <div className={styles.managementCard}>

                {/* HEADER */}

                <div className={styles.cardHeader}>

                    <div className={styles.headerContent}>

                        <span className={styles.headerLabel}>
                            ACADEMIC ADMINISTRATION
                        </span>

                        <h1 className={styles.headerTitle}>
                            Matieres
                        </h1>

                        <p className={styles.headerSubtitle}>
                            Manage subjects and their academic information.
                        </p>

                    </div>

                    <button
                        className={styles.addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        <span className={styles.addIcon}>+</span>
                        Add Matiere
                    </button>

                </div>

                {/* TABLE BODY */}

                <div className={styles.cardBody}>

                    <table className={styles.table}>

                        <thead>

                            <tr>
                                <th className={styles.idHeader}>
                                    ID
                                </th>

                                <th>
                                    Name
                                </th>

                                <th className={styles.actionsHeader}>
                                    Actions
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {/* ADD ROW */}

                            {isAdding && (

                                <tr className={styles.addRow}>

                                    <td>

                                        <span className={styles.newBadge}>
                                            NEW
                                        </span>

                                    </td>

                                    <td>

                                        <input
                                            className={styles.tableInput}
                                            placeholder="Matiere name"
                                            value={newMatiere}
                                            onChange={e => setNewMatiere(e.target.value)}
                                        />

                                    </td>

                                    <td>

                                        <div className={styles.actionGroup}>

                                            <button
                                                className={styles.saveButton}
                                                onClick={handleAdd}
                                            >
                                                Save
                                            </button>

                                            <button
                                                className={styles.cancelButton}
                                                onClick={() => setIsAdding(false)}
                                            >
                                                Cancel
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            )}

                            {/* DATA ROWS */}

                            {matieres.length > 0 ? matieres.map(m => (

                                <tr
                                    key={m.id}
                                    className={styles.dataRow}
                                >

                                    <td>

                                        <span className={styles.idNumber}>
                                            {m.id}
                                        </span>

                                    </td>

                                    <td>

                                        {editingId === m.id ? (

                                            <input
                                                className={styles.tableInput}
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                            />

                                        ) : (

                                            <span className={styles.nameText}>
                                                {m.name}
                                            </span>

                                        )}

                                    </td>

                                    <td>

                                        {editingId === m.id ? (

                                            <div className={styles.actionGroup}>

                                                <button
                                                    className={styles.saveButton}
                                                    onClick={() => handleUpdate(m.id)}
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    className={styles.cancelButton}
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    Cancel
                                                </button>

                                            </div>

                                        ) : (

                                            <div className={styles.actionGroup}>

                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => handleEdit(m)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDelete(m.id)}
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        )}

                                    </td>

                                </tr>

                            )) : (

                                <tr className={styles.emptyRow}>

                                    <td colSpan="3">

                                        <div className={styles.emptyState}>

                                            <span className={styles.emptyAccent}></span>

                                            <span className={styles.emptyTitle}>
                                                No Matieres Found
                                            </span>

                                            <span className={styles.emptySubtitle}>
                                                Add a subject to begin managing your academic data.
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