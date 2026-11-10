import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import styles from '../../shared.module.css';

const IndexClasses = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [newMatiere, setNewMatiere] = useState("");
    const [newNiveau, setNewNiveau] = useState("");
    const [newTeacher, setNewTeacher] = useState("");
    const [newPercentage, setNewPercentage] = useState("");
    const [newPrice, setNewPrice] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editMatiere, setEditMatiere] = useState("");
    const [editNiveau, setEditNiveau] = useState("");
    const [editTeacher, setEditTeacher] = useState("");
    const [editPercentage, setEditPercentage] = useState("");
    const [editPrice, setEditPrice] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    // LOAD
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

    // ADD
    const handleAdd = async () => {
        if (!newMatiere || !newNiveau || !newTeacher) {
            return alert("Please select Matiere, Niveau and Teacher");
        }

        if (!newPercentage || !newPrice) {
            return alert("Percentage and Price are required");
        }

        try {
            const res = await API.post('/admin/classes', {
                matiere: newMatiere,
                niveau: newNiveau,
                teacher: newTeacher,
                percentage: newPercentage,
                price: newPrice
            });

            alert(res.data.message || "Class added successfully!");

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

    const handleCancelAdd = () => {
        setNewMatiere("");
        setNewNiveau("");
        setNewTeacher("");
        setNewPercentage("");
        setNewPrice("");
        setIsAdding(false);
    };

    // EDIT
    const handleEdit = (classe) => {
        setEditingId(classe.id);
        setEditMatiere(classe.matiere_id);
        setEditNiveau(classe.niveau_id);
        setEditTeacher(classe.prof_id);
        setEditPercentage(classe.percentage);
        setEditPrice(classe.price);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditMatiere("");
        setEditNiveau("");
        setEditTeacher("");
        setEditPercentage("");
        setEditPrice("");
    };

    const handleUpdate = async (id) => {
        if (!editMatiere || !editNiveau || !editTeacher) {
            return alert("Please select Matiere, Niveau and Teacher");
        }

        if (!editPercentage || !editPrice) {
            return alert("Percentage and Price are required");
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

    // DELETE
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this class?")) return;

        try {
            const res = await API.delete(`/admin/classes/${id}`);

            alert(res.data.message || "Class deleted successfully!");

            setClasses(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error("Error deleting class:", err);
            alert("Failed to delete class");
        }
    };

    return (
        <div className={styles.admin_classes_index_pageContainer}>

            <div className={styles.admin_classes_index_managementCard}>

                {/* HEADER */}
                <div className={styles.admin_classes_index_cardHeader}>

                    {/* Header background image */}
                    <img
                        src="/images/neonImage.png"
                        alt=""
                        aria-hidden="true"
                        className={styles.admin_classes_index_headerBackground}
                    />

                    {/* Dark overlay over the image */}
                    <div className={styles.admin_classes_index_headerOverlay}></div>

                    <div className={styles.admin_classes_index_headerContent}>

                        <span className={styles.admin_classes_index_headerLabel}>
                            ACADEMIC ADMINISTRATION
                        </span>

                        <h1 className={styles.admin_classes_index_headerTitle}>
                            Classes
                        </h1>

                        <p className={styles.admin_classes_index_headerSubtitle}>
                            Manage classes, teachers, levels and pricing.
                        </p>

                    </div>

                    {!isAdding && !editingId && (
                        <button
                            type="button"
                            className={styles.admin_classes_index_addButton}
                            onClick={() => setIsAdding(true)}
                        >
                            <span className={styles.admin_classes_index_addIcon}>+</span>
                            Add Class
                        </button>
                    )}

                </div>

                {/* TABLE */}
                <div className={styles.admin_classes_index_tableContainer}>

                    {loading ? (

                        <div className={styles.admin_classes_index_loadingState}>

                            <span className={styles.admin_classes_index_loadingLine}></span>

                            <span className={styles.admin_classes_index_loadingText}>
                                Loading classes...
                            </span>

                        </div>

                    ) : (

                        <table className={styles.admin_classes_index_table}>

                            <thead>
                                <tr>
                                    <th className={styles.admin_classes_index_idHeader}>ID</th>
                                    <th>Matiere</th>
                                    <th>Teacher</th>
                                    <th>Niveau</th>
                                    <th>Percentage</th>
                                    <th>Price</th>
                                    <th className={styles.admin_classes_index_actionsHeader}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {/* ADD ROW */}
                                {isAdding && (
                                    <tr className={styles.admin_classes_index_addRow}>

                                        <td>
                                            <span className={styles.admin_classes_index_newBadge}>
                                                NEW
                                            </span>
                                        </td>

                                        <td>
                                            <select
                                                className={styles.admin_classes_index_selectInput}
                                                value={newMatiere}
                                                onChange={e => setNewMatiere(e.target.value)}
                                            >
                                                <option value="">Select Matiere</option>

                                                {matieres.map(matiere => (
                                                    <option key={matiere.id} value={matiere.id}>
                                                        {matiere.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <select
                                                className={styles.admin_classes_index_selectInput}
                                                value={newTeacher}
                                                onChange={e => setNewTeacher(e.target.value)}
                                            >
                                                <option value="">Select Teacher</option>

                                                {teachers.map(teacher => (
                                                    <option key={teacher.id} value={teacher.id}>
                                                        {teacher.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <select
                                                className={styles.admin_classes_index_selectInput}
                                                value={newNiveau}
                                                onChange={e => setNewNiveau(e.target.value)}
                                            >
                                                <option value="">Select Niveau</option>

                                                {niveaux.map(niveau => (
                                                    <option key={niveau.id} value={niveau.id}>
                                                        {niveau.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                className={styles.admin_classes_index_numberInput}
                                                min="0"
                                                max="100"
                                                value={newPercentage}
                                                onChange={e => setNewPercentage(e.target.value)}
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                className={styles.admin_classes_index_numberInput}
                                                min="0"
                                                step="0.01"
                                                value={newPrice}
                                                onChange={e => setNewPrice(e.target.value)}
                                            />
                                        </td>

                                        <td>
                                            <div className={styles.admin_classes_index_actionGroup}>

                                                <button
                                                    className={styles.admin_classes_index_saveButton}
                                                    onClick={handleAdd}
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    className={styles.admin_classes_index_cancelButton}
                                                    onClick={handleCancelAdd}
                                                >
                                                    Cancel
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                )}

                                {/* DATA ROWS */}
                                {classes.length > 0 ? (

                                    classes.map(classe => (

                                        <tr
                                            key={classe.id}
                                            className={styles.admin_classes_index_dataRow}
                                        >

                                            <td>
                                                <span className={styles.admin_classes_index_idNumber}>
                                                    {classe.id}
                                                </span>
                                            </td>

                                            <td>
                                                {editingId === classe.id ? (

                                                    <select
                                                        className={styles.admin_classes_index_selectInput}
                                                        value={editMatiere}
                                                        onChange={e => setEditMatiere(e.target.value)}
                                                    >
                                                        <option value="">Select Matiere</option>

                                                        {matieres.map(matiere => (
                                                            <option key={matiere.id} value={matiere.id}>
                                                                {matiere.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                ) : (

                                                    <span className={styles.admin_classes_index_cellText}>
                                                        {classe.matiere_name}
                                                    </span>

                                                )}
                                            </td>

                                            <td>
                                                {editingId === classe.id ? (

                                                    <select
                                                        className={styles.admin_classes_index_selectInput}
                                                        value={editTeacher}
                                                        onChange={e => setEditTeacher(e.target.value)}
                                                    >
                                                        <option value="">Select Teacher</option>

                                                        {teachers.map(teacher => (
                                                            <option key={teacher.id} value={teacher.id}>
                                                                {teacher.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                ) : (

                                                    <span className={styles.admin_classes_index_cellText}>
                                                        {classe.prof_name}
                                                    </span>

                                                )}
                                            </td>

                                            <td>
                                                {editingId === classe.id ? (

                                                    <select
                                                        className={styles.admin_classes_index_selectInput}
                                                        value={editNiveau}
                                                        onChange={e => setEditNiveau(e.target.value)}
                                                    >
                                                        <option value="">Select Niveau</option>

                                                        {niveaux.map(niveau => (
                                                            <option key={niveau.id} value={niveau.id}>
                                                                {niveau.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                ) : (

                                                    <span className={styles.admin_classes_index_cellText}>
                                                        {classe.niveau_name}
                                                    </span>

                                                )}
                                            </td>

                                            <td>
                                                {editingId === classe.id ? (

                                                    <input
                                                        type="number"
                                                        className={styles.admin_classes_index_numberInput}
                                                        min="0"
                                                        max="100"
                                                        value={editPercentage}
                                                        onChange={e => setEditPercentage(e.target.value)}
                                                    />

                                                ) : (

                                                    <span className={styles.admin_classes_index_valueText}>
                                                        {`${classe.percentage}%`}
                                                    </span>

                                                )}
                                            </td>

                                            <td>
                                                {editingId === classe.id ? (

                                                    <input
                                                        type="number"
                                                        className={styles.admin_classes_index_numberInput}
                                                        min="0"
                                                        step="0.01"
                                                        value={editPrice}
                                                        onChange={e => setEditPrice(e.target.value)}
                                                    />

                                                ) : (

                                                    <span className={styles.admin_classes_index_priceText}>
                                                        {`${Number(classe.price).toFixed(2)} DH`}
                                                    </span>

                                                )}
                                            </td>

                                            <td>
                                                {editingId === classe.id ? (

                                                    <div className={styles.admin_classes_index_actionGroup}>

                                                        <button
                                                            className={styles.admin_classes_index_saveButton}
                                                            onClick={() => handleUpdate(classe.id)}
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            className={styles.admin_classes_index_cancelButton}
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancel
                                                        </button>

                                                    </div>

                                                ) : (

                                                    <div className={styles.admin_classes_index_actionGroup}>

                                                        <button
                                                            className={styles.admin_classes_index_editButton}
                                                            onClick={() => handleEdit(classe)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className={styles.admin_classes_index_deleteButton}
                                                            onClick={() => handleDelete(classe.id)}
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                )}
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr className={styles.admin_classes_index_emptyRow}>
                                        <td colSpan="7">
                                            <div className={styles.admin_classes_index_emptyState}>

                                                <span className={styles.admin_classes_index_emptyAccent}></span>

                                                <span className={styles.admin_classes_index_emptyTitle}>
                                                    No Classes Found
                                                </span>

                                                <span className={styles.admin_classes_index_emptySubtitle}>
                                                    Add a class to begin managing your academic schedule.
                                                </span>

                                            </div>
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </div>
    );
};

export default IndexClasses;