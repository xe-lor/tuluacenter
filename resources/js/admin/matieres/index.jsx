import React, { useEffect, useState } from 'react';
import API from '../../api.js';

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
        <div className="container mt-4">
            <div className="card shadow-sm">
                {/* HEADER */}
                <div className="card-header d-flex justify-content-between align-items-center bg-warning text-dark">
                    <h5 className="mb-0">Matieres Management</h5>
                    <button className="btn btn-dark btn-sm" onClick={() => setIsAdding(true)}>
                        + Add Matiere
                    </button>
                </div>

                {/* TABLE BODY */}
                <div className="card-body p-0">
                    <table className="table table-hover mb-0 text-center align-middle" style={{width: 500}}>
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
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
                                            placeholder="Matiere name"
                                            value={newMatiere}
                                            onChange={e => setNewMatiere(e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button className="btn btn-success btn-sm me-2" onClick={handleAdd}>Save</button>
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
                                    </td>
                                </tr>
                            )}

                            {/* DATA ROWS */}
                            {matieres.length > 0 ? matieres.map(m => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>
                                        {editingId === m.id ? (
                                            <input
                                                className="form-control form-control-sm"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                            />
                                        ) : m.name}
                                    </td>
                                    <td>
                                        {editingId === m.id ? (
                                            <>
                                                <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdate(m.id)}>Save</button>
                                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-outline-warning btn-sm me-2" onClick={() => handleEdit(m)}>Edit</button>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-muted py-3">No Matieres found</td>
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