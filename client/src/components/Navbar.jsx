import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
const MotionLink = motion(Link);
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedin, setIsLoggedin, logout } = useContext(AppContext);

  return (
    <>
      <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="fixed top-0 left-0 w-full z-50 py-4 flex justify-between items-center bg-white/10 text-white px-12 backdrop-blur-md">
        <div className="flex items-center gap-3 p-0">
          <img src="/LOGO.png" alt="Logo" className="h-10 w-auto p-0  " />
        </div>
        <motion.ul
          className="flex justify-center items-center gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } }
          }}
        >
          {[
            ["/", "Home"],
            ["/join-team", "Join Team"],
            ["/create-team", "Create Team"],
            ["/created-teams", "My Teams"],
            ["/applied-teams", "My Applications"],
          ].map(([to, label]) => (
            <motion.li key={label} variants={{ hidden: { y: -8, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.45 } } }} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
              <MotionLink to={to} className="relative inline-block px-2 py-1 group" initial={{ color: '#ffffff' }} whileHover={{ color: '#0c00fa' }} transition={{ duration: 0.25 }}>
                <span className="relative z-10">{label}</span>
                <span className="absolute left-0 bottom-0 h-0.5 w-full origin-left transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100" style={{ background: 'currentColor', transformOrigin: 'left' }} />
              </MotionLink>
            </motion.li>
          ))}
          <motion.li variants={{ hidden: { y: -8, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.45 } } }} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={async () => { if (isLoggedin) { await logout(); navigate('/login'); } else { navigate('/login'); } }}
              className={isLoggedin ? "bg-red-500 text-white px-4 py-2 rounded" : "bg-blue-700 text-white px-4 py-2 rounded"}>{isLoggedin ? "Logout" : "Login"}
            </button>
          </motion.li>
        </motion.ul>
      </motion.div>
    </>
  );
};

export default Navbar;
