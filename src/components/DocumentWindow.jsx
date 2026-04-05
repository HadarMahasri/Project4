import React from 'react';
import TextDisplay from './TextDisplay';
import './DocumentWindow.css';

const DocumentWindow = ({ document, isActive, onClick, onClose }) => {
  const { fileName, textData } = document;
  
  const handleClose = (e) => {
    e.stopPropagation(); // prevent window from being clicked and set active immediately before closing
    onClose(document);
  };

  return (
    <div 
      className={`document-window ${isActive ? 'active' : ''}`}
      onClick={() => onClick(document.id)}
    >
      <div className="document-header">
        <span className="document-title">
          {fileName ? fileName : 'Untitled Document'}
        </span>
        <button className="btn-close-doc" onClick={handleClose} title="Close Document">
          ✕
        </button>
      </div>
      <div className="document-body">
        <TextDisplay text={textData} />
      </div>
    </div>
  );
};

export default DocumentWindow;
