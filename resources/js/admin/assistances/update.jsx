import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API from '../../api.js';

const AssistantEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        user_name: '',
        role: "",
    });

    useEffect(() => {
        API
            .get(`/admin/secretaries/${id}`)
            .then((res) => {
                const data = res.data.assistant;

                setForm({
                    name: data.name,
                    user_name: data.user?.name || '',
                    role: data.user?.role || "",
                });
            })
            .catch((err) => console.error(err));
    }, [id]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        API
            .put(`/admin/secretaries/${id}`, form)
            .then(() => {
                navigate("/assistances");
            })
            .catch((err) => console.error(err));
    };

    return (
        <div
            className="container"
            style={{
                border: "1px solid yellow",
                padding: 16,
                borderRadius: 10,
            }}
        >
            <div>
                <h1
                    className="text-warning"
                    style={{ fontSize: 25, textAlign: "center" }}
                >
                    Edit Assistant
                </h1>

                <br />
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter secretary name"
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            name="role"
                            className="form-control"
                            value={form.role}
                            onChange={handleChange}
                            placeholder="Enter role"
                        />
                    </div>

                    <div className="d-flex justify-content-between">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate("/assistances")}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="btn btn-warning">
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssistantEdit;
