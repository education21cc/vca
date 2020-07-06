import React, { useEffect, useState } from 'react';
import './App.css';
import { Stage, Sprite } from '@inlet/react-pixi';
import { loadResource } from './utils/pixiJs';
import { TiledMapData } from './utils/tiledMapData';
import { SpritesheetData, SpriteData } from './utils/spritesheetData';
import * as PIXI from 'pixi.js';
import Map from "./Map";

const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
function App() {


  return (
    <div className="App">
      <Map jsonPath={`${process.env.PUBLIC_URL}maps/testmap1.json`} />
        {/* <Stage width={mapWidth} height={mapHeight} options={{backgroundColor: 0x0}} className="background">
            {textures && (
              <>
                <Sprite
                  texture={textures["tile-structure-floor-blackwhite.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([0, 0])}
                /> 
                <Sprite
                  texture={textures["tile-structure-floor-blackwhite.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([1, 0])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-blackwhite.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([2, 0])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-blackwhite.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([3, 0])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-dadada.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([4, 0])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-blackwhite.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([5, 0])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-dadada.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([0, 1])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-wood.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([1, 1])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-blackwhite.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([2, 1])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([3, 1])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([4, 1])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([5, 1])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([0, 2])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([1, 2])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([2, 2])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([3, 2])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([4, 2])}
                />
                <Sprite
                  texture={textures["tile-structure-floor-grass.png"]}
                  anchor={[.5, 1]}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  position={tileLocationToPosition([5, 2])}
                />
              </> 
            )}

        </Stage> */}
        </div>
  );
}

export default App;

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

