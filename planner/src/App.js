import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Planner from "./pages/Planner";
import Analytics from "./pages/Analytics";

export default function App(){
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">StudyFlow</Link>
          <div className="d-flex align-items-center">
            <Link to="/" className="btn btn-sm btn-outline-primary me-2">Planner</Link>
            <Link to="/analytics" className="btn btn-sm btn-outline-secondary">Analytics</Link>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        <Routes>
          <Route path="/" element={<Planner />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}
