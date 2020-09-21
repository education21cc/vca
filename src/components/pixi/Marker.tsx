import React, { useRef, useEffect, useState, ComponentProps } from 'react';
import { Sprite } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap'


const CAN_DRAG = false;
interface Props {
    position?: PIXI.Point;
    delay?: number; // Wait this long before showing
    bounce?: boolean;
}

/* A map marker (the red or green arrow thimg) */
const Marker = (props: Props & ComponentProps<typeof Sprite>) => {
    const ref = useRef<PIXI.Sprite>(null);
    const data = useRef<PIXI.InteractionData>();
    const [position, setPosition] = useState<PIXI.Point>(props.position || new PIXI.Point());
    const popInDuration = 1;
    const image = props.bounce ? `${process.env.PUBLIC_URL}/images/ui/marker-red.svg` :  `${process.env.PUBLIC_URL}/images/ui/marker-green.svg`;

    useEffect(() => {
        // Pop in animation!
        gsap.from(ref.current, { 
          duration: popInDuration,
          ease: "elastic.out(2, 0.5)",
          pixi: { 
            visible: false,
            scale: .1, 
          }
        }).delay(props.delay || 0);
    }, [props.delay]);

    useEffect(() => {
        let bounceAnim: gsap.core.Tween;
        // Bounce animation!
        if (props.bounce !== false) {
            bounceAnim = gsap.to(ref.current, { 
                duration: .5,
                yoyo: true,
                repeat: -1,
                pixi: { 
                  //@ts-ignore
                    y: '-=40', 
                }
              }).delay(popInDuration + Math.random());      
        }
        return () => {
            bounceAnim?.kill();
        }
    }, [props.bounce]);

    const onDragStart = (event: PIXI.InteractionEvent) => {
        if (!CAN_DRAG) return;
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        data.current = event.data;
        event.stopPropagation(); // Stop dragging the map!
    }
    
    const onDragEnd = () => {
        data.current = undefined;
    }
    
    const onDragMove = () => {
        if (!CAN_DRAG) return;
        if (data.current)
        {
            const newPosition = data.current.getLocalPosition(ref.current!.parent);
            setPosition(newPosition);
        }
    }
    
    return (
        <Sprite 
            { ...props }
            anchor={[0.5, 0.5]}
            position={position}
            ref={ref}
            interactive={true}
            image={image}
            mousedown={onDragStart}
            touchstart={onDragStart}
            mouseup={onDragEnd}
            mouseupoutside={onDragEnd}
            mousemove={onDragMove}
            touchmove={onDragMove}
        />
    );
}

export default Marker;