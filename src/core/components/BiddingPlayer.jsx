import React from "react";
import Card from "../../assets/ui/mystery_player.webp";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState, useEffect } from "react";
import socket from "../utils/socket";
import { useParams } from "react-router";
import { Imagen } from "./Lineup";
const BiddingPlayer = ({setShowLineUp, showLineUp}) => {
  const [bid, setBid] = useState(40);
  const [currentBid, setCurrentBid] = useState(35);
  const [myTurn, setMyTurn] = useState(false);
  const [msgStatus, setMsgStatus] = useState("Esperando inicio de ronda...");
  const myID = socket.id;
  const { code } = useParams();
  const [playerImage, setPlayerImage] = useState(null);
  useEffect(() => {
    socket.on("new-round", ({ currentBid }) => {
      setCurrentBid(currentBid);
      setBid(currentBid + 5);
      setMsgStatus("Ronda iniciada");
      console.log(playerImage)

      setPlayerImage(null);
      

    });

    socket.on("bid-update", ({ amount, bidderName }) => {
      setCurrentBid(amount);
      setBid(amount + 5);
      setMsgStatus(`¡${bidderName} ofreció ${amount}M!`);
    });

    socket.on("turn-started", ({ userID, userName }) => {
      if (userID === myID) {
        setMyTurn(true);
        setMsgStatus("¡ES TU TURNO!");
      } else {
        setMyTurn(false);
        setMsgStatus(`Turno de ${userName}`);
      }
    });

    socket.on('player-assigned', ({winnerName, player, amount}) => {
      setPlayerImage(player)
      
    })

    return () => {
      socket.off("new-round");
      socket.off("bid-update");
      socket.off("turn-started");
      socket.off('player-assigned')
    };
  }, [myID]);

  const handlePass = () => {
    if (!myTurn) return;
    setMyTurn(false);
    socket.emit("pass", { code });
  };

  const handleBid = () => {
    if (!myTurn) return;
    if (bid <= currentBid) {
      alert("La apuesta debe ser mayor a " + currentBid);
      return;
    }
    setMyTurn(false);
    socket.emit("bid", { code, amount: bid });
  };

  return (
    <div className={`h-full w-full bg-black/80 flex justify-center items-center absolute z-100 backdrop-blur-xs ${showLineUp ? "hidden" : "block"}`}>
      <div>
        <img src={playerImage ? Imagen(playerImage.position, playerImage.file) : Card} alt="Skeleton Card" className={playerImage ? "w-200 animate-bounce" : "w-90"} />
        <div className="flex justify-center items-center gap-3 flex-col mt-4">
          <div>
            <span className="text-foreground text-2xl font-bold">
              Mayor Puja Actual:
            </span>
            <span className="text-foreground text-2xl font-bold ml-2">
              {currentBid}M USD
            </span>
          </div>
          <div className="flex gap-2">
            <p className={`text-2xl font-bold p-2 px-4 rounded-xl ${myTurn ? "bg-yellow-400 text-black shadow-lg shadow-yellow-500/50 transition-all font-black scale-110" : "text-foreground"}`}>
              {msgStatus}
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center gap-3 mt-6">
          <Button disabled={!myTurn} onClick={() => setBid((b) => b + 5)}>+5M</Button>
          <Button disabled={!myTurn} onClick={() => setBid((b) => b + 10)}>+10M</Button>

          <Input
            type="number"
            value={bid}
            onChange={(e) => setBid(Number(e.target.value))}
            min={currentBid + 5}
            step={5}
            max={100}
            className="w-24 text-white text-lg font-bold"
            disabled={!myTurn}
          ></Input>
          <Button disabled={!myTurn} onClick={handleBid} className="bg-green-600 hover:bg-green-500">Apostar</Button>
          <Button disabled={!myTurn} onClick={handlePass} variant="destructive">Pasar Turno</Button>
          <Button className="bg-blue-600 hover:bg-blue-500" onClick={() => setShowLineUp(true)}>Mostrar Alineacion</Button>
        </div>
      </div>
    </div>
  );
};

export default BiddingPlayer;
