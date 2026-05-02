import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import Competitions from '../pages/Competitions';
import Projects from '../pages/Projects';
import Rating from '../pages/Rating';
import Auth from '../pages/Auth';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Navigate to="/auth" replace state={location.state} />} />
      <Route path="/competitions" element={<Competitions />} />
      <Route
        path="/projects"
        element={(
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        )}
      />
      <Route path="/rating" element={<Rating />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
