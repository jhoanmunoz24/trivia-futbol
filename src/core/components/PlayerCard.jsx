const PlayerCard = ({ player, position }) => {
  return (
    <img
      src={player.image}
      alt={player.name}
      className='absolute w-80 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl'
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
      }}
    />
  );
};

export default PlayerCard