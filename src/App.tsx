import React, { useState, useEffect } from 'react';
import './App.css';
import Map from "./components/pixi/Map";
import PlayerBridge from 'components/playerBridge';
import { GameData } from 'components/playerBridge/GameData';
import { Content, ContentConfig, Scenario } from 'data/Content';
import { PixiPlugin } from 'gsap/all';
import { gsap } from 'gsap'
import FinderBox from 'components/FinderBox';
import IFrameModal from 'components/IFrameModal';
import ScenarioBox from 'components/ScenariosBox';
import ScenarioScreen from 'components/ScenarioScreen';
import Loading from 'components/playerBridge/Loading';
import IntroDialog from 'components/dialogs/IntroDialog';
import useTilesetsLoader from 'hooks/useTilesetsLoader';
import { TiledTilesetData, TiledMapData } from 'utils/tiledMapData';
import { loadResource } from 'utils/pixiJs';
import './styles/common.scss'

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


enum GameState {
  intro = 0,
  normal = 1 << 1,
  wrong = 1 << 2,
  correct = 1 << 3,
  complete = 1 << 4
}

function App() {
  const [state, setState] = useState(GameState.intro);
  const [translations, setTranslations] = useState<{[key: string]: string}>({});
  const [mapData, setMapData] = useState<TiledMapData>();


  const [scenario, setScenario] = useState<Scenario>();
  const [content, setContent] = useState<Content>();
  const [foundSituations, setFoundSituations] = useState<string[]>([]);
  const [iframe, setIframe] = useState<ContentConfig>();
  const solvedScenarios: string[] = [];

  const handleClose = () => {
    setIframe(undefined);
  }

  const handleGameDataReceived = (data: GameData<Content>) => {
    setContent(data.content);
    
    if (data.translations){
      const t = data.translations.reduce<{[key: string]: string}>((acc, translation) => {
        acc[translation.key] = translation.value;
        return acc;
      }, {});
      setTranslations(t);
    }
  }

  const {
    loadComplete,
    loadTilesets,
    tilesetsTextures
  } = useTilesetsLoader(determineTilesetSpritesheetPath);
  
  useEffect(() => {
    if (!content) return;

    // Content loaded, load map json
    const jsonPath = content.mapJson;
    loadResource(`${process.env.PUBLIC_URL}/${jsonPath}`, (resource) => {
      setMapData(resource.data);
    });    
  }, [content]);

  useEffect(() => {
    if (!mapData) return;

    loadTilesets(mapData.tilesets);    
  }, [loadTilesets, mapData]);

  useEffect(() => {
    // See if we are fed gamedata by 21ccplayer app, if not, go fetch it ourselves
    const timeout = setTimeout(() => {
      // @ts-ignore
      if(!window.GAMEDATA || !process.env.REACT_APP_PLAYER_MODE) {
        console.log("no bridge found, fetching fallback")
        // @ts-ignore
        
        fetch(`${process.env.PUBLIC_URL}/config/data-fireextinguishers.json`)
        .then((response) => {
          response.json().then((data) => {
            console.log(data)
            handleGameDataReceived(data);
          })
        })
      }
    }, 1300); // todo: maybe a less hacky way
    return () => { clearTimeout(timeout)};
  }, []);
  
  const handleOpenGame = () => {
    setIframe(content?.finder?.final);
  }

  const handleStart = () => {   
    setState(GameState.normal);
  }
  
  const handleSituationClick = (situation: string) => {
    if (!content?.finder) return;

    if (content.finder.situations.indexOf(situation) > -1 && foundSituations.indexOf(situation) === -1){
      setFoundSituations([...foundSituations, situation]);
    }
  }
  
  const handleScenarioClick = (scenario: string) => {
    setScenario(content?.scenarios[scenario]);
  }
    
  const exitScenario = () => {
    setScenario(undefined);
  }

  return (
    <>
      {(!loadComplete) && (          
        <Loading />
      )}
      <div className="background" >
        <PlayerBridge gameDataReceived={handleGameDataReceived} disableBackButton={!!iframe || !!scenario}/>
        {loadComplete && (
          <>
            {(state === GameState.intro) &&
            (<IntroDialog
              onStart={handleStart}
              headerText={translations["intro-header"]}
              descriptionText={translations["intro-description"]}
              starsToGainText={translations["intro-stars-to-gain"]}
              startText={translations["intro-start"]}
            />)}
            {(state === GameState.normal) && mapData && content && (
              <>
                <Map 
                  content={content}
                  mapData={mapData}
                  tilesetsTextures={tilesetsTextures}
                  onSituationClick={handleSituationClick} 
                  foundSituations={foundSituations}
                  solvedScenarios={solvedScenarios}
                  onScenarioClick={handleScenarioClick}
                />
                {content?.finder && <FinderBox content={content.finder} foundSituations={foundSituations} onOpenGame={handleOpenGame}/>}
                {content?.scenarios && <ScenarioBox scenarios={content.scenarios} solvedScenarios={solvedScenarios} />}
              </>
            )}
            {iframe && <IFrameModal content={iframe} onClose={handleClose} />}
            {scenario && (
              <ScenarioScreen 
                content={scenario}
                setCorrectAnswer={() => {}}
                onClose={exitScenario}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;

// returns the path to the spritesheet for given tileset
const determineTilesetSpritesheetPath = (tilesetData: TiledTilesetData) => `${process.env.PUBLIC_URL}/maps/tilesets/${tilesetData.name}.json`;


