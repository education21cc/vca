import { Content, GameMode } from "data/Content";
import { useEffect } from "react";
import { GameState, useGameStateStore } from "stores/gameState";
import useGameMode from "./useGameMode";
import { usePrevious } from "./usePrevious";
import sound from 'pixi-sound';


sound.add('blip', `${process.env.PUBLIC_URL}/sound/blip.ogg`);

export const useGameLogic = (content: Content, foundSituations: string[]) => {
  const { setState } = useGameStateStore()
  const gameMode = useGameMode(content)
  const previousFoundSituationsCount = usePrevious(foundSituations.length)

  // Timed finder logic
  useEffect(() => {
    if (gameMode === GameMode.timedFinder) {
      if (foundSituations.length === content.finder?.situations.length) {
        setTimeout(() => { setState(GameState.preComplete) }, 1000)
      }
    }
  }, [content.finder?.situations.length, foundSituations.length, gameMode, setState]);

  useEffect(() => {
    if (previousFoundSituationsCount !== foundSituations.length && foundSituations.length) {
      sound.play('blip');
    }
  }, [foundSituations.length, previousFoundSituationsCount])
}
