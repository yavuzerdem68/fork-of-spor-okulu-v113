import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/toaster"
import ErrorBoundary from '@/components/ErrorBoundary'
import { simpleAuthManager } from '@/lib/simple-auth'

import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize authentication
    const initializeApp = async () => {
      try {
        await simpleAuthManager.initialize();
        await simpleAuthManager.initializeDefaultUsers();
        console.log('App initialized successfully');
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    initializeApp();

    // Simple theme setup
    document.documentElement.classList.add('light');
    setMounted(true);
  }, []);

  // Prevent flash while theme loads
  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Component {...pageProps} />
        <Toaster />
      </div>
    </ErrorBoundary>
  )
}