import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './utils/queryClient';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import AppSplashScreen from './components/common/AppSplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Application readiness signal: React component tree mount complete
    setIsAppReady(true);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {showSplash && (
          <AppSplashScreen
            isAppReady={isAppReady}
            onFinish={() => setShowSplash(false)}
          />
        )}
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
