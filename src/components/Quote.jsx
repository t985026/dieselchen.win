import React from 'react';

const Quote = ({ text, isWorking }) => {
  return (
    <div 
      id="quote" 
      className={`show ${isWorking ? 'working' : 'offwork'}`}
    >
      {text}
    </div>
  );
};

export default Quote;
