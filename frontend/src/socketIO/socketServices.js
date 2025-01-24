import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userDetails) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("Connected to server");
      this.socket.emit("register", userDetails);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.listeners.forEach((handler, event) => {
      this.socket.on(event, handler);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, handler) {
    this.listeners.set(event, handler);
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
