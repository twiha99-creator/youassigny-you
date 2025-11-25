const API_BASE = "https://youassign-backend-2.onrender.com/api";

// ---- USERS ----
export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function createUser(user: any) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}

// ---- GROUPS ----
export async function getGroups() {
  const res = await fetch(`${API_BASE}/groups`);
  return res.json();
}

export async function createGroup(group: any) {
  const res = await fetch(`${API_BASE}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(group),
  });
  return res.json();
}

// ---- GAMES ----
export async function getGames() {
  const res = await fetch(`${API_BASE}/games`);
  return res.json();
}

export async function createGame(game: any) {
  const res = await fetch(`${API_BASE}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });
  return res.json();
}

// ---- ASSIGNMENTS ----
export async function getAssignments() {
  const res = await fetch(`${API_BASE}/assignments`);
  return res.json();
}

export async function createAssignment(assignment: any) {
  const res = await fetch(`${API_BASE}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assignment),
  });
  return res.json();
}

// ---- AVAILABILITY ----
export async function getAvailability() {
  const res = await fetch(`${API_BASE}/availability`);
  return res.json();
}

export async function setAvailability(data: any) {
  const res = await fetch(`${API_BASE}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ---- NOTIFICATIONS ----
export async function sendNotification(data: any) {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
