import { Content, GameMode } from "data/Content";
import { useEffect, useState } from "react";
import useGameMode from "./useGameMode";

export enum GameState {
  intro = 0,
  normal = 1 << 1,
  complete = 1 << 2
}

export const useGameLogic = (content: Content, foundSituations: string[]) => {
  const [state, setState] = useState(GameState.intro);
  const gameMode = useGameMode(content)

  // Timed finder logic
  useEffect(() => {
    if (gameMode === GameMode.timedFinder) {
      if (foundSituations.length === content.finder?.situations.length) {
        setTimeout(() => { setState(GameState.complete) }, 1000)
      }
    }
  }, [content.finder?.situations.length, foundSituations.length, gameMode]);

  return {
    state,
    setState
  }
}
