import { useState, useEffect } from "react";
import Lineup from "../components/Lineup";
import BiddingPlayer from "../components/BiddingPlayer";
import { useLocation, useParams } from "react-router";
import socket from "../utils/socket";
const BiddingGame = () => {
  const { state } = useLocation();
  const [lineUp, setLineUp] = useState(state?.lineUp ?? null);
  const { code } = useParams();
  const [showLineUp, setShowLineUp] = useState(false);
  useEffect(() => {
    socket.emit("start-bidding", { code });
    if (!lineUp) {
      // si se recargó y perdió el state, pide de nuevo
      socket.emit("rejoin-room", { code, name });
    }

    socket.on("rejoined", ({ lineUp }) => setLineUp(lineUp));
    socket.on("turn-started", ({ userID, userName }) => {
      console.log("Es el turno de: ", userName, "Con id: ", userID);
    });
    socket.on("lineup-update", ({ lineUpPersonal }) => {
      setLineUp(lineUpPersonal);
    });
    



    return () => {
      socket.off("rejoined");
      socket.off("lineup-update");
      socket.off("turn-started");
    };
  }, []);

  const formation = {
    goalkeepers: 1,
    defenders: 4,
    midfielders: 3,
    strikers: 3,
  };

  console.log("Lineup pasado por router", lineUp);
  return (
    <>
      <BiddingPlayer setShowLineUp={setShowLineUp} showLineUp={showLineUp}></BiddingPlayer>
      {lineUp && <Lineup lineUp={lineUp} setShowLineUp={setShowLineUp} />}
    </>
  );
};

export default BiddingGame;
