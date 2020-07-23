import React, { useState } from 'react';
import './App.css';
import Map from "./components/Map";
import Modal from 'components/Modal';


function App() {
  const [currentMap, setCurrentMap] = useState("maps/testmap3.json");
  const [modalOpen, setModalOpen] = useState(false);

  const handleClose = () => {
    setModalOpen(false)
  }
  const handleOpen = () => {
    setModalOpen(false)
  }
  return (
    <div className="App" onMouseUp={handleOpen}>
      <select value={currentMap} onChange={e => setCurrentMap(e.currentTarget.value)}>
        <option>maps/testmap1.json</option>
        <option>maps/testmap2.json</option>
        <option>maps/testmap3.json</option>
        <option>maps/testmap4.json</option>
      </select>
      {modalOpen && <Modal onClose={handleClose} />  }
      <Map jsonPath={currentMap} />
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


