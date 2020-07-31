import React, { useState, useEffect } from 'react';
import './App.css';
import Map from "./components/pixi/Map";
import Modal from 'components/Modal';
import PlayerBridge from 'components/playerBridge';
import { GameData } from 'components/playerBridge/GameData';
import { Content, Situation } from 'data/Content';
import { PixiPlugin } from 'gsap/all';
import { gsap } from 'gsap'
import FinderBox from 'components/FinderBox';

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


function App() {
  const [situation, setSituation] = useState<Situation>();
  const [content, setContent] = useState<Content>();
  const [foundSituations, setFoundSituations] = useState<string[]>([]);

  const handleClose = () => {
    setSituation(undefined);
  }

  const handleGameDataReceived = (data: GameData<Content>) => {
    setContent(data.content);
  }

  useEffect(() => {
    // @ts-ignore
    if(!window.GAME_DATA || !process.env.REACT_APP_PLAYER_MODE) {
      fetch(`${process.env.PUBLIC_URL}/config/data.json`)
        .then((response) => {
          response.json().then((data) => {
            handleGameDataReceived(data);
          })
        })
    }
  }, []);
   
  const handleSituationClick = (situation: string) => {
    //setSituation(content!.situations[situation]);
    if (foundSituations.indexOf(situation) === -1){
      setFoundSituations([...foundSituations, situation]);
    }
  }


  return (
    <div className="App" >
      <PlayerBridge gameDataReceived={handleGameDataReceived}/>
      {/* {situation && <Modal onClose={handleClose} situation={situation}/>  } */}
      {content && <Map content={content} onSituationClick={handleSituationClick} foundSituations={foundSituations}/> }
      {content?.finder && <FinderBox content={content.finder} foundSituations={foundSituations} />}
    </div>
  );
}

export default App;


