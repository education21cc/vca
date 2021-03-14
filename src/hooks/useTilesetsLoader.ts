import { useState, useEffect, useCallback } from "react";
import { TiledTilesetData } from "utils/tiledMapData";
import { loadResource } from "utils/pixiJs";
import { LoaderResource } from "pixi.js";

const useTilesetsLoader = (determineTilesetSpritesheetPath: (tileset: TiledTilesetData) => string) => {
    const [tilesetsTextures, setTilesets] = useState<{[key: string]: any}>({});
    const [data, setData] = useState<TiledTilesetData[]>();

    const loadTilesets = useCallback((value: TiledTilesetData[]) => {
        setData(value);
    }, []);

    useEffect(() => {
        if (!data) return;
        const nextTileset = nextTilesetToload(data, tilesetsTextures);
        if (!nextTileset) return;
        
        const tilesetName = nextTileset.name;
        console.log('loading tilesets', data, tilesetName)
        const path = determineTilesetSpritesheetPath(nextTileset);
        loadResource(`${path}`, (resource) => {
            if (resource.error) {
                throw new Error(`Loading ${path}\n${resource.error}`);
            }
            // const newTilesets = { 
            //     ...tilesetsTextures,
            //     [tilesetName]: resource
            // }
            // setTilesets(newTilesets);
        });
    }, [data, determineTilesetSpritesheetPath, tilesetsTextures]);
    
    const loadComplete = !!data && nextTilesetToload(data, tilesetsTextures) === undefined;

    return {
        loadComplete,
        loadTilesets,
        tilesetsTextures
    }
}

export default useTilesetsLoader;

// Returns a TiledTilesetData that has not been loaded into tilesetsTextures yet
const nextTilesetToload = (tilesets: TiledTilesetData[], tilesetsTextures: {[key: string]: any}) => {
    return tilesets.find((t) => {
        return !tilesetsTextures[t.name];
    })
}