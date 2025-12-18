import React from 'react';

const Popup = ({ isOpen, onClose, title, titleColor, content, icon, buttonColor, buttonText }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay show" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: titleColor }}>{title}</h2>
        {content}
        <div style={{ fontSize: '3rem', marginTop: '20px' }}>{icon}</div>
        <button 
          className="popup-close-btn" 
          style={{ backgroundColor: buttonColor }} 
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Popup;
