import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {

  const defaultHint = "Наведи курсор на пункт меню, щоб побачити короткий опис сторінки.";
  
  const [hint, setHint] = useState(defaultHint);

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <img src="/images/logo_for_hackathonHUB.png" alt="HackathonHub Logo" />
          <span>HackathonHub</span>
        </div>
        
        <nav>
          <ul className="nav-list">
            <li>
              <NavLink 
                to="/"
                onMouseEnter={() => setHint("Головна: переваги платформи, журі, FAQ та швидкі переходи.")}
                onMouseLeave={() => setHint(defaultHint)}
              >
                Головна
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/competitions"
                onMouseEnter={() => setHint("Змагання: активні хакатони, фільтрація, деталі та форма подання.")}
                onMouseLeave={() => setHint(defaultHint)}
              >
                Змагання
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/projects"
                onMouseEnter={() => setHint("Мої проєкти: статичні проєкти, подані заявки і керування ними.")}
                onMouseLeave={() => setHint(defaultHint)}
              >
                Мої проєкти
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/rating"
                onMouseEnter={() => setHint("Рейтинг: найсильніші учасники спільноти за балами та перемогами.")}
                onMouseLeave={() => setHint(defaultHint)}
              >
                Рейтинг
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      
      <p id="nav-hint" className="nav-hint">{hint}</p>
    </header>
  );
}