import React, { useEffect, useMemo, useState } from 'react';
import BaseDialog from './BaseDialog';
import { ReactComponent as StarEmpty } from './../../common/images/star-empty.svg';
import { ReactComponent as StarFull } from './../../common/images/star-full.svg';
import { useTranslationStore } from 'stores/translations';
import { useTimerStore } from 'stores/timer';
import { useContentStore } from 'stores/content';
import './styles/completeDialogScenarios.scss';

interface Props {
  foundSituations: string[];
  onTryAgain: () => void;
  onExit: () => void;
}
const DEFAULT_TIME = 120

const CompleteDialogTimedFinder = (props: Props) => {
  const { foundSituations } = props;
  const { getText } = useTranslationStore();
  const totalStars = 4;
  const [animationScore, setAnimationScore] = useState(0)
  const { timePassed } = useTimerStore()
  const { content } = useContentStore()
  const finderContent = content?.finder ?? {
    situations: [],
    final: {},
    time: DEFAULT_TIME
  }
  const { time = DEFAULT_TIME } = finderContent ?? { time: DEFAULT_TIME };


  const score = useMemo(() => {
    if (foundSituations.length === 0) return 0;
    if (foundSituations.length < finderContent.situations.length) return 1;
    if ((time - timePassed) / time < .5) return 2;
    if ((time - timePassed) / time < .8) return 3;
    return 4
  }, [finderContent.situations.length, foundSituations.length, time, timePassed]);

  useEffect(() => {
    // @ts-ignore
    if (window.setLevelScore) window.setLevelScore(1, score, totalStars);
  }, [score, totalStars]);

  const renderScoreList = () => {
    // Renders *all* the scores (unused)
    const result = [];
    for (let i = 0; i < animationScore; i++) {
      result.push(
        <li>
          {getText(`score-list-${i}`)}
        </li>
      )
    }
    return result;
  }

  const renderStars = () => {
    const result = [];
    for (let i = 0; i < totalStars; i++) {
      result.push(
        <div key={`star${i}`}>
          <StarEmpty />
          {i < animationScore && (<StarFull className="full"/>)}
        </div>
      )
    }
    return result;
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const update = () => {
      setAnimationScore(animationScore + 1);
    }
    if (animationScore < score) {
      timeout = setTimeout(update, 750)
    }

    return () => clearTimeout(timeout)
  }, [animationScore, score]);

  const headerKey = (time - timePassed) <= 0 ? "timeup-header" : "complete-header";

  return (
    <BaseDialog className="complete-dialog">
      <div className="block">
        <h1>{getText(headerKey)}</h1>
      </div>
      { score === 0 ? (
        <div className={`block score timed}`}>
          {getText(`score-list-0`)}
        </div>
        ) : (
        <div className={`block score timed ${animationScore === score ? "fade-out" : ''}`}>
          {/* {renderScoreList()} */}
          {animationScore > 0 && getText(`score-list-${animationScore}`)}
        </div>
      )}

      <div className="block stars">
        {renderStars()}
      </div>
      <div className="bottom">
        <button className="green button" onClick={props.onTryAgain}>
          {getText("complete-try-again")}
        </button>
        <button className="red button" onClick={props.onExit}>
          {getText("complete-exit")}
        </button>
      </div>
    </BaseDialog>
  );
}

export default CompleteDialogTimedFinder;
