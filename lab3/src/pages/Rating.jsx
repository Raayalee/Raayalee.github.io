import React, { useState } from 'react';
import useAppData from '../hooks/useAppData';

export default function Rating() {
  const [isVisible, setIsVisible] = useState(true);
  const { data, loading, error } = useAppData();
  const participants = data?.participants || [];

  return (
    <main>
      <section>
        <h1>Рейтинг</h1>
        <div className="rating-intro">
          <p>
            У цій таблиці зібрані найактивніші учасники нашої спільноти: люди, які стабільно
            показують якісний результат, працюють у командах та підтримують високий темп
            розвитку проєктів у хакатонах.
          </p>
        </div>

        <div className="rating-controls">
          <button 
            id="toggle-rating-btn" 
            className="btn btn-secondary" 
            type="button"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? 'Приховати рейтинг' : 'Показати рейтинг'}
          </button>
        </div>

        {isVisible && (
          loading ? (
            <p>Завантаження даних...</p>
          ) : error ? (
            <p>Помилка завантаження: {error.message}</p>
          ) : (
          <div id="rating-table-wrap" className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Учасник</th>
                  <th>Перемоги</th>
                  <th>Бали</th>
                </tr>
              </thead>
              <tbody id="rating-body">
                {participants.map((participant, index) => {
                  let bgColor = '#ffffff';
                  if (index === 0) bgColor = '#fff3bf';
                  else if (index === 1) bgColor = '#f1f5ff';

                  return (
                    <tr key={index} style={{ backgroundColor: bgColor }}>
                      <td>{participant.name}</td>
                      <td>{participant.wins}</td>
                      <td>{participant.points}</td>
                    </tr>
                  );
                  })}
              </tbody>
            </table>
          </div>
            )
        )}
      </section>
    </main>
  );
}