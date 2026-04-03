import React from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState, useEffect, useRef } from "react";
import socket from "../utils/socket";
import { Link, useNavigate } from "react-router";
const JoinRoom = () => {
  const [code, setCode] = useState("");
  const codeRef = useRef(code);
  const [name, setName] = useState("");
  const [runGame, setRunGame] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    socket.on("room-joined", ({ name, code }) => {
      setMessages((prev) => [...prev, `Bienvenido ${name} a la sala ${code}`]);
    });

    socket.on("user-joined", ({ name }) => {
      setMessages((prev) => [...prev, `${name} se unió a la sala`]);
    });

    socket.on("room-error", (msg) => {
      console.log("Error:", msg);
    });
    socket.on("game-started", (data) => {
      console.log("Juego iniciado");
      navigate(`/bidding/${codeRef.current}`);

      console.log(data.lineUp);
      setRunGame("Iniciando juego");
    });

    return () => {
      socket.off("room-joined");
      socket.off("room-error");
      socket.off("user-joined");
      socket.off("game-started");
      socket.off("start-bidding");
    };
  }, []);
  const handleJoinRoom = () => {
    socket.emit("join-room", { code, name });
  };
  const handleRunGame = () => {
    socket.emit("run-game", { code });
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    codeRef.current = e.target.value;
  };
  const handleNameChange = (e) => setName(e.target.value);
  return (
    <>
      <Input
        type="text"
        placeholder="Codigo de sala"
        onChange={handleCodeChange}
      />
      <Input type="text" placeholder="Nombre" onChange={handleNameChange} />
      <Button onClick={() => handleJoinRoom()}>Unirse</Button>
      {messages.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
      <Button onClick={handleRunGame}>Iniciar Juego</Button>
      {runGame}
    </>
  );
};

export default JoinRoom;
