import React, { useEffect, useState, useRef } from 'react';
import { loadResource } from 'utils/pixiJs';
import { Stage, Sprite, Container } from '@inlet/react-pixi';
import { TiledMapData, TiledTilesetData, TiledLayerData } from 'utils/tiledMapData';
import * as PIXI from 'pixi.js';
import useTilesetsLoader from 'hooks/useTilesetsLoader';
import Viewport from '../pixi/Viewport';
import { SCALE_MODES } from 'pixi.js';
import { Viewport as PixiViewport } from "pixi-viewport";
import { TILE_HEIGHT, TILE_WIDTH, MARGIN_TOP } from 'constants/tiles';
import { tileLocationToPosition } from 'utils/isometric';
import FloorTileLayer from 'components/pixi/FloorTileLayer';

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
  PIXI.settings.ROUND_PIXELS = true;

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

  const renderFloor = (layer?: TiledLayerData) => {
    if (!layer) {
      console.warn("No layer with name 'floor' found!");
      return null;
    }
    const firstTileGid = layer.data.find(Boolean);
    if (!firstTileGid) {
      console.warn("Layer with name 'floor' is empty?");
      return null;
    }
    const actualGid = firstTileGid & 0x1FFFFFFF;
    const tileset = findTileset(actualGid, mapData!.tilesets);
    if (!tileset) {
      console.warn("No tileset found for floor layer. Huh?");
      return null;
    }
    const resource = tilesetsTextures[tileset.name];
    PIXI.utils.clearTextureCache();

    if (!resource.spritesheet) {
      console.warn(`No texture loaded found for floor layer. Was looking for ${tileset.name}`);
      return null;
    }
    return (
      <FloorTileLayer 
        texture={(resource.spritesheet as any)._texture}
        horizontalTiles={mapData.width}
        layer={layer}
        tileset={tileset}
        spritesheet={resource.spritesheet}
      />
    )
  }

  const renderLayers = (layers: TiledLayerData[]) => {
    return layers.filter(l => l.visible && l.name !== "floor").map((layer: TiledLayerData, index: number) => {
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
      if (!tilesetsTextures[spritesheet].textures![textureName]) {
        console.warn(`Could not find texture ${spritesheet} ${textureName}`);
      }

      return (
          <Sprite
            key={i}
            name={`${layer.name}: ${x},${y} (${textureName})`}
            scale={scale}
            texture={tilesetsTextures[spritesheet].textures![textureName]}
            anchor={[0, 1]}
            pivot={[TILE_WIDTH / 2, 0]}
            position={tileLocationToPosition([x, y], mapData.width)}
            zIndex={i * 100 + layerIndex}
          /> 
      );  
    })
  }



  const options = {
    sharedLoader: true,
    backgroundColor: 0x0
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
        {renderFloor(mapData.layers.find(l => l.name === "floor"))}
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
