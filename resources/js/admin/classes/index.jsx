import React, { useEffect, useState } from 'react';
import API from '../../api.js';

const IndexClasses = () => {

    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [matieres, setMatieres] = useState([]);

    const [isAdding, setIsAdding] = useState(false);

    // =========================
    // ADD STATES
    // =========================

    const [newMatiere, setNewMatiere] = useState("");
    const [newNiveau, setNewNiveau] = useState("");
    const [newTeacher, setNewTeacher] = useState("");
    const [newPercentage, setNewPercentage] = useState("");
    const [newPrice, setNewPrice] = useState("");

    // =========================
    // EDIT STATES
    // =========================

    const [editingId, setEditingId] = useState(null);

    const [editMatiere, setEditMatiere] = useState("");
    const [editNiveau, setEditNiveau] = useState("");
    const [editTeacher, setEditTeacher] = useState("");
    const [editPercentage, setEditPercentage] = useState("");
    const [editPrice, setEditPrice] = useState("");

    const [loading, setLoading] = useState(true);

    // =========================
    // GET DATA
    // =========================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            setLoading(true);

            const [classesRes, optionsRes] = await Promise.all([
                API.get('/admin/classes/index'),
                API.get('/admin/classes')
            ]);

            setClasses(classesRes.data.classes || []);

            setTeachers(optionsRes.data.teachers || []);
            setNiveaux(optionsRes.data.niveaux || []);
            setMatieres(optionsRes.data.matieres || []);

        } catch (err) {

            console.error("Error loading classes:", err);

        } finally {

            setLoading(false);

        }
    };

    // =========================
    // ADD CLASS
    // =========================

    const handleAdd = async () => {

        if (!newMatiere || !newNiveau || !newTeacher) {
            alert("Please select Matiere, Niveau and Teacher");
            return;
        }

        if (!newPercentage || !newPrice) {
            alert("Percentage and Price are required");
            return;
        }

        try {

            const res = await API.post('/admin/classes', {

                matiere: newMatiere,
                niveau: newNiveau,
                teacher: newTeacher,
                percentage: newPercentage,
                price: newPrice

            });

            alert(res.data.message);

            await loadData();

            handleCancelAdd();

        } catch (err) {

            console.error("Error adding class:", err);

            if (err.response?.data?.errors) {
                console.error(err.response.data.errors);
            }

            alert("Failed to add class");
        }
    };

    // =========================
    // CANCEL ADD
    // =========================

    const handleCancelAdd = () => {

        setNewMatiere("");
        setNewNiveau("");
        setNewTeacher("");
        setNewPercentage("");
        setNewPrice("");

        setIsAdding(false);
    };

    // =========================
    // START EDIT
    // =========================

    const handleEdit = (classe) => {

        setEditingId(classe.id);

        setEditMatiere(classe.matiere_id);
        setEditNiveau(classe.niveau_id);
        setEditTeacher(classe.prof_id);
        setEditPercentage(classe.percentage);
        setEditPrice(classe.price);
    };

    // =========================
    // CANCEL EDIT
    // =========================

    const handleCancelEdit = () => {

        setEditingId(null);

        setEditMatiere("");
        setEditNiveau("");
        setEditTeacher("");
        setEditPercentage("");
        setEditPrice("");
    };

    // =========================
    // UPDATE CLASS
    // =========================

    const handleUpdate = async (id) => {

        if (!editMatiere || !editNiveau || !editTeacher) {

            alert("Please select Matiere, Niveau and Teacher");

            return;
        }

        if (!editPercentage || !editPrice) {

            alert("Percentage and Price are required");

            return;
        }

        try {

            const res = await API.put(`/admin/classes/${id}`, {

                matiere: editMatiere,
                niveau: editNiveau,
                teacher: editTeacher,
                percentage: editPercentage,
                price: editPrice

            });

            alert(res.data.message || "Class updated successfully!");

            await loadData();

            handleCancelEdit();

        } catch (err) {

            console.error("Error updating class:", err);

            if (err.response?.data?.errors) {
                console.error(err.response.data.errors);
            }

            alert("Failed to update class");
        }
    };

    // =========================
    // DELETE CLASS
    // =========================

    const handleDelete = async (id) => {

        if (!window.confirm("Are you sure you want to delete this class?")) {
            return;
        }

        try {

            const res = await API.delete(`/admin/classes/${id}`);

            alert(res.data.message || "Class deleted successfully!");

            setClasses(
                classes.filter(classe => classe.id !== id)
            );

        } catch (err) {

            console.error("Error deleting class:", err);

            alert("Failed to delete class");
        }
    };

    // =========================
    // RENDER
    // =========================

    return (

        <div className="container mt-4">

            <div className="card shadow-sm">

                {/* HEADER */}

                <div className="card-header d-flex justify-content-between align-items-center bg-warning text-dark">

                    <h5 className="mb-0">
                        Classes Management
                    </h5>

                    {!isAdding && !editingId && (

                        <button
                            className="btn btn-dark btn-sm"
                            onClick={() => setIsAdding(true)}
                        >
                            + Add Class
                        </button>

                    )}

                </div>

                {/* TABLE */}

                <div className="card-body p-0">

                    {loading ? (

                        <div className="text-center py-5 text-muted">
                            Loading classes...
                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover mb-0 text-center align-middle">

                                <thead className="table-light">

                                    <tr>

                                        <th>ID</th>
                                        <th>Matiere</th>
                                        <th>Teacher</th>
                                        <th>Niveau</th>
                                        <th>Percentage</th>
                                        <th>Price</th>
                                        <th style={{ width: 190 }}>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {/* =========================
                                        ADD ROW
                                    ========================= */}

                                    {isAdding && (

                                        <tr className="table-warning">

                                            <td>
                                                New
                                            </td>

                                            {/* MATIERE */}

                                            <td>

                                                <select
                                                    className="form-select form-select-sm"
                                                    value={newMatiere}
                                                    onChange={e =>
                                                        setNewMatiere(e.target.value)
                                                    }
                                                >

                                                    <option value="">
                                                        Select Matiere
                                                    </option>

                                                    {matieres.map(matiere => (

                                                        <option
                                                            key={matiere.id}
                                                            value={matiere.id}
                                                        >
                                                            {matiere.name}
                                                        </option>

                                                    ))}

                                                </select>

                                            </td>

                                            {/* TEACHER */}

                                            <td>

                                                <select
                                                    className="form-select form-select-sm"
                                                    value={newTeacher}
                                                    onChange={e =>
                                                        setNewTeacher(e.target.value)
                                                    }
                                                >

                                                    <option value="">
                                                        Select Teacher
                                                    </option>

                                                    {teachers.map(teacher => (

                                                        <option
                                                            key={teacher.id}
                                                            value={teacher.id}
                                                        >
                                                            {teacher.name}
                                                        </option>

                                                    ))}

                                                </select>

                                            </td>

                                            {/* NIVEAU */}

                                            <td>

                                                <select
                                                    className="form-select form-select-sm"
                                                    value={newNiveau}
                                                    onChange={e =>
                                                        setNewNiveau(e.target.value)
                                                    }
                                                >

                                                    <option value="">
                                                        Select Niveau
                                                    </option>

                                                    {niveaux.map(niveau => (

                                                        <option
                                                            key={niveau.id}
                                                            value={niveau.id}
                                                        >
                                                            {niveau.name}
                                                        </option>

                                                    ))}

                                                </select>

                                            </td>

                                            {/* PERCENTAGE */}

                                            <td>

                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    min="0"
                                                    max="100"
                                                    value={newPercentage}
                                                    onChange={e =>
                                                        setNewPercentage(e.target.value)
                                                    }
                                                />

                                            </td>

                                            {/* PRICE */}

                                            <td>

                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    min="0"
                                                    step="0.01"
                                                    value={newPrice}
                                                    onChange={e =>
                                                        setNewPrice(e.target.value)
                                                    }
                                                />

                                            </td>

                                            {/* ACTIONS */}

                                            <td>

                                                <button
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={handleAdd}
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={handleCancelAdd}
                                                >
                                                    Cancel
                                                </button>

                                            </td>

                                        </tr>

                                    )}

                                    {/* =========================
                                        CLASS ROWS
                                    ========================= */}

                                    {classes.length > 0 ? (

                                        classes.map(classe => (

                                            <tr key={classe.id}>

                                                {/* ID */}

                                                <td>
                                                    {classe.id}
                                                </td>

                                                {/* MATIERE */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={editMatiere}
                                                            onChange={e =>
                                                                setEditMatiere(e.target.value)
                                                            }
                                                        >

                                                            <option value="">
                                                                Select Matiere
                                                            </option>

                                                            {matieres.map(matiere => (

                                                                <option
                                                                    key={matiere.id}
                                                                    value={matiere.id}
                                                                >
                                                                    {matiere.name}
                                                                </option>

                                                            ))}

                                                        </select>

                                                    ) : (

                                                        classe.matiere_name

                                                    )}

                                                </td>

                                                {/* TEACHER */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={editTeacher}
                                                            onChange={e =>
                                                                setEditTeacher(e.target.value)
                                                            }
                                                        >

                                                            <option value="">
                                                                Select Teacher
                                                            </option>

                                                            {teachers.map(teacher => (

                                                                <option
                                                                    key={teacher.id}
                                                                    value={teacher.id}
                                                                >
                                                                    {teacher.name}
                                                                </option>

                                                            ))}

                                                        </select>

                                                    ) : (

                                                        classe.prof_name

                                                    )}

                                                </td>

                                                {/* NIVEAU */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={editNiveau}
                                                            onChange={e =>
                                                                setEditNiveau(e.target.value)
                                                            }
                                                        >

                                                            <option value="">
                                                                Select Niveau
                                                            </option>

                                                            {niveaux.map(niveau => (

                                                                <option
                                                                    key={niveau.id}
                                                                    value={niveau.id}
                                                                >
                                                                    {niveau.name}
                                                                </option>

                                                            ))}

                                                        </select>

                                                    ) : (

                                                        classe.niveau_name

                                                    )}

                                                </td>

                                                {/* PERCENTAGE */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            min="0"
                                                            max="100"
                                                            value={editPercentage}
                                                            onChange={e =>
                                                                setEditPercentage(e.target.value)
                                                            }
                                                        />

                                                    ) : (

                                                        `${classe.percentage}%`

                                                    )}

                                                </td>

                                                {/* PRICE */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            min="0"
                                                            step="0.01"
                                                            value={editPrice}
                                                            onChange={e =>
                                                                setEditPrice(e.target.value)
                                                            }
                                                        />

                                                    ) : (

                                                        `${Number(classe.price).toFixed(2)} DH`

                                                    )}

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <>

                                                            <button
                                                                className="btn btn-success btn-sm me-2"
                                                                onClick={() =>
                                                                    handleUpdate(classe.id)
                                                                }
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={handleCancelEdit}
                                                            >
                                                                Cancel
                                                            </button>

                                                        </>

                                                    ) : (

                                                        <>

                                                            <button
                                                                className="btn btn-outline-warning btn-sm me-2"
                                                                onClick={() =>
                                                                    handleEdit(classe)
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() =>
                                                                    handleDelete(classe.id)
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </>

                                                    )}

                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-muted py-3"
                                            >
                                                No Classes found
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default IndexClasses;