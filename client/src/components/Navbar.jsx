import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const MotionLink = motion(Link);
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedin, setIsLoggedin, logout } = useContext(AppContext);
  const [open, setOpen] = useState(false);

  const links = [
    ["/", "Home"],
    ["/about", "About"],
    ["/join-team", "Join Team"],
    ["/create-team", "Create Team"],
    ["/created-teams", "My Teams"],
    ["/applied-teams", "My Applications"],
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div className="container row" style={{ justifyContent: "space-between", alignItems: "center", paddingTop: "0.6rem", paddingBottom: "0.6rem" }}>
        <div className="row" style={{ gap: "1rem", alignItems: "center" }}>
          <Link to="/" className="row" aria-label="Home" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(90deg,#60a5fa,#0369a1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(3,105,161,0.18)" }}>
              <span style={{ fontWeight: 800, color: "white" }}>S</span>
            </div>
            <div style={{ marginLeft: 10 }}>
              <div className="h2" style={{ margin: 0 }}>SE_PROJECT2</div>
              <div className="text-muted" style={{ marginTop: 2 }}>Find teams · Collaborate</div>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex row" style={{ alignItems: "center", gap: "1rem" }}>
          <ul className="row" style={{ gap: "0.5rem", alignItems: "center" }}>
            {links.map(([to, label]) => (
              <li key={label}>
                <MotionLink to={to} className="nav-link" whileHover={{ y: -3 }} transition={{ duration: 0.14 }}>
                  {label}
                </MotionLink>
              </li>
            ))}
            <li>
              <button
                onClick={async () => {
                  if (isLoggedin) {
                    await logout();
                    setIsLoggedin(false);
                    navigate("/login");
                  } else {
                    navigate("/login");
                  }
                }}
                className={isLoggedin ? "btn btn-danger" : "btn btn-accent"}
              >
                {isLoggedin ? "Logout" : "Login"}
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile toggle */}
        <div className="md:hidden" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button className="btn btn-primary" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} className="container" style={{ paddingTop: 6, paddingBottom: 12 }}>
          <div className="card col">
            {links.map(([to, label]) => (
              <MotionLink key={label} to={to} className="nav-link" onClick={() => setOpen(false)} style={{ padding: ".6rem 0", display: "block" }}>
                {label}
              </MotionLink>
            ))}
            <div style={{ marginTop: 8 }}>
              <button
                onClick={async () => {
                  if (isLoggedin) {
                    await logout();
                    setIsLoggedin(false);
                    navigate("/login");
                  } else {
                    navigate("/login");
                  }
                }}
                className={isLoggedin ? "btn btn-danger" : "btn btn-accent"}
                style={{ width: "100%" }}
              >
                {isLoggedin ? "Logout" : "Login"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
