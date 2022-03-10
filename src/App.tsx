import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map from "./components/pixi/Map";
import PlayerBridge, { send } from 'components/playerBridge';
import { GameData } from 'components/playerBridge/GameData';
import { Content, ContentConfig, GameMode } from 'data/Content';
import { PixiPlugin } from 'gsap/all';
import { gsap } from 'gsap';
import FinderBox from 'components/FinderBox';
import IFrameModal from 'components/IFrameModal';
import ScenarioBox from 'components/ScenariosBox';
import ScenarioScreen from 'components/ScenarioScreen';
import Loading from 'components/playerBridge/Loading';
import IntroDialog from 'components/dialogs/IntroDialog';
import useTilesetsLoader from 'hooks/useTilesetsLoader';
import { TiledTilesetData, TiledMapData } from 'utils/tiledMapData';
import { loadResource } from 'utils/pixiJs';
import CompleteDialog from 'components/dialogs/CompleteDialog';
import './styles/common.scss'
import './App.css';
import * as PIXI from 'pixi.js';
import TimedFinderBox from 'components/TimedFinderBox';

declare global {
  interface Window { PIXI: any; }
}

window.PIXI = PIXI;
PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


export enum GameState {
  intro = 0,
  normal = 1 << 1,
  complete = 1 << 2
}

function App() {
  const [state, setState] = useState(GameState.intro);
  const [translations, setTranslations] = useState<{[key: string]: string}>({});
  const [mapData, setMapData] = useState<TiledMapData>();
  const [data, setData] = useState<GameData<Content>>();

  const gameMode = useMemo(() => {
    if (!data) return undefined;
    if (data.content.gameMode) return data.content.gameMode;
    // for backwards compatibility
    if (data.content.finder) return GameMode.finder;
    if (data.content.scenarios) return GameMode.scenarios;
  }, [data])

  const [scenario, setScenario] = useState<string|undefined>();
  const [foundSituations, setFoundSituations] = useState<string[]>([]);
  const [scenarioReactions, setScenarioReactions] = useState<{[key: string]: string}>({}); // key = scenario, value = reaction id
  const [iframeOpen, setIframeOpen] = useState(false);

  const handleBack = useCallback(() => {
    setIframeOpen(false);
  }, []);

  const handleSetGameData = useCallback((data: GameData<any>) => {
    window.setGameData(data);
  }, []);
  const handleGameDataReceived = useCallback((data: GameData<Content>) => {

    // PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST; // prevent lines on the edges of tiles
    setData(data);

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

  const content = useMemo(() => data?.content, [data]);
  const levelsCompleted = useMemo(() => data?.levelsCompleted, [data]);

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
        fetch(`${process.env.PUBLIC_URL}/config/data-handling.json`)
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

  const handleComplete = () => {
    setState(GameState.complete);

    handleSetGameData({
      ...data!,
      levelsCompleted: [{
        level: 1,
        score: correctScenarios.length,
        maxScore: correctScenarios.length
      }]
    });
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

  const handleCorrectReaction = (reaction: string) => {
    // gets called from within modal once the correct answer is selected

    setScenarioReactions({
      ...scenarioReactions,
      [scenario!]: reaction
    });
  }

  const handleWrongScenario = (reaction: string) => {
    // gets called from within modal once the correct answer is selected

    if(content?.mistakeMode) {
      setScenarioReactions({
        ...scenarioReactions,
        [scenario!]: reaction
      });
    }
  }

  const exitScenario = () => {
    setScenario(undefined);
  }

  const handleExit = () => {
    send({
      type: 'exit'
    });
  }

  const handleReset = () => {
    setState(GameState.normal);
    setScenarioReactions({});
  }

  const starsToGainText = useMemo<string>(() => {
    const currentScore = levelsCompleted?.[0]?.score || 0;
    // const maxScore = content?.finder?.situations.length || 0;
    const maxScore = content?.stars || content?.finder?.situations.length || Object.keys(content?.scenarios || {}).length || 1;
    return ("" + translations["intro-stars-to-gain"])
      .replace("{0}", ""+currentScore)
      .replace("{1}", ""+maxScore);
  }, [content, levelsCompleted, translations]);

  const { correctScenarios, wrongScenarios } = useMemo(() => {
    // make maps of correct and wrong answers
    return Object.keys(scenarioReactions || {}).reduce<{ correctScenarios: string[], wrongScenarios: string[]}>((acc, value) => {
      const scenario = data?.content.scenarios[value];
      if (scenario) {
        const isCorrect = !!scenario.reactions.find(r => r.id === scenarioReactions[value])?.correct
        if (isCorrect) {
          acc.correctScenarios.push(value)
        } else {
          acc.wrongScenarios.push(value)
        }
      }
      return acc;
    }, {
      correctScenarios: [],
      wrongScenarios: []
    })
  }, [data?.content.scenarios, scenarioReactions]);

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
                  mistakeMode={content?.mistakeMode ?? false}
                  correctScenarios={correctScenarios}
                  wrongScenarios={wrongScenarios}
                  onScenarioClick={handleScenarioClick}
                />
                {gameMode === GameMode.finder && content.finder && (
                  <FinderBox
                    content={content.finder}
                    instructionText={translations["finder-instruction"]}
                    nextText={translations["button-next"]}
                    foundSituations={foundSituations}
                    onOpenGame={handleOpenGame}
                  />
                )}
                {gameMode === GameMode.timedFinder && content.finder && (
                  <TimedFinderBox
                    content={content.finder}
                    instructionText={translations["finder-instruction"]}
                    nextText={translations["button-next"]}
                    foundSituations={foundSituations}
                    onSetState={setState}
                  />
                )}
                {gameMode === GameMode.scenarios && content?.scenarios && (
                  <ScenarioBox
                    scenarios={content.scenarios}
                    correctScenarios={correctScenarios}
                    wrongScenarios={wrongScenarios}
                    instructionText={translations["finder-instruction"]}
                    nextText={translations["button-next"]}
                    onComplete={handleComplete}
                  />
                )}
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
                onCorrectReaction={handleCorrectReaction}
                onWrongReaction={handleWrongScenario}
                texts={translations}
                onBack={exitScenario}
              />
            )}
            {(state === GameState.complete) &&
              (<CompleteDialog
                onTryAgain={handleReset}
                onExit={handleExit}
                total={Object.keys(content?.scenarios!).length || 0}
                mistakes={wrongScenarios.length}
                headerText={translations["complete-header"]}
                scoreText={translations["complete-score"]}
                tryAgainText={translations["complete-try-again"]}
                exitText={translations["complete-exit"]}
              />)}
          </>
        )}
      </div>
    </>
  );
}

export default App;

// returns the path to the spritesheet for given tileset
const determineTilesetSpritesheetPath = (tilesetData: TiledTilesetData) => `${process.env.PUBLIC_URL}/maps/tilesets/${tilesetData.name}.json`;


