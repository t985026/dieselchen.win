import React from 'react';

const TimerBox = ({ name, shiftTime, timeLeft, isFinished }) => {
  return (
    <div className="timer-box">
      <h3>{name}</h3>
      <div className="shift-time">{shiftTime}</div>
      <div className={`timer ${isFinished ? 'finished' : ''}`}>
        {timeLeft}
      </div>
    </div>
  );
};

export default TimerBox;
