import React, { useEffect, useState, useRef } from 'react';
import { loadResource } from '../../utils/pixiJs';
import { Stage, Sprite, Container } from '@inlet/react-pixi';
import { TiledMapData, TiledTilesetData, TiledLayerData } from '../../utils/tiledMapData';
import * as PIXI from 'pixi.js';
import useTilesetsLoader from '../../hooks/useTilesetsLoader';
import Viewport from '../Viewport';
import { SCALE_MODES } from 'pixi.js';
import { Viewport as PixiViewport } from "pixi-viewport";

window.PIXI = PIXI;
// eslint-disable-next-line import/first
import 'pixi-tilemap'; // tilemap is not a real npm module :/

const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
const MARGIN_TOP = 128;   // extra top margin around the map

const screenWidth = 1280;
const screenHeight = 720;

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

  const {
    loadComplete,
    loadTilesets,
    tilesetsTextures
  } = useTilesetsLoader(determineTilesetSpritesheetPath);

  useEffect(() => {
    PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST; // prevent lines on the edges of tiles
    loadResource(`${process.env.PUBLIC_URL}/${jsonPath}`, (resource) => {
      setMapData(resource.data);
    });
  }, [jsonPath]);

  useEffect(() => {
    if (mapData) {
      loadTilesets(mapData.tilesets);
    }
  }, [loadTilesets, mapData]);


  const tileLocationToPosition = (location: [number, number]) => {
    const x = (location[0] - location[1]) * TILE_WIDTH / 2 + (TILE_WIDTH * mapData!.width / 2);
    const y = (location[0] + location[1]) * TILE_HEIGHT / 2 + (TILE_HEIGHT) + MARGIN_TOP;
    return new PIXI.Point(x, y);
  }

  const mapWidth = TILE_WIDTH * (mapData?.width || 1);
  const mapHeight = TILE_HEIGHT * (mapData?.height || 1) + MARGIN_TOP;

  const viewportRef = useRef<PixiViewport>(null);
  useEffect(() => {
    // focus on center of the map
    if (viewportRef.current && mapData) {
        const viewport = viewportRef.current;
        viewport.moveCenter(mapWidth / 2, mapHeight / 2);
        console.log("hi")
    }
  }, [mapData, mapHeight, mapWidth]);


  if (!loadComplete || !mapData) {
    return (
      <div>Loading...</div>
    )
  }

  const renderLayers = (layers: TiledLayerData[]) => {
    return layers.filter(l => l.visible).map((layer: TiledLayerData, index: number) => {
      return (
        // <Container key={layer.name} name={layer.name}>
        renderLayerTiles(layer, index)
        // </Container>
      )  //people-transports/tile-people-transports-cart-01.png
    });
  } 

  const renderLayerTiles = (layer: TiledLayerData, layerIndex: number) => {
    const tileData = layer.data;
    return tileData.map((gid, i) => {
      const actualGid = gid & 0x1FFFFFFF;
      const tileset = findTileset(actualGid, mapData!.tilesets);
      if (!tileset || !tileset.tiles || gid === 0) return null;

      const columns = mapData!.width;
      const x = (i % columns);
      const y = Math.floor(i / columns);
      
      // See https://discourse.mapeditor.org/t/data-field-in-the-tmx-format-json/3633
      const flipHor = (gid & 0x80000000) !== 0;
      const flipVert = (gid & 0x40000000) !== 0;
      // const flipDiag = (gid & 0x20000000) !== 0;
      const scale: [number, number] = [1, 1];
      if (flipHor) {
        scale[0] *= -1;
      }
      if (flipVert) {
        scale[1] *= -1;
      }
      const texture = tileset.tiles.find((t) => t.id === actualGid - tileset.firstgid);
      if (!texture) return null;

      // the image is in the format "tiles/structure-wall/tile-structure-wall-gray-left.png"
      // the 'structure-wall' part refers to the spritesheet, the 'tile-structure-wall-gray-left' is the texture on the spriesheet
      const [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            name={`${layer.name}: ${x},${y} (${textureName})`}
            scale={scale}
            texture={tilesetsTextures[spritesheet][textureName]}
            anchor={[0, 1]}
            pivot={[TILE_WIDTH / 2, 0]}
            position={tileLocationToPosition([x, y])}
            zIndex={i * 100 + layerIndex}
          /> 
      );  
    })
  }



  const options = {
    roundPixels: true,
    sharedLoader: true,
    backgroundColor: 0xffffff
  }
  return (
    <Stage width={screenWidth} height={screenHeight} className="background" options={options}>
      <Viewport
        worldWidth={mapWidth}
        worldHeight={mapHeight}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        ref={viewportRef}
      >
        <Container sortableChildren={true}>
        {renderLayers(mapData.layers)}
        </Container>
      </Viewport>
    </Stage>
  );
}

export default Map;

// returns the path to the spritesheet for given tileset
const determineTilesetSpritesheetPath = (tilesetData: TiledTilesetData) => `${process.env.PUBLIC_URL}/maps/tilesets/${tilesetData.name}.json`;

// finds tileset based on gid
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
