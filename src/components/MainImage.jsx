import React from 'react';

const MainImage = ({ isWorking }) => {
  // Assets in the public folder are served at the root path
  const src = isWorking ? '/疲憊上班族.gif' : '/大家可以回家拉.gif';
  
  return (
    <img 
      id="main-image" 
      src={src} 
      alt="狀態圖片" 
    />
  );
};

export default MainImage;
