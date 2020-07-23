import React from 'react';
import ReactModal from 'react-modal';
import './styles/modal.css';


interface Props {
  onClose: () => void;
}

const Modal = (props: Props) => {
  const { onClose} = props;

  const handleClose = () => {
    onClose();
  };


  return (
    <ReactModal
      isOpen={true}
      ariaHideApp={false}
      portalClassName="modal-portal"
      overlayClassName="modal-overlay"
      className="modal"
      onRequestClose={handleClose}
    >
      <>
        <div className="header">
          <h1>TEST </h1>
          <div className="modal-close" onClick={() => handleClose()}></div>
        </div>
        <iframe src="https://21cceducation.nl/content/webgl_portfolio/games/ConveyorGame/"></iframe>
      </>
    </ReactModal>  
  )
}

export default Modal;

