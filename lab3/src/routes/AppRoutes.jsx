import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Competitions from '../pages/Competitions';
import Projects from '../pages/Projects';
import Rating from '../pages/Rating';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/competitions" element={<Competitions />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/rating" element={<Rating />} />
    </Routes>
  );
}
