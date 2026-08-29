import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import styles from './index.module.css';

const IndexNiveaux = () => {
    const [niveaux, setNiveaux] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newAvrage, setNewAvrage] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editAvrage, setEditAvrage] = useState("");

    useEffect(() => {
        API.get('/admin/niveaux')
            .then(res => setNiveaux(res.data.niveaux))
            .catch(err => console.error(err));
    }, []);

    // ADD
    const handleAdd = () => {
        if (!newName.trim()) return alert("Name required");

        API.post('/admin/storeNiveau', { name: newName, avrage: newAvrage })
            .then(res => {
                setNiveaux([...niveaux, res.data.niveau]);
                setNewName("");
                setNewAvrage("");
                setIsAdding(false);
            })
            .catch(err => console.error(err));
    };

    // EDIT
    const handleEdit = (niveau) => {
        setEditingId(niveau.id);
        setEditName(niveau.name);
        setEditAvrage(niveau.avrage || "");
    };

    const handleUpdate = (id) => {
        if (!editName.trim()) return alert("Name required");

        API.put(`/admin/niveaux/${id}`, { name: editName, avrage: editAvrage })
            .then(res => {
                const updated = res.data.niveau;
                setNiveaux(niveaux.map(n => n.id === id ? updated : n));
                setEditingId(null);
            })
            .catch(err => console.error(err));
    };

    // DELETE
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure?")) return;

        API.post('/admin/niveaux/delete', { id })
            .then(() => {
                setNiveaux(niveaux.filter(n => n.id !== id));
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
                            Niveaux
                        </h1>

                        <p className={styles.headerSubtitle}>
                            Manage academic levels and their average values.
                        </p>

                    </div>

                    <button
                        className={styles.addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        <span className={styles.addIcon}>+</span>
                        Add Niveau
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

                                <th>
                                    Avrage
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
                                            placeholder="Name"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                        />

                                    </td>

                                    <td>

                                        <input
                                            className={styles.tableInput}
                                            placeholder="Avrage"
                                            value={newAvrage}
                                            onChange={e => setNewAvrage(e.target.value)}
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

                            {niveaux.length > 0 ? niveaux.map(n => (

                                <tr
                                    key={n.id}
                                    className={styles.dataRow}
                                >

                                    <td>

                                        <span className={styles.idNumber}>
                                            {n.id}
                                        </span>

                                    </td>

                                    <td>

                                        {editingId === n.id ? (

                                            <input
                                                className={styles.tableInput}
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                            />

                                        ) : (

                                            <span className={styles.nameText}>
                                                {n.name}
                                            </span>

                                        )}

                                    </td>

                                    <td>

                                        {editingId === n.id ? (

                                            <input
                                                className={styles.tableInput}
                                                value={editAvrage}
                                                onChange={e => setEditAvrage(e.target.value)}
                                            />

                                        ) : (

                                            <span className={styles.averageText}>
                                                {n.avrage}
                                            </span>

                                        )}

                                    </td>

                                    <td>

                                        {editingId === n.id ? (

                                            <div className={styles.actionGroup}>

                                                <button
                                                    className={styles.saveButton}
                                                    onClick={() => handleUpdate(n.id)}
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
                                                    onClick={() => handleEdit(n)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDelete(n.id)}
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        )}

                                    </td>

                                </tr>

                            )) : (

                                <tr className={styles.emptyRow}>

                                    <td colSpan="4">

                                        <div className={styles.emptyState}>

                                            <span className={styles.emptyAccent}></span>

                                            <span className={styles.emptyTitle}>
                                                No Niveaux Found
                                            </span>

                                            <span className={styles.emptySubtitle}>
                                                Add a level to begin managing your academic structure.
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