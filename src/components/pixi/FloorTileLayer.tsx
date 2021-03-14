import { PixiComponent } from "@inlet/react-pixi";
import * as PIXI  from 'pixi.js';
import { TiledLayerData, TiledTilesetData } from "utils/tiledMapData";
import { tileLocationToPosition } from "utils/isometric";
import { TILE_HEIGHT, TILE_WIDTH } from "constants/tiles";
import { CompositeRectTileLayer } from "@pixi/tilemap"

interface Props  {
  texture: PIXI.Texture;
  verticalTiles: number;
  horizontalTiles: number;
  layer: TiledLayerData;
  tileset: TiledTilesetData;
  spritesheet: PIXI.Spritesheet;
};

// Floortile layer leverages pixi-tilemap for better performance
const FloorTileLayer = PixiComponent<Props, any>("FloorTileLayer", {
  create(props: Props) {

    // @ts-ignore
    const tileLayer = new CompositeRectTileLayer(0, [props.texture]);
    return tileLayer;
  },

  applyProps(instance, oldProps: Props, props: Props) {
    const {layer, tileset, verticalTiles, horizontalTiles, spritesheet } = props;
    if (!layer.data) {
      return;
    }
    for (let i = 0; i < layer.data.length; i++) {
      if (layer.data[i] > 0) {
        const location: [number, number] = [i % horizontalTiles, Math.floor(i / horizontalTiles)];
        const position = tileLocationToPosition(location, horizontalTiles, verticalTiles);

        // @ts-ignore
        const tile = tileset.tiles!.find((t) => t.id === layer.data[i] - tileset.firstgid);
        const tileName = tile?.image.substr(tile?.image.lastIndexOf('/') + 1);
        
        instance.addFrame(spritesheet.textures[tileName!], 
          position.x - TILE_WIDTH / 2, 
          position.y - TILE_HEIGHT);
      }
    }
  }
});

export default FloorTileLayer;

