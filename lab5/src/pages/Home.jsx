import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <h1>Віртуальна платформа для хакатонів нового покоління</h1>
          <p>HackathonHub об'єднує учасників, менторів і журі в єдиній екосистемі: від ідеї до демо-пітчу. Ми робимо участь у хакатонах простою, прозорою і максимально практичною.</p>
          <div className="form-row">
            <Link className="btn btn-primary" to="/competitions">Перейти до змагань</Link>
            <Link className="btn btn-secondary" to="/projects">Мої проєкти</Link>
          </div>
        </div>
      </section>

      <section>
        <h2>Чому обирають наші хакатони</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Прозорі правила</h3>
            <p>Кожне змагання має чіткі критерії оцінювання, таймінг і зрозумілий формат захисту.</p>
          </article>
          <article className="feature-card">
            <h3>Практичні кейси</h3>
            <p>Завдання орієнтовані на реальні сценарії з освіти, вебу, аналітики та продуктової розробки.</p>
          </article>
          <article className="feature-card">
            <h3>Підтримка команди</h3>
            <p>Ментори й журі надають зворотний зв'язок, щоб ти міг швидко покращувати рішення.</p>
          </article>
        </div>
      </section>

      <section>
        <h2>Постійне журі</h2>
        <div className="jury-grid">
          <article className="jury-card">
            <img src="/images/jury-1.jpg" alt="Скрипник Анна" onError={(e) => { e.target.src = '/images/anechka.JPG'; }} />
            <h3>Скрипник Анна</h3>
            <p className="jury-role">Lead Front-end Engineer</p>
          </article>
          <article className="jury-card">
            <img src="/images/jury-2.jpg" alt="Бабій Ольга" onError={(e) => { e.target.src = '/images/olga.JPG'; }} />
            <h3>Бабій Ольга</h3>
            <p className="jury-role">Product & UX Mentor</p>
          </article>
          <article className="jury-card">
            <img src="/images/jury-3.jpg" alt="Ярослав Басараб" onError={(e) => { e.target.src = '/images/yarichek.JPG'; }} />
            <h3>Ярослав Басараб</h3>
            <p className="jury-role">Data Science Reviewer</p>
          </article>
        </div>
      </section>

      <section>
        <h2>FAQ</h2>
        <div className="faq-grid">
          <article className="faq-item">
            <h3>Чи можна брати участь без команди?</h3>
            <p>Так, можна. На старті кожного хакатону доступний етап формування команд за навичками.</p>
          </article>
          <article className="faq-item">
            <h3>Які технології дозволені?</h3>
            <p>Дозволено будь-який стек, якщо ти можеш обґрунтувати вибір і показати робочий прототип.</p>
          </article>
          <article className="faq-item">
            <h3>Як оцінюють проєкти?</h3>
            <p>Основні критерії: цінність ідеї, технічна реалізація, UX, якість презентації та масштабованість.</p>
          </article>
          <article className="faq-item">
            <h3>Коли публікуються результати?</h3>
            <p>Результати публікуються в день захисту на сторінці рейтингу після верифікації балів журі.</p>
          </article>
        </div>

        <div className="form-row" style={{ marginTop: '16px' }}>
          <Link className="btn btn-primary" to="/competitions">Переглянути хакатони</Link>
          <Link className="btn btn-secondary" to="/rating">Відкрити рейтинг</Link>
        </div>
      </section>
    </main>
  );
}