import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import Map from "./components/pixi/Map";
import PlayerBridge from 'components/playerBridge';
import { GameData, Level } from 'components/playerBridge/GameData';
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
import { SCALE_MODES } from 'pixi.js';

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
  const [levelsCompleted, setLevelsCompleted] = useState<Level[]>();

  const [scenario, setScenario] = useState<string|undefined>();
  const [content, setContent] = useState<Content>();
  const [foundSituations, setFoundSituations] = useState<string[]>([]);
  const [scenarioReactions, setScenarioReactions] = useState<{[key: string]: string}>({}); // key = scenario, value = reaction id
  const [iframeOpen, setIframeOpen] = useState(false);

  const handleBack = useCallback(() => {
    setIframeOpen(false);
  }, []);

  const handleSetGameData = useCallback((data: GameData<any>) => {
    // @ts-ignore
    window.setGameData(data);
  }, []);

  const handleGameDataReceived = useCallback((data: GameData<Content>) => {
    PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST; // prevent lines on the edges of tiles
    setLevelsCompleted(data.levelsCompleted);    
    setContent(data.content);
    
    if (data.translations){
      const t = data.translations.reduce<{[key: string]: string}>((acc, translation) => {
        acc[translation.key] = translation.value;
        return acc;
      }, {});
      setTranslations(t);
    }

    // console.log(data.translations.map(t => `${t.key}`).join('\n'))
    // console.log(data.translations.map(t => t.value).join('\n'))
  }, []);

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
    // @ts-ignore

    // See if we are fed gamedata by 21ccplayer app, if not, go fetch it ourselves
    if (!process.env.REACT_APP_PLAYER_MODE) {
      // @ts-ignore
      if(!content) {
        console.log("no bridge found, fetching fallback")
        // @ts-ignore
        
        // fetch(`${process.env.PUBLIC_URL}/config/data-fireextinguishers.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/data-emergencyexits.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/data-aeds.json`)
        // fetch(`${process.env.PUBLIC_URL}/config/data-dangeroussituations.json`)
        fetch(`${process.env.PUBLIC_URL}/config/data.json`)
        .then((response) => {
          response.json().then((data) => {
            handleGameDataReceived(data);
          })
        })
      }
    };
  }, [content, handleGameDataReceived]);
  
  const iframe = useMemo(() => {
    if (!levelsCompleted) return;
    if (!content?.finder?.final) return;

    // Copy the levelsCompleted of VCA game into minigame
    const final: ContentConfig = {
      ...content?.finder?.final!,
      data: {
        ...content?.finder?.final.data!,
        levelsCompleted
      }
    }
    return final;
  }, [content, levelsCompleted]);

  const handleOpenGame = () => {
    setIframeOpen(true);
  }

  const handleStart = useCallback(() => {   
    setState(GameState.normal); 
  }, []);
  
  const handleSituationClick = (situation: string) => {
    if (!content?.finder) return;

    if (content.finder.situations.indexOf(situation) > -1 && foundSituations.indexOf(situation) === -1){
      setFoundSituations([...foundSituations, situation]);
    }
  }
  
  const handleScenarioClick = (scenario: string) => {
    setScenario(scenario);
  }

  // useEffect(() => {
  //   // todo: just for testing remove!
  //   setScenario("test");
  // }, [content]);
    
  const handleCorrectReaction = (reaction: string) => {
    // gets called from within modal once the correct answer is selected

    setScenarioReactions({
      ...scenarioReactions,
      [scenario!]: reaction
    });
  }

  const exitScenario = () => {
    setScenario(undefined);
  }

  const starsToGainText = useMemo<string>(() => {
    const currentScore = levelsCompleted?.[0]?.score || 0;
    // const maxScore = content?.finder?.situations.length || 0;
    const maxScore = content?.stars || 1;
    return ("" + translations["intro-stars-to-gain"])
      .replace("{0}", ""+currentScore)
      .replace("{1}", ""+maxScore);
  }, [content, levelsCompleted, translations]);

  const solvedScenarios = useMemo(() => {
    return Object.keys(scenarioReactions || {});
  }, [scenarioReactions]);


  return (
    <>
      {(!loadComplete) && (          
        <Loading />
      )}
      <div className="background" >
        <PlayerBridge 
          gameDataReceived={handleGameDataReceived}
          disableBackButton={!!iframeOpen || !!scenario}

        />
        {loadComplete && (
          <>
            {(state === GameState.intro) &&
            (<IntroDialog
              onStart={handleStart}
              headerText={translations["intro-header"]}
              descriptionText={translations["intro-description"]}
              starsToGainText={starsToGainText}
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
                {content?.finder && (
                  <FinderBox 
                    content={content.finder} 
                    instruction={translations["finder-instruction"]}
                    foundSituations={foundSituations} 
                    onOpenGame={handleOpenGame}
                    nextText={translations["button-next"]}
                  />
                )}
                {/* {content?.scenarios && <ScenarioBox scenarios={content.scenarios} solvedScenarios={solvedScenarios} />} */}
              </>
            )}
            {iframe && (
              <IFrameModal 
                content={iframe}
                open={iframeOpen}
                onBack={handleBack} 
                onSetGameData={handleSetGameData} 
              />
            )}
            {scenario && (
              <ScenarioScreen 
                scenario={scenario}
                content={content?.scenarios[scenario]!}
                selectedReaction={scenarioReactions[scenario]}
                setCorrectReaction={handleCorrectReaction}
                texts={translations}
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


