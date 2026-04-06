import React, { useState, useEffect } from 'react';
import ApplicationForm from '../components/ApplicationForm';
import { hackathons } from '../data/appData';

export default function Projects() {

  const [applications, setApplications] = useState([]);

  const loadApplications = () => {
    const saved = JSON.parse(localStorage.getItem('applications') || '[]');
    setApplications(saved);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Видалити цю заявку без можливості відновлення?")) {
      const updatedApps = applications.filter(app => app.id !== id);
      localStorage.setItem('applications', JSON.stringify(updatedApps));
      setApplications(updatedApps); 
    }
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "дата невідома";
    return date.toLocaleString("uk-UA", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <main>
      <section>
        <h1>Мої проєкти</h1>
        <p>Статус ваших робіт і поданих заявок.</p>

        <div className="project-list">
          <article className="project-card">
            <div className="project-top">
              <h3>Educational Intelligence</h3>
              <span className="status status-progress">Завершено</span>
            </div>
            <p>AI-помічник для навчання та автоматизації відповідей студентам. Поточний етап: підготовка до подання заявки.</p>
          </article>

          <article className="project-card">
            <div className="project-top">
              <h3>Uni Club</h3>
              <span className="status status-submitted">Завершено</span>
            </div>
            <p>Адаптивний інтерфейс платформи змагань із сучасною навігацією та мобільною версією.</p>
          </article>

          <article className="project-card">
            <div className="project-top">
              <h3>City Data Insights</h3>
              <span className="status status-done">Завершено</span>
            </div>
            <p>Аналітичний сервіс для візуалізації відкритих міських даних і створення міні-дашбордів.</p>
          </article>
        </div>

        <h2>Подані заявки</h2>
        <div id="submitted-projects" className="submitted-grid">
          {applications.length === 0 ? (
            <p>Поки що немає поданих заявок.</p>
          ) : (
            applications.map((app) => (
              <article key={app.id} className="submitted-card">
                <div className="submitted-top">
                  <h4>{app.project}</h4>
                  <span className="status status-submitted">ПОДАНО</span>
                </div>
                <p><strong>Хакатон:</strong> {app.hackathon}</p>
                <p><strong>Автор:</strong> {app.name} • {app.email}</p>
                <p>{app.idea}</p>
                <p><small>Подано: {formatDate(app.createdAt)}</small></p>
                <button 
                  className="btn-danger" 
                  type="button" 
                  onClick={() => handleDelete(app.id)}
                >
                  Видалити заявку
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="application-panel">
        <h2>Подати нову заявку</h2>
        <p>Форма синхронізується з “Змаганнями”. Після подання картка з'явиться в блоці “Подані заявки”.</p>
        
        <ApplicationForm hackathons={hackathons} onSuccess={loadApplications} />
      </section>
    </main>
  );
}