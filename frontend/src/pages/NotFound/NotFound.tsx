import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound(): React.JSX.Element {
  const handleGoBack = (): void => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4 text-center text-gray-100">
      {/* Visual Element / Illustration placeholder */}
      <div className="relative mb-8 select-none">
        <h1 className="text-9xl font-black text-gray-400 tracking-widest opacity-40">
          404
        </h1>
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-200 whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Oops! Page not found
        </p>
      </div>

      {/* Explanatory Text */}
      <div className="max-w-md mb-8">
        <p className="text-gray-400 text-lg">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-200 rounded-lg shadow-lg shadow-indigo-600/20"
        >
          Go Back Home
        </Link>
        <button
          onClick={handleGoBack}
          type="button"
          className="inline-flex items-center justify-center px-6 py-3 font-semibold text-gray-300 bg-gray-900 border border-gray-600 hover:bg-gray-800 hover:text-white transition-colors duration-200 rounded-lg shadow-sm"
        >
          Previous Page
        </button>
      </div>
    </div>
  );
}