import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folder = path.join(__dirname, "../../src/assets/cards/players");

// ✅ Orden fijo, ya no dependes del filesystem
const POSITION_ORDER = ["goalkeepers", "defenders", "midfielders", "strikers"];

const generateLineUp = (room) => {
  const lineUp = {
    goalkeepers: [],
    defenders: [],
    midfielders: [],
    strikers: [],
  };

  const formation = {
    goalkeepers: 1,
    defenders: 4,
    midfielders: 3,
    strikers: 3,
  };

  const numPlayers = room.users.length;

  try {
    // ✅ Iteramos en orden fijo, no con forEach sobre el filesystem
    for (const position of POSITION_ORDER) {
      const subFolder = path.join(folder, position);
      const players = fs.readdirSync(subFolder);

      const totalNeeded = formation[position] * numPlayers;

      for (let i = 0; i < totalNeeded; i++) {
        const random = Math.floor(Math.random() * players.length);
        const randomPlayer = players[random];
        players.splice(random, 1);

        // ✅ Cada jugador ahora sabe su posición
        lineUp[position].push({
          file: randomPlayer,
          position: position,
        });
      }
    }
  } catch (err) {
    console.error(err);
  }

  // ✅ Array plano en orden fijo, listo para iterar con currentPlayerIndex
  const flatLineUp = [
    ...lineUp.goalkeepers,
    ...lineUp.defenders,
    ...lineUp.midfielders,
    ...lineUp.strikers,
  ];

  console.log("LineUp generado:", flatLineUp);
  return flatLineUp;
};

export default generateLineUp;