// ==============================
//  APP ENTRY ROUTES (App.tsx)
//  Responsibility:
//   - Provides global navigation structure (header + routes + footer).
//   - Uses React Router for client-side navigation between pages.
//   - Applies Bootstrap for responsive and professional styling.
// ==============================

// -------------- IMPORTS --------------

// React core library

// React Router: client-side routing (SPA navigation)
import { Routes, Route, Link } from "react-router-dom";

// Custom React components (views)
import SessionList from "./components/SessionList.tsx"; // Home page - lists all public sessions
import SessionDetails from "./components/SessionDetails.tsx"; // Displays details for specific session
import CreateSession from "./components/CreateSession"; // Form to create new session
import ManagementPage from "./components/ManagementPage"; // Management (edit/delete/attendees)

// ---------------- MAIN APP COMPONENT ----------------

export default function App() {
  return (
    // Bootstrap container: centers and adds horizontal padding
    <div className="container my-3">
      {/* 
        HEADER SECTION:
        - Displays app title and navigation buttons
        - Uses Bootstrap utilities: mb-4 (margin bottom), border-bottom, pb-2 (padding bottom)
      */}
      <header className="navbar navbar-expand-lg navbar-light bg-light mb-4 p-3 rounded shadow-sm">
        {/* App title on the left */}
        <h2 className="navbar-brand text-primary m-0">Hobby Session Planner</h2>

        {/* 
          NAVIGATION LINKS:
          - <Link> = React Router's client-side navigation.
          - Avoids full page reloads → faster, smoother transitions.
          - Bootstrap buttons for consistent look.
        */}
        <nav>
          {/* "All Sessions" button → Home page */}
          <Link to="/" className="btn btn-outline-primary me-2">
            All Sessions
          </Link>

          {/* "Create Session" button → Form page */}
          <Link to="/create" className="btn btn-success">
            Create Session
          </Link>
        </nav>
      </header>

      {/* 
        ROUTE DEFINITIONS:
        - <Routes> acts as a switch container that renders ONE matching <Route>.
        - Each <Route> specifies a URL pattern and which component to display.
      */}
      <Routes>
        {/* 
          ROUTE 1: Home / Landing Page
          - Path: "/"
          - Component: SessionList
          - Displays list of all public sessions.
        */}
        <Route path="/" element={<SessionList />} />

        {/* 
          ROUTE 2: Create Session Page
          - Path: "/create"
          - Component: CreateSession
          - Displays form to create new hobby session.
        */}
        <Route path="/create" element={<CreateSession />} />

        {/* 
          ROUTE 3: Session Details (Public)
          - Dynamic route using ":id" → URL example: /session/3
          - Component can access ID with useParams() → id = "3"
        */}
        <Route path="/session/:id" element={<SessionDetails />} />

        {/* 
          ROUTE 4: Session Details (Private)
          - Accessed by unique code → /session/by-code/abcd1234
          - Allows invite-only access to private sessions.
        */}
        <Route path="/session/by-code/:code" element={<SessionDetails />} />

        {/* 
          ROUTE 5: Management Page (Public session)
          - /session/:id/manage?code=MGMT_CODE
          - Allows creator to edit/delete session and manage attendees.
        */}
        <Route path="/session/:id/manage" element={<ManagementPage />} />

        {/* 
          ROUTE 6: Management Page (Private session)
          - /session/by-code/:code/manage?code=MGMT_CODE
          - Same as above but for sessions accessed via private_code.
        */}
        <Route
          path="/session/by-code/:code/manage"
          element={<ManagementPage />}
        />
      </Routes>

      {/* 
        FOOTER SECTION:
        - Adds small, muted text centered at the bottom of the page.
        - Provides a professional look for the deployed web app.
      */}
      <footer className="text-center mt-5 text-muted small">
        © 2025 Hobby Session Planner & Atten
      </footer>
    </div>
  );
}
