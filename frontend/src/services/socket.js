import { io } from "socket.io-client";

// api.js's baseURL is the API root (http://localhost:5000/api) — the socket
// server listens on the same host/port, one level up, with no /api prefix.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
const SOCKET_URL = API_BASE.replace(/\/api\/?$/, "");

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;
