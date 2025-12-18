import React, { useState, useEffect, useRef } from 'react';
import TimerBox from './components/TimerBox';
import Quote from './components/Quote';
import Popup from './components/Popup';
import BlogLink from './components/BlogLink';
import MainImage from './components/MainImage';
import './App.css'; // Ensure CSS is imported

// Helper for sound
const playDingSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1); 

        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
        console.error("Audio play failed", e);
    }
};

// Animation helpers
const createConfetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#ff69b4', '#95e1d3'];
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
};

const createBalloon = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#ff69b4', '#95e1d3'];
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = Math.random() * 90 + 5 + 'vw';
    balloon.style.top = '100vh';
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.setProperty('--float-x', (Math.random() - 0.5) * 200 + 'px');
    balloon.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(balloon);
    setTimeout(() => balloon.remove(), 5000);
};

const triggerCelebration = () => {
    for (let i = 0; i < 100; i++) setTimeout(createConfetti, i * 50);
    for (let i = 0; i < 20; i++) setTimeout(createBalloon, i * 200);

    const interval = setInterval(() => {
        createConfetti();
        if (Math.random() > 0.7) createBalloon();
    }, 300);

    setTimeout(() => clearInterval(interval), 5000);
};

// Quotes
const offworkQuotes = [
    '終於可以回家了！', '回家吃飯囉～', '下班萬歲！', '自由的感覺真好！',
    '今天辛苦了！', '回家的路上最美麗', '終於解放了！', '家，我回來了！',
    '打卡下班，開心回家', '又是充實的一天', '期待已久的下班時刻', '準備享受自己的時間了'
];

const workQuotes = [
    '明明昨天還好好的啊!?', '今天又是充滿挑戰的一天...', '咖啡...需要更多咖啡...',
    '為什麼周一這麼快就到了', '深呼吸，你可以的！', '距離下班還有好久...',
    '又是努力搬磚的一天', '加油！撐過今天就好', '會議怎麼這麼多啊',
    '想念被窩的溫暖', '這個 bug 怎麼還在...', '堅持住，等等就下班了'
];

// Shifts
const shifts = [
    { id: 'timer-normal', name: '正常班', startHour: 8, startMinute: 50, endHour: 17, endMinute: 30 },
    { id: 'timer-late', name: '晚班', startHour: 9, startMinute: 50, endHour: 18, endMinute: 30 },
    { id: 'timer-finance', name: '金控', startHour: 9, startMinute: 0, endHour: 18, endMinute: 0 }
];

