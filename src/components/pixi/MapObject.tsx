import React, { useEffect, useRef } from 'react';
import { TiledObjectData, TiledProperty, TiledMapData } from 'utils/tiledMapData';
import { TILE_HEIGHT, TILE_WIDTH } from 'constants/tiles';
import { Sprite, Graphics } from '@inlet/react-pixi';
import { findTileset } from 'utils/tiles';
import { tileLocationToPosition } from 'utils/isometric';
import Smoke1 from './effects/smoke1';
import { gsap } from 'gsap'


interface Props {
    data: TiledObjectData;
    found?: boolean;
    mapData: TiledMapData;
    tilesetsTextures: {[key: string]: PIXI.LoaderResource};
    onClick: (name:string) => void; 
}

const MapObject = (props: Props) => {
  const o = props.data;
  const {mapData, tilesetsTextures, found, onClick} = props;

  const popInDuration = 1;
  const checkRef = useRef(null);
  useEffect(() => {
    // Pop in animation!
    if (!checkRef.current) return;
    gsap.from(checkRef.current, { 
      duration: popInDuration,
      ease: "elastic.out(2, 0.5)",
      pixi: { 
        visible: false,
        scale: .1, 
      }
    });
  }, [found]);

  if (o.polygon) {
    const {x, y } = o;
    const location: [number, number] = [
      x / TILE_HEIGHT,
      y / TILE_HEIGHT
    ];

    const points = o.polygon.reduce((acc: number[], value: { x: number, y: number} ) => {
      acc.push(value.y + value.x)
      acc.push((value.y / 2) - (value.x / 2));
      return acc;
    }, []);

    return (
      <Graphics
        key={`${o.type}${o.name}`}
        draw={graphics => {
          graphics.beginFill(0xBADA55);
          graphics.drawPolygon(points);
          graphics.endFill();
        }}
        position={tileLocationToPosition(location, mapData.width, mapData.height)}
        pivot={[TILE_WIDTH / 2, TILE_HEIGHT /2]}
      />
    )
  }
  else if (o.gid) {
    // todo: DRY
    const {x, y, gid } = o;
    const location: [number, number] = [
      x / TILE_HEIGHT - 1,
      y / TILE_HEIGHT - 1
    ];
    const actualGid = gid & 0x1FFFFFFF;
    const tileset = findTileset(actualGid, mapData!.tilesets);
    if (!tileset || !tileset.tiles || gid === 0) return null;
      
    // See https://discourse.mapeditor.org/t/data-field-in-the-tmx-format-json/3633
    const flipHor = (gid & 0x80000000) !== 0;
    const flipVert = (gid & 0x40000000) !== 0;
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
          name={`${o.name}: ${x},${y} (${textureName})`}
          scale={scale}
          texture={tilesetsTextures[spritesheet].textures![textureName]}
          anchor={[0, 1]}
          pivot={[TILE_WIDTH / 2, 0]}
          position={tileLocationToPosition(location, mapData.width, mapData.height)}
          pointerdown={() => onClick(o.name)}
          interactive={!!o.name}
        >
          {renderEffects(o.properties)}
          {found && <Sprite
            ref={checkRef}
            image={`${process.env.PUBLIC_URL}/images/ui/check.svg`}
            scale={.8}
            anchor={[-.1, 1]}
            pivot={[TILE_WIDTH / 2, 0]}
          />}
        </Sprite> 
    );  
  }
  return null;
}

export default MapObject;

const renderEffects = (properties?: TiledProperty[]) => {
    if (!properties) return null;
    let x, y;
    const offset = properties.find(p => p.name === 'offset');
    if (offset) {
      [x, y] = offset.value.split(',');
    }
    
    return (
      <Smoke1 
        x={x}
        y={y}
      />
    )
  }
