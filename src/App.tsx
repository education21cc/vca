import React, { useState, useEffect } from 'react';
import './App.css';
import Map from "./components/Map";
import Modal from 'components/Modal';
import PlayerBridge from 'components/playerBridge';
import { GameData } from 'components/playerBridge/GameData';
import { Content, Situation } from 'data/Content';


function App() {
  const [currentMap, setCurrentMap] = useState<string>();
  const [situation, setSituation] = useState<Situation>();
  const [content, setContent] = useState<Content>();

  const handleClose = () => {
    setSituation(undefined);
  }

  const handleGameDataReceived = (data: GameData<Content>) => {
    //setContent(data.content);
    setCurrentMap(data.content.mapJson);
    setContent(data.content);
  }

  useEffect(() => {
    //setTimeout(handleOpen, 5000);
  }, []);
   
  const handleSituationClick = (situation: string) => {
    setSituation(content!.situations[situation]);
  }


  return (
    <div className="App" >
      <PlayerBridge gameDataReceived={handleGameDataReceived}/>
      <select value={currentMap} onChange={e => setCurrentMap(e.currentTarget.value)}>
        <option>maps/testmap1.json</option>
        <option>maps/testmap2.json</option>
        <option>maps/testmap3.json</option>
        <option>maps/testmap4.json</option>
      </select>
      {situation && <Modal onClose={handleClose} situation={situation}/>  }
      {currentMap && <Map jsonPath={currentMap} onSituationClick={handleSituationClick} /> }
    </div>
  );
}

export default App;


