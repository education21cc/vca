import { ScenarioReaction } from 'data/Content';
import React from 'react';
import { useTranslationStore } from 'stores/translations';

interface Props {
  scenario: string;
  reactions: ScenarioReaction[];
  selected?: string;
  onSelect: (id: string) => void;
}

const Reactions = (props: Props) => {
  const { getText } = useTranslationStore();
  return (
    <ul>
      {props.reactions.map(r => {
        const handleClick = () => {
          props.onSelect(r.id);
        }
        return (
          <li key={r.id} onClick={handleClick} className={`${props.selected === r.id ? "selected": ""}`}>
            {getText(`reaction-${props.scenario}-${r.id}`)}
          </li>
        )
      })}
    </ul>
  );
}

export default Reactions;
