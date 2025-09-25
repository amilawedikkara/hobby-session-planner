// AI-GENERATED: small helpers
export function generateCode(length = 10): string {
  // ai-gen marker: random code
  return Math.random().toString(36).slice(2, 2 + length);
}

// Combine separate date + time (from form) into ISO string
export function combineToISO(dateStr?: string, timeStr?: string): string | null {
  if (!dateStr || !timeStr) return null;
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}
