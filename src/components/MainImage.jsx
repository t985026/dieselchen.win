import { useState, useEffect } from 'react';

const MainImage = ({ isWorking }) => {
  const [isLunchTime, setIsLunchTime] = useState(false);

  useEffect(() => {
    const checkLunchTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const totalMinutes = currentHour * 60 + currentMinute;

      // 午餐時間: 11:50 - 13:30
      const startLunch = 11 * 60 + 50;  // 11:50
      const endLunch = 13 * 60 + 30;     // 13:30
      const isLunch = totalMinutes >= startLunch && totalMinutes < endLunch;

      setIsLunchTime(isLunch);
    };

    // 每秒檢查一次
    const intervalId = setInterval(checkLunchTime, 1000);
    checkLunchTime(); // 立即執行一次

    return () => clearInterval(intervalId);
  }, []);

  // Assets in the public folder are served at the root path
  let src;
  if (isLunchTime) {
    src = '/吃午餐.gif';
  } else {
    src = isWorking ? '/疲憊上班族.gif' : '/大家可以回家拉.gif';
  }

  return (
    <img
      id="main-image"
      src={src}
      alt="狀態圖片"
    />
  );
};

export default MainImage;
