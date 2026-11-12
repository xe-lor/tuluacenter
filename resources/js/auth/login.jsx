import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api.js";
import styles from "./login.module.css";

// Duration of the zoom animation (must match the CSS: 1.1s)
const ZOOM_MS = 1100;

// White curtain timings
const WHITE_IN_DELAY = 100; // when the white starts fading in (during the zoom)
const WHITE_IN_MS = 450; // how long the white takes to fade in
const WHITE_OUT_MS = 800; // how long the white takes to fade away on the new page
const PAGE_SETTLE_MS = 350; // time given to the new page to render behind the white

// The curtain lives directly on <body>, so it survives the route change
// (the Login component unmounts when we navigate).
const createWhiteCurtain = () => {
    const el = document.createElement("div");
    el.style.cssText =
        "position:fixed;inset:0;z-index:100000;background:#ffffff;" +
        "opacity:0;pointer-events:none;" +
        `transition:opacity ${WHITE_IN_MS}ms ease-in;`;
    document.body.appendChild(el);
    return el;
};

const Login = () => {
    const [name, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [zooming, setZooming] = useState(false);

    const navigate = useNavigate();
    const timerRef = useRef(null);

    // Where each role lands after login
    const getRoute = (role) => {
        if (role === "admin") return "/classes/index";
        if (role === "teacher") return "/teacher/students";
        if (role === "assistant") return "/payment/index";
        return "/";
    };

    // Lock page scroll while zooming, and clean up the timer on unmount
    useEffect(() => {
        if (zooming) {
            const previous = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = previous;
            };
        }
    }, [zooming]);

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (zooming) return;

        API.post("/auth/login", { name, password }, { withCredentials: true })
            .then((res) => {
                if (res.data.success === true) {
                    const user = res.data.user;

                    const target = getRoute(user.role);

                    // Store role + notify the Sidebar. This is done LATE (after the
                    // zoom) so the app doesn't show the next page too early.
                    const saveSession = () => {
                        localStorage.setItem("user_role", user.role);
                        localStorage.setItem("user_id", user.id);
                        localStorage.setItem("username", user.name);
                        window.dispatchEvent(new Event("updateRole"));
                    };

                    // Respect reduced-motion: skip the animation
                    const reduceMotion = window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                    ).matches;

                    if (reduceMotion) {
                        saveSession();
                        navigate(target);
                        return;
                    }

                    // 1) Start the zoom
                    setMessage("");
                    setZooming(true);

                    // 2) Fade white in over the end of the zoom
                    const curtain = createWhiteCurtain();
                    setTimeout(() => {
                        curtain.style.opacity = "1";
                    }, WHITE_IN_DELAY);

                    // 3) Screen is fully white -> save session + open the page
                    timerRef.current = setTimeout(() => {
                        saveSession();
                        navigate(target);

                        // 4) Let the new page render behind the white, then fade it away
                        setTimeout(() => {
                            curtain.style.transition = `opacity ${WHITE_OUT_MS}ms ease-out`;
                            curtain.style.opacity = "0";
                            setTimeout(
                                () => curtain.remove(),
                                WHITE_OUT_MS + 100,
                            );
                        }, PAGE_SETTLE_MS);
                    }, ZOOM_MS + 100);
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
        <>
            <div
                className={`${styles.containerDiv} ${
                    zooming ? styles.zooming : ""
                }`}
            >
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

                        <Link
                            className="passlink"
                            style={{ color: "white" }}
                            to="/ForgotPassword"
                        >
                            Mot de passe oublié ?
                        </Link>

                        <input
                            className={styles.loginButton}
                            type="submit"
                            value="Login"
                            disabled={zooming}
                        />
                        <p className={styles.copyright}> © 2026–2027 Tulua </p>
                        {message && (
                            <div className={styles.messageBtn}> {message} </div>
                        )}
                    </div>
                </form>

                <div className={styles.imageDiv}>
                    <img
                        className={styles.image}
                        src="/images/neonLogin.gif"
                        alt="LoginLogo"
                    />
                </div>
            </div>

            {/* Full-screen aurora that fades in at the end of the zoom,
                so no edges or background are ever visible */}
            {zooming && (
                <div
                    className={styles.zoomOverlay}
                    style={{ backgroundImage: "url(/images/sideback.avif)" }}
                />
            )}
        </>
    );
};

export default Login;
