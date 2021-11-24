import React from 'react';
import './styles/scenariosBox.scss';
import { Scenario } from 'data/Content';

interface Props {
  scenarios: { [key: string]: Scenario }
  correctScenarios: string[];
  wrongScenarios: string[];
  nextText: string;
  instructionText: string;
  onComplete: () => void;
}

const ScenarioBox = (props: Props) => {
  const {scenarios, correctScenarios, wrongScenarios} = props;
  const scenariosNames = Object.keys(scenarios);
  const solvedScenarios = [...correctScenarios, ...wrongScenarios]
  const disabled = (correctScenarios.length + wrongScenarios.length) < scenariosNames.length;
  return (
    <div className="scenarios-box">
      {`(${solvedScenarios.length}/${scenariosNames.length})`}
      <button className="green button" disabled={disabled} onClick={props.onComplete}>
        {props.nextText}
      </button>
    </div>
  )
}

export default ScenarioBox;
