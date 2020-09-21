import { ScenarioReaction } from 'data/Content';
import React from 'react';

interface Props {
  scenario: string;
  texts: {[key: string]: string};
  reactions: ScenarioReaction[];
  selected?: string;
  onSelect: (id: string) => void;
}

const Reactions = (props: Props) => {
  return (
      <ul>
        {props.reactions.map(r => {
          const handleClick = () => {
            props.onSelect(r.id);
          }
          return (
            <li key={r.id} onClick={handleClick} className={`${props.selected === r.id ? "selected": ""}`}>
              {props.texts[`reaction-${props.scenario}-${r.id}`]}
            </li>
          )
        })}
      </ul>
  );
}

export default Reactions;