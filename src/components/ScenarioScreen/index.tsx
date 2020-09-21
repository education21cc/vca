import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/all';
import sound from 'pixi-sound';
import { Scenario } from 'data/Content';
import ReactMarkdown from 'react-markdown';
import Reactions from './Reactions';
import FeedbackTitle from './FeedbackTitle';
import { ReactComponent as CloseIcon } from './styles/close.svg';

import "./styles/scenarioScreen.scss";

gsap.registerPlugin(TextPlugin);

interface Props {
  scenario: string;
  content: Scenario;
  texts: {[key: string]: string};
  selectedReaction?: string; // When reaction has been set correctly before
  setCorrectReaction: (index: string) => void;
  onClose: () => void;
}

enum State {
  description,
  reactions,
  feedback,
}

const ScenarioScreen = (props: Props) => {
  const {content} = props;
  const ref = useRef<HTMLDivElement>(null);
  const reopeningCorrectScenario = useRef<boolean>(!!props.selectedReaction);
  const [state, setState] = useState(State.description);
  const [selectedReaction, setSelectedReaction] = useState<string|undefined>(props.selectedReaction);

  const handleClickNextDescription = () => {
    setState(State.reactions)
  }

  const handleGoToDescription = () => {
    setState(State.description)
  }
  
  const handleGoToFeedback = () => {
    setState(State.feedback);
    setTimeout(() => {
      if (selectedReactionCorrect) {
        sound.play('correct');
        props.setCorrectReaction(selectedReaction!);
      } else {
        sound.play('wrong');
      }
    }, 500);
  }
  
  useEffect(() => {
    sound.add('correct', `${process.env.PUBLIC_URL}/sound/correct.mp3`);    
    sound.add('wrong', `${process.env.PUBLIC_URL}/sound/wrong.mp3`);
  }, []);
  
  // shown on the feedback page
  const selectedReactionText = useMemo(() => {
    if (!selectedReaction) return "";
    const id = content.reactions.find(r => r.id === selectedReaction)?.id;
    return props.texts[`reaction-${props.scenario}-${id}`];
  }, [content.reactions, props.scenario, props.texts, selectedReaction]); 
  
  const selectedReactionCorrect = useMemo(() => {
    if (!selectedReaction) return false;
    return content.reactions.find(r => r.id === selectedReaction)?.correct === true;
  }, [content.reactions, selectedReaction]);

  return (
    <>
    <div className={`scenario-screen`} ref={ref}>
      <div className="illustration">
        { content.image && <img src={content.image} alt=""></img>}
      </div>
      <div className={`content state-${State[state]} ${reopeningCorrectScenario.current && "reopening"}`}>
        <div className="description">
          <ReactMarkdown source={props.texts[`description-${props.scenario}`]} />
          <div className="buttons">
            <button className="button right-align white" onClick={handleClickNextDescription}>
              {props.texts["button-next"]}
            </button>
          </div>
        </div>
        <div className="reactions">
          <h1>{props.texts["reactions"]}</h1>
          <Reactions
            scenario={props.scenario}
            texts={props.texts}
            selected={selectedReaction}
            onSelect={setSelectedReaction}
            reactions={content.reactions} 
          />
          <div className="buttons">
            <button className="button white" onClick={handleGoToDescription}>
              {props.texts["button-prev"]}
            </button>
            <button 
              className={`button ${selectedReaction ? "green" : ""}`} 
              onClick={handleGoToFeedback}
              disabled={!selectedReaction}
            >
             {props.texts["button-check"]}
            </button>
          </div>
        </div>
        <div className="feedback">
          <FeedbackTitle 
            texts={props.texts}
            correct={selectedReactionCorrect}
          />
          <p className={`reaction ${selectedReactionCorrect ? "correct" : "wrong"}`}>
           {selectedReactionText}
          </p>
          <h1 className="title">Feedback</h1>
          <ReactMarkdown source={props.texts[`feedback-${props.scenario}`]} />
          <div className="buttons">
            {reopeningCorrectScenario.current && 
              (<button className="button white" onClick={handleGoToDescription}>
                {props.texts["button-prev"]}
              </button>
            )}
            <button 
              className={`button green right-align`} 
              onClick={props.onClose}
            >
              {props.texts["button-continue"]}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="close">
        <CloseIcon onClick={props.onClose} />
    </div>
    </>
  )
}

export default ScenarioScreen;
