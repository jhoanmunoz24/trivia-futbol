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
    currentTurn: 0,
    currentPlayerIndex: 0,
    currentBidderIndex: 0,
    eligibleUsers: [],
    passedUsers: new Set(),
    roundTimer: null,
    roundActive: null,
  });
  res.status(200).json({ code });
});

const formation = {
  goalkeepers: 1,
  defenders: 4,
  midfielders: 3,
  strikers: 3,
};

io.on("connect", (socket) => {
  socket.on("join-room", async ({ code, name }) => {
    const room = rooms.get(code);
    if (!room) {
      console.log("Sala no encontrada");
      return socket.emit("room-error", "Sala no encontrada");
    }

    const lineUpPersonal = {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      strikers: [],
    };

    socket.join(code);
    socket.data.code = code;
    socket.data.name = name;

    room.users.push({ id: socket.id, name, lineUpPersonal });

    const sockets = await io.in(code).fetchSockets();
    const usuarios = sockets.map((s) => ({ id: s.id, name: s.data.name }));

    socket.emit("room-joined", { name, code, usuarios });

    socket.to(code).emit("user-joined", { name, usuarios });

    console.log(
      "Entro un usuario a la sala" + "Codigo: " + code + "Nombre: " + name,
    );

    console.log("Usuarios en la sala: ", usuarios);

    console.log("SALAS", Array.from(rooms.keys()));
    console.log("Datos del usuario", room.users);
  });

  socket.on("rejoin-room", ({ code }) => {
    console.log("Reconectando");
    const room = rooms.get(code);
    if (!room) return socket.emit("room-error", "Sala no encontrada");

    socket.emit("rejoined", { lineUp: room.lineUp });
  });

  socket.on("run-game", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return socket.emit("room-error", "Sala no encontrada");
    if (room.users.length < 2) {
      return socket.emit("room-error", "Se necesitan al menos 2 jugadores");
    }

    console.log("Iniciando juego");

    io.to(code).emit("game-started");
  });

  socket.on("start-bidding", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;

    if (room.lineUp) return;

    room.lineUp = generateLineUp(room);
    console.log("Lineup generado", room.lineUp);
    const userTurn = room.users[room.currentTurn];

    let actualPlayer = room.lineUp[room.currentPlayerIndex];
    room.eligibleUsers = room.users.filter(
      (position) =>
        position.lineUpPersonal[actualPlayer.position].length <
        formation[actualPlayer.position],
    );
    console.log("Usuarios elegibles", room.eligibleUsers);
    console.log("Primer jugador", actualPlayer.file);
    io.to(code).emit("turn-started", {
      userID: userTurn.id,
      userName: userTurn.name,
    });

    startRoundTimer(room, io);
  });

  socket.on("bid", ({ code, amount }) => {
    const room = rooms.get(code);
    if (!room) return;

    clearTimeout(room.roundTimer);
  });

  socket.on("pass", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;

    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }
    console.log("Jugador", room.users[room.currentTurn].name, "paso");

    room.passedUsers.add(room.users[room.currentTurn].id);
    advanceTurn(room, io);
  });
});

function startRoundTimer(room, io) {
  if (room.roundTimer) clearTimeout(room.roundTimer);
  room.roundTimer = setTimeout(() => {
    console.log("no pujaste por el jugador");
    advanceTurn(room, io);
  }, 10000);
}

function advanceTurn(room, io) {
  room.currentTurn++;
  if (room.currentTurn >= room.users.length) {
    room.currentTurn = 0; // simple wrap-around for now
  }

  const userTurn = room.users[room.currentTurn];
  io.to(room.code).emit("turn-started", {
    userID: userTurn.id,
    userName: userTurn.name,
  });

  startRoundTimer(room, io);
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
