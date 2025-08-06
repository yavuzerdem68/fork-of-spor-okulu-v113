import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function RegistrationSelection() {
  const router = useRouter();

  const handleSelection = (type: 'child' | 'adult') => {
    // Redirect to the parent registration form with the appropriate type
    router.push(`/parent-registration-form?type=${type}`);
  };

  return (
    <>
      <Head>
        <title>Kayıt Türü Seçimi - G7 Spor Okulu Yönetim Sistemi</title>
        <meta name="description" content="Kayıt türünüzü seçin - Sporcu veya Yetişkin kaydı" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Back Button */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Giriş Sayfasına Dön</span>
              </Button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-6 mb-6">
              <img 
                src="https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/g7-spor-kulubu-logo-a3c923c.png" 
                alt="G7 Spor Kulübü Logo" 
                className="h-20 w-20 object-contain"
              />
              <img 
                src="https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/asset-7-fe3257c.png" 
                alt="Lüleburgaz Tofaş Basketbol Okulu Logo" 
                className="h-20 w-20 object-contain"
              />
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Kayıt Türünüzü Seçin
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Hangi tür kayıt yapmak istiyorsunuz?
            </p>
          </motion.div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Child/Parent Registration */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-xl border-border/50 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleSelection('child')}>
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Users className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      Sporcu Kaydı
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      18 yaş altı sporcu kaydı için veli bilgileri ile birlikte kayıt yapın
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => handleSelection('child')}
                  >
                    Sporcu Kaydı Yap
                  </Button>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    • Veli bilgileri gerekli<br />
                    • 18 yaş altı sporcular için<br />
                    • Detaylı sağlık bilgileri
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Adult Registration */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-xl border-border/50 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleSelection('adult')}>
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                      <User className="w-10 h-10 text-secondary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      Üye Kaydı
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      18 yaş üstü bireysel sporcu kaydı yapın
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant="secondary"
                    onClick={() => handleSelection('adult')}
                  >
                    Üye Kaydı Yap
                  </Button>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    • Kendi adınıza kayıt<br />
                    • 18 yaş üstü sporcular için<br />
                    • Hızlı kayıt süreci
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              Kayıt işlemi sırasında herhangi bir sorun yaşarsanız, lütfen bizimle iletişime geçin.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}