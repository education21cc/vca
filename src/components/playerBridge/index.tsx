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

    const send = (payload: any) => {
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

    const back = () => {       
        send({
            type: 'back'
        });
    }

    const exit = () => {       
        send({
            type: 'exit'
        });
    }

    useEffect(() => {
        if (!process.env.REACT_APP_PLAYER_MODE) {
            return;
        }
        let interval: NodeJS.Timeout;
        
        const check = () => {
            // @ts-ignore
            // @ts-ignore
            if (window.GAMEDATA) {
                clearInterval(interval);
                // @ts-ignore
                // @ts-ignore
                gameDataReceived(window.GAMEDATA);
            }
        }
        // cordova iab just sets window.GAMEDATA
        interval = setInterval(check, 250);

        const receiveMessage = (msg: any) => {
            clearInterval(interval);

            if (!msg.data.hasOwnProperty('content')){
                return;
            }
            // @ts-ignore
            window.GAMEDATA = msg.data;
            gameDataReceived(msg.data);
        }

        // @ts-ignore
        window.setGameData = (gameData) => {
            send({
                type: 'setGameData',
                data: gameData
            });
        }
               
        // @ts-ignore
        window.getGameData = () => {
            // @ts-ignore
            return window.GAMEDATA;
        }   
        window.addEventListener("message", receiveMessage, false);

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