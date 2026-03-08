import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-airbnb-black dark:text-gray-100 mb-6 text-center transition-colors duration-300">Log in to StayNear</h1>
        <form onSubmit={handleSubmit} className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-6 space-y-4 transition-colors duration-300">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-airbnb-black dark:text-gray-100 mb-1 transition-colors duration-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-airbnb-black dark:text-gray-100 mb-1 transition-colors duration-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-airbnb-pink text-white py-3 font-medium hover:bg-airbnb-pink-hover disabled:opacity-50 transition-colors duration-300"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-airbnb-gray dark:text-gray-300 transition-colors duration-300">
          Do not have an account? <Link to="/register" className="text-airbnb-pink font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
