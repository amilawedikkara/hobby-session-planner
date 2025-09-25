// AI-GENERATED: placeholder details page (we'll flesh out next)
import React from "react";
import { useParams } from "react-router-dom";

export default function SessionDetails() {
  const { id } = useParams(); // ai-gen marker: route param
  return (
    <div>
      <h2>Session Details</h2>
      <p>Session ID: {id}</p>
      <p>(Next step: fetch details, show “I’m going” button.)</p>
    </div>
  );
}
