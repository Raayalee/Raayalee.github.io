import React, { useState, useEffect } from 'react';

export default function HackathonCard({ hackathon, onOpenModal }) {
  const [timerText, setTimerText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadline = new Date(hackathon.deadlineIso).getTime();
      const now = Date.now();
      const diffMs = deadline - now;

      if (diffMs > 0 && diffMs < 3 * 24 * 60 * 60 * 1000) {
        setIsUrgent(true);
      } else {
        setIsUrgent(false);
      }

      if (diffMs <= 0) {
        setTimerText('Хакатон завершено');
        setIsFinished(true);
        return true;
      } else {
        const total = Math.floor(diffMs / 1000);
        const days = Math.floor(total / 86400);
        const hours = Math.floor((total % 86400) / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;

        const pad = (val) => (val < 10 ? `0${val}` : val);
        setTimerText(`До завершення: ${days}д. ${hours}год. ${pad(minutes)}хв. ${pad(seconds)}с`);
        setIsFinished(false);
        return false;
      }
    };

    const finished = calculateTimeLeft();
    let interval;
    if (!finished) {
      interval = setInterval(calculateTimeLeft, 1000);
    }
    return () => clearInterval(interval);
  }, [hackathon.deadlineIso]);

  const cardClasses = `hackathon-card ${isUrgent ? 'urgent' : ''}`;

  return (
    <article className={cardClasses}>
      <div className="project-top">
        <h3 style={{ margin: 0 }}>{hackathon.title}</h3>
        <span className="status status-progress">
          {hackathon.category}
        </span>
      </div>
      
      <p className={isFinished ? "timer timer-finished" : "timer"}>
        ⏳ {timerText}
      </p>
      
      <p><strong>Тема:</strong> {hackathon.topic || hackathon.category}</p>
      <p><strong>Дедлайн:</strong> {hackathon.date}</p>
      <p>{hackathon.short}</p>

      <button 
        onClick={() => onOpenModal(hackathon)} 
        className="btn-primary"
        style={{ marginTop: '16px' }}
        disabled={isFinished}
      >
        Детальніше
      </button>
    </article>
  );
}