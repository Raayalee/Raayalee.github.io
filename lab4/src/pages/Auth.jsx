import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser, saveUserProfile } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(() => location.state?.from?.pathname || '/projects', [location.state]);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const normalizeError = (error) => {
    if (!error?.code) {
      return 'Сталася помилка. Спробуйте ще раз.';
    }

    const map = {
      'auth/email-already-in-use': 'Цей email вже зареєстровано.',
      'auth/invalid-email': 'Некоректний формат email.',
      'auth/weak-password': 'Пароль має містити щонайменше 6 символів.',
      'auth/invalid-credential': 'Неправильний email або пароль.',
      'auth/user-not-found': 'Користувача з таким email не знайдено.',
      'auth/wrong-password': 'Неправильний пароль.',
      'auth/too-many-requests': 'Забагато спроб. Спробуйте пізніше.',
      'auth/operation-not-allowed': 'У Firebase не увімкнено вхід через Email/Password.',
      'auth/unauthorized-domain': 'Поточний домен не додано в Authorized domains Firebase Authentication.',
      'auth/network-request-failed': 'Мережевий збій. Перевірте інтернет-з’єднання та спробуйте знову.',
      'auth/invalid-api-key': 'Некоректна Firebase конфігурація (apiKey).',
      'auth/configuration-not-found': 'Firebase Authentication ще не налаштовано для цього проєкту.',
      'permission-denied': 'Немає доступу до Firestore. Перевірте firestore.rules.',
    };

    return map[error.code] || `${error.code}: Операцію не вдалося виконати. Перевірте дані і повторіть.`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage('❌ Заповніть email і пароль.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      if (mode === 'register') {
        const user = await registerUser(formData.email, formData.password);
        try {
          await saveUserProfile(user);
        } catch (profileError) {
          console.warn('User created in Firebase Auth, but profile sync failed:', profileError);
        }
        setMessage('✅ Реєстрація успішна. Виконуємо вхід...');
      } else {
        await loginUser(formData.email, formData.password);
        setMessage('✅ Вхід успішний.');
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setMessage(`❌ ${normalizeError(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main>
      <section className="application-panel" style={{ maxWidth: '620px', margin: '16px auto' }}>
        <h1>{mode === 'login' ? 'Вхід у систему' : 'Реєстрація'}</h1>
        <p>
          {mode === 'login'
            ? 'Увійдіть, щоб отримати доступ до сторінки “Мої проєкти”.'
            : 'Створіть акаунт для подання заявок і роботи з проєктами.'}
        </p>

        <div className="form-row" style={{ marginTop: 0 }}>
          <button
            type="button"
            className={mode === 'login' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMode('login')}
          >
            Вхід
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMode('register')}
          >
            Реєстрація
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Мінімум 6 символів"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          <div className="form-row">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? 'Зачекайте...'
                : mode === 'login'
                ? 'Увійти'
                : 'Зареєструватися'}
            </button>
            <p className="form-message" aria-live="polite">
              {message}
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
