import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { gsap, Linear, Sine } from 'gsap'
import { TextPlugin } from 'gsap/all';
import sound from 'pixi-sound';
import SituationScene from '../pixi/SituationScene';
import "./styles/scenarioScreen.css";
import { SceneElement, Scenario, SequenceItemType } from 'data/Content';
import { ReactComponent as CloseIcon } from '../playerBridge/style/close.svg';

gsap.registerPlugin(TextPlugin);
const SPEED_MODIFIER = 1; // for debugging

interface Props {
  content: Scenario;
  setCorrectAnswer: (index: number) => void;
  onClose: () => void;
  selectedAnswer?: number; // When answer has been set correctly before
}

const ScenarioScreen = (props: Props) => {
  const {content, selectedAnswer = null} = props;
  console.log(content)
  const {imageBaseUrl} = content;
  const [selectedOption, selectOption] = useState<number | null>(selectedAnswer);
  // Reaction based on current selection
  const reaction = useMemo(() => {
    if (selectedOption === null) return null;
    return props.content.reactions[selectedOption];
  }, [props.content.reactions, selectedOption]);
  
  const [confirmed, setConfirmed] = useState(selectedAnswer != null);
  const [sceneConfig, setSceneConfig] = useState<SceneElement[]>(reaction?.scene || props.content.scene);
  const balloonRef = useRef<HTMLDivElement>(null);
  const balloonArrowRef = useRef<HTMLDivElement>(null);
  const balloonTextRef = useRef<HTMLSpanElement>(null);
  const insetRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const handleOptionClick = (element: HTMLLIElement, index: number) => {
    element.className = "animating";
    if (!ref.current) return;

    // Fade out the non selected options
    const otherOptions = ref.current!.querySelectorAll(".options .normal");
    gsap.to(otherOptions, {
      duration: 0.5,
      opacity: 0,
      ease: Linear.easeNone,
    });

    // Move current option to top
    var parentTop = ref.current!.querySelector(".options")!.getBoundingClientRect().top; // Initial parent's top distance from the top of the viewport;
    var childTop = element.getBoundingClientRect().top;
    var distance = Math.abs(parentTop - childTop);

    gsap.to(element, {
      duration: 0.5,
      top: -distance,
      ease: Linear.easeNone,
      onComplete: () => {
        setTimeout(() => {
          element.className = "";
          selectOption(index);
        }, 250);
      }
    });
  };

  useEffect(() => {
    sound.add('correct', `${process.env.PUBLIC_URL}/sound/correct.mp3`);    
    sound.add('wrong', `${process.env.PUBLIC_URL}/sound/wrong.mp3`);
  }, []);

  const sequence = useRef<gsap.core.Timeline>();
  const playSequence = useCallback(() => {
    const tl = gsap.timeline();
    sequence.current = tl;
    const balloonText = balloonTextRef!.current!;
    const inset = insetRef.current!;
    gsap.killTweensOf(balloonText);
    gsap.killTweensOf(balloonRef.current);
    gsap.killTweensOf(inset);

    // Reset
    if (nextButtonRef.current) nextButtonRef.current!.removeAttribute('style');
    balloonRef.current!.removeAttribute('style');
    balloonArrowRef.current!.removeAttribute('style');
    inset.removeAttribute('style');

    // Build timeline
    balloonText.innerHTML = content.sequence[0].text;

    // All the sequences
    content.sequence.forEach((sequenceItem, index) => {

      const onStart = () => {
        if (balloonArrowRef.current) {
          balloonArrowRef.current.style.visibility = sequenceItem.type === SequenceItemType.speech ? 'visible' : 'hidden';
        }
        if (sequenceItem.type !== SequenceItemType.image) {
          if (balloonRef.current) {
            balloonRef.current!.className = `balloon ${sequenceItem.type}`;
          }
          balloonText.innerHTML = sequenceItem.text;
          
          if (sequenceItem.balloonArrowPos && balloonArrowRef.current) {
            balloonArrowRef.current!.style.right = `${sequenceItem.balloonArrowPos}%`;  
          }
          positionArrow();
        }

        if (sequenceItem.scene) {
          setSceneConfig(sequenceItem.scene);
        }
      } 

      tl.add(`seq-${index}`);
      switch (sequenceItem.type) {
        case SequenceItemType.caption:
          tl.to(balloonText, {
            onStart,
            duration: sequenceItem.text.length * 0.025 / SPEED_MODIFIER,
            text: {
              value: sequenceItem.text, 
              oldClass: "hidden",
              newClass: "visible"
            },
            ease: Linear.easeNone,
          });
          tl.to(balloonText, { duration: 3});
          break;
        case SequenceItemType.speech:
          tl.to(balloonText, {
            onStart,
            duration: sequenceItem.text.length * 0.045 / SPEED_MODIFIER,
            ease: Linear.easeNone,
          });
          break;
        case SequenceItemType.image:
          tl.to(balloonRef.current, {
            onStart,
            duration: .25,
            autoAlpha: 0,
            ease: Linear.easeNone,
          });
          tl.to(balloonArrowRef.current, {
            duration: .25,
            autoAlpha: 0,
            ease: Linear.easeNone,
          }, "-=.25");
          break;
      }
    });

    tl.add(`seq-${content.sequence.length}`);

    // Fade the balloon out
    tl.to(balloonRef.current, {
      delay: 1 / SPEED_MODIFIER,
      duration: .5,
      autoAlpha: 0,
      ease: Linear.easeNone,
    });

    tl.add('end');
    // Slide inset in
    tl.to(inset, {
      onStart: () => {
        if (nextButtonRef.current) 
          nextButtonRef.current!.style.display = "none";

        if (balloonArrowRef.current)
          balloonArrowRef.current.style.visibility = 'hidden';
      },
      duration: .5,
      left: 0,
      ease: Sine.easeInOut,
    }, "-=1");
  }, [content.sequence]);

  const positionArrow = () => {
    if (!balloonRef.current || !balloonArrowRef.current) return;
    const rect = balloonRef.current.getBoundingClientRect();
    balloonArrowRef.current.style.top = `${balloonRef.current.offsetTop + rect.height}px`;
  }

  useEffect(() => {
    window.addEventListener('resize', positionArrow);
    return () => {
      window.removeEventListener('resize', positionArrow);
    }
  }, []);

  const handleSkipSequenceStep = () => {
    if (!sequence.current) return;
    const currentIndex = parseInt(sequence.current.currentLabel().substring('seq-'.length));
    if (isNaN(currentIndex)) return;
    // @ts-ignore
    sequence.current.seek(`seq-${currentIndex+1}`, false);
  }

  useEffect(() => {
    if (selectedAnswer) {
      insetRef.current!.style.left = '0px';
      balloonRef.current!.style.visibility = 'hidden';
    }
    else {
      playSequence();
    }
  }, [content.sequence, playSequence, selectedAnswer]);

  const handleReplay = () => {
    setSceneConfig(props.content.scene);
    selectOption(null);
    setConfirmed(false);
    playSequence();
  }

  const handleYes = () => {
    setConfirmed(true);
    setSceneConfig(reaction!.scene);

    if (reaction!.correct) {
      sound.play('correct');
      props.setCorrectAnswer(selectedOption!);
    } else {
      sound.play('wrong');
    }
  }

  const handleNo = () => {
    if (!sequence.current) return;
    setSceneConfig(props.content.scene);
    selectOption(null);
    setConfirmed(false);
    // @ts-ignore
    sequence.current.seek('end', false);
  }

  const renderReaction = () => {
    if (!reaction) {
      return null;
    }
    if (!confirmed) {
      return (
        <>
          <p>{reaction.confirmText}</p>
          <p className="yesno">
            <button onClick={handleYes}>yes</button>
            <span className="motivation">{reaction.yesText}</span>
          </p>
          <p className="yesno">
            <button onClick={handleNo}>no</button>
            <span className="motivation">{reaction.noText}</span>
          </p>
        </>
      )
    }
    return (
      <>
        { reaction?.correct && (<p className="right-option">You’ve chosen the right option!</p>)}
        {reaction.text.split("\n").map(p => <p key={p.substring(0, 10)}>{p}</p>)}
        { (!reaction?.correct) && (
         <button onClick={handleNo} className="button-replay">
           try again
         </button>
        )}     
      </>
    )
  }

  const renderOption = (option: string, index: number) => {
    if (selectedOption === null) {
      // Nothing selected, render all
      return (
        <li key={option} className="normal" onClick={(e) => handleOptionClick(e.currentTarget, index)} >
          <div className="text">
            {option}
          </div>
        </li>
      );
    }
    if (selectedOption === index) {
      // Render only selected option
      let className = 'selected';
      if (confirmed) {
        className = reaction?.correct ? "correct" : "wrong";
      }

      return (
        <li key={option} className={className} >
          <div className="text">
            {option}
          </div>
        </li>
      );
    }
  }

  const exit = () => {
    props.onClose();
  }

  return (
    <div className="scenario-screen" ref={ref}>
      <div className="title">
        <div className="close">
            <CloseIcon onClick={exit} />
        </div>
        {content.title}
      </div>
      <div className="situation" onClick={handleSkipSequenceStep}>
        { props.content.scene && (
          <SituationScene 
            sceneConfig={sceneConfig} 
            imageBaseUrl={imageBaseUrl}
          />
        )}
        <div className="inset" ref={insetRef} >
          <p>
            {content.description}
          </p>
          <ul className="options">
            {content.options.map((option, index) => renderOption(option, index))}
          </ul>
          { renderReaction() }
        </div> 
        <div className={`balloon`} ref={balloonRef}>
          <span ref={balloonTextRef}></span>
        </div>
        <div className="balloon-arrow" ref={balloonArrowRef} style={{visibility: 'hidden'}}/>
      </div>
      { !selectedOption && (
        <div className="controls-bottomright">
          <button className="button-replay" onClick={handleReplay}>
            replay
          </button>
          <button className="button-next" ref={nextButtonRef} onClick={handleSkipSequenceStep}>
            {">"}
          </button>
        </div>
      )}
    </div>
  )
}

export default ScenarioScreen;