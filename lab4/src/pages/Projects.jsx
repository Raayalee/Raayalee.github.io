import React, { useCallback, useEffect, useState } from 'react';
import ApplicationForm from '../components/ApplicationForm';
import useAppData from '../hooks/useAppData';
import { deleteApplicationById, getUserApplications } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState('');

  const normalizeReadError = (error) => {
    const code = error?.code || '';

    const map = {
      'permission-denied': 'Немає доступу до списку заявок у Firestore. Перевірте firestore.rules і deploy.',
      'failed-precondition': 'Для запиту заявок у Firestore потрібен composite index.',
      'unauthenticated': 'Потрібно увійти в акаунт повторно, щоб отримати заявки.',
      'network-request-failed': 'Мережевий збій під час завантаження заявок.',
      'aborted': 'Запит заявок було перервано. Спробуйте ще раз.',
    };

    return map[code] || `${code || 'firestore-error'}: ${error?.message || 'Не вдалося завантажити заявки з Firestore.'}`;
  };

  const loadApplications = useCallback(async (optimisticApplication = null) => {
    if (!user?.uid) {
      setApplications([]);
      setApplicationsLoading(false);
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError('');

    try {
      const fetchedApplications = await getUserApplications(user.uid);
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
  }, [user?.uid]);

  const { data, loading, error } = useAppData();
  const hackathons = data?.hackathons || [];

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleDelete = async (id) => {
    if (window.confirm("Видалити цю заявку без можливості відновлення?")) {
      try {
        await deleteApplicationById(id);
        setApplications((prev) => prev.filter((app) => app.id !== id));
      } catch {
        setApplicationsError('Не вдалося видалити заявку.');
      }
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