import React from 'react';

export default function ParticipantsList({ participants }) {
  if (!participants || participants.length === 0) {
    return <p style={{ fontSize: '0.9rem', color: '#666' }}>Учасників поки немає.</p>;
  }
  return (
    <ul style={{ paddingLeft: '20px', margin: '8px 0', fontSize: '0.9rem' }}>
      {participants.map((p, idx) => <li key={idx}>{p}</li>)}
    </ul>
  );
}