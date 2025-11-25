// src/services/apiBackend.ts
import axios from "axios";

const API = axios.create({
  baseURL: "https://youassign-backend-2.onrender.com/api",
  headers: { "Content-Type": "application/json" }
});

// 🔐 Store JWT in memory
let authToken: string | null = null;

export const backend = {
  setToken(token: string | null) {
    authToken = token;
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  },

  // ------------------------
  // AUTHENTICATION
  // ------------------------
  async authenticate(email: string, password: string) {
    const res = await API.post("/auth/login", { email, password });
    return res.data; // { user, token }
  },

  async createUser(user: any) {
    const res = await API.post("/users", user);
    return res.data;
  },

  // ------------------------
  // USERS
  // ------------------------
  async getUsers() {
    const res = await API.get("/users");
    return res.data;
  },

  // ------------------------
  // GROUPS
  // ------------------------
  async getGroups() {
    const res = await API.get("/groups");
    return res.data;
  },

  // ------------------------
  // GAMES
  // ------------------------
  async getGames() {
    const res = await API.get("/games");
    return res.data;
  },

  async saveGame(game: any) {
    return await API.put(`/games/${game.id}`, game);
  },

  // ------------------------
  // AVAILABILITY
  // ------------------------
  async getAvailabilities() {
    const res = await API.get("/availability");
    return res.data;
  },

  async addAvailability(avail: any) {
    const res = await API.post("/availability", avail);
    return res.data;
  },

  async deleteAvailability(id: string) {
    await API.delete(`/availability/${id}`);
  },

  // ------------------------
  // ASSIGNMENTS
  // ------------------------
  async updateAssignmentStatus(gameId: string, role: string, status: string) {
    await API.put(`/assignments/${gameId}/${role}`, { status });
  },

  async markAssignmentAsPaid(gameId: string, role: string) {
    await API.put(`/assignments/${gameId}/${role}/paid`);
  },

  // ------------------------
  // NOTIFICATIONS
  // ------------------------
  async sendNotification(userId: string, message: string, type: "EMAIL" | "SMS") {
    await API.post("/notifications", { userId, message, type });
  },

  async sendManualNotification(args: {
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) {
    await API.post("/notifications/manual", args);
  },

  async sendAdminUpcomingGamesReport(adminId: string) {
    await API.post("/notifications/admin-report", { adminId });
  },

  async triggerGameReminders() {
    const res = await API.post("/notifications/reminders");
    return res.data.count ?? 0;
  },

  // ------------------------
  // BANK DETAILS
  // ------------------------
  async saveBankDetails(userId: string, details: any) {
    await API.put(`/users/${userId}/bank`, details);
  }
};

export default backend;
