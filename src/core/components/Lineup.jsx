import React from "react";
import Pitch from "../../assets/ui/field.webp";
import Skeleton from "../../assets/ui/skeleton_card.webp";
import PlayerCard from "./PlayerCard";
import { Button } from "../../components/ui/button";
import { useState } from "react";

function Imagen(position, player) {
  return `/cards/players/${position}/${player}`;
}
const Lineup = ({ setShowLineUp, lineUp }) => {
  // Formación 4-3-3 - Define las posiciones en el campo
  const positions = [
    // Portero
    { top: 90, left: 50 },
    // Defensa
    { top: 70, left: 20 },
    { top: 70, left: 40 },
    { top: 70, left: 60 },
    { top: 70, left: 80 },
    // Medio campo
    { top: 45, left: 30 },
    { top: 45, left: 50 },
    { top: 45, left: 70 },
    // Delanteros
    { top: 20, left: 30 },
    { top: 20, left: 50 },
    { top: 20, left: 70 },
  ];

  // Helper: devuelve la imagen del jugador o Skeleton si el slot está vacío
  const getImage = (arr, index, position) =>
    arr?.[index]?.file ? Imagen(position, arr[index].file) : Skeleton;

  const players = [
    {
      id: 1,
      name: "PT",
      image: getImage(lineUp?.goalkeepers, 0, "goalkeepers"),
    },
    { id: 2, name: "DFC", image: getImage(lineUp?.defenders, 0, "defenders") },
    { id: 3, name: "DFC", image: getImage(lineUp?.defenders, 1, "defenders") },
    { id: 4, name: "DFC", image: getImage(lineUp?.defenders, 2, "defenders") },
    { id: 5, name: "DFC", image: getImage(lineUp?.defenders, 3, "defenders") },
    {
      id: 6,
      name: "MC",
      image: getImage(lineUp?.midfielders, 0, "midfielders"),
    },
    {
      id: 7,
      name: "MC",
      image: getImage(lineUp?.midfielders, 1, "midfielders"),
    },
    {
      id: 8,
      name: "MC",
      image: getImage(lineUp?.midfielders, 2, "midfielders"),
    },
    { id: 9, name: "DC", image: getImage(lineUp?.strikers, 0, "strikers") },
    { id: 10, name: "DC", image: getImage(lineUp?.strikers, 1, "strikers") },
    { id: 11, name: "DC", image: getImage(lineUp?.strikers, 2, "strikers") },
  ];
  return (
    <div className="w-screen  flex items-center justify-start ">
      <div className="relative h-[90vh] w-[1000px] ">
        <img
          src={Pitch}
          alt="Football pitch"
          className="w-full h-full object-fill"
        />

        {/* Cartas */}
        <div className="absolute inset-0 ">
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              position={positions[index]}
            />
          ))}
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-500"
          onClick={() => setShowLineUp(false)}
        >
          Volver a apuestas
        </Button>
      </div>
    </div>
  );
};

export default Lineup;
export { Imagen };
