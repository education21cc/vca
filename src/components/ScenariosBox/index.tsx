import React from 'react';
import './styles/scenariosBox.css';
import { Scenario } from 'data/Content';
import { ReactComponent as CheckSvg } from './styles/check.svg';

interface Props {
    scenarios: { [key: string]: Scenario }
    solvedScenarios: string[];
    //setScenarioSelected: React.Dispatch<React.SetStateAction<number | null>>;

}

const ScenarioBox = (props: Props) => {
    const {scenarios} = props;
    const scenariosNames = Object.keys(scenarios);

    const renderContent = (scenarioName: string, index: number) => {
        const scenario = scenarios[scenarioName];
        const completed = props.solvedScenarios[index] === undefined;
        const handleClick = () => {
           // props.setSituationSelected(index);
        }
        if (completed) {
            return (
                <li className="" onClick={handleClick} key={scenarioName}>
                    {/* {scenario.title} */}
                </li>
            )
        }

        return (
            <li className="completed" key={scenarioName}>
                <CheckSvg className="check" />
                {/* {scenario.title} */}
            </li>
        )
    }
    return (
        <div className="scenarios-box">
            <ul>
                {scenariosNames.map((scenarioName, index) => renderContent(scenarioName, index))}
            </ul>
        </div>
    )

    // return (
    //     <div className="Scenario-box">
    //         {/* {`${props.content.instruction} (${props.content.situations.length - props.foundSituations.length})`}  */}
    //     </div>
    // )
}

export default ScenarioBox;