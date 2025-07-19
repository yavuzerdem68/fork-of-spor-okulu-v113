import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page since login functionality is now consolidated there
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Yönlendiriliyor - SportsCRM</title>
        <meta name="description" content="Ana sayfaya yönlendiriliyor..." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Trophy className="h-12 w-12 text-primary animate-pulse" />
            <span className="text-3xl font-bold text-primary">SportsCRM</span>
          </div>
          
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            Ana sayfaya yönlendiriliyor...
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Giriş işlemleri artık ana sayfada gerçekleştiriliyor.
          </p>

          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    </>
  );
}