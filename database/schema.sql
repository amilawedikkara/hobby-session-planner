-- database/schema.sql
-- AI-GENERATED: schema draft with extension support

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  max_participants INT,
  type VARCHAR(10) NOT NULL DEFAULT 'public'
    CHECK (type IN ('public','private')),
  management_code VARCHAR(50) NOT NULL UNIQUE,
  private_code VARCHAR(50) UNIQUE,
  creator_email TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
  attendee_name TEXT,
  attendee_email TEXT,
  attendee_phone TEXT,
  attendance_code VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_type ON sessions(type);
CREATE INDEX idx_attendance_session ON attendance(session_id);
