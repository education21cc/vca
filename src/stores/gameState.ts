import create from "zustand";

export enum GameState {
  intro = 1 << 0,
  normal = 1 << 1,
  preComplete = 1 << 2, // show an animation
  complete = 1 << 3
}

type GameStateStore = {
  state: GameState
  setState: (s: GameState) => void
}

export const useGameStateStore = create<GameStateStore>(
  (set, get): GameStateStore => ({
    state: GameState.intro,
    setState: (state: GameState) => set({ state })
  })
)
