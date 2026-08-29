import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api.js";
import styles from "./login.module.css";

const Login = () => {
    const [name, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        API.post(
            "/auth/login",
            { name, password },
            { withCredentials: true }, // important for Laravel session cookies
        )
            .then((res) => {
                if (res.data.success === true) {
                    const user = res.data.user;

                    // Store role and user info in localStorage for global access
                    localStorage.setItem("user_role", user.role);
                    localStorage.setItem("user_id", user.id);
                    localStorage.setItem("username", user.name);

                    // Dispatch custom event so sidebar updates immediately
                    window.dispatchEvent(new Event("updateRole"));

                    // Navigate to classes page (or dashboard)
                    navigate("/classes", { state: { user } });
                } else {
                    setMessage("Invalid Credentials!");
                }
            })
            .catch((err) => {
                if (err.response && err.response.status === 401) {
                    setMessage("Invalid Credentials!");
                } else {
                    setMessage("Something went wrong. Please try again!");
                }
            });
    };

    return (
        <div className={styles.containerDiv}>
            <form className={styles.formDiv} onSubmit={handleLogin}>
                <div className={styles.formContent}>
                    <div className={styles.brand}>TULUA</div>
                    <h1 className={styles.title}> Welcome back. </h1>
                    <p className={styles.subtitle}> Sign in to continue </p>
                    <input
                        className={styles.form}
                        type="text"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        className={styles.form}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <input
                        className={styles.loginButton}
                        type="submit"
                        value="Login"
                    />
                    <p className={styles.copyright}> © 2026–2027 Tulua </p>
                    {message && (
                        <div className={styles.messageBtn}> {message} </div>
                    )}
                </div>
            </form>
            <div className={styles.imageDiv}>
              <img className={styles.img} src="./images/tulua.png" alt="Tulua"/>
              <img className={styles.logo} src="./images/Logo.png" alt="Tulua Logo"/>
              <div className={styles.imageCaption}>
                  <span className={styles.captionLine}></span>
                  <span>LEARN · CREATE · BECOME</span>
              </div>
          </div>
        </div>
    );
};

export default Login;