function App() {
    const [timers, setTimers] = useState({});
    const [isWorking, setIsWorking] = useState(false);
    const [quote, setQuote] = useState('');
    const [showRestingPopup, setShowRestingPopup] = useState(false);
    const [showOffWorkPopup, setShowOffWorkPopup] = useState(false);
    
    // Refs to track state without triggering re-renders for logic checks
    const restingClosedRef = useRef(false);
    const offWorkClosedRef = useRef(false);
    const prevOffWorkStateRef = useRef(false);
    const celebrationTriggeredRef = useRef({});

    useEffect(() => {
        const updateTick = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const day = now.getDay();
            const totalMinutes = currentHour * 60 + currentMinute;

            // 1. Update Timers & Check Working Status
            const newTimers = {};
            let anyoneWorking = false;

            shifts.forEach(shift => {
                const startTime = new Date();
                startTime.setHours(shift.startHour, shift.startMinute, 0, 0);
                const endTime = new Date();
                endTime.setHours(shift.endHour, shift.endMinute, 0, 0);

                let timeLeft;
                let isFinished = false;

                if (now < startTime) {
                    const diff = endTime - now;
                    timeLeft = formatTime(diff);
                } else if (now >= startTime && now < endTime) {
                    anyoneWorking = true;
                    const diff = endTime - now;
                    timeLeft = formatTime(diff);

                    // Check for near end
                     if (diff <= 1000 && diff > 0) {
                        celebrationTriggeredRef.current[shift.id] = false;
                     }

                } else {
                    timeLeft = '回家';
                    isFinished = true;
                    
                    if (celebrationTriggeredRef.current[shift.id] === undefined) {
                         // Initialize if undefined (first run might be after work)
                         celebrationTriggeredRef.current[shift.id] = true;
                    } else if (celebrationTriggeredRef.current[shift.id] === false) {
                        celebrationTriggeredRef.current[shift.id] = true;
                        triggerCelebration();
                    }
                }

                newTimers[shift.id] = { timeLeft, isFinished, shiftTime: `${shift.endHour}:${shift.endMinute.toString().padStart(2, '0')}` };
            });

            setTimers(newTimers);
            
            // 2. Update IsWorking State & Quote (Only if changed to avoid jitter)
            if (isWorking !== anyoneWorking) {
                setIsWorking(anyoneWorking);
                const quotes = anyoneWorking ? workQuotes : offworkQuotes;
                setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
            } else if (!quote) {
                 // Initial quote
                 const quotes = anyoneWorking ? workQuotes : offworkQuotes;
                 setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
            }


            // 3. Check Popups
            // Resting: 12:00 - 13:30
            const startRest = 12 * 60;
            const endRest = 13 * 60 + 30;
            const isRestingTime = totalMinutes >= startRest && totalMinutes < endRest;

            if (isRestingTime) {
                if (!restingClosedRef.current) setShowRestingPopup(true);
            } else {
                restingClosedRef.current = false;
                setShowRestingPopup(false);
            }

            // Off Work: Weekday 17:30 - Next 07:00
            const isWeekdayEvening = (day >= 1 && day <= 5) && (totalMinutes >= 17 * 60 + 30);
            const isPostWorkMorning = (day >= 2 && day <= 6) && (totalMinutes < 7 * 60);
            const isOffWorkPopupTime = isWeekdayEvening || isPostWorkMorning;

            if (isOffWorkPopupTime) {
                if (!offWorkClosedRef.current) {
                    setShowOffWorkPopup(true);
                    if (!prevOffWorkStateRef.current) playDingSound();
                }
            } else {
                offWorkClosedRef.current = false;
                setShowOffWorkPopup(false);
            }
            prevOffWorkStateRef.current = isOffWorkPopupTime;
        };

        const intervalId = setInterval(updateTick, 1000);
        updateTick(); // Run immediately

        return () => clearInterval(intervalId);
    }, [isWorking, quote]); // dependencies minimal check

    const formatTime = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <>
            <MainImage isWorking={isWorking} />

            <div id="countdown">
                <div id="timers-container">
                    {shifts.map(shift => (
                        <TimerBox
                            key={shift.id}
                            name={shift.name}
                            shiftTime={timers[shift.id]?.shiftTime || '...'}
                            timeLeft={timers[shift.id]?.timeLeft || '00:00:00'}
                            isFinished={timers[shift.id]?.isFinished}
                        />
                    ))}
                </div>
            </div>

            <BlogLink />
            <Quote text={quote} isWorking={isWorking} />

            <Popup 
                isOpen={showRestingPopup} 
                onClose={() => { setShowRestingPopup(false); restingClosedRef.current = true; }}
                title="😴 休息中"
                titleColor="#ff6b6b"
                content={<p>現在是午休時間 (12:00 - 13:30)<br/>請勿打擾，正在充電...</p>}
                icon="🍱🍵"
                buttonColor="#ff6b6b"
                buttonText="好，我知道了"
            />

            <Popup 
                isOpen={showOffWorkPopup} 
                onClose={() => { setShowOffWorkPopup(false); offWorkClosedRef.current = true; }}
                title="🎉 下班啦！"
                titleColor="#4ecdc4"
                content={
                    <>
                        <p>現在時間 17:30</p>
                        <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#4ecdc4' }}>該打卡下班啦</p>
                        <p className="sub-text">好好休息，明天見！</p>
                    </>
                }
                icon="🏃‍♂️💨"
                buttonColor="#4ecdc4"
                buttonText="下班！"
            />
        </>
    );
}

export default App;
