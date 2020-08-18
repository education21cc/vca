import React from 'react';
import BaseDialog from './BaseDialog';
import { ReactComponent as StarEmpty } from './../../common/images/star-empty.svg';
import './styles/introDialog.scss';

interface Props {
  headerText: string;
  descriptionText: string;
  starsToGainText: string;
  startText: string;
  onStart: () => void;
}

const IntroDialog = (props: Props) => {
  return (
    <BaseDialog className="intro-dialog">
      <div className="top">
        <h1>{props.headerText}</h1>
      </div>
      <div className="center">
        <section>{props.descriptionText}</section>
      </div>  
      <div className="bottom">
        <StarEmpty className="star"/>
        <span className="stars-to-gain">
          {props.starsToGainText}
        </span>
        <button className="green button start" onClick={props.onStart}>
          {props.startText}
        </button>
      </div>
    </BaseDialog>
  );
}

export default IntroDialog;