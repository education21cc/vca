import React, { useEffect } from 'react';
import { FinderContent } from 'data/Content';
import ProgressBar from 'components/ProgressBar';
import { useTranslationStore } from 'stores/translations';
import { GameState } from 'hooks/useGameLogic';
import { useTimerStore } from 'stores/timer';
import './styles/timedFinderBox.scss';

interface Props {
  content: FinderContent;
  foundSituations: string[];
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
  const { getTextRaw } = useTranslationStore();
  const { content, foundSituations, onSetState } = props;
  const { timePassed } = useTimerStore()
  const { time = 120 } = content;

  useEffect(() => {
    const interval = setInterval(() => {
      useTimerStore.setState({ timePassed: timePassed + 1 });
      if (timePassed >= time) {
        onSetState(GameState.complete);
      }
    }, 1000)
    return () => clearInterval(interval);
  })
  return (
    <div className="timed-finder-box">
      <div className="items-remain">
       {getTextRaw("items-remain").replace('{0}', (content.situations.length - foundSituations.length).toString())}
      </div>
      <ProgressBar value={(time - timePassed) / time}>
        Time left: {formatTime(time - timePassed)}
      </ProgressBar>
    </div>
  )
}

export default TimedFinderBox;
