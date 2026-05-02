import React, { useEffect, useRef, useState } from 'react';
import { createApplication } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function ApplicationForm({ hackathons, onSuccess }) {
  const { user } = useAuth();
  const accountEmail = user?.email || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hackathon: '',
    project: '',
    idea: ''
  });
  
  const [message, setMessage] = useState('');
  const [jsonPreview, setJsonPreview] = useState('JSON-preview: файл не імпортовано');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!accountEmail) return;

    setFormData((prev) => ({
      ...prev,
      email: prev.email || accountEmail,
    }));
  }, [accountEmail]);

  const normalizeFirestoreError = (error) => {
    const code = error?.code || '';

    const map = {
      'permission-denied': 'Немає доступу до Firestore. Перевірте firestore.rules і чи задеплоєні вони.',
      'unauthenticated': 'Потрібно увійти в акаунт ще раз і повторити подання заявки.',
      'failed-precondition': 'Для цього запиту у Firestore потрібен індекс або інша конфігурація.',
      'invalid-argument': 'Дані заявки мають некоректний формат.',
      'network-request-failed': 'Мережевий збій. Перевірте інтернет і повторіть спробу.',
    };

    return map[code] || `${code || 'firestore-error'}: ${error?.message || 'Не вдалося зберегти заявку.'}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.hackathon || !formData.project || !formData.idea) {
      setMessage('❌ Будь ласка, заповніть всі обов\'язкові поля.');
      return;
    }

    if (!user?.uid || !accountEmail) {
      setMessage('❌ Для подання заявки потрібно увійти в акаунт.');
      return;
    }

    const normalizedEmail = accountEmail.trim();

    const newApplication = {
      name: formData.name,
      email: normalizedEmail,
      hackathon: formData.hackathon,
      project: formData.project,
      idea: formData.idea,
    };

    try {
      const applicationId = await createApplication(newApplication, user);
      const submittedApplication = {
        id: applicationId,
        ...newApplication,
        uid: user.uid,
        userEmail: normalizedEmail,
        createdAt: new Date().toISOString(),
      };

      setMessage('✅ Заявку успішно подано!');
      setFormData({
        name: '',
        email: user.email || '',
        hackathon: '',
        project: '',
        idea: '',
      });
      setJsonPreview('JSON-preview: файл не імпортовано');

      if (onSuccess) onSuccess(submittedApplication);
    } catch (error) {
      console.error('Create application failed:', error);
      setMessage(`❌ ${normalizeFirestoreError(error)}`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        setFormData({
          name: parsedData.name || '',
          email: parsedData.email || '',
          hackathon: parsedData.hackathon || '',
          project: parsedData.project || '',
          idea: parsedData.idea || ''
        });
        setJsonPreview(`Файл імпортовано успішно:\n${JSON.stringify(parsedData, null, 2)}`);
      } catch (error) {
        setJsonPreview('❌ Помилка читання файлу. Переконайтеся, що це валідний JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <form id="application-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label className="field">
          <span>Ім'я</span>
          <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Введіть ім'я" required />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
              placeholder={accountEmail || 'name@example.com'}
            required
              readOnly={Boolean(accountEmail)}
          />
        </label>

        <label className="field">
          <span>Хакатон</span>
          <select name="hackathon" value={formData.hackathon} onChange={handleChange} required>
            <option value="" disabled>Оберіть хакатон</option>

            {hackathons.map((h) => (
              <option key={h.slug} value={h.title}>{h.title}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Назва проєкту</span>
          <input name="project" value={formData.project} onChange={handleChange} type="text" placeholder="Назва вашого проєкту" required />
        </label>
      </div>

      <label className="field">
        <span>Короткий опис ідеї</span>
        <textarea name="idea" value={formData.idea} onChange={handleChange} rows="4" placeholder="Опишіть ідею в 2-4 реченнях" required></textarea>
      </label>

      <div className="form-row">
        <button id="import-json-btn" className="btn-secondary" type="button" onClick={handleImportClick}>
          Імпортувати файл
        </button>
        <input ref={fileInputRef} type="file" accept=".json,.txt" hidden onChange={handleFileChange} />
        <span className="import-label">Підтримка: .json, .txt (формат key=value)</span>
      </div>

      <pre id="json-preview" className="json-preview">{jsonPreview}</pre>

      <div className="form-row">
        <button className="btn-primary" type="submit">Подати заявку</button>
        <p className="form-message" aria-live="polite">{message}</p>
      </div>
    </form>
  );
}