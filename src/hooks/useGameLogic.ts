import { Content, GameMode } from "data/Content";
import { useEffect } from "react";
import { GameState, useGameStateStore } from "stores/gameState";
import useGameMode from "./useGameMode";

export const useGameLogic = (content: Content, foundSituations: string[]) => {
  const { setState } = useGameStateStore()
  const gameMode = useGameMode(content)

  // Timed finder logic
  useEffect(() => {
    if (gameMode === GameMode.timedFinder) {
      if (foundSituations.length === content.finder?.situations.length) {
        setTimeout(() => { setState(GameState.preComplete) }, 1000)
      }
    }
  }, [content.finder?.situations.length, foundSituations.length, gameMode, setState]);
}
