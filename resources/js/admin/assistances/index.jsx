import React, { useEffect, useState } from 'react';
import API from '../../api.js';

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
            API.get('/admin/secretaries').then(r => setAssistants(r.data.assistantes));
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
            payload.password = editPassword; // only send if new password is entered
        }

        API.put(`/admin/secretaries/${id}`, payload)
            .then(res => {
                // update locally
                const updated = res.data.assistant || {
                    id,
                    name: editName,
                    user: { role: editRole }
                };
                setAssistants(assistants.map(a => a.id === id ? updated : a));
                setEditingId(null);
            })
            .catch(err => console.error(err));
    };

    // ✅ DELETE
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure?")) return;

        API.delete(`/admin/secretaries/${id}`)
            .then(() => setAssistants(assistants.filter(a => a.id !== id)))
            .catch(() => alert("Error deleting"));
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center bg-warning text-dark">
                    <h5 className="mb-0">Secretaries Management</h5>
                    <button className="btn btn-dark btn-sm" onClick={() => setIsAdding(true)}>+ Add Assistant</button>
                </div>

                <div className="card-body p-0">
                    <table className="table table-hover mb-0 text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Password</th>
                                <th style={{ width: 200 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* ADD ROW */}
                            {isAdding && (
                                <tr className="table-warning">
                                    <td>New</td>
                                    <td>
                                        <input
                                            className="form-control form-control-sm"
                                            placeholder="Name"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="password"
                                            className="form-control form-control-sm"
                                            placeholder="Password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button className="btn btn-success btn-sm me-2" onClick={handleAdd}>Save</button>
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
                                    </td>
                                </tr>
                            )}

                            {/* DATA ROWS */}
                            {assistants.length > 0 ? assistants.map(a => (
                                <tr key={a.id}>
                                    <td>{a.id}</td>
                                    <td>
                                        {editingId === a.id ? (
                                            <input
                                                className="form-control form-control-sm"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                            />
                                        ) : a.name}
                                    </td>

                                    <td>
                                        {editingId === a.id ? (
                                            <input
                                                type="password"
                                                className="form-control form-control-sm"
                                                placeholder="New password (optional)"
                                                value={editPassword}
                                                onChange={e => setEditPassword(e.target.value)}
                                            />
                                        ) : "••••••"}
                                    </td>
                                    <td>
                                        {editingId === a.id ? (
                                            <>
                                                <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdate(a.id)}>Save</button>
                                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-outline-warning btn-sm me-2" onClick={() => handleEdit(a)}>Edit</button>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-muted py-3">No Assistants found</td>
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