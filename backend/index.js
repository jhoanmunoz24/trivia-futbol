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
    if (room.lineUp) return; // Si ya hay lineup, no lo regeneramos

    room.lineUp = generateLineUp(room);
    console.log("\n--- JUEGO INICIADO: Lineup generado ---\n");

    // Iniciar la primera ronda
    startRound(room, io);
  });

  socket.on("bid", ({ code, amount }) => {
    const room = rooms.get(code);
    if (!room) return;

    // Solo aceptamos la subasta si es mayor
    if (amount <= room.currentBid) return;

    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }

    room.currentBid = amount;
    room.highestBidder = socket.id;
    console.log(
      `[APUESTA] -> ID: ${socket.id} apostó ${amount}M por el futbolista actual!`,
    );

    io.to(code).emit("bid-update", { amount, bidderName: socket.data.name });

    // La ronda sigue para ver si alguien lo supera
    advanceTurn(room, io);
  });

  socket.on("pass", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;

    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }

    // METEMOS AL USUARIO EN EL SET (ya no vuelve a jugar esta ronda)
    room.passedUsers.add(socket.id);
    console.log(`[PASÓ TURNO] -> ID: ${socket.id} decidió pasar.`);
    console.log(
      `           -> Estatus del SET: ${room.passedUsers.size} de ${room.eligibleUsers.length} jugadores en la mesa ya pasaron.`,
    );

    advanceTurn(room, io);
  });
});

function startRound(room, io) {
  // Verificamos si nos quedamos sin jugadores en el lineup (el ARREGLO inmenso)
  if (room.currentPlayerIndex >= room.lineUp.length) {
    console.log("\n[FIN DEL DRAFT] -> Ya no quedan jugadores.");
    io.to(room.code).emit("draft-finished");
    return;
  }

  const actualPlayer = room.lineUp[room.currentPlayerIndex];

  // Creamos el ARREGLO de elegibles filtrando el de 'users'
  room.eligibleUsers = room.users.filter(
    (user) =>
      user.lineUpPersonal[actualPlayer.position].length <
      formation[actualPlayer.position],
  );

  console.log(`\n=== INICIO DE RONDA ===`);
  console.log(
    `Jugador en subasta: ${actualPlayer.file} (Posición: ${actualPlayer.position})`,
  );

  // Si nadie lo puede comprar, saltamos al siguiente automáticamente
  if (room.eligibleUsers.length === 0) {
    console.log(
      `[INF] Ningún jugador tiene espacio para un ${actualPlayer.position}. Avanzamos al siguiente...`,
    );
    room.currentPlayerIndex++;
    return startRound(room, io);
  }

  // REINICIAMOS TODO PARA LA NUEVA RONDA
  room.passedUsers.clear(); // Vaciamos el SET. ¡Listo para volver a usarse!
  room.currentBid = 35;
  room.highestBidder = null;
  room.currentTurn = 0;

  console.log(
    `Elegibles en esta ronda: ${room.eligibleUsers.map((u) => u.name).join(", ")}`,
  );

  io.to(room.code).emit("new-round", {
    player: actualPlayer,
    currentBid: room.currentBid,
  });

  startCurrentTurn(room, io);
}

function startCurrentTurn(room, io) {
  // ESCENARIO A: Nadie ofertó y todos los elegibles están metidos en el SET 'passedUsers'
  if (
    room.passedUsers.size === room.eligibleUsers.length &&
    !room.highestBidder
  ) {
    console.log("[FIN RONDA] -> Nadie apostó. Eligiendo al azar...");
    const randomUserIndex = Math.floor(
      Math.random() * room.eligibleUsers.length,
    );
    const winner = room.eligibleUsers[randomUserIndex];
    assignPlayerAndAdvance(room, winner, io);
    return;
  }

  // ESCENARIO B: Alguien apostó y todos los DEMÁS están en el SET 'passedUsers'
  if (
    room.highestBidder &&
    room.passedUsers.size === room.eligibleUsers.length - 1
  ) {
    const winner = room.eligibleUsers.find((u) => u.id === room.highestBidder);
    console.log(
      `[FIN RONDA] -> Espectacular subasta. Se la lleva ${winner.name} por ${room.currentBid}M USD!`,
    );
    assignPlayerAndAdvance(room, winner, io);
    return;
  }

  // Si la ronda no se acaba, iteramos sobre el ARREGLO de elegibles
  let attempts = 0;
  while (attempts < room.eligibleUsers.length) {
    // Extrayendo el OBJETO usuario del ARREGLO
    const userTurn = room.eligibleUsers[room.currentTurn];

    // Verificando en el SET si ya pasó turno
    if (!room.passedUsers.has(userTurn.id)) {
      console.log(`[TURNO ASIGNADO] -> Jugador: ${userTurn.name}`);
      io.to(room.code).emit("turn-started", {
        userID: userTurn.id,
        userName: userTurn.name,
      });
      startRoundTimer(room, io);
      return;
    }

    // Si su ID ya está dentro del SET, sumamos y evaluamos el próximo:
    room.currentTurn = (room.currentTurn + 1) % room.eligibleUsers.length;
    attempts++;
  }
}

function assignPlayerAndAdvance(room, winner, io) {
  const actualPlayer = room.lineUp[room.currentPlayerIndex];

  // Inserción en el ARREGLO de la posición en el OBJETO lineUpPersonal de ESTE usuario en específico
  winner.lineUpPersonal[actualPlayer.position].push(actualPlayer);

  

  io.to(room.code).emit("player-assigned", {
    winnerName: winner.name,
    player: actualPlayer,
    amount: room.currentBid,
  });
  

  io.to(winner.id).emit("lineup-update", {
    lineUpPersonal: winner.lineUpPersonal,
  });

  console.log(
    "Se lo lleva",
    winner.name,
    actualPlayer,
    room.currentBid,
    winner.lineUpPersonal,
  );

  // Modificamos el estado principal e iniciamos nueva ronda

  setTimeout(() => {
    room.currentPlayerIndex++;
    startRound(room, io);
    console.log("Mirando quien gano")
  }, 10000);
}

function advanceTurn(room, io) {
  room.currentTurn = (room.currentTurn + 1) % room.eligibleUsers.length;
  startCurrentTurn(room, io);
}

function startRoundTimer(room, io) {
  if (room.roundTimer) clearTimeout(room.roundTimer);
  room.roundTimer = setTimeout(() => {
    const userTurn = room.eligibleUsers[room.currentTurn];
    console.log(
      `[TIEMPO AGOTADO] -> El jugador ${userTurn.name} tardó 10s. Agregándolo al SET de passedUsers...`,
    );
    room.passedUsers.add(userTurn.id);
    advanceTurn(room, io);
  }, 10000);
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
