import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import FloatingChatbot from './components/FloatingChatbot';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import ComparePage from './pages/ComparePage';
import RoomDetail from './pages/RoomDetail';
import Dashboard from './pages/Dashboard';
import RoomForm from './pages/RoomForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import RecommendationsPage from './pages/RecommendationsPage';
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div  className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/rooms" element={<Home />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/new" element={<RoomForm />} />
              <Route path="/dashboard/edit/:id" element={<RoomForm />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/analytics" element={<OwnerAnalyticsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <FloatingChatbot />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
