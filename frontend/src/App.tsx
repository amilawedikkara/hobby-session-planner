// basic routes for sessions Responsibility: Provides navigation structure.
// Uses React Router to switch between session list and details.
import React from "react";
import { Routes, Route, Link } from "react-router-dom";//client-side navigation.
import SessionList from "./components/SessionList.tsx";//importing custom React components from other files 
import SessionDetails from "./components/SessionDetails.tsx"; // ADD import
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
// <Link to="/create">Create Session</Link> ===>The [to] prop specifies the destination path. Instant navigation, preserves state, SPA behavior.
// why use 'to' instead of <a href="/create">Create Session</a> Full page reload, loses React state, slower
//element: The React component to render when the path matches.
//Route path="/session/:id" element={<SessionDetails />} --> Dynamic route with parameter id
//The colon (:) before id indicates that it's a variable part of the URL.
