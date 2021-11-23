import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/all';
import sound from 'pixi-sound';
import { Hotspot, Scenario } from 'data/Content';
import ReactMarkdown from 'react-markdown';
import Reactions from './Reactions';
import FeedbackTitle from './FeedbackTitle';
import { ReactComponent as BackIcon } from './styles/back.svg';
import { ReactComponent as CloseIcon } from './styles/close.svg';

import "./styles/scenarioScreen.scss";

gsap.registerPlugin(TextPlugin);

interface Props {
  scenario: string;
  content: Scenario;
  texts: {[key: string]: string};
  selectedReaction?: string; // When reaction has been set correctly before
  onCorrectReaction: (index: string) => void;
  onWrongReaction: (index: string) => void;
  onBack: () => void;
}

enum State {
  description,
  reactions,
  feedback,
}

const parseUrl = (url: string, texts: {[key: string]: string}) => {
  // url can be either a direct path or a key in the translation section
  if (url.startsWith('http')){
    return url;
  }
  return texts[url];
}

const ScenarioScreen = (props: Props) => {
  const {content, texts} = props;
  const ref = useRef<HTMLDivElement>(null);
  const reopeningCorrectScenario = useRef<boolean>(!!props.selectedReaction);
  const [state, setState] = useState(State.description);
  const [image, setImage] = useState<string>(); // zoomed in image
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
        props.onCorrectReaction(selectedReaction!);
      } else {
        sound.play('wrong');
        props.onWrongReaction(selectedReaction!);
      }
    }, 500);
  }

  useEffect(() => {
    const slideTransitionTime = 500;
    const timeout = setTimeout(() => {
      ref.current?.querySelector('.content')?.scroll({top: 0, left: 0, behavior: 'smooth' });
    }, slideTransitionTime);
    return () => {
      clearTimeout(timeout);
    }
  }, [state]);

  useEffect(() => {
    sound.add('correct', `${process.env.PUBLIC_URL}/sound/correct.mp3`);
    sound.add('wrong', `${process.env.PUBLIC_URL}/sound/wrong.mp3`);
  }, []);

  // shown on the feedback page
  const selectedReactionText = useMemo(() => {
    if (!selectedReaction) return "";
    const id = content.reactions.find(r => r.id === selectedReaction)?.id;
    return texts[`reaction-${props.scenario}-${id}`];
  }, [content.reactions, props.scenario, texts, selectedReaction]);

  const selectedReactionCorrect = useMemo(() => {
    if (!selectedReaction) return false;
    return content.reactions.find(r => r.id === selectedReaction)?.correct === true;
  }, [content.reactions, selectedReaction]);

  const handleHotspotClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Zoom in on image
    if((event.target as HTMLElement).tagName === "IMG") {
      const path = (event.target as HTMLImageElement)?.getAttribute("data-img");
      if (path) {
        setImage(path);
      }
    }
  };

  const handleCloseImage = () => {
    setImage(undefined);
  }

  const imageUrl = useMemo(() => {

    if (content.image && state !== State.feedback) {
      return parseUrl(content.image, texts);
    }
    if (content.imageFeedback && state === State.feedback) {
      return parseUrl(content.imageFeedback, texts);
    }
    return null;
  }, [content.image, content.imageFeedback, state, texts]);

  return (
    <>
    <div className={`scenario-screen`} ref={ref}>
      <div className="illustration">
        <div className="scaler" >
          { imageUrl && <img src={imageUrl} alt="" ></img> }
          { ( content.hotspots && state !== State.feedback
            ) && content.hotspots.map((h: Hotspot) => {
            return (
              <img
                className="hotspot"
                key={parseUrl(h.image, texts)}
                style={{
                  left: `${h.left}%`,
                  top: `${h.top}%`,
                  width: `${h.width}%`,
                }}
                alt=""
                data-img={parseUrl(h.image, texts)}
                onClick={handleHotspotClick}
                src={parseUrl(h.hotspot, texts)}
              />
            )
          })}
        </div>
      </div>
      <div className={`content state-${State[state]} ${reopeningCorrectScenario.current ? "reopening" : ""}`}>
        <div className="description" >
          <ReactMarkdown source={texts[`description-${props.scenario}`]} />
          <div className="buttons">
            <button className="button right-align white" onClick={handleClickNextDescription}>
              {texts["button-next"]}
            </button>
          </div>
        </div>
        <div className="reactions">
          <h1>{texts["reactions"]}</h1>
          <Reactions
            scenario={props.scenario}
            texts={texts}
            selected={selectedReaction}
            onSelect={setSelectedReaction}
            reactions={content.reactions}
          />
          <div className="buttons">
            <button className="button white" onClick={handleGoToDescription}>
              {texts["button-prev"]}
            </button>
            <button
              className={`button ${selectedReaction ? "green" : ""}`}
              onClick={handleGoToFeedback}
              disabled={!selectedReaction}
            >
             {texts["button-check"]}
            </button>
          </div>
        </div>
        <div className="feedback">
          <FeedbackTitle
            texts={texts}
            correct={selectedReactionCorrect}
          />
          <p className={`reaction ${selectedReactionCorrect ? "correct" : "wrong"}`}>
           {selectedReactionText}
          </p>
          <h1 className="title">{texts["feedback"]}</h1>
          <ReactMarkdown source={texts[`feedback-${props.scenario}`]} />
          <div className="buttons">
            {reopeningCorrectScenario.current &&
              (<button className="button white" onClick={handleGoToDescription}>
                {texts["button-prev"]}
              </button>
            )}
            <button
              className={`button green right-align`}
              onClick={props.onBack}
            >
              {texts["button-continue"]}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="close">
        <BackIcon onClick={props.onBack} />
    </div>
    { image && (<div className="image">
      <img src={image} alt="img" />
      <div className="close-image">
        <CloseIcon onClick={handleCloseImage} />
      </div>
    </div>)}
    </>
  )
}

export default ScenarioScreen;
