import React from 'react';

const LobbyModal = () => {
  return (
    <div className='w-7xl h-150 bg-black/80  flex flex-col justify-center items-center gap-7 rounded-4xl backdrop-blur-md shadow-lg text-white px-8 text-nowrap '>
      <h3>Subasta y arma tu dream team</h3>
      <button className='cursor-pointer w-30 bg-amber-700 h-20'>CREAR SALA</button>
      <button className='cursor-pointer w-30 bg-amber-700 h-20'>UNIRSE A SALA</button>
    </div>
  );
};

export default LobbyModal;
