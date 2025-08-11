import React from "react";
import { Link} from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <div className="w-full flex justify-between items-center bg-gray-200 text-black px-12">
        <div>LOGO</div>
        <ul className="flex justify-center items-center gap-4">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/join-team">Join Team</Link>
          <Link to="/create-team">Create Team</Link>
          <Link to="/live-opening-creator-view">Live Opportunities</Link>
          <Link to="/live-opening-joining-view">My Openings</Link>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
