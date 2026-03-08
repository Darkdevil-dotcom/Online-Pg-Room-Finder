import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-airbnb-gray-bg dark:bg-gray-800 text-xs font-medium text-airbnb-gray dark:text-gray-300 mb-4">
            <span className="w-2 h-2 rounded-full bg-airbnb-pink" />
            Stay near your campus in minutes
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-airbnb-black dark:text-gray-100 mb-4">
            Find verified PGs and rooms
            <span className="text-airbnb-pink"> with AI helping you choose.</span>
          </h1>

          <p className="text-airbnb-gray dark:text-gray-300 text-sm sm:text-base max-w-xl mb-6">
            StayNear searches student-friendly rooms, PGs and co-living spaces near your college or office.
            Our built-in AI assistant understands your budget, distance and facilities to recommend the best 3 options.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center rounded-full bg-airbnb-pink text-white px-6 py-3 text-sm font-semibold hover:bg-airbnb-pink-hover transition-colors duration-300"
            >
              Start exploring rooms
            </Link>
            <button
              type="button"
              onClick={() => {
                const chatButton = document.querySelector('button[aria-label="Open chat"]');
                if (chatButton) chatButton.click();
              }}
              className="inline-flex items-center justify-center rounded-full border border-airbnb-gray-light dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-airbnb-black dark:text-gray-100 hover:bg-airbnb-gray-bg dark:hover:bg-gray-800"
            >
              Chat with StayNear AI
            </button>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-airbnb-gray dark:text-gray-300">
            <div>
              <p className="font-semibold text-airbnb-black dark:text-gray-100 text-sm">No brokers, no spam</p>
              <p>Talk directly to verified owners and managers.</p>
            </div>
            <div>
              <p className="font-semibold text-airbnb-black dark:text-gray-100 text-sm">Filters that matter</p>
              <p>Budget, distance, food, AC, sharing type and more.</p>
            </div>
            <div>
              <p className="font-semibold text-airbnb-black dark:text-gray-100 text-sm">Made for students</p>
              <p>Optimized for campus, coaching and IT park clusters.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-airbnb-pink/10 via-transparent to-airbnb-pink/20 rounded-airbnb-lg blur-2xl" />
          <div className="relative rounded-airbnb-lg bg-white dark:bg-gray-800 shadow-card border border-airbnb-gray-light dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-airbnb-gray-light dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-airbnb-pink text-white flex items-center justify-center text-sm font-semibold">AI</span>
                <div>
                  <p className="text-sm font-semibold text-airbnb-black dark:text-gray-100">StayNear AI</p>
                  <p className="text-xs text-airbnb-gray dark:text-gray-300">Tell me your budget and area</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-airbnb-gray-bg dark:bg-gray-700 text-airbnb-gray dark:text-gray-300">24/7</span>
            </div>
            <div className="p-4 space-y-3 text-xs bg-airbnb-gray-bg/60 dark:bg-gray-900/70">
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg rounded-tl-none bg-white dark:bg-gray-700 px-3 py-2 shadow text-airbnb-black dark:text-gray-100">
                  Hi! What is your max monthly budget and how far from college can you stay?
                </div>
              </div>
              <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg rounded-tr-none bg-[#DCF8C6] dark:bg-green-700 px-3 py-2 shadow text-airbnb-black dark:text-white transition-colors duration-300">
                  Under Rs 15,000 within 5 km of BMS College.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg rounded-tl-none bg-white dark:bg-gray-700 px-3 py-2 shadow text-airbnb-black dark:text-gray-100">
                  Great! I shortlisted 3 PGs with food, WiFi and AC under your budget. Tap any card to view or compare.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-airbnb-gray-light dark:border-gray-700 bg-airbnb-gray-bg/40 dark:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-lg sm:text-xl font-semibold text-airbnb-black dark:text-gray-100 mb-4">How StayNear works</h2>
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-airbnb-gray dark:text-gray-300">
            <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-4">
              <p className="text-xs font-semibold text-airbnb-pink mb-1">1. Tell us your plan</p>
              <p>Share your budget, dates, distance from college or office, and must-have facilities.</p>
            </div>
            <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-4">
              <p className="text-xs font-semibold text-airbnb-pink mb-1">2. Let AI shortlist</p>
              <p>Our AI ranks nearby PGs and rooms so you only see the most relevant options.</p>
            </div>
            <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-4">
              <p className="text-xs font-semibold text-airbnb-pink mb-1">3. Visit, compare, move in</p>
              <p>Open detailed cards, compare rooms side-by-side, save favorites and contact owners directly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
