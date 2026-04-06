import React from 'react';

export default function ResultsList({ results }) {
  if (!results || results.length === 0) {
    return <p style={{ fontSize: '0.9rem', color: '#666' }}>Результати ще не оголошені.</p>;
  }
  return (
    <ul style={{ paddingLeft: '20px', margin: '8px 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#b8860b' }}>
      {results.map((r, idx) => <li key={idx}>🏆 {r}</li>)}
    </ul>
  );
}