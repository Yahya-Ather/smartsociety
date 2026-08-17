// Small singleton so controllers can emit socket events without importing
// server.js (which would create a circular import back into app.js).
let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

export function getIO() {
  return ioInstance;
}
