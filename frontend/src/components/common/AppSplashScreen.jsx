import React, { useState, useEffect } from 'react';
import msCentreLogo from '../../assets/images/ms-centre-logo.jpeg';

const AppSplashScreen = ({ isAppReady = true, onFinish }) => {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('initial'); // 'initial', 'getting_ready', 'slow_startup'
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Timers for 1000ms minimum duration & progressive loading messaging
  useEffect(() => {
    // Minimum 1000ms display timer
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
      setLoadingPhase('getting_ready');
    }, 1000);

    // 3500ms progressive informational timer
    const slowTimer = setTimeout(() => {
      setLoadingPhase('slow_startup');
    }, 3500);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(slowTimer);
    };
  }, []);

  // Trigger smooth fade-out ONLY when BOTH minimum 1000ms has elapsed AND app readiness is true
  useEffect(() => {
    if (minTimeElapsed && isAppReady && !isFadingOut) {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 300);
      return () => clearTimeout(exitTimer);
    }
  }, [minTimeElapsed, isAppReady, isFadingOut, onFinish]);

  // Progressive informational status message
  const getStatusMessage = () => {
    if (loadingPhase === 'slow_startup') {
      return 'Taking a little longer than usual...';
    }
    if (loadingPhase === 'getting_ready') {
      return 'Getting things ready...';
    }
    return 'Loading...';
  };

  return (
    <div
      role="status"
      aria-label="Armaan Mobile Service Centre App Startup"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 text-slate-900 select-none transition-all duration-300 ease-out ${
        isFadingOut ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center max-w-xs px-6 text-center">
        {/* Brand Logo Container */}
        <div className="relative mb-5">
          <div className="absolute -inset-1 rounded-full bg-blue-500/20 blur-md"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white shadow-xl shadow-slate-200/90 overflow-hidden bg-slate-900 flex items-center justify-center">
            <img
              src={msCentreLogo}
              alt="Armaan Mobile Service Centre Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="space-y-1 mb-8">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Armaan Mobile
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-500 uppercase">
            Service Centre
          </p>
        </div>

        {/* Progressive Loading Line & Status Message */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-36 sm:w-44 h-1.5 bg-slate-200/80 rounded-full overflow-hidden relative shadow-inner">
            <div className="h-full bg-blue-600 rounded-full animate-pulse w-full transition-all duration-300" />
          </div>

          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wide">
            {getStatusMessage()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppSplashScreen;
