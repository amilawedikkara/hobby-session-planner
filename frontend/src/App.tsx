// basic routes for sessions Responsibility: Provides navigation structure.
// Uses React Router to switch between session list and details.
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import SessionList from "./components/SessionList.tsx";
import SessionDetails from "./components/SessionDetails.tsx"; // stub for next step
import CreateSession from "./components/CreateSession"; // ADD import


export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">All Sessions</Link>
        <Link to="/create">Create Session</Link>
      
      </header>

      <Routes>
        <Route path="/" element={<SessionList />} />
        <Route path="/create" element={<CreateSession />} /> 
        <Route path="/session/:id" element={<SessionDetails />} />
      </Routes>
    </div>
  );
}
