import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
const PORT = process.env.PORT ?? 3000;
import { generateRoomCode } from "./utils/generateCode.js";
import cors from "cors";
import generateLineUp from "./utils/generateLineUp.js";
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
};
const app = express();

const rooms = new Map();

const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.post("/api/room/create", (req, res) => {
  const code = generateRoomCode();
  rooms.set(code, {
    code,
    users: [],
    createdAt: Date.now(),
  });
  res.status(200).json({ code });
});

io.on("connect", (socket) => {
  socket.on("join-room", async ({ code, name }) => {
    const room = rooms.get(code);
    if (!room) {
      console.log("Sala no encontrada");
      return socket.emit("room-error", "Sala no encontrada");
    }

    const userExists = room.users.some((u) => u.id == socket.id);

    socket.join(code);
    socket.data.code = code;
    socket.data.name = name;

    room.users.push({ id: socket.id, name });

    const sockets = await io.in(code).fetchSockets();
    const usuarios = sockets.map((s) => ({ id: s.id, name: s.data.name }));

    socket.emit("room-joined", { name, code, usuarios });

    socket.to(code).emit("user-joined", { name, usuarios });

    console.log(
      "Entro un usuario a la sala" + "Codigo: " + code + "Nombre: " + name,
    );

    console.log("Usuarios en la sala: ", usuarios);

    console.log("SALAS", Array.from(rooms.keys()));
  });

  socket.on("run-game", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return socket.emit("room-error", "Sala no encontrada");
    if (room.users.length < 2) {
      return socket.emit("room-error", "Se necesitan al menos 2 jugadores");
    }

    console.log("Iniciando juego");

    const lineUp = generateLineUp(room);

    io.to(code).emit("game-started", { lineUp });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
