import React, { useEffect, useRef } from 'react';
import ReactModal from 'react-modal';
import './styles/modal.css';
import { Situation, ContentConfig } from 'data/Content';
import { GameData } from 'components/playerBridge/GameData';

interface GameDataEvent {
  data: {
    type: 'exit' | 'setGameData',
    data: GameData<any>;
  };
}

interface Props {
  content: ContentConfig;
  onClose?: () => void;
}

const IFrameModal = (props: Props) => {
  const { onClose, content} = props;
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleLoad = () => {
      // Send gamedata to iframe. Iframe needs to pick this up and serve it to the game when needed
      ref?.current?.contentWindow?.postMessage(content.data, '*');
    };

    const handleMessage = (event: GameDataEvent) => {
      switch (event.data.type) {
        case 'setGameData':
          // The iframe is sending a GameData to be stored
          break;
        case 'exit':
          if (onClose) { onClose(); }
          break;
      }
    };
console.log('hi')
    ref?.current?.addEventListener('load', handleLoad, true);
    window.addEventListener('message', handleMessage, true);

  }, [content.data, onClose]);

  return (
      <iframe src={content.url} ref={ref} title={content.url} className="iframe-content"></iframe>
  )
}

export default IFrameModal;

