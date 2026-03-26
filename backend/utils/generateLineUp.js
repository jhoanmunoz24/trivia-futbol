import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folder = path.join(__dirname, "../../src/assets/cards/players");

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
    const files = fs.readdirSync(folder);

    files.forEach((file) => {
      const subFolder = path.join(folder, file);
      const player = fs.readdirSync(subFolder);

      console.log("Jugadores", player);

      for (let i = 0; i < formation[file] * numPlayers; i++) {
        const random = Math.floor(Math.random() * player.length);
        const randomPlayer = player[random];
        lineUp[file].push(randomPlayer);
        player.splice(random, 1);
      }
    });
  } catch (err) {
    console.error(err);
  }
  console.log(lineUp);

  return lineUp;
};

export default generateLineUp;
