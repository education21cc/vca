import React, {  useEffect } from 'react';
import './style/styles.css';
import { ReactComponent as CloseIcon } from './style/close.svg';

interface Props {
    disableBackButton?: boolean;
    gameDataReceived: (gameData: any) => void;
}

// start w  REACT_APP_PLAYER_MODE=true npm start

const PlayerBridge = (props: Props) => {   
    const {gameDataReceived, disableBackButton} = props;
    
    const back = () => {       
        send({
            type: 'back'
        });
    }

    useEffect(() => {
        if (!process.env.REACT_APP_PLAYER_MODE) {
            return;
        }
        let interval: NodeJS.Timeout;
        
        const check = () => {
            // @ts-ignore
            if (window.GAMEDATA) {
                clearInterval(interval);
                // @ts-ignore
                gameDataReceived(window.GAMEDATA);
            }
        }
        // cordova iab just sets window.GAMEDATA
        interval = setInterval(check, 250);

        // @ts-ignore
        window.setGameData = (gameData) => {
            send({
                type: 'setGameData',
                data: gameData
            });
        }
             
        // @ts-ignore
        window.exit = () => {
            send({
                type: 'exit'
            });
        }

        // @ts-ignore
        window.getGameData = () => {
            // @ts-ignore
            return window.GAMEDATA;
        }   

        return () => {
            clearInterval(interval);
        }
    }, [gameDataReceived]);

    if (!process.env.REACT_APP_PLAYER_MODE) {
        return null;
    }

    if (disableBackButton === true) {
        return null;
    }
    return (
        <div className="close">
            <CloseIcon onClick={back} />
        </div>
    )
}

export default PlayerBridge;

export const send = (payload: any) => {
    // @ts-ignore
    if (window.hasOwnProperty("webkit") && window.webkit.hasOwnProperty("messageHandlers")){
        var stringifiedMessageObj = JSON.stringify(payload);
        // Send to In App Browser context
        // @ts-ignore
        webkit.messageHandlers.cordova_iab.postMessage(stringifiedMessageObj);
    }
    else {
        // @ts-ignore
        window.parent.postMessage(payload, '*');
    }
}
