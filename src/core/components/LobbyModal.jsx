
import {Button} from '../../components/ui/button';
import JoinRoom from './JoinRoom';
import { useState } from 'react';
import socket from '../utils/socket';
import axios from 'axios';
const LobbyModal = () => {
  
  const [code,setCode] = useState('')
  const [showJoinRoom,setShowJoinRoom] = useState(false)
  const handleCreateRoom = async () => {
    try{
      console.log("Creando sala")
      const response = await axios.post('http://localhost:3000/api/room/create')
      setCode(response?.data?.code)
    }
    catch(error){
      console.log(error)
    }
  }
  return (
    <div className='w-7xl h-150 bg-black/80  flex flex-col justify-center items-center gap-7 rounded-4xl backdrop-blur-md shadow-lg text-white px-8 text-nowrap '>
      <h3 className='text-6xl'>CONFIGURAR SALA</h3>

      <h3 className='text-4xl '>Subasta y arma tu Dream Team</h3>
      <Button className='cursor-pointer text-4xl p-10 hover:bg-primary/70' onClick={handleCreateRoom}>Crear Sala</Button>
      {code}
      <Button className='cursor-pointer text-4xl  p-10 hover:bg-primary/70' onClick={() => setShowJoinRoom(!showJoinRoom)}>Unirse a Sala</Button>
      {showJoinRoom && <JoinRoom />}
    </div>
  );
};

export default LobbyModal;
