import React, { useEffect, useState } from 'react';
import API from '../../api.js';

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
        <div className="container mt-4">
            <div className="card shadow-sm">
                
                {/* HEADER */}
                <div className="card-header d-flex justify-content-between align-items-center bg-warning text-dark">
                    <h5 className="mb-0">Teachers Management</h5>
                    <button 
                        className="btn btn-dark btn-sm"
                        onClick={() => setIsAdding(true)}
                    >
                        + Add Teacher
                    </button>
                </div>

                {/* BODY */}
                <div className="card-body p-0">
                    <table className="table table-hover mb-0 text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Password</th>
                                <th style={{ width: 180 }}>Actions</th>
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
                                            placeholder="Teacher name"
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
                                        <button className="btn btn-success btn-sm me-2" onClick={handleAdd}>
                                            Save
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsAdding(false)}>
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {/* DATA */}
                            {teachers.length > 0 ? teachers.map(t => (
                                <tr key={t.id}>
                                    <td>{t.id}</td>

                                    <td>
                                        {editingId === t.id ? (
                                            <input
                                                className="form-control form-control-sm"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                            />
                                        ) : t.name}
                                    </td>

                                    <td>
                                        {editingId === t.id ? (
                                            <input
                                                type="password"
                                                className="form-control form-control-sm"
                                                placeholder="New password"
                                                value={editPassword}
                                                onChange={e => setEditPassword(e.target.value)}
                                            />
                                        ) : (
                                            <span className="text-muted">••••••</span>
                                        )}
                                    </td>

                                    <td>
                                        {editingId === t.id ? (
                                            <>
                                                <button 
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={() => handleUpdate(t.id)}
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    className="btn btn-outline-warning btn-sm me-2"
                                                    onClick={() => handleEdit(t)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDelete(t.id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-muted py-3">
                                        No teachers found
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