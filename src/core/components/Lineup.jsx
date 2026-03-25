import React from 'react';
import Pitch from '../../assets/Field.webp';
import Player from '../../assets/skeleton_card.webp';
import PlayerCard from './PlayerCard'
const Lineup = () => {
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

  const players = [
    { id: 1, name: 'PT', image: Player },
    { id: 2, name: 'DFC', image: Player },
    { id: 3, name: 'DFC', image: Player },
    { id: 4, name: 'DFC', image: Player },
    { id: 5, name: 'DFC', image: Player },
    { id: 6, name: 'MC', image: Player },
    { id: 7, name: 'MC', image: Player },
    { id: 8, name: 'MC', image: Player },
    { id: 9, name: 'DC', image: Player },
    { id: 10, name: 'DC', image: Player },
    { id: 11, name: 'DC', image: Player },
  ];
  return (
    <div className='w-screen  flex items-center justify-start '>
      <div className='relative h-[90vh] w-[1000px] '>
        <img
          src={Pitch}
          alt='Football pitch'
          className='w-full h-full object-fill'
        />

        {/* Cartas */}
        <div className='absolute inset-0 '>
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              position={positions[index]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lineup;
