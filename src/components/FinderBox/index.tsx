import React from 'react';
import { FinderContent } from 'data/Content';
import { useTranslationStore } from 'stores/translations';
import './styles/finderBox.scss';

interface Props {
  content: FinderContent;
  foundSituations: string[];
  onOpenGame: () => void;
}

const FinderBox = (props: Props) => {
  const { getText } = useTranslationStore();
  const { foundSituations, content, onOpenGame } = props;
  const disabled = foundSituations.length < content.situations.length;

  return (
    <div className="finder-box">
      {getText("finder-instruction")}
      {`(${foundSituations.length}/${content.situations.length})`}
      <button className="green button" disabled={disabled} onClick={onOpenGame}>
        {getText("button-next")}
      </button>
    </div>
  )
}

export default FinderBox;
