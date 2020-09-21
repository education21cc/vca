import React from 'react';
import './styles/scenariosBox.scss';
import { Scenario } from 'data/Content';

interface Props {
    scenarios: { [key: string]: Scenario }
    solvedScenarios: string[];
    nextText: string;
    instructionText: string;
    onComplete: () => void;
}

const ScenarioBox = (props: Props) => {
    const {scenarios, solvedScenarios} = props;
    const scenariosNames = Object.keys(scenarios);
    const disabled = solvedScenarios.length < scenariosNames.length;

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