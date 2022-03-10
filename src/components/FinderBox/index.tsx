import React from 'react';
import { FinderContent } from 'data/Content';
import './styles/finderBox.scss';

interface Props {
  content: FinderContent;
  instructionText: string;
  foundSituations: string[];
  nextText: string;
  onOpenGame: () => void;
}

const FinderBox = (props: Props) => {
  const disabled = props.foundSituations.length < props.content.situations.length;
  return (
    <div className="finder-box">
      {`${props.instructionText} (${props.foundSituations.length}/${props.content.situations.length})`}
      <button className="green button" disabled={disabled} onClick={props.onOpenGame}>
        {props.nextText}
      </button>
    </div>
  )
}

export default FinderBox;
