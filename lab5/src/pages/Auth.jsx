import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useAuth();

  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(() => location.state?.from?.pathname || '/projects', [location.state]);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const normalizeError = (error) => {
    const status = error?.status;

    const map = {
      400: 'Некоректні дані. Перевірте email і пароль.',
      401: 'Неправильний email або пароль.',
      409: 'Цей email вже зареєстровано.',
      500: 'Помилка сервера. Спробуйте пізніше.'
    };

    if (status && map[status]) {
      return map[status];
    }

    return error?.message || 'Сталася помилка. Спробуйте ще раз.';
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
        const result = await registerUser(formData.email, formData.password);
        signIn(result.token, result.user);
        setMessage('✅ Реєстрація успішна. Виконуємо вхід...');
      } else {
        const result = await loginUser(formData.email, formData.password);
        signIn(result.token, result.user);
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
