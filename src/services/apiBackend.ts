
const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path: string, method = "GET", body?: any) {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);

  if (!res.ok) {
    console.error("API ERROR", method, path, await res.text());
    throw new Error(`API request failed: ${method} ${path}`);
  }

  return res.json().catch(() => null);
}

export const backend = {
  getUsers: () => request("/users"),
  createUser: (user: any) => request("/users", "POST", user),

  authenticate: (email: string, pass: string) =>
    request("/auth/login", "POST", { email, password: pass }),

  getGroups: () => request("/groups"),

  getGames: () => request("/games"),

  saveGame: (game: any) => request(`/games/${game.id}`, "PUT", game),

  updateAssignmentStatus: (gameId: string, role: string, status: string) =>
    request(`/games/${gameId}/assignment`, "POST", { role, status }),

  markAssignmentAsPaid: (gameId: string, role: string) =>
    request(`/games/${gameId}/paid`, "POST", { role }),

  getAvailabilities: () => request("/availability"),

  addAvailability: (avail: any) => request("/availability", "POST", avail),

  deleteAvailability: (id: string) =>
    request(`/availability/${id}`, "DELETE"),

  sendNotification: (userId: string, message: string, type: string) =>
    request("/notifications", "POST", { userId, message, type }),

  sendManualNotification: (args: any) =>
    request("/notifications/manual", "POST", args),

  sendAdminUpcomingGamesReport: (adminId: string) =>
    request(`/reports/upcoming/${adminId}`, "POST"),

  triggerGameReminders: () =>
    request(`/notifications/reminders`, "POST")
};
