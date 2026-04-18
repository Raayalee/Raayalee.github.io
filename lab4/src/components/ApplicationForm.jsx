import React, { useState, useRef } from 'react';

export default function ApplicationForm({ hackathons, onSuccess }) {

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.hackathon || !formData.project || !formData.idea) {
      setMessage('❌ Будь ласка, заповніть всі обов\'язкові поля.');
      return;
    }

    const newApplication = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const existingApps = JSON.parse(localStorage.getItem('applications') || '[]');
    existingApps.push(newApplication);
    localStorage.setItem('applications', JSON.stringify(existingApps));

    setMessage('✅ Заявку успішно подано!');
    setFormData({ name: '', email: '', hackathon: '', project: '', idea: '' });
    setJsonPreview('JSON-preview: файл не імпортовано');

    if (onSuccess) onSuccess();
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
          <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="name@example.com" required />
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