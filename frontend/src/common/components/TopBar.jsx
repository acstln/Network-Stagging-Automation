import React from "react";
import { Link } from "react-router-dom";
import logo from "../../medias/logo_netax_long.png";

export default function TopBar() {
  return (
    <header
      className="Header"
      style={{
        background: "#F6F8FA",
        borderBottom: "1px solid #d0d7de",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        zIndex: 100,
        minHeight: 56,
      }}
    >
      <div
        className="d-flex flex-items-center"
        style={{ height: 56, width: "100%" }}
      >
        <div className="d-flex flex-items-center" style={{ marginLeft: 24 }}>
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              width={150}
              style={{ borderRadius: 4, cursor: "pointer" }}
            />
          </Link>
          <nav className="d-flex flex-items-center ml-4">
            <Link to="/">
              <button className="Header-link mr-3">Home</button>
            </Link>
            <Link to="/stagging">
              <button className="Header-link mr-3">Stagging</button>
            </Link>
            <Link to="/software">
              <button className="Header-link">Software</button>
            </Link>
          </nav>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ marginRight: 24 }}>
          <Link to="/help">
            <button className="Header-link">Help</button>
          </Link>
        </div>
      </div>
    </header>
  );
}