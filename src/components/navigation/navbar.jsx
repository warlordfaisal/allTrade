import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom"; // Import both Link and NavLink
import "./navbar.css"; // Include the CSS file for styles
import logo from "../../assets/AKlogo.svg"; // Adjust the path to your logo

const Navbar = () => {
  const [isSidebarActive, setSidebarActive] = useState(false);
  const sidebarRef = useRef(null);

  // Toggle Sidebar
  const handleSidebarToggle = () => {
    setSidebarActive((prev) => !prev);
  };

  // Close Sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.classList.contains("sidebar-toggle")
      ) {
        setSidebarActive(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <aside
      className={`sidebar ${isSidebarActive ? "active" : ""}`}
      ref={sidebarRef}
      id="navbar"
    >
      <div className="sidebar-header">
        <img src={logo} alt="logo" />
        <Link to="/">
          <h2>AK Traders</h2>
        </Link>
      </div>

      {/* Hamburger Button */}
      <div
        className={`sidebar-toggle ${isSidebarActive ? "active" : ""}`}
        onClick={handleSidebarToggle}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      <ul className="sidebar-links">
        <h4>
          <span>Main Menu</span>
          <div className="menu-separator"></div>
        </h4>
        <li className="phone">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/purchase"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">overview</span>
            Purchase
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/sales"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">monitoring</span>
            D. O. / Sales
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/forwardPurchase"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            Forward Purchase
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/forwardSell"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">receipt</span>
            Forward Sell
          </NavLink>
        </li>
        <h4>
          <span>General</span>
          <div className="menu-separator"></div>
        </h4>
        <li className="phone">
          <NavLink
            to="/allReports"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">flag</span>
            All Reports
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/create"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">folder</span>
            Create
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/ledger"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">groups</span>
            Ledger
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/payments"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">move_up</span>
            Payment
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/notifications"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">
              notifications_active
            </span>
            Notifications
          </NavLink>
        </li>
        <h4>
          <span>Account</span>
          <div className="menu-separator"></div>
        </h4>
        <li className="phone">
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">account_circle</span>
            Profile
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </NavLink>
        </li>
        <li className="phone">
          <NavLink
            to="/logout"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Navbar;