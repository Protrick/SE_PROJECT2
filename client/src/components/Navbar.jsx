import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedin, setIsLoggedin, logout } = useContext(AppContext);

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 py-4 flex justify-between items-center bg-white/10 text-white px-12 backdrop-blur-md">
        <div>LOGO</div>
        <ul className="flex justify-center items-center gap-4">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/join-team">Join Team</Link>
          <Link to="/create-team">Create Team</Link>
          <Link to="/live-opening-creator-view">Live Opportunities</Link>
          <button
            onClick={async () => { if (isLoggedin) { await logout(); navigate('/login'); } else { navigate('/login'); } }}
            className={isLoggedin ? "bg-red-500 text-white px-4 py-2 rounded" : "bg-blue-700 text-white px-4 py-2 rounded"}>{isLoggedin ? "Logout" : "Login"}
          </button>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
