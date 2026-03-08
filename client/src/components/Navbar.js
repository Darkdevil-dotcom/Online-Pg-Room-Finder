import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle.jsx';
import NotificationBell from './notifications/NotificationBell.jsx';

export default function Navbar() {
  const { user, isOwner, isTenant, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-xl">
          <span className="text-pink-500">StayNear</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link to="/rooms" className="text-gray-800 dark:text-gray-200 hover:underline text-sm font-medium">Rooms</Link>
          <Link to="/map" className="text-gray-800 dark:text-gray-200 hover:underline text-sm font-medium">Map</Link>
          <Link to="/compare" className="text-gray-800 dark:text-gray-200 hover:underline text-sm font-medium">Compare</Link>
          {isTenant && <Link to="/recommendations" className="text-gray-800 dark:text-gray-200 hover:underline text-sm font-medium">AI Match</Link>}
          {isOwner && <Link to="/dashboard" className="text-gray-800 dark:text-gray-200 hover:underline text-sm font-medium">Dashboard</Link>}
          {isOwner && <Link to="/analytics" className="text-gray-800 dark:text-gray-200 hover:underline text-sm font-medium">Analytics</Link>}

          <ThemeToggle />
          <NotificationBell />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:shadow text-sm"
              >
                <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-medium">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 z-20">
                    <Link to="/favorites" className="block px-4 py-2 text-sm" onClick={() => setUserMenuOpen(false)}>Favorites</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm">Log out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-gray-800 dark:text-gray-200 hover:underline text-sm font-medium">Log in</Link>
              <Link to="/register" className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-600">Sign up</Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4 px-4 space-y-2">
          <ThemeToggle />
          <Link to="/rooms" className="block py-2" onClick={() => setMenuOpen(false)}>Rooms</Link>
          <Link to="/map" className="block py-2" onClick={() => setMenuOpen(false)}>Map</Link>
          <Link to="/compare" className="block py-2" onClick={() => setMenuOpen(false)}>Compare</Link>
          {isTenant && <Link to="/recommendations" className="block py-2" onClick={() => setMenuOpen(false)}>AI Match</Link>}
          {isOwner && <Link to="/dashboard" className="block py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {isOwner && <Link to="/analytics" className="block py-2" onClick={() => setMenuOpen(false)}>Analytics</Link>}

          {user ? (
            <>
              <Link to="/favorites" className="block py-2" onClick={() => setMenuOpen(false)}>Favorites</Link>
              <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block py-2 text-pink-500 font-medium">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/register" className="block py-2 text-pink-500 font-medium" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
