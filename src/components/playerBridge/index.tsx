
import React, {  useEffect } from 'react';
import './style/styles.css';
import { ReactComponent as CloseIcon } from './style/close.svg';

interface Props {
  disableBackButton?: boolean;
  gameDataReceived: (gameData: any) => void;
}

export type GameEvent = {
  code: string,
  level?: number,
  additionalInfo?: string
}

declare global {
  interface Window {
    setGameData: (gameData: any) => void;
    storeGameEvent: (gameEvent: GameEvent) => void;
    getGameData: () => any
    GAMEDATA: any
  }
}

const PlayerBridge = (props: Props) => {
  const {gameDataReceived, disableBackButton} = props;

  useEffect(() => {
    /* Add the following to index.html
    <script>
      const receiveMessage = (msg) => {
        if (!msg.data.hasOwnProperty('content')){
            return;
        }
        window.GAMEDATA = msg.data;
      }
      window.addEventListener("message", receiveMessage, false);
    </script>
    */
    if (!process.env.REACT_APP_PLAYER_MODE) {
      return;
    }

    window.getGameData = () => {
      return window.GAMEDATA;
    }

    const check = () => {
      if (window.GAMEDATA) {
        clearInterval(interval);
        gameDataReceived(window.GAMEDATA);
      }
    }
    // cordova iab just sets window.GAMEDATA
    let interval = setInterval(check, 250);

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
      <CloseIcon onClick={exit} />
    </div>
  )
}

export default PlayerBridge;

const exit = () => {
  send({
    type: 'exit'
  });
}

window.setGameData = (gameData: any) => {
  send({
    type: 'setGameData',
    data: gameData
  });
}

window.storeGameEvent = (gameEvent: GameEvent) => {
  send({
    type: 'gameEvent',
    data: gameEvent
  });
}

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
