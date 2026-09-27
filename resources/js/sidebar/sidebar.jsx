
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./sidebar.module.css";
import useLogout from "./useLogout";

const SideBar = () => {
  const [role, setRole] = useState(localStorage.getItem("user_role"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = useLogout();

  // Update role when login/logout changes it
  useEffect(() => {
    const updateRole = () => {
      setRole(localStorage.getItem("user_role"));
    };

    window.addEventListener("updateRole", updateRole);

    return () => {
      window.removeEventListener("updateRole", updateRole);
    };
  }, []);

  // Do not display sidebar if user is not authenticated
  if (!role) return null;

  // =========================
  // ADMIN LINKS
  // =========================
  const adminLinks = [
    { label: "Classes", to: "/classes/index" },
    { label: "Levels", to: "/niveaux" },
    { label: "Teachers", to: "/teachers" },
    { label: "Assistant", to: "/assistances" },
    { label: "Subjects", to: "/matieres" },
  ];

  // =========================
  // ASSISTANT LINKS
  // =========================
  const assistantLinks = [
    { label: "Add Student", to: "/payment/add" },
    { label: "All Students", to: "/payment/index" },
    { label: "Students Cards", to: "/students/studentsQr" },
    { label: "Scanner", to: "/students/scanner" },
  ];

  // =========================
  // TEACHER LINKS
  // =========================
  // Leave empty for now.
  // Add teacher navigation here later.
  const teacherLinks = [
      { label: "Stats Page", to: "/teacher/statistiques" },
      { label: "Students Page", to: "/teacher/students" },
  ];

  // =========================
  // SELECT LINKS BASED ON ROLE
  // =========================
  let links = [];

  switch (role) {
    case "admin":
      links = adminLinks;
      break;

    case "assistant":
      links = assistantLinks;
      break;

    case "teacher":
      links = teacherLinks;
      break;

    default:
      links = [];
  }

  // Close mobile menu after clicking a link
  const handleMobileLinkClick = () => {
    setMobileOpen(false);
  };

  // Logout
  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  return (
    <aside
      className={`${styles.sidebar} ${
        mobileOpen ? styles.mobileOpen : ""
      }`}
    >
      {/* =========================
          MOBILE TOP BAR
          ========================= */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileBrand}>
          <span className={styles.brandMark}>T</span>

          <div>
            <span className={styles.brandName}>TULUA</span>
            <span className={styles.brandLabel}>CENTER</span>
          </div>
        </div>

        <button
          type="button"
          className={`${styles.menuToggle} ${
            mobileOpen ? styles.menuToggleOpen : ""
          }`}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={
            mobileOpen ? "Close navigation" : "Open navigation"
          }
          aria-expanded={mobileOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* =========================
          SIDEBAR CONTENT
          ========================= */}
      <div className={styles.sidebarInner}>

        {/* DESKTOP BRAND */}
        <div className={styles.brand}>
          <span className={styles.brandMark}>T</span>

          <div>
            <span className={styles.brandName}>TULUA</span>
            <span className={styles.brandLabel}>CENTER</span>
          </div>
        </div>

        {/* ROLE */}
        <div className={styles.role}>
          <span className={styles.roleLine} />
          <span>{role}</span>
        </div>

        {/* NAVIGATION */}
        <nav className={styles.navigation}>
          <div className={styles.navLabel}>Navigation</div>

          {links.map((link, index) => (
            <React.Fragment key={link.to}>
              <Link
                className={styles.navLink}
                to={link.to}
                onClick={handleMobileLinkClick}
              >
                <span className={styles.navNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>{link.label}</span>

                <span className={styles.arrow}>→</span>
              </Link>

              <div className={styles.separator} />
            </React.Fragment>
          ))}
        </nav>

        {/* FOOTER */}
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <span>Logout</span>
            <span className={styles.logoutIcon}></span>
          </button>
        </div>

      </div>
    </aside>
  );
};

export default SideBar;
