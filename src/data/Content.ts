import { GameData } from "components/playerBridge/GameData";
import { NineSlicePlane } from "pixi.js";

export interface Content {
  mapJson: string,
  situations: { [key: string]: Situation }
  scenarios: { [key: string]: Scenario }
  finder?: FinderContent,
  stars?: number,
}

export enum Mode {
  scenario = "scenario",
  finder = "finder"
}

export interface FinderContent {
    situations: string[];
    final: ContentConfig;
}

export interface ContentConfig {
  url: string
  data: GameData<any>
}

export interface Situation {
  url: string;
  title: string;
}

export interface Scenario {
  location: number[];
  description: string | string[];
  image?: string;
  imageFeedback?: string;
  hotspots?: Hotspot[];
  reactions: ScenarioReaction[];
}

export interface Hotspot {
  left: number; 
  top: number; 
  width: number;
  image: string;
  hotspot: string;
}

// Something on the scene
export interface SceneElement {
  image?: string;
  position?: [number, number];
  scale?: number;
  flipped: boolean;
}

export interface ScenarioReaction { 
  correct: boolean, 
  id: string, 
}

