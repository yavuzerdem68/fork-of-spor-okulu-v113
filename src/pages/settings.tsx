import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Loader2 } from 'lucide-react';

export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    if (userRole === 'admin') {
      router.push('/system-settings');
    } else {
      // For non-admin users, redirect to dashboard
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Ayarlar - SportsCRM</title>
        <meta name="description" content="Ayarlar sayfasına yönlendiriliyor..." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Settings className="h-8 w-8 text-primary" />
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-primary mb-2">
                Ayarlar Sayfasına Yönlendiriliyor
              </h1>
              <p className="text-muted-foreground">
                Lütfen bekleyin...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}