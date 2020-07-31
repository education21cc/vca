import React from 'react';
import './styles/finderBox.css';
import { FinderContent } from 'data/Content';

interface Props {
    content: FinderContent;
    foundSituations: string[];
}

const FinderBox = (props: Props) => {
    return (
        <div className="finder-box">
            {`${props.content.instruction} (${props.content.situations.length - props.foundSituations.length})`} 
        </div>
    )
}

export default FinderBox;