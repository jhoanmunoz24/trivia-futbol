import React from 'react';
import Logo from '../../assets/ui/peak_card.png';
import { Link } from 'react-router';
const Header = () => {
 const menu = ['Inicio','Como jugar','Nosotros','Redes']
  return (
    <div className='h-30 w-full flex items-center justify-center sticky top-0 z-50'>
      <div className='flex items-center justify-between w-4xl bg-black/60 rounded-full backdrop-blur-md shadow-lg text-white px-8 text-nowrap gap-30'>
        <div className='flex justify-start '>
          <img
            src={Logo}
            alt=''
            className='h-20 w-50 object-contain '
          />
          <span className='h-full self-center font-bold text-2xl'>
            Trivia Futbolera
          </span>
        </div>
        <div>
          <div className='flex gap-5 group'>
            {menu.map((item)=> (
                <Link to={item} key={item} className='hover:bg-black/90 hover:rounded-full px-4 py-2 text-nowrap hover:transition-all hover:duration-500'>{item}</Link>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Header;
