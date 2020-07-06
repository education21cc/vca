import { useState, useEffect } from "react";
import { TiledTilesetData } from "../utils/tiledMapData";
import { loadResource } from "../utils/pixiJs";

const useTilesetsLoader = (determineTilesetSpritesheetPath: (tileset: TiledTilesetData) => string) => {
    const [tilesetsTextures, setTilesets] = useState<{[key: string]: PIXI.ITextureDictionary}>({});
    const [data, setData] = useState<TiledTilesetData[]>();
    // const [loadComplete, setLoadComplete] = useState(false);

    const loadTilesets = (value: TiledTilesetData[]) => {
        setData(value);
    };

    useEffect(() => {
        if (!data) return;
        const nextIndex = Object.keys(tilesetsTextures).length;
        const tilesetData = data[nextIndex];
        if (!tilesetData) return;

        const tilesetName = tilesetData.name;
        const path = determineTilesetSpritesheetPath(tilesetData);
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
    
    // useEffect(() => {
    //     if (!data) return;
    //     console.log(data.length)
    //     console.log(Object.keys(tilesetsTextures).length)
    //     if (data.length === Object.keys(tilesetsTextures).length){
    //         setLoadComplete(true);
    //     }
    
    // }, [tilesetsTextures, data])

    const loadComplete = !!data && data.length === Object.keys(tilesetsTextures).length;

    return {
        loadComplete,
        loadTilesets,
        tilesetsTextures
    }
}

export default useTilesetsLoader;