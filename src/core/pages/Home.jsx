import React from 'react';
import Header from '../components/Header';

import Lineup from '../components/Lineup';
import LobbyModal from '../components/LobbyModal';
const Home = () => {
  return (
    <div>
      <Header></Header>
      <div className='flex flex-row-reverse '>
        <LobbyModal></LobbyModal>

        <Lineup></Lineup>
      </div>
    </div>
  );
};

export default Home;
