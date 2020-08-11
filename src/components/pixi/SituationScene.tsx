import React, { ComponentProps } from 'react';
import { Sprite, Container, Stage } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { SceneElement } from 'data/Content';

interface Props {
  imageBaseUrl: string;
  sceneConfig: SceneElement[];
}


if (process.env.NODE_ENV === "development") {
  // @ts-ignore
  window.__PIXI_INSPECTOR_GLOBAL_HOOK__ && window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}

const SituationScene = (props: Props & ComponentProps<typeof Container>) => {
  // const ref = useRef<PIXI.Sprite>(null);
  // const data = useRef<PIXI.interaction.InteractionData>();
  // const [position, setPosition] = useState<PIXI.Point>(props.position || new PIXI.Point());
  // const popInDuration = 1;
  const {sceneConfig, imageBaseUrl, ...otherProps} = props;
  const renderElement = (sceneElement: SceneElement) => {
    const scale: [number, number] = [sceneElement.scale || 1, sceneElement.scale || 1];
    if (sceneElement.flipped) scale[0] = -scale[0];
    console.log(`${imageBaseUrl}${sceneElement.image}`, sceneConfig)
    return (
      <Sprite 
        image={`${imageBaseUrl}${sceneElement.image}`} 
        key={sceneElement.image} 
        position={sceneElement.position || [0, 0]}
      />
    )   
  }
  return (
      <Stage width={1280} height={720} className="scene" options={{backgroundColor: 0xffffff}}>
        <Container {...otherProps} >
         {sceneConfig.map(e => renderElement(e))}
        </Container>
      </Stage>
  )
}

export default SituationScene;