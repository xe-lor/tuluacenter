import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import styles from './index.module.css';

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

        <div className={styles.pageContainer}>

            <div className={styles.managementCard}>

                {/* HEADER */}

                <div className={styles.cardHeader}>

                    <div className={styles.headerContent}>

                        <span className={styles.headerLabel}>
                            ACADEMIC ADMINISTRATION
                        </span>

                        <h1 className={styles.headerTitle}>
                            Classes
                        </h1>

                        <p className={styles.headerSubtitle}>
                            Manage classes, teachers, levels and pricing.
                        </p>

                    </div>

                    {!isAdding && !editingId && (

                        <button
                            className={styles.addButton}
                            onClick={() => setIsAdding(true)}
                        >
                            <span className={styles.addIcon}>+</span>
                            Add Class
                        </button>

                    )}

                </div>

                {/* TABLE */}

                <div className={styles.cardBody}>

                    {loading ? (

                        <div className={styles.loadingState}>

                            <span className={styles.loadingLine}></span>

                            <span className={styles.loadingText}>
                                Loading classes...
                            </span>

                        </div>

                    ) : (

                        <div className={styles.tableWrapper}>

                            <table className={styles.table}>

                                <thead>

                                    <tr>

                                        <th>Matiere</th>
                                        <th>Teacher</th>
                                        <th>Niveau</th>
                                        <th>Price</th>

                                        <th className={styles.actionsHeader}>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {/* =========================
                                        ADD ROW
                                    ========================= */}

                                    {isAdding && (

                                        <tr className={styles.addRow}>

                                            <td>

                                                <span className={styles.newBadge}>
                                                    NEW
                                                </span>

                                            </td>

                                            {/* MATIERE */}

                                            <td>

                                                <select
                                                    className={styles.selectInput}
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
                                                    className={styles.selectInput}
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
                                                    className={styles.selectInput}
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
                                                    className={styles.numberInput}
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
                                                    className={styles.numberInput}
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

                                                <div className={styles.actionGroup}>

                                                    <button
                                                        className={styles.saveButton}
                                                        onClick={handleAdd}
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        className={styles.cancelButton}
                                                        onClick={handleCancelAdd}
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )}

                                    {/* =========================
                                        CLASS ROWS
                                    ========================= */}

                                    {classes.length > 0 ? (

                                        classes.map(classe => (

                                            <tr
                                                key={classe.id}
                                                className={styles.dataRow}
                                            >

                                                {/* MATIERE */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <select
                                                            className={styles.selectInput}
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

                                                        <span className={styles.cellText}>
                                                            {classe.matiere_name}
                                                        </span>

                                                    )}

                                                </td>

                                                {/* TEACHER */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <select
                                                            className={styles.selectInput}
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

                                                        <span className={styles.cellText}>
                                                            {classe.prof_name}
                                                        </span>

                                                    )}

                                                </td>

                                                {/* NIVEAU */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <select
                                                            className={styles.selectInput}
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

                                                        <span className={styles.cellText}>
                                                            {classe.niveau_name}
                                                        </span>

                                                    )}

                                                </td>


                                                {/* PRICE */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <input
                                                            type="number"
                                                            className={styles.numberInput}
                                                            min="0"
                                                            step="0.01"
                                                            value={editPrice}
                                                            onChange={e =>
                                                                setEditPrice(e.target.value)
                                                            }
                                                        />

                                                    ) : (

                                                        <span className={styles.priceText}>
                                                            {`${Number(classe.price).toFixed(2)} DH`}
                                                        </span>

                                                    )}

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    {editingId === classe.id ? (

                                                        <div className={styles.actionGroup}>

                                                            <button
                                                                className={styles.saveButton}
                                                                onClick={() =>
                                                                    handleUpdate(classe.id)
                                                                }
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                className={styles.cancelButton}
                                                                onClick={handleCancelEdit}
                                                            >
                                                                Cancel
                                                            </button>

                                                        </div>

                                                    ) : (

                                                        <div className={styles.actionGroup}>

                                                            <button
                                                                className={styles.editButton}
                                                                onClick={() =>
                                                                    handleEdit(classe)
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                className={styles.deleteButton}
                                                                onClick={() =>
                                                                    handleDelete(classe.id)
                                                                }
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

                                            <td colSpan="7">

                                                <div className={styles.emptyState}>

                                                    <span className={styles.emptyAccent}></span>

                                                    <span className={styles.emptyTitle}>
                                                        No Classes Found
                                                    </span>

                                                    <span className={styles.emptySubtitle}>
                                                        Add a class to begin managing your academic schedule.
                                                    </span>

                                                </div>

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