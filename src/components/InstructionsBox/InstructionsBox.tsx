import { Instruction } from "data/Content";
import { useEffect, useRef, useState } from "react";
import { Viewport as PixiViewport } from "pixi-viewport";
import { Point } from "pixi.js";
import React from "react";
import "./styles/instructionsBox.scss";
import { GameState, useGameStateStore } from "stores/gameState";

type Props = {
  instructions: Instruction[];
  viewport: PixiViewport | null;
}

const InstructionsBox = (props: Props) => {
  const { instructions, viewport } = props;
  const [step, setStep] = useState<number>(0);
  const { setState } = useGameStateStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextStep = () => {
      if (ref.current) {
        ref.current.style.opacity = '0';
      }
      if (step < instructions.length - 1) {
        setStep(step + 1)
      } else {
        setState(GameState.normal);
      }
    }
    const info = instructions?.[step]
    if (!info) {
      return
    }
    setTimeout(() => {
      if (ref.current) {
        ref.current.style.opacity = '1';
        ref.current.innerHTML = instructions[step]?.text;
      }

      viewport?.animate({
        time: info.time,
        position: new Point(info.x, info.y),
        scale: info.zoom,
        callbackOnComplete: nextStep
      })
    }, info.delay ?? 0);
  }, [instructions, setState, step, viewport]);

  useEffect(() => {
    setStep(0)
  }, [viewport])

  return (
    <div className="instructions-box" ref={ref} style={{ opacity: 0}}>
    </div>
  )
}

export default InstructionsBox
