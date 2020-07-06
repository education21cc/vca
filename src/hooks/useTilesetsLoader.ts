import { useState, useEffect } from "react";
import { TiledTilesetData } from "../utils/tiledMapData";
import { loadResource } from "../utils/pixiJs";

const useTilesetsLoader = (determineTilesetSpritesheetPath: (tileset: TiledTilesetData) => string) => {
    const [tilesetsTextures, setTilesets] = useState<{[key: string]: PIXI.ITextureDictionary}>({});
    const [data, setData] = useState<TiledTilesetData[]>();

    const loadTilesets = (value: TiledTilesetData[]) => {
        setData(value);
    };

    useEffect(() => {
        if (!data) return;
        const nextTileset = nextTilesetToload(data, tilesetsTextures);
        if (!nextTileset) return;

        const tilesetName = nextTileset.name;
        const path = determineTilesetSpritesheetPath(nextTileset);
        loadResource(`${path}`, (resource) => {
            if (resource.error) {
                console.error(resource.error);
            }
            const newTilesets = { 
                ...tilesetsTextures,
                [tilesetName]: resource.textures!
            }
            setTilesets(newTilesets);
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
const nextTilesetToload = (tilesets: TiledTilesetData[], tilesetsTextures: {[key: string]: PIXI.ITextureDictionary}) => {
    return tilesets.find((t) => {
        return !tilesetsTextures[t.name];
    })
}