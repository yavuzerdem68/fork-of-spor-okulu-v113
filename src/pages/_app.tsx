import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/toaster"
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import NetworkStatus from '@/components/NetworkStatus'
import ErrorBoundary from '@/components/ErrorBoundary'
import { SessionManager } from '@/utils/security'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get the color-scheme value from :root
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const colorScheme = computedStyle.getPropertyValue('--mode').trim().replace(/"/g, '');
    if (colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
    setMounted(true);

    // Session validation on app load
    const { isValid } = SessionManager.validateSession();
    
    // Refresh session activity on route changes
    const handleRouteChange = () => {
      SessionManager.refreshSession();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Prevent flash while theme loads
  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Component {...pageProps} />
        <Toaster />
        <PWAInstallPrompt />
        <NetworkStatus />
      </div>
    </ErrorBoundary>
  )
}