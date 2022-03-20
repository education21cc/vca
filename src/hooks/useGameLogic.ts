import { Content } from "data/Content";
import { useEffect, useState } from "react";

export enum GameState {
  intro = 0,
  normal = 1 << 1,
  complete = 1 << 2
}

export const useGameLogic = (content: Content, foundSituations: string[]) => {
  const [state, setState] = useState(GameState.intro);

  useEffect(() => {

  }, []);

  return {
    state,
    setState
  }
}
