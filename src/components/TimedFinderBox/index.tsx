import React, { useEffect, useState } from 'react';
import { FinderContent } from 'data/Content';
import ProgressBar from 'components/ProgressBar';
import { GameState } from 'App';
// import './styles/finderBox.scss';

interface Props {
  content: FinderContent;
  instructionText: string;
  foundSituations: string[];
  nextText: string;
  onSetState: (gameState: GameState) => void;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);

  return [
    h,
    m > 9 ? m : (h ? '0' + m : m || '0'),
    s > 9 ? s : '0' + s
  ].filter(Boolean).join(':');
}

const TimedFinderBox = (props: Props) => {
  const { content, onSetState } = props;
  const { time = 120 } = content;
  const [timePassed, setTime] = useState(0)
  // const disabled = props.foundSituations.length < props.content.situations.length;
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(timePassed + 1);
      if (timePassed >= time) {
        onSetState(GameState.complete);
      }
    }, 1000)
    return () => clearInterval(interval);
  })
  return (
    <div className="finder-box">
      <ProgressBar value={(time - timePassed) / time}>
        Time left: {formatTime(time - timePassed)}
      </ProgressBar>
    </div>
  )
}

export default TimedFinderBox;
