import React, { useEffect, useState } from "react";
import API from "../api.js";
import styles from "../shared.module.css";

/**
 * First-visit popup for teachers: asks for an (optional) email.
 * Shown once — saving or skipping both mark the prompt as answered
 * on the server, so it never comes back. The email can still be
 * added later from the "Account" page.
 */
export default function EmailPrompt() {
  const [role, setRole] = useState(localStorage.getItem("user_role"));
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Follow login / logout
  useEffect(() => {
    const updateRole = () => setRole(localStorage.getItem("user_role"));
    window.addEventListener("updateRole", updateRole);
    return () => window.removeEventListener("updateRole", updateRole);
  }, []);

  // Ask the server whether this teacher still needs to be prompted
  useEffect(() => {
    if (role !== "teacher") {
      setOpen(false);
      return;
    }

    let cancelled = false;

    API.get("/teacher/profile", { withCredentials: true })
      .then((res) => {
        if (!cancelled && res.data.needs_email_prompt) {
          setEmail("");
          setError("");
          setOpen(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [role]);

  const send = (value) => {
    setSaving(true);
    setError("");

    API.post(
      "/teacher/profile/email-prompt",
      { email: value },
      { withCredentials: true }
    )
      .then(() => setOpen(false))
      .catch((err) => {
        setError(
          err?.response?.data?.errors?.email?.[0] ||
            err?.response?.data?.message ||
            "Une erreur est survenue. Veuillez réessayer."
        );
      })
      .finally(() => setSaving(false));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Entrez une adresse email ou cliquez sur « Plus tard ».");
      return;
    }
    send(email.trim());
  };

  if (!open) return null;

  return (
    <div className={styles.teacher_EmailPrompt_overlay}>
      <form className={styles.teacher_EmailPrompt_modal} onSubmit={handleSave}>
        <span className={styles.teacher_EmailPrompt_label}>ESPACE ENSEIGNANT</span>

        <h2 className={styles.teacher_EmailPrompt_title}>Ajoutez votre email</h2>

        <p className={styles.teacher_EmailPrompt_text}>
          Cet email servira à récupérer votre mot de passe en cas d'oubli. C'est
          facultatif, vous pouvez aussi l'ajouter plus tard depuis « Account ».
        </p>

        <input
          type="email"
          className={styles.teacher_EmailPrompt_input}
          placeholder="exemple@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          autoComplete="email"
        />

        {error && <div className={styles.teacher_EmailPrompt_error}>{error}</div>}

        <div className={styles.teacher_EmailPrompt_actions}>
          <button
            type="button"
            className={styles.teacher_EmailPrompt_skip}
            onClick={() => send("")}
            disabled={saving}
          >
            Plus tard
          </button>

          <button
            type="submit"
            className={styles.teacher_EmailPrompt_save}
            disabled={saving}
          >
            {saving ? "..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
