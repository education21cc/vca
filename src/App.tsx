import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameData } from 'components/playerBridge/GameData';
import { Content } from 'data/Content';
import { useTranslationStore } from 'stores/translations';
import Game from 'Game';
import './styles/common.scss'
import './App.css';
import PlayerBridge from 'components/playerBridge';


function App() {
  const [data, setData] = useState<GameData<Content>>();

  const handleGameDataReceived = useCallback((data: GameData<Content>) => {

    // PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST; // prevent lines on the edges of tiles
    setData(data);

    if (data.translations){
      const t = data.translations.reduce<{[key: string]: string}>((acc, translation) => {
        acc[translation.key] = translation.value;
        return acc;
      }, {});
      useTranslationStore.setState({ texts: t });
    }

    // console.log(data.translations.map(t => `${t.key}`).join('\n'))
    // console.log(data.translations.map(t => t.value).join('\n'))
  }, []);


  useEffect(() => {
    // @ts-ignore

    // See if we are fed gamedata by 21ccplayer app, if not, go fetch it ourselves
    if (!process.env.REACT_APP_PLAYER_MODE) {
      // @ts-ignore
      if(!window.GAMEDATA) {
        console.log("no bridge found, fetching fallback")
        // @ts-ignore

        fetch(`${process.env.PUBLIC_URL}/config/data-handling.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/data-fireextinguishers.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/data-emergencyexits.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/data-aeds.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/data-dangeroussituations.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-basic-english-EN.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-1.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-1_HI.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-1_EN.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-1_CH.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-1_MS.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-1_KN.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-1-microsoft_EN.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-1-microsoft_HI.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-2.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/scenarios-3.json`)
        .then((response) => {
          response.json().then((data) => {

            handleGameDataReceived(data);
          })
        })
      }
    };
  }, [handleGameDataReceived]);

  return (
    <div className="background" >
      <PlayerBridge
        gameDataReceived={handleGameDataReceived}
        disableBackButton={false}
        // disableBackButton={!!iframeOpen || !!scenario}
      />
      {data && (
        <Game data={data} />
      )}
    </div>
  )
}

export default App;

