import React, { useEffect, useState } from "react";
import API from "../api.js";
import styles from "../shared.module.css";

const firstError = (err, field) =>
  err?.response?.data?.errors?.[field]?.[0] || null;

const genericError = (err) =>
  err?.response?.data?.message ||
  "Une erreur est survenue. Veuillez réessayer.";

export default function AccountPage() {
  const [loaded, setLoaded] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type, text }
  const [profileErrors, setProfileErrors] = useState({});

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    API.get("/teacher/profile", { withCredentials: true })
      .then((res) => {
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setLoaded(true);
      })
      .catch(() => {
        setProfileMsg({
          type: "error",
          text: "Impossible de charger votre profil.",
        });
        setLoaded(true);
      });
  }, []);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    setProfileErrors({});

    API.put(
      "/teacher/profile",
      { name, email, current_password: profilePassword },
      { withCredentials: true }
    )
      .then((res) => {
        const user = res.data.user;
        setName(user.name);
        setEmail(user.email || "");
        setProfilePassword("");
        localStorage.setItem("username", user.name);
        setProfileMsg({ type: "success", text: res.data.message });
      })
      .catch((err) => {
        setProfileErrors({
          name: firstError(err, "name"),
          email: firstError(err, "email"),
          current_password: firstError(err, "current_password"),
        });
        if (err?.response?.status !== 422) {
          setProfileMsg({ type: "error", text: genericError(err) });
        }
      })
      .finally(() => setProfileSaving(false));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg(null);
    setPasswordErrors({});

    API.put(
      "/teacher/profile/password",
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      },
      { withCredentials: true }
    )
      .then((res) => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMsg({ type: "success", text: res.data.message });
      })
      .catch((err) => {
        setPasswordErrors({
          current_password: firstError(err, "current_password"),
          password: firstError(err, "password"),
        });
        if (err?.response?.status !== 422) {
          setPasswordMsg({ type: "error", text: genericError(err) });
        }
      })
      .finally(() => setPasswordSaving(false));
  };

  const renderMessage = (msg) =>
    msg && (
      <div
        className={`${styles.teacher_Account_message} ${
          msg.type === "success"
            ? styles.teacher_Account_messageSuccess
            : styles.teacher_Account_messageError
        }`}
      >
        {msg.text}
      </div>
    );

  const renderField = ({ id, label, optional, error, hint, ...inputProps }) => (
    <div className={styles.teacher_Account_inputGroup}>
      <label htmlFor={id}>
        {label}
        {optional && (
          <span className={styles.teacher_Account_optionalTag}>(optionnel)</span>
        )}
      </label>
      <input
        id={id}
        className={`${styles.teacher_Account_inputField} ${
          error ? styles.teacher_Account_inputField_error : ""
        }`}
        {...inputProps}
      />
      {error && <span className={styles.teacher_Account_fieldError}>{error}</span>}
      {!error && hint && <span className={styles.teacher_Account_hint}>{hint}</span>}
    </div>
  );

  return (
    <div className={styles.teacher_Account_pageContainer}>
      <div className={styles.teacher_Account_managementCard}>
        {/* Header — identical structure to the other teacher pages */}
        <div className={styles.teacher_Account_cardHeader}>
          <img
            src="/images/neonImage.png"
            alt=""
            className={styles.teacher_Account_headerBackground}
          />

          <div className={styles.teacher_Account_headerOverlay}></div>

          <div className={styles.teacher_Account_headerContent}>
            <span className={styles.teacher_Account_headerLabel}>
              ESPACE ENSEIGNANT
            </span>

            <h1 className={styles.teacher_Account_headerTitle}>Mon compte</h1>

            <p className={styles.teacher_Account_headerSubtitle}>
              Gérez vos identifiants, votre email et votre mot de passe.
            </p>
          </div>
        </div>

        <div className={styles.teacher_Account_cardBody}>
          {/* 01 — Identifiants */}
          <section className={styles.teacher_Account_section}>
            <div className={styles.teacher_Account_sectionHeading}>
              <div className={styles.teacher_Account_sectionLeft}>
                <span className={styles.teacher_Account_sectionNumber}>01</span>

                <div>
                  <span className={styles.teacher_Account_sectionLabel}>PROFIL</span>
                  <h2 className={styles.teacher_Account_sectionTitle}>
                    Identifiants et email
                  </h2>
                </div>
              </div>

              <span className={styles.teacher_Account_sectionDescription}>
                NOM D'UTILISATEUR ET EMAIL DE RÉCUPÉRATION
              </span>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className={styles.teacher_Account_formGrid}>
                {renderField({
                  id: "acc-name",
                  label: "Nom d'utilisateur",
                  type: "text",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  required: true,
                  disabled: !loaded,
                  autoComplete: "username",
                  error: profileErrors.name,
                })}

                {renderField({
                  id: "acc-email",
                  label: "Email",
                  optional: true,
                  type: "email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  placeholder: "exemple@email.com",
                  disabled: !loaded,
                  autoComplete: "email",
                  error: profileErrors.email,
                  hint: "Utilisé pour récupérer votre mot de passe.",
                })}

                {renderField({
                  id: "acc-profile-password",
                  label: "Mot de passe actuel",
                  type: "password",
                  value: profilePassword,
                  onChange: (e) => setProfilePassword(e.target.value),
                  placeholder: "••••••••",
                  autoComplete: "current-password",
                  error: profileErrors.current_password,
                  hint: "Requis pour changer le nom d'utilisateur ou modifier un email existant.",
                })}
              </div>

              <div className={styles.teacher_Account_actions}>
                <button
                  type="submit"
                  className={styles.teacher_Account_submitButton}
                  disabled={profileSaving || !loaded}
                >
                  <span>{profileSaving ? "Enregistrement" : "Enregistrer"}</span>
                  {profileSaving ? (
                    <span className={styles.teacher_Account_spinner}></span>
                  ) : (
                    <span className={styles.teacher_Account_buttonArrow}>→</span>
                  )}
                </button>
              </div>

              {renderMessage(profileMsg)}
            </form>
          </section>

          {/* 02 — Mot de passe */}
          <section className={styles.teacher_Account_section}>
            <div className={styles.teacher_Account_sectionHeading}>
              <div className={styles.teacher_Account_sectionLeft}>
                <span className={styles.teacher_Account_sectionNumber}>02</span>

                <div>
                  <span className={styles.teacher_Account_sectionLabel}>SÉCURITÉ</span>
                  <h2 className={styles.teacher_Account_sectionTitle}>
                    Changer le mot de passe
                  </h2>
                </div>
              </div>

              <span className={styles.teacher_Account_sectionDescription}>
                MINIMUM 6 CARACTÈRES
              </span>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div
                className={`${styles.teacher_Account_formGrid} ${styles.teacher_Account_formGrid_single}`}
              >
                {renderField({
                  id: "acc-current-password",
                  label: "Mot de passe actuel",
                  type: "password",
                  value: currentPassword,
                  onChange: (e) => setCurrentPassword(e.target.value),
                  required: true,
                  autoComplete: "current-password",
                  error: passwordErrors.current_password,
                })}

                {renderField({
                  id: "acc-new-password",
                  label: "Nouveau mot de passe",
                  type: "password",
                  value: newPassword,
                  onChange: (e) => setNewPassword(e.target.value),
                  required: true,
                  minLength: 6,
                  autoComplete: "new-password",
                  error: passwordErrors.password,
                })}

                {renderField({
                  id: "acc-confirm-password",
                  label: "Confirmer le nouveau mot de passe",
                  type: "password",
                  value: confirmPassword,
                  onChange: (e) => setConfirmPassword(e.target.value),
                  required: true,
                  minLength: 6,
                  autoComplete: "new-password",
                })}
              </div>

              <div className={styles.teacher_Account_actions}>
                <button
                  type="submit"
                  className={styles.teacher_Account_submitButton}
                  disabled={passwordSaving}
                >
                  <span>
                    {passwordSaving ? "Modification" : "Changer le mot de passe"}
                  </span>
                  {passwordSaving ? (
                    <span className={styles.teacher_Account_spinner}></span>
                  ) : (
                    <span className={styles.teacher_Account_buttonArrow}>→</span>
                  )}
                </button>
              </div>

              {renderMessage(passwordMsg)}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
