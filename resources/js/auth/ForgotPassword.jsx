import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api.js";
import styles from "./ForgotPassword.module.css";

const RESEND_SECONDS = 60;

const firstError = (err, field) =>
  err?.response?.data?.errors?.[field]?.[0] || null;

const genericError = (err) =>
  err?.response?.status === 429
    ? "Trop de tentatives. Patientez une minute puis réessayez."
    : err?.response?.data?.message ||
      "Une erreur est survenue. Veuillez réessayer.";

/**
 * Public "forgot password" page (teachers).
 *   1. enter the email        -> a 6-digit code is sent
 *   2. enter code + new password
 *   3. done -> back to login
 */
export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // "email" | "code" | "done"

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [cooldown, setCooldown] = useState(0);

  // Countdown before the code can be sent again
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const requestCode = (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setInfo("");
    setFieldErrors({});

    API.post("/auth/forgot-password", { email: email.trim() })
      .then((res) => {
        setInfo(res.data.message);
        setCode("");
        setStep("code");
        setCooldown(RESEND_SECONDS);
      })
      .catch((err) => {
        const msg = firstError(err, "email");
        if (msg) setFieldErrors({ email: msg });
        // Also shown as a banner, because on the "code" step there is no email field.
        setError(msg || genericError(err));
      })
      .finally(() => setLoading(false));
  };

  const resetPassword = (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setInfo("");
    setFieldErrors({});

    if (password !== confirmation) {
      setFieldErrors({ password: "La confirmation ne correspond pas." });
      return;
    }

    setLoading(true);

    API.post("/auth/reset-password", {
      email: email.trim(),
      code: code.trim(),
      password,
      password_confirmation: confirmation,
    })
      .then((res) => {
        setInfo(res.data.message);
        setPassword("");
        setConfirmation("");
        setStep("done");
      })
      .catch((err) => {
        const errors = {
          code: firstError(err, "code"),
          password: firstError(err, "password"),
        };
        if (errors.code || errors.password) setFieldErrors(errors);
        else setError(genericError(err));
      })
      .finally(() => setLoading(false));
  };

  const backToEmail = () => {
    setStep("email");
    setCode("");
    setPassword("");
    setConfirmation("");
    setInfo("");
    setError("");
    setFieldErrors({});
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.label}>TULUA CENTER</span>

        {step === "email" && (
          <form onSubmit={requestCode} noValidate>
            <h1 className={styles.title}>Mot de passe oublié ?</h1>
            <p className={styles.text}>
              Entrez l'email de votre compte enseignant. Nous vous enverrons un
              code de vérification à 6 chiffres.
            </p>

            <div className={styles.group}>
              <label htmlFor="fp-email">Email</label>
              <input
                id="fp-email"
                type="email"
                className={`${styles.input} ${
                  fieldErrors.email ? styles.inputError : ""
                }`}
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "Envoi..." : "Envoyer le code"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={resetPassword} noValidate>
            <h1 className={styles.title}>Vérifiez votre email</h1>
            {info && <div className={styles.info}>{info}</div>}

            <div className={styles.group}>
              <label htmlFor="fp-code">Code à 6 chiffres</label>
              <input
                id="fp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className={`${styles.input} ${styles.codeInput} ${
                  fieldErrors.code ? styles.inputError : ""
                }`}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
                autoFocus
                required
              />
              {fieldErrors.code && (
                <span className={styles.fieldError}>{fieldErrors.code}</span>
              )}
            </div>

            <div className={styles.group}>
              <label htmlFor="fp-password">Nouveau mot de passe</label>
              <input
                id="fp-password"
                type="password"
                className={`${styles.input} ${
                  fieldErrors.password ? styles.inputError : ""
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              {fieldErrors.password && (
                <span className={styles.fieldError}>{fieldErrors.password}</span>
              )}
            </div>

            <div className={styles.group}>
              <label htmlFor="fp-confirm">Confirmer le mot de passe</label>
              <input
                id="fp-confirm"
                type="password"
                className={styles.input}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "..." : "Changer le mot de passe"}
            </button>

            <div className={styles.linksRow}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={backToEmail}
                disabled={loading}
              >
                Changer d'email
              </button>

              <button
                type="button"
                className={styles.linkButton}
                onClick={() => requestCode()}
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : "Renvoyer le code"}
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div>
            <h1 className={styles.title}>Mot de passe modifié</h1>
            {info && <div className={styles.success}>{info}</div>}

            <Link to="/" className={`${styles.primary} ${styles.primaryLink}`}>
              Retour à la connexion
            </Link>
          </div>
        )}

        {step !== "done" && (
          <Link to="/" className={styles.back}>
            ← Retour à la connexion
          </Link>
        )}
      </div>
    </div>
  );
}
