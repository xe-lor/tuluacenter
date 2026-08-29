import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import styles from './index.module.css';

const TeacherIndex = () => {
    const [teachers, setTeachers] = useState([]);

    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPassword, setEditPassword] = useState("");

    useEffect(() => {
        API.get('/admin/profs')
            .then(res => setTeachers(res.data.teachers))
            .catch(err => console.error(err));
    }, []);

    const handleAdd = () => {
        if (!newName || !newPassword) return alert("Name & password required");

        API.post('/admin/storeTeacher', {
            name: newName,
            password: newPassword
        })
        .then(res => {
            setTeachers([...teachers, res.data.teacher]);
            setNewName("");
            setNewPassword("");
            setIsAdding(false);
        })
        .catch(err => console.error(err));
    };

    const handleEdit = (teacher) => {
        setEditingId(teacher.id);
        setEditName(teacher.name);
        setEditPassword("");
    };

    const handleUpdate = (id) => {
        if (!editName.trim()) return alert("Name required");

        API.put(`/admin/teachers/${id}`, {
            name: editName,
            password: editPassword
        })
        .then(res => {
            const updated = res.data.teacher;
            setTeachers(teachers.map(t => t.id === id ? updated : t));
            setEditingId(null);
        })
        .catch(err => console.error(err));
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure?")) return;

        API.delete(`/admin/teachers/${id}`)
            .then(() => {
                setTeachers(teachers.filter(t => t.id !== id));
            })
            .catch(() => alert("Error deleting"));
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
                            Teachers
                        </h1>

                        <p className={styles.headerSubtitle}>
                            Manage teacher accounts and credentials.
                        </p>

                    </div>

                    <button
                        className={styles.addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        <span className={styles.addIcon}>+</span>
                        Add Teacher
                    </button>

                </div>

                {/* BODY */}

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
                                    Password
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
                                            placeholder="Teacher name"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                        />

                                    </td>

                                    <td>

                                        <input
                                            type="password"
                                            className={styles.tableInput}
                                            placeholder="Password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
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

                            {/* DATA */}

                            {teachers.length > 0 ? teachers.map(t => (

                                <tr
                                    key={t.id}
                                    className={styles.dataRow}
                                >

                                    <td>

                                        <span className={styles.idNumber}>
                                            {t.id}
                                        </span>

                                    </td>

                                    <td>

                                        {editingId === t.id ? (

                                            <input
                                                className={styles.tableInput}
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                            />

                                        ) : (

                                            <span className={styles.nameText}>
                                                {t.name}
                                            </span>

                                        )}

                                    </td>

                                    <td>

                                        {editingId === t.id ? (

                                            <input
                                                type="password"
                                                className={styles.tableInput}
                                                placeholder="New password"
                                                value={editPassword}
                                                onChange={e => setEditPassword(e.target.value)}
                                            />

                                        ) : (

                                            <span className={styles.passwordText}>
                                                ••••••
                                            </span>

                                        )}

                                    </td>

                                    <td>

                                        {editingId === t.id ? (

                                            <div className={styles.actionGroup}>

                                                <button
                                                    className={styles.saveButton}
                                                    onClick={() => handleUpdate(t.id)}
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
                                                    onClick={() => handleEdit(t)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDelete(t.id)}
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
                                                No Teachers Found
                                            </span>

                                            <span className={styles.emptySubtitle}>
                                                Add a teacher to begin managing your staff.
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

export default TeacherIndex;