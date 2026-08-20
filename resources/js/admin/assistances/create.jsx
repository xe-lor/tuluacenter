import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from '../../api.js';

export default function CreateAssistant() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate=useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();


      const response = await API.post("/admin/assistants", {
        username,
        password,
      }).then(()=>{
        navigate('/assistances')
      });

  };

  return (
    <div className="container mt-4" style={{border: "1px solid yellow", padding: 16, borderRadius: 10 }}>
      <h1 className="text-warning" style={{fontSize: 25,textAlign: "center"}}>Create Assistant</h1>
        <br />

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="text-white">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="text-white">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-warning">
          Create Assistant
        </button>
      </form>
    </div>
  );
}