import React, { useEffect, useState } from 'react';
import { loadResource } from '../utils/pixiJs';
import { Stage, Sprite, Container } from '@inlet/react-pixi';
import { TiledMapData, TiledTilesetData, TiledLayerData } from '../utils/tiledMapData';
import { SpritesheetData, SpriteData } from '../utils/spritesheetData';
import * as PIXI from 'pixi.js';
import useTilesetsLoader from '../hooks/useTilesetsLoader';

const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
interface Props { 
    jsonPath: string
}

// // This stuff is needed for the pixi-js browser plugin
if (process.env.NODE_ENV === "development") {
  // @ts-ignore
  // tslint:disable-next-line: no-unused-expression
  window.__PIXI_INSPECTOR_GLOBAL_HOOK__ && window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI });
}


const Map = (props: Props) => {
  const {jsonPath} = props;
  const [mapData, setMapData] = useState<TiledMapData>();
  const mapWidth = TILE_WIDTH * 6;
  const mapHeight = TILE_HEIGHT * 6;

  const {
    loadComplete,
    loadTilesets,
    tilesetsTextures
  } = useTilesetsLoader(determineTilesetSpritesheetPath);

  useEffect(() => {
    loadResource(`${process.env.PUBLIC_URL}/${jsonPath}`, (resource) => {
      setMapData(resource.data);
    });
  }, [jsonPath]);

  useEffect(() => {
    if (mapData) {
      loadTilesets(mapData.tilesets);
    }
  }, [loadTilesets, mapData]);

  console.log(`loadcomplete: ${loadComplete}`);

  const tileLocationToPosition = (location: [number, number]) => {
    const x = (location[0] - location[1]) * TILE_WIDTH / 2 + (TILE_WIDTH * 6 / 2);
    const y = (location[0] + location[1]) * TILE_HEIGHT / 2 + (TILE_HEIGHT);
    return new PIXI.Point(x, y);
  }

  if (!loadComplete) {
    return (
      <div>Loading...</div>
    )
  }
  const textures = tilesetsTextures["structure-floor"];
  
  const renderLayers = (layers: TiledLayerData[]) => {
    return layers.map((layer: TiledLayerData) => {
      return (
        <Container key={layer.name} name={layer.name}>
          {renderLayerTiles(layer.data)}
        </Container>
      )  
    });
  } 

  const renderLayerTiles = (tileData: number[]) => {
    return tileData.map((gid, i) => {
      const tileset = findTileset(gid, mapData!.tilesets);
      if (!tileset || !tileset.tiles) return null;

      const columns = mapData!.width;
      const x = (i % columns);
      const y = Math.floor(i / columns);
      const texture = tileset.tiles.find((t) => t.id === gid - tileset.firstgid);
      if (!texture) return null;

      // the image is in the format "tiles/structure-wall/tile-structure-wall-gray-left.png"
      // the 'structure-wall' part refers to the spritesheet, the 'tile-structure-wall-gray-left' is the texture on the spriesheet
      const [
        _,
        spritesheet,
        textureName
      ] = texture.image.split("/");
      if (!tilesetsTextures[spritesheet]) {
        console.warn(`Could not find spritesheet ${spritesheet} ${tilesetsTextures}`);
      };
      if (!tilesetsTextures[spritesheet][textureName]) {
        console.warn(`Could not find texture ${spritesheet} ${textureName}`);
      }
      return (
          <Sprite
            key={i}
            name={`${x},${y}`}
            texture={tilesetsTextures[spritesheet][textureName]}
            anchor={[0, 1]}
            pivot={[64, 0]}
            position={tileLocationToPosition([x, y])}
          /> 
      );  
    })
  }

  return (
    <Stage width={mapWidth} height={mapHeight} options={{backgroundColor: 0x0}} className="background">
      {textures && (
        renderLayers(mapData!.layers)
      )}
    </Stage>
  );
}

export default Map;

// returns the path to the spritesheet for given tileset
const determineTilesetSpritesheetPath = (tilesetData: TiledTilesetData) => `${process.env.PUBLIC_URL}maps/tilesets/${tilesetData.name}.json`;

const findTileset = (gid: number, tilesets: TiledTilesetData[]) => {
  let tileset;
  for (let i = tilesets.length - 1; i >= 0; i--) {
    tileset = tilesets[i];
    if (tileset.firstgid <= gid) {
      break;
    }
  }
  return tileset;
}

const parseSpritesheetData = (mapData: TiledMapData): SpritesheetData => {
  const tileset = mapData.tilesets[0];
  const columns = tileset.columns;

  const frames: { [name: string]: SpriteData } = {};
  for (let i = 0; i < tileset.tilecount; i++) {
      const w = tileset.tilewidth;
      const h = tileset.tileheight;
      const x = (i % columns) * w;
      const y = Math.floor(i / columns) * h;

      frames[`${tileset.name}-${i + tileset.firstgid}`] = { 
          frame: {x, y, w, h},
          spriteSourceSize: {x, y, w, h},
          rotated: false,
          trimmed: false,
          sourceSize: { w, h}
      };
  }
  const image = tileset.image;
  const size = { w: tileset.imagewidth, h: tileset.imageheight };
  return {
      frames,
      meta: {
          image,
          size,
          scale: 1
      }
  };
}

