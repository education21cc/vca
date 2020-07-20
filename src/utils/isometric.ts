import * as PIXI from 'pixi.js';
import { TILE_WIDTH, TILE_HEIGHT, MARGIN_TOP } from "constants/tiles";

export const tileLocationToPosition = (location: [number, number], horizontalTiles: number, verticalTiles: number, ) => {
  const originX = (verticalTiles - horizontalTiles) * (TILE_HEIGHT / 2) + ((verticalTiles + horizontalTiles) * TILE_WIDTH / 2) / 2;
  const x = originX + (TILE_WIDTH / 2) * location[0] + (TILE_WIDTH / 2) * -location[1];
  const y = (location[0] + location[1]) * TILE_HEIGHT / 2 + (TILE_HEIGHT) + MARGIN_TOP;
  return new PIXI.Point(x, y);
}