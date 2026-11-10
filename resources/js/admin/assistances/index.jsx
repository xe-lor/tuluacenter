import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import styles from '../../shared.module.css';

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
        <div className={styles.admin_assistances_index_pageContainer}>

            <div className={styles.admin_assistances_index_managementCard}>

<div className={styles.admin_assistances_index_cardHeader}>

    {/* Header background image */}
    <img
        src="/images/neonImage.png"
        alt=""
        className={styles.admin_assistances_index_headerBackground}
    />

    {/* Dark overlay over the image */}
    <div className={styles.admin_assistances_index_headerOverlay}></div>

    <div className={styles.admin_assistances_index_headerContent}>
        <span className={styles.admin_assistances_index_headerLabel}>
            ADMINISTRATION
        </span>

        <h1 className={styles.admin_assistances_index_headerTitle}>
            Secretaries
        </h1>

        <p className={styles.admin_assistances_index_headerSubtitle}>
            Manage assistant accounts and access.
        </p>
    </div>

    <button
        className={styles.admin_assistances_index_addButton}
        onClick={() => setIsAdding(true)}
    >
        Add Assistant
    </button>

</div>


                <div className={styles.admin_assistances_index_tableContainer}>

                    <table className={styles.admin_assistances_index_table}>

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Password</th>
                                <th className={styles.admin_assistances_index_actionsHeader}>
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {isAdding && (
                                <tr className={styles.admin_assistances_index_addRow}>

                                    <td>
                                        <span className={styles.admin_assistances_index_newBadge}>
                                            NEW
                                        </span>
                                    </td>

                                    <td>
                                        <input
                                            className={styles.admin_assistances_index_tableInput}
                                            placeholder="Name"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                        />
                                    </td>

                                    <td>
                                        <input
                                            type="password"
                                            className={styles.admin_assistances_index_tableInput}
                                            placeholder="Password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                        />
                                    </td>

                                    <td>
                                        <div className={styles.admin_assistances_index_actionGroup}>

                                            <button
                                                className={styles.admin_assistances_index_saveButton}
                                                onClick={handleAdd}
                                            >
                                                Save
                                            </button>

                                            <button
                                                className={styles.admin_assistances_index_cancelButton}
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
                                        className={styles.admin_assistances_index_dataRow}
                                    >

                                        <td>
                                            <span className={styles.admin_assistances_index_idNumber}>
                                                {a.id}
                                            </span>
                                        </td>

                                        <td>

                                            {editingId === a.id ? (

                                                <input
                                                    className={styles.admin_assistances_index_tableInput}
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                />

                                            ) : (

                                                <span className={styles.admin_assistances_index_nameText}>
                                                    {a.name}
                                                </span>

                                            )}

                                        </td>


                                        <td>

                                            {editingId === a.id ? (

                                                <input
                                                    type="password"
                                                    className={styles.admin_assistances_index_tableInput}
                                                    placeholder="New password (optional)"
                                                    value={editPassword}
                                                    onChange={e => setEditPassword(e.target.value)}
                                                />

                                            ) : (

                                                <span className={styles.admin_assistances_index_passwordText}>
                                                    ••••••
                                                </span>

                                            )}

                                        </td>


                                        <td>

                                            {editingId === a.id ? (

                                                <div className={styles.admin_assistances_index_actionGroup}>

                                                    <button
                                                        className={styles.admin_assistances_index_saveButton}
                                                        onClick={() => handleUpdate(a.id)}
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        className={styles.admin_assistances_index_cancelButton}
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            ) : (

                                                <div className={styles.admin_assistances_index_actionGroup}>

                                                    <button
                                                        className={styles.admin_assistances_index_editButton}
                                                        onClick={() => handleEdit(a)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className={styles.admin_assistances_index_deleteButton}
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

                                <tr className={styles.admin_assistances_index_emptyRow}>
                                    <td colSpan="4">
                                        <div className={styles.admin_assistances_index_emptyState}>
                                            <span className={styles.admin_assistances_index_emptyAccent}></span>

                                            <span className={styles.admin_assistances_index_emptyTitle}>
                                                No Assistants Found
                                            </span>

                                            <span className={styles.admin_assistances_index_emptySubtitle}>
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