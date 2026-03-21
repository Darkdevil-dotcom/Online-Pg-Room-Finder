import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

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
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-airbnb-gray-light dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-airbnb-black dark:text-gray-100 font-semibold text-xl">
          <span className="text-airbnb-pink">StayNear</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/rooms" className="text-airbnb-black dark:text-gray-100 hover:underline text-sm font-medium">Rooms</Link>
          <Link to="/map" className="text-airbnb-black dark:text-gray-100 hover:underline text-sm font-medium">Map</Link>
          <Link to="/compare" className="text-airbnb-black dark:text-gray-100 hover:underline text-sm font-medium">Compare</Link>
          {isTenant && (
            <>
              <Link to="/roommate-profile" className="text-airbnb-black dark:text-gray-100 hover:underline text-sm font-medium">Roommate Profile</Link>
              <Link to="/roommates" className="text-airbnb-black dark:text-gray-100 hover:underline text-sm font-medium">Find Roommates</Link>
            </>
          )}
          {isOwner && (
            <Link to="/dashboard" className="text-airbnb-black dark:text-gray-100 hover:underline text-sm font-medium">Dashboard</Link>
          )}
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-airbnb-gray-light hover:shadow-card text-sm"
              >
                <span className="w-8 h-8 rounded-full bg-airbnb-pink text-white flex items-center justify-center text-sm font-medium">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="text-airbnb-black dark:text-gray-100 font-medium">{user.name}</span>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-48 py-2 bg-white dark:bg-gray-800 rounded-airbnb shadow-card border border-airbnb-gray-light dark:border-gray-700 z-20">
                    <Link to="/favorites" className="block px-4 py-2 text-sm text-airbnb-black dark:text-gray-100 hover:bg-airbnb-gray-bg dark:hover:bg-gray-700" onClick={() => setUserMenuOpen(false)}>Favorites</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-airbnb-black dark:text-gray-100 hover:bg-airbnb-gray-bg dark:hover:bg-gray-700">
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-airbnb-black dark:text-gray-100 hover:underline text-sm font-medium">Log in</Link>
              <Link to="/register" className="bg-airbnb-pink text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-airbnb-pink-hover">
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-airbnb-gray-bg"
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-airbnb-gray-light dark:border-gray-700 bg-white dark:bg-gray-900 py-4 px-4 space-y-2">
          <Link to="/rooms" className="block py-2 text-airbnb-black dark:text-gray-100 font-medium" onClick={() => setMenuOpen(false)}>Rooms</Link>
          <Link to="/map" className="block py-2 text-airbnb-black dark:text-gray-100 font-medium" onClick={() => setMenuOpen(false)}>Map</Link>
          <Link to="/compare" className="block py-2 text-airbnb-black dark:text-gray-100 font-medium" onClick={() => setMenuOpen(false)}>Compare</Link>
          {isTenant && (
            <>
              <Link to="/roommate-profile" className="block py-2 text-airbnb-black dark:text-gray-100 font-medium" onClick={() => setMenuOpen(false)}>
                Roommate Profile
              </Link>
              <Link to="/roommates" className="block py-2 text-airbnb-black dark:text-gray-100 font-medium" onClick={() => setMenuOpen(false)}>
                Find Roommates
              </Link>
            </>
          )}
          {isOwner && <Link to="/dashboard" className="block py-2 text-airbnb-black dark:text-gray-100 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          <div className="py-2">
            <ThemeToggle />
          </div>
          {user ? (
            <>
              <Link to="/favorites" className="block py-2 text-airbnb-black dark:text-gray-100 font-medium" onClick={() => setMenuOpen(false)}>Favorites</Link>
              <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block py-2 text-airbnb-pink font-medium">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-airbnb-black dark:text-gray-100 font-medium" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/register" className="block py-2 text-airbnb-pink font-medium" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
