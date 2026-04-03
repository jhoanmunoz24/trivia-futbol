import React from "react";
import Card from "../../assets/ui/mystery_player.webp";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState, useEffect } from "react";
import socket from "../utils/socket";
import { useParams } from "react-router";
const BiddingPlayer = () => {
  const [bid, setBid] = useState(35);
  const myID = socket.id;
  const { code } = useParams();
  useEffect(() => {
    socket.on("turn-started", ({ userID, userName }) => {
      if (userID === myID) {
        alert("Es tu turno de pujar", userName);
      } else {
        console.log("Turno de", userName);
      }
    });

    return () => {
      socket.off("turn-started");
    };
  }, [myID]);

  const handlePass = (code) => {
    socket.emit("pass", { code });
  };
  return (
    <div className="h-full w-full bg-black/80 flex justify-center items-center absolute z-100 backdrop-blur-xs">
      <div>
        <img src={Card} alt="Skeleton Card" className="w-90" />
        <div className="flex justify-center items-center gap-3 flex-col">
          <div>
            <span className="text-foreground text-2xl font-bold">
              Puja inicial:
            </span>
            <span className="text-foreground text-2xl font-bold">35M USD</span>
          </div>
          <div className="flex gap-2">
            <p className="text-2xl text-foreground font-bold">Tu apuesta: </p>
            <p className="text-2xl text-bold text-destructive font-bold">
              {bid}M USD
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center gap-3 ">
          <Button>+5M</Button>
          <Button>+10M</Button>

          <Input
            type="number"
            min={40}
            step={5}
            max={100}
            className="w-20"
          ></Input>
          <Button>Apostar</Button>
          <Button onClick={() => handlePass(code)}>Pasar Turno</Button>
        </div>
      </div>
    </div>
  );
};

export default BiddingPlayer;
