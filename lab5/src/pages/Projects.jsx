import React, { useCallback, useEffect, useState } from 'react';
import ApplicationForm from '../components/ApplicationForm';
import useAppData from '../hooks/useAppData';
import { getApplications } from '../api/applications';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState('');
  const [fromDate, setFromDate] = useState('');

  const normalizeReadError = (error) =>
    error?.message || 'Не вдалося завантажити заявки з сервера.';

  const loadApplications = useCallback(async (optimisticApplication = null) => {
    if (!user?.id) {
      setApplications([]);
      setApplicationsLoading(false);
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError('');

    try {
      const result = await getApplications(fromDate || null);
      const fetchedApplications = result?.items || [];
      if (optimisticApplication) {
        const filtered = fetchedApplications.filter((app) => app.id !== optimisticApplication.id);
        setApplications([optimisticApplication, ...filtered]);
      } else {
        setApplications(fetchedApplications);
      }
    } catch (error) {
      setApplicationsError(normalizeReadError(error));
      if (optimisticApplication) {
        setApplications((prev) => {
          const exists = prev.some((app) => app.id === optimisticApplication.id);
          return exists ? prev : [optimisticApplication, ...prev];
        });
      }
    } finally {
      setApplicationsLoading(false);
    }
  }, [user?.id, fromDate]);

  const { data, loading, error } = useAppData();
  const hackathons = data?.hackathons || [];

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const formatDate = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "дата невідома";
    return date.toLocaleString("uk-UA", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) return (
    <main>
      <section>
        <h1>Мої проєкти</h1>
        <p>Завантаження даних...</p>
      </section>
    </main>
  );

  if (error) return (
    <main>
      <section>
        <h1>Мої проєкти</h1>
        <p>Помилка завантаження даних: {error.message}</p>
      </section>
    </main>
  );

  return (
    <main>
      <section>
        <h1>Мої проєкти</h1>
        <p>Статус ваших робіт і поданих заявок.</p>

        <div className="form-row" style={{ alignItems: 'center' }}>
          <label className="field" style={{ marginBottom: 0 }}>
            <span>Показати заявки з дати</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setFromDate('')}
          >
            Скинути фільтр
          </button>
        </div>

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
        {applicationsError ? <p>{applicationsError}</p> : null}
        <div id="submitted-projects" className="submitted-grid">
          {applicationsLoading ? (
            <p>Завантаження заявок...</p>
          ) : applications.length === 0 ? (
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