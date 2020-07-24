import React, { useState, useEffect } from 'react';
import './App.css';
import Map from "./components/Map";
import Modal from 'components/Modal';
import PlayerBridge from 'components/playerBridge';
import { GameData } from 'components/playerBridge/GameData';
import { Content } from 'data/Content';


function App() {
  const [currentMap, setCurrentMap] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClose = () => {
    setModalOpen(false)
  }
  const handleOpen = () => {
    setModalOpen(true)
  }

  const handleGameDataReceived = (data: GameData<Content>) => {
    //setContent(data.content);
    setCurrentMap(data.content.mapJson);
  }

  useEffect(() => {
    //setTimeout(handleOpen, 5000);
  }, []);
   
  return (
    <div className="App" onDoubleClick={handleOpen}>
      <PlayerBridge gameDataReceived={handleGameDataReceived}/>
      <select value={currentMap} onChange={e => setCurrentMap(e.currentTarget.value)}>
        <option>maps/testmap1.json</option>
        <option>maps/testmap2.json</option>
        <option>maps/testmap3.json</option>
        <option>maps/testmap4.json</option>
      </select>
      {modalOpen && <Modal onClose={handleClose} />  }
      {currentMap && <Map jsonPath={currentMap} /> }
    </div>
  );
}

export default App;


