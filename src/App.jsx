import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';


import Home from './core/pages/Home';

import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
      </Routes>
      
    </>
  );
}

export default App;
