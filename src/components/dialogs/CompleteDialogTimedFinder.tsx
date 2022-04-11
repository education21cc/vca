import React, { useEffect, useMemo, useState } from 'react';
import BaseDialog from './BaseDialog';
import { ReactComponent as StarEmpty } from './../../common/images/star-empty.svg';
import { ReactComponent as StarFull } from './../../common/images/star-full.svg';
import { useTranslationStore } from 'stores/translations';
import { FinderContent } from 'data/Content';
import { useTimerStore } from 'stores/timer';
import './styles/completeDialogScenarios.scss';

interface Props {
  content: FinderContent;
  foundSituations: string[];
  onTryAgain: () => void;
  onExit: () => void;
}

const CompleteDialogTimedFinder = (props: Props) => {
  const { content, foundSituations } = props;
  const { getText } = useTranslationStore();
  const totalStars = 4;
  const [animationScore, setAnimationScore] = useState(0)
  const { timePassed } = useTimerStore()
  const { time = 120 } = content;

  const score = useMemo(() => {
    if (foundSituations.length === 0) return 0;
    if (foundSituations.length < content.situations.length) return 1;
    if ((time - timePassed) / time < .5) return 2;
    if ((time - timePassed) / time < .8) return 3;
    return 4
  }, [content.situations.length, foundSituations.length, time, timePassed]);

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
  }, [animationScore, score])

  return (
    <BaseDialog className="complete-dialog">
      <div className="block">
        <h1>{getText("complete-header")}</h1>
      </div>
      <div className={`block score timed ${animationScore === score? "fade-out" : ''}`}>
        {/* {renderScoreList()} */}
        {animationScore > 0 && getText(`score-list-${animationScore}`)}
      </div>
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