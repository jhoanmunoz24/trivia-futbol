import React from 'react'
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import { useState } from 'react';
import socket from '../utils/socket';
const JoinRoom = () => {
    const handleJoinRoom = (code, name) => {
        console.log("Uniendo a sala")
        socket.emit('join-room', {code, name})

    }
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    
    const handleCodeChange = (e) => setCode(e.target.value)
    const handleNameChange = (e) => setName(e.target.value)
  return (

  

    
    <>
        <Input type="text" placeholder='Codigo de sala' onChange={handleCodeChange} />
        <Input type="text" placeholder='Nombre' onChange={handleNameChange} />
        <Button onClick={() => handleJoinRoom(code, name)}>Unirse</Button>
    </>
  )
}

export default JoinRoom
