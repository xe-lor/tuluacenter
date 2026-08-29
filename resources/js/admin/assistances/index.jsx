import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import styles from './index.module.css';

const AssistantIndex = () => {
    const [assistants, setAssistants] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editPassword, setEditPassword] = useState("");

    useEffect(() => {
        API.get('/admin/secretaries')
            .then(res => setAssistants(res.data.assistantes))
            .catch(err => console.error(err));
    }, []);

    const handleAdd = () => {
        if (!newName.trim() || !newPassword.trim()) {
            alert("Name & password are required");
            return;
        }

        API.post('/admin/assistants', {
            username: newName,
            password: newPassword
        })
        .then(() => {
            API.get('/admin/secretaries')
                .then(r => setAssistants(r.data.assistantes));

            setNewName("");
            setNewPassword("");
            setIsAdding(false);
        })
        .catch(err => console.error(err));
    };

    const handleEdit = (assistant) => {
        setEditingId(assistant.id);
        setEditName(assistant.name);
        setEditRole(assistant.user?.role || "");
        setEditPassword("");
    };

    const handleUpdate = (id) => {
        if (!editName.trim() || !editRole.trim()) {
            alert("Name & Role are required");
            return;
        }

        const payload = {
            name: editName,
            user_name: editName,
            role: editRole
        };

        if (editPassword.trim()) {
            payload.password = editPassword;
        }

        API.put(`/admin/secretaries/${id}`, payload)
            .then(res => {
                const updated = res.data.assistant || {
                    id,
                    name: editName,
                    user: { role: editRole }
                };

                setAssistants(
                    assistants.map(a => a.id === id ? updated : a)
                );

                setEditingId(null);
            })
            .catch(err => console.error(err));
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure?")) return;

        API.delete(`/admin/secretaries/${id}`)
            .then(() => {
                setAssistants(
                    assistants.filter(a => a.id !== id)
                );
            })
            .catch(() => alert("Error deleting"));
    };

    return (
        <div className={styles.pageContainer}>

            <div className={styles.managementCard}>

                <div className={styles.cardHeader}>

                    <div className={styles.headerContent}>
                        <span className={styles.headerLabel}>
                            ADMINISTRATION
                        </span>

                        <h1 className={styles.headerTitle}>
                            Secretaries
                        </h1>

                        <p className={styles.headerSubtitle}>
                            Manage assistant accounts and access.
                        </p>
                    </div>

                    <button
                        className={styles.addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        <span className={styles.addIcon}>+</span>
                        Add Assistant
                    </button>

                </div>


                <div className={styles.tableContainer}>

                    <table className={styles.table}>

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Password</th>
                                <th className={styles.actionsHeader}>
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>

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


                            {assistants.length > 0 ? (

                                assistants.map(a => (

                                    <tr
                                        key={a.id}
                                        className={styles.dataRow}
                                    >

                                        <td>
                                            <span className={styles.idNumber}>
                                                {a.id}
                                            </span>
                                        </td>

                                        <td>

                                            {editingId === a.id ? (

                                                <input
                                                    className={styles.tableInput}
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                />

                                            ) : (

                                                <span className={styles.nameText}>
                                                    {a.name}
                                                </span>

                                            )}

                                        </td>


                                        <td>

                                            {editingId === a.id ? (

                                                <input
                                                    type="password"
                                                    className={styles.tableInput}
                                                    placeholder="New password (optional)"
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

                                            {editingId === a.id ? (

                                                <div className={styles.actionGroup}>

                                                    <button
                                                        className={styles.saveButton}
                                                        onClick={() => handleUpdate(a.id)}
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
                                                        onClick={() => handleEdit(a)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDelete(a.id)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            )}

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr className={styles.emptyRow}>
                                    <td colSpan="4">
                                        <div className={styles.emptyState}>
                                            <span className={styles.emptyAccent}></span>

                                            <span className={styles.emptyTitle}>
                                                No Assistants Found
                                            </span>

                                            <span className={styles.emptySubtitle}>
                                                Create an assistant account to get started.
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

export default AssistantIndex;