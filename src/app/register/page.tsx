"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check initial state
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Check for error in URL
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    if (error === 'EmailAlreadyExists') {
      setErrorMsg("This Google account is already registered. Please login instead.");
    } else if (error) {
      setErrorMsg("An error occurred during authentication. Please try again.");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  return (
    <div className="min-h-screen bg-[#E0E1DD] dark:bg-[#060D14] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/50 dark:border-white/10 text-[#0D1B2A] dark:text-gray-200 hover:bg-white/50 dark:hover:bg-black/50 transition-all cursor-pointer shadow-sm"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full blur-[80px] opacity-40 dark:opacity-15 bg-[#55f761] w-[40vw] h-[40vw] -top-[10%] -left-[10%] animate-float-slow"></div>
        <div className="absolute rounded-full blur-[80px] opacity-40 dark:opacity-15 bg-[#1F7A1F] w-[50vw] h-[50vw] top-[40%] -right-[20%] animate-float-slower"></div>
        <div className="absolute rounded-full blur-[80px] opacity-40 dark:opacity-15 bg-[#3de34a] w-[35vw] h-[35vw] -bottom-[10%] left-[20%] animate-float-slowest"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col justify-center max-w-md bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/40 dark:border-white/15 rounded-2xl shadow-2xl p-6 sm:p-8 animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#0D1B2A] dark:text-white">
            Link Bitmappro Account
          </h1>
          <p className="text-sm text-[#2F3E46] dark:text-white/60 mt-2">
            Sign in with Google to start connecting your existing Bitmappro account.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              window.location.href = '/api/auth/google';
            }}
            disabled={isLoading}
            className="w-full bg-white dark:bg-[#0D1B2A] hover:bg-gray-50 dark:hover:bg-[#1B263B] text-[#0D1B2A] dark:text-white border border-black/15 dark:border-white/15 font-semibold rounded-xl py-3.5 text-sm transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-3 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#0D1B2A] dark:border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {isLoading ? "Redirecting..." : "Continue with Google"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float-slow { animation: float 15s ease-in-out infinite; }
        .animate-float-slower { animation: float 20s ease-in-out infinite; animation-delay: -5s; }
        .animate-float-slowest { animation: float 25s ease-in-out infinite; animation-delay: -10s; }
      `}</style>
    </div>
  );
}
