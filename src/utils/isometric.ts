import * as PIXI from 'pixi.js';
import { TILE_WIDTH, TILE_HEIGHT, MARGIN_TOP } from "constants/tiles";

export const tileLocationToPosition = (location: [number, number], mapWidth: number) => {
  const x = (location[0] - location[1]) * TILE_WIDTH / 2 + (TILE_WIDTH * mapWidth / 2);
  const y = (location[0] + location[1]) * TILE_HEIGHT / 2 + (TILE_HEIGHT) + MARGIN_TOP;
  return new PIXI.Point(x, y);
}