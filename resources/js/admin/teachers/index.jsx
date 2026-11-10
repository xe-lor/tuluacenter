import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import styles from '../../shared.module.css';

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

    // ADD
    const handleAdd = () => {
        const name = newName.trim();
        if (!name || !newPassword.trim()) {
            return alert("Name & password required");
        }

        API.post('/admin/storeTeacher', {
            name,
            password: newPassword
        })
            .then(res => {
                setTeachers(prev => [...prev, res.data.teacher]);
                setNewName("");
                setNewPassword("");
                setIsAdding(false);
            })
            .catch(err => {
                console.error(err);
                alert("Error adding teacher");
            });
    };

    // EDIT
    const handleEdit = (teacher) => {
        setEditingId(teacher.id);
        setEditName(teacher.name);
        setEditPassword("");
    };

    const handleUpdate = (id) => {
        const name = editName.trim();
        if (!name) return alert("Name required");

        const payload = { name };

        // only send the password if the user typed a new one
        if (editPassword.trim()) {
            payload.password = editPassword;
        }

        API.put(`/admin/teachers/${id}`, payload)
            .then(res => {
                const updated = res.data.teacher;
                setTeachers(prev => prev.map(t => (t.id === id ? updated : t)));
                setEditingId(null);
                setEditPassword("");
            })
            .catch(err => {
                console.error(err);
                alert("Error updating teacher");
            });
    };

    // DELETE
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure?")) return;

        API.delete(`/admin/teachers/${id}`)
            .then(() => {
                setTeachers(prev => prev.filter(t => t.id !== id));
            })
            .catch(() => alert("Error deleting"));
    };

    return (
        <div className={styles.admin_teachers_index_pageContainer}>

            <div className={styles.admin_teachers_index_managementCard}>

                {/* HEADER */}
                <div className={styles.admin_teachers_index_cardHeader}>

                    {/* Header background image */}
                    <img
                        src="/images/neonImage.png"
                        alt=""
                        aria-hidden="true"
                        className={styles.admin_teachers_index_headerBackground}
                    />

                    {/* Dark overlay over the image */}
                    <div className={styles.admin_teachers_index_headerOverlay}></div>

                    <div className={styles.admin_teachers_index_headerContent}>

                        <span className={styles.admin_teachers_index_headerLabel}>
                            ACADEMIC ADMINISTRATION
                        </span>

                        <h1 className={styles.admin_teachers_index_headerTitle}>
                            Teachers
                        </h1>

                        <p className={styles.admin_teachers_index_headerSubtitle}>
                            Manage teacher accounts and credentials.
                        </p>

                    </div>

                    <button
                        className={styles.admin_teachers_index_addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        <span className={styles.admin_teachers_index_addIcon}>+</span>
                        Add Teacher
                    </button>

                </div>

                {/* TABLE */}
                <div className={styles.admin_teachers_index_tableContainer}>

                    <table className={styles.admin_teachers_index_table}>

                        <thead>
                            <tr>
                                <th className={styles.admin_teachers_index_idHeader}>ID</th>
                                <th>Name</th>
                                <th>Password</th>
                                <th className={styles.admin_teachers_index_actionsHeader}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {/* ADD ROW */}
                            {isAdding && (
                                <tr className={styles.admin_teachers_index_addRow}>

                                    <td>
                                        <span className={styles.admin_teachers_index_newBadge}>
                                            NEW
                                        </span>
                                    </td>

                                    <td>
                                        <input
                                            className={styles.admin_teachers_index_tableInput}
                                            placeholder="Teacher name"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                        />
                                    </td>

                                    <td>
                                        <input
                                            type="password"
                                            className={styles.admin_teachers_index_tableInput}
                                            placeholder="Password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                        />
                                    </td>

                                    <td>
                                        <div className={styles.admin_teachers_index_actionGroup}>

                                            <button
                                                className={styles.admin_teachers_index_saveButton}
                                                onClick={handleAdd}
                                            >
                                                Save
                                            </button>

                                            <button
                                                className={styles.admin_teachers_index_cancelButton}
                                                onClick={() => setIsAdding(false)}
                                            >
                                                Cancel
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            )}

                            {/* DATA ROWS */}
                            {teachers.length > 0 ? (

                                teachers.map(t => (

                                    <tr
                                        key={t.id}
                                        className={styles.admin_teachers_index_dataRow}
                                    >

                                        <td>
                                            <span className={styles.admin_teachers_index_idNumber}>
                                                {t.id}
                                            </span>
                                        </td>

                                        <td>
                                            {editingId === t.id ? (

                                                <input
                                                    className={styles.admin_teachers_index_tableInput}
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                />

                                            ) : (

                                                <span className={styles.admin_teachers_index_nameText}>
                                                    {t.name}
                                                </span>

                                            )}
                                        </td>

                                        <td>
                                            {editingId === t.id ? (

                                                <input
                                                    type="password"
                                                    className={styles.admin_teachers_index_tableInput}
                                                    placeholder="New password (optional)"
                                                    value={editPassword}
                                                    onChange={e => setEditPassword(e.target.value)}
                                                />

                                            ) : (

                                                <span className={styles.admin_teachers_index_passwordText}>
                                                    ••••••
                                                </span>

                                            )}
                                        </td>

                                        <td>
                                            {editingId === t.id ? (

                                                <div className={styles.admin_teachers_index_actionGroup}>

                                                    <button
                                                        className={styles.admin_teachers_index_saveButton}
                                                        onClick={() => handleUpdate(t.id)}
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        className={styles.admin_teachers_index_cancelButton}
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            ) : (

                                                <div className={styles.admin_teachers_index_actionGroup}>

                                                    <button
                                                        className={styles.admin_teachers_index_editButton}
                                                        onClick={() => handleEdit(t)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className={styles.admin_teachers_index_deleteButton}
                                                        onClick={() => handleDelete(t.id)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            )}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr className={styles.admin_teachers_index_emptyRow}>
                                    <td colSpan="4">
                                        <div className={styles.admin_teachers_index_emptyState}>

                                            <span className={styles.admin_teachers_index_emptyAccent}></span>

                                            <span className={styles.admin_teachers_index_emptyTitle}>
                                                No Teachers Found
                                            </span>

                                            <span className={styles.admin_teachers_index_emptySubtitle}>
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