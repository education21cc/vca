import React, { useState, useEffect } from 'react';
import './App.css';
import Map from "./components/pixi/Map";
import Modal from 'components/Modal';
import PlayerBridge from 'components/playerBridge';
import { GameData } from 'components/playerBridge/GameData';
import { Content, Situation, ContentConfig } from 'data/Content';
import { PixiPlugin } from 'gsap/all';
import { gsap } from 'gsap'
import FinderBox from 'components/FinderBox';
import IFrameModal from 'components/IFrameModal';

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


function App() {
  const [situation, setSituation] = useState<Situation>();
  const [content, setContent] = useState<Content>();
  const [foundSituations, setFoundSituations] = useState<string[]>([]);
  const [iframe, setIframe] = useState<ContentConfig>();

  const handleClose = () => {
    setIframe(undefined);
  }

  const handleGameDataReceived = (data: GameData<Content>) => {
    setContent(data.content);
  }

  useEffect(() => {
    // See if we are fed gamedata by 21ccplayer app, if not, go fetch it ourselves
    const timeout = setTimeout(() => {
      // @ts-ignore
      if(!window.GAME_DATA || !process.env.REACT_APP_PLAYER_MODE) {
        console.log("no bridge found, fetching fallback")
        // @ts-ignore
  
        fetch(`${process.env.PUBLIC_URL}/config/data.json`)
          .then((response) => {
            response.json().then((data) => {
              handleGameDataReceived(data);
            })
          })
      }
    }, 300); // todo: maybe a less hacky way
    return () => { clearTimeout(timeout)};
  }, []);
   
  useEffect(() => {
    let timeout: number;
    if (content?.finder) {
      if (foundSituations.length === content.finder.situations.length) {
        timeout = setTimeout(setIframe, 1000, content.finder.final);
      }
    }
    return () => { clearTimeout(timeout);}
  }, [content, foundSituations]);

  const handleSituationClick = (situation: string) => {
    if (foundSituations.indexOf(situation) === -1){
      setFoundSituations([...foundSituations, situation]);
    }
  }


  return (
    <div className="App" >
      <PlayerBridge gameDataReceived={handleGameDataReceived} disableBackButton={!!iframe}/>
      {/* {situation && <Modal onClose={handleClose} situation={situation}/>  } */}
      {content && <Map content={content} onSituationClick={handleSituationClick} foundSituations={foundSituations}/> }
      {content?.finder && <FinderBox content={content.finder} foundSituations={foundSituations} />}
      {iframe && <IFrameModal content={iframe} onClose={handleClose} />}
    </div>
  );
}

export default App;


