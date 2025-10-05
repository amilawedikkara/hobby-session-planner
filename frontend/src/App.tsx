// basic routes for sessions Responsibility: Provides navigation structure.
// Uses React Router to switch between session list and details.
import React from "react";
import { Routes, Route, Link } from "react-router-dom";//client-side navigation.
import SessionList from "./components/SessionList.tsx";//importing custom React components from other files 
import SessionDetails from "./components/SessionDetails.tsx"; // ADD import
import CreateSession from "./components/CreateSession"; // ADD import

export default function App() {
  return (   
    // Main container div with styling
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      
      {/* Header section with navigation links */}
      <header style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        
        {/* Link to home page - shows all sessions */}
        {/* 
          REACT ROUTER LINK (to="/") vs REGULAR ANCHOR TAG (href="/"):
          - <Link to="/">: React Router's special component for navigation
          - Benefits: Instant navigation (no page reload), preserves React state, faster SPA experience
          - Unlike <a href="/"> which causes full page reload, loses state, slower
        */}
        <Link to="/">All Sessions</Link>
        
        {/* Link to create session page */}
        {/* 
          The [to] prop tells React Router where to navigate when clicked
          This goes to the "/create" route we defined below
        */}
        <Link to="/create">Create Session</Link>
      
      </header>

      {/* 
        ROUTES CONTAINER: This is where we define which component shows for which URL
        Think of it as a "display area" that swaps components based on the current URL
      */}
      <Routes>
        
        {/* 
          ROUTE 1: Home page route
          - When URL is exactly "/" (home page), show the SessionList component
          - path="/": Matches the root URL
          - element={<SessionList />}: The component to display for this route
        */}
        <Route path="/" element={<SessionList />} />
        
        {/* 
          ROUTE 2: Create session page  
          - When URL is "/create", show the CreateSession component
          - This is a static route - the path doesn't change
        */}
        <Route path="/create" element={<CreateSession />} /> 
        
        {/* 
          ROUTE 3: Dynamic session details page
          - When URL matches pattern like "/session/1", "/session/2", "/session/123"
          - The colon (:) before "id" makes it a DYNAMIC PARAMETER (variable part of URL)
          - Examples: 
            * "/session/1" → id = "1"
            * "/session/42" → id = "42"
            * "/session/abc" → id = "abc"
          - The SessionDetails component can access this id using useParams() hook
        */}
        <Route path="/session/:id" element={<SessionDetails />} />
      
      </Routes>
    </div>
  );
}



/*
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
}*/
// <Link to="/create">Create Session</Link> ===>The [to] prop specifies the destination path. Instant navigation, preserves state, SPA behavior.
// why use 'to' instead of <a href="/create">Create Session</a> Full page reload, loses React state, slower
//element: The React component to render when the path matches.
//Route path="/session/:id" element={<SessionDetails />} --> Dynamic route with parameter id
//The colon (:) before id indicates that it's a variable part of the URL.
