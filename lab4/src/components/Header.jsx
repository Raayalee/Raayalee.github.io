import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthReady } = useAuth();

  const defaultHint = "Наведи курсор на пункт меню, щоб побачити короткий опис сторінки.";
  
  const [hint, setHint] = useState(defaultHint);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch {
      setHint('Не вдалося вийти з акаунта. Спробуйте ще раз.');
    }
  };

  const authStatus = !isAuthReady
    ? 'Перевірка статусу...'
    : isAuthenticated
      ? 'Авторизовано'
      : 'Гість';

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

        <div className="header-auth">
          <span className="header-auth-status">{authStatus}</span>

          {isAuthenticated ? (
            <button type="button" className="btn btn-secondary auth-action" onClick={handleLogout}>
              Вийти
            </button>
          ) : (
            <NavLink to="/auth" className="btn btn-secondary auth-action">
              Увійти
            </NavLink>
          )}
        </div>
      </div>
      
      <p id="nav-hint" className="nav-hint">{hint}</p>
    </header>
  );
}