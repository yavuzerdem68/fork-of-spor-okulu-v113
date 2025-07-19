import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Shield, Users, Eye, EyeOff, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { simpleAuthManager } from "@/lib/simple-auth";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  const [parentCredentials, setParentCredentials] = useState({ email: "", password: "" });
  const [coachCredentials, setCoachCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // Initialize auth without auto-redirect to prevent loops
  useEffect(() => {
    const initAuth = async () => {
      try {
        await simpleAuthManager.initialize();
        await simpleAuthManager.initializeDefaultUsers();
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any corrupted auth state
        await simpleAuthManager.signOut();
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent, role: 'admin' | 'coach' | 'parent') => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let credentials;
    switch (role) {
      case 'admin':
        credentials = adminCredentials;
        break;
      case 'coach':
        credentials = coachCredentials;
        break;
      case 'parent':
        credentials = parentCredentials;
        break;
    }

    try {
      const user = await simpleAuthManager.signIn(credentials.email, credentials.password);
      
      // Add a small delay to ensure state is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on role
      switch (user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'coach':
          router.push('/coach-dashboard');
          break;
        case 'parent':
          router.push('/parent-dashboard');
          break;
        default:
          setError("Geçersiz kullanıcı rolü");
      }
    } catch (error: any) {
      setError(`Giriş hatası: ${error.message || "Bilinmeyen hata"}`);
    }
    
    setLoading(false);
  };





  return (
    <>
      <Head>
        <title>G7 Spor Okulu Yönetim Sistemi</title>
        <meta name="description" content="G7 Spor Okulu Yönetim Sistemi'ne giriş yapın" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <img 
                src="https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/g7-spor-kulubu-logo-1543f61.png" 
                alt="G7 Spor Kulübü Logo" 
                className="h-16 w-16 object-contain"
              />
              <span className="text-3xl font-bold text-primary">G7 Spor Okulu</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              G7 Spor Okulu
              <span className="text-primary block">Yönetim Sistemi</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Spor okulunuzu dijitalleştirin. Sporcu kayıtları, aidat takibi, 
              antrenman programları ve daha fazlası için kapsamlı CRM sistemi.
            </p>


          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div 
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="shadow-2xl border-border/50">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Hesabınıza Giriş Yapın</h2>
                  <p className="text-muted-foreground">Rolünüzü seçin ve giriş yapın</p>
                </div>

                <Tabs defaultValue="admin" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="admin" className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Yönetici</span>
                    </TabsTrigger>
                    <TabsTrigger value="coach" className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Antrenör</span>
                    </TabsTrigger>
                    <TabsTrigger value="parent" className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Veli</span>
                    </TabsTrigger>
                  </TabsList>

                  {error && (
                    <Alert className="mb-4" variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Admin Login */}
                  <TabsContent value="admin">
                    <motion.form onSubmit={(e) => handleLogin(e, 'admin')} variants={fadeInUp}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="admin-email">Email</Label>
                          <Input
                            id="admin-email"
                            type="email"
                            placeholder="admin@example.com"
                            value={adminCredentials.email}
                            onChange={(e) => setAdminCredentials({...adminCredentials, email: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="admin-password">Şifre</Label>
                          <div className="relative">
                            <Input
                              id="admin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={adminCredentials.password}
                              onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Giriş yapılıyor..." : "Yönetici Girişi"}
                        </Button>
                      </div>
                    </motion.form>
                  </TabsContent>

                  {/* Coach Login */}
                  <TabsContent value="coach">
                    <motion.form onSubmit={(e) => handleLogin(e, 'coach')} variants={fadeInUp}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="coach-email">Email</Label>
                          <Input
                            id="coach-email"
                            type="email"
                            placeholder="coach@sportscr.com"
                            value={coachCredentials.email}
                            onChange={(e) => setCoachCredentials({...coachCredentials, email: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="coach-password">Şifre</Label>
                          <div className="relative">
                            <Input
                              id="coach-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={coachCredentials.password}
                              onChange={(e) => setCoachCredentials({...coachCredentials, password: e.target.value})}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Giriş yapılıyor..." : "Antrenör Girişi"}
                        </Button>
                      </div>
                    </motion.form>
                  </TabsContent>

                  {/* Parent Login */}
                  <TabsContent value="parent">
                    <motion.form onSubmit={(e) => handleLogin(e, 'parent')} variants={fadeInUp}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="parent-email">Email / Kullanıcı Adı</Label>
                          <Input
                            id="parent-email"
                            type="text"
                            placeholder="parent@sportscr.com"
                            value={parentCredentials.email}
                            onChange={(e) => setParentCredentials({...parentCredentials, email: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="parent-password">Şifre</Label>
                          <div className="relative">
                            <Input
                              id="parent-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={parentCredentials.password}
                              onChange={(e) => setParentCredentials({...parentCredentials, password: e.target.value})}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Giriş yapılıyor..." : "Veli Girişi"}
                        </Button>
                      </div>
                    </motion.form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 text-center">
                  <Link href="/parent-signup" className="text-sm text-primary hover:underline block">
                    Hesabınız yok mu? Kayıt olun
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
