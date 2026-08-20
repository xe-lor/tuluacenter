import React, { useEffect, useState } from 'react';
import API from '../../api.js';

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
        <div className="container mt-4">
            <div className="card shadow-sm">
                {/* HEADER */}
                <div className="card-header d-flex justify-content-between align-items-center bg-warning text-dark">
                    <h5 className="mb-0">Niveaux Management</h5>
                    <button className="btn btn-dark btn-sm" onClick={() => setIsAdding(true)}>
                        + Add Niveau
                    </button>
                </div>

                {/* TABLE BODY */}
                <div className="card-body p-0">
                    <table className="table table-hover mb-0 text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Avrage</th>
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
                                            placeholder="Name"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className="form-control form-control-sm"
                                            placeholder="Avrage"
                                            value={newAvrage}
                                            onChange={e => setNewAvrage(e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button className="btn btn-success btn-sm me-2" onClick={handleAdd}>Save</button>
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
                                    </td>
                                </tr>
                            )}

                            {/* DATA ROWS */}
                            {niveaux.length > 0 ? niveaux.map(n => (
                                <tr key={n.id}>
                                    <td>{n.id}</td>
                                    <td>
                                        {editingId === n.id ? (
                                            <input
                                                className="form-control form-control-sm"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                            />
                                        ) : n.name}
                                    </td>
                                    <td>
                                        {editingId === n.id ? (
                                            <input
                                                className="form-control form-control-sm"
                                                value={editAvrage}
                                                onChange={e => setEditAvrage(e.target.value)}
                                            />
                                        ) : n.avrage}
                                    </td>
                                    <td>
                                        {editingId === n.id ? (
                                            <>
                                                <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdate(n.id)}>Save</button>
                                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-outline-warning btn-sm me-2" onClick={() => handleEdit(n)}>Edit</button>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(n.id)}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-muted py-3">No Niveaux found</td>
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