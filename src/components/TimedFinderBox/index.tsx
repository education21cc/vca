import React, { useEffect } from 'react';
import ProgressBar from 'components/ProgressBar';
import { useTranslationStore } from 'stores/translations';
import { useTimerStore } from 'stores/timer';
import { GameState, useGameStateStore } from 'stores/gameState';
import { useContentStore } from 'stores/content';
import './styles/timedFinderBox.scss';

interface Props {
  foundSituations: string[];
}

const DEFAULT_TIME = 120

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
  const { state, setState } = useGameStateStore()
  const { foundSituations } = props;
  const { timePassed } = useTimerStore()

  useEffect(() => {
    const interval = setInterval(() => {
      if (state === GameState.normal) {

        useTimerStore.setState({ timePassed: timePassed + 1 });
        if (timePassed >= time) {
          setState(GameState.complete);
        }
      }
    }, 1000)
    return () => clearInterval(interval);
  })
  const { content } = useContentStore()
  if (!content?.finder) return null
  const finderContent = content?.finder
  const { time = DEFAULT_TIME } = finderContent ?? { time: DEFAULT_TIME };

  return (
    <div className="timed-finder-box">
      <div className="items-remain">
       {getTextRaw("items-remain").replace('{0}', (finderContent.situations.length - foundSituations.length).toString())}
      </div>
      <ProgressBar value={(time - timePassed) / time}>
        Time left: {formatTime(time - timePassed)}
      </ProgressBar>
    </div>
  )
}

export default TimedFinderBox;
