import React, { useState } from 'react';
import ApplicationForm from '../components/ApplicationForm';
import HackathonCard from '../components/HackathonCard';
import ParticipantsList from '../components/ParticipantsList';
import ResultsList from '../components/ResultsList';
import useAppData from '../hooks/useAppData';

export default function Competitions() {

  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [selectedHackathon, setSelectedHackathon] = useState(null);

  const { data, loading, error } = useAppData();
  const hackathons = data?.hackathons || [];

  const categories = ['Всі', ...new Set(hackathons.map(h => h.category))];

  const filteredHackathons = selectedCategory === 'Всі'
    ? hackathons
    : hackathons.filter(h => h.category === selectedCategory);

  const closeModal = () => setSelectedHackathon(null);

  if (loading) return (
    <main>
      <section>
        <h1>Доступні змагання</h1>
        <p>Завантаження даних...</p>
      </section>
    </main>
  );

  if (error) return (
    <main>
      <section>
        <h1>Доступні змагання</h1>
        <p>Помилка завантаження даних: {error.message}</p>
      </section>
    </main>
  );

  return (
    <main>
      <section>
        <h1>Доступні змагання</h1>
        <p>Оберіть хакатон, ознайомтеся з правилами та критеріями оцінювання, і подавайте заявку!</p>

        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '12px' }}>Фільтр за категоріями:</span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 12px', fontSize: '0.9rem' }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="feature-grid">
          {filteredHackathons.length === 0 ? (
            <p>У цій категорії поки немає змагань 😔</p>
          ) : (
            filteredHackathons.map((h) => (
              <HackathonCard key={h.slug} hackathon={h} onOpenModal={setSelectedHackathon} />
            ))
          )}
        </div>
      </section>

      <section className="application-panel" style={{ marginTop: '40px' }}>
        <h2>Подати заявку на змагання</h2>
        <ApplicationForm hackathons={hackathons} />
      </section>

      {selectedHackathon && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
          }} 
          onClick={closeModal}
        >
          <div 
            style={{
              backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>

            <h2 style={{ marginTop: 0, color: '#1a73e8', borderBottom: '2px solid #e8f0fe', paddingBottom: '10px' }}>
              {selectedHackathon.title}
            </h2>
            
            <p style={{ lineHeight: '1.6', fontSize: '1rem', color: '#444' }}>
              <strong>📝 Про змагання:</strong> {selectedHackathon.details.description}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#202124' }}>📌 Правила:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: '#5f6368' }}>
                  {selectedHackathon.details.rules.map((rule, i) => <li key={i} style={{marginBottom: '4px'}}>{rule}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#202124' }}>🎯 Критерії:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: '#5f6368' }}>
                  {selectedHackathon.details.criteria.map((crit, i) => <li key={i} style={{marginBottom: '4px'}}>{crit}</li>)}
                </ul>
              </div>
            </div>

            <h4 style={{ margin: '20px 0 10px 0', color: '#202124' }}>🎁 Призовий фонд:</h4>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.95rem', color: '#137333', fontWeight: 'bold' }}>
              {selectedHackathon.details.prizes.map((prize, i) => <li key={i} style={{marginBottom: '4px'}}>{prize}</li>)}
            </ul>

            <hr style={{ margin: '25px 0', border: 'none', borderTop: '1px solid #ddd' }} />
            
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#1a73e8' }}>👥 Зареєстровані учасники:</h3>
            <ParticipantsList participants={selectedHackathon.participants} />

            <h3 style={{ margin: '20px 0 10px 0', fontSize: '1.1rem', color: '#1a73e8' }}>🏆 Результати:</h3>
            <ResultsList results={selectedHackathon.results} />

            <button onClick={closeModal} className="btn-primary" style={{ marginTop: '25px', width: '100%', padding: '12px' }}>
              Зрозуміло, закрити
            </button>
          </div>
        </div>
      )}
    </main>
  );
}