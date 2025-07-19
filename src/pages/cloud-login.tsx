import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Shield, Users, Eye, EyeOff, ArrowLeft, Zap, Cloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { simpleAuthManager } from "@/lib/simple-auth";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function CloudLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  // Check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      await simpleAuthManager.initialize();
      await simpleAuthManager.initializeDefaultUsers(); // Create default users if none exist
      const user = simpleAuthManager.getCurrentUser();
      
      if (user) {
        // Redirect based on role
        switch (user.role) {
          case 'admin':
            router.replace('/dashboard');
            break;
          case 'coach':
            router.replace('/coach-dashboard');
            break;
          case 'parent':
            router.replace('/parent-dashboard');
            break;
          default:
            await simpleAuthManager.signOut();
        }
      }
    };

    initAuth();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await simpleAuthManager.signIn(credentials.email, credentials.password);
      
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
      console.error('Sign in error:', error);
      setError(error.message || "Giriş sırasında bir hata oluştu");
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create new user as parent role
      const userData = {
        name: credentials.email.split('@')[0],
        surname: 'User',
        role: 'parent' as const
      };

      await simpleAuthManager.createUser(credentials.email, credentials.password, userData);
      
      // After successful signup, sign in
      const user = await simpleAuthManager.signIn(credentials.email, credentials.password);
      router.push('/parent-dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || "Kayıt sırasında bir hata oluştu");
    }
    
    setLoading(false);
  };

  const createDefaultAdmin = async () => {
    try {
      await simpleAuthManager.createDefaultAdmin();
      setError("");
      alert("Varsayılan admin hesabı oluşturuldu!\nEmail: admin@sportscr.com\nŞifre: admin123");
    } catch (error: any) {
      if (error.message.includes('zaten kullanılıyor')) {
        alert("Varsayılan admin hesabı zaten mevcut!\nEmail: admin@sportscr.com\nŞifre: admin123");
        setError("");
      } else {
        setError("Admin hesabı oluşturulamadı: " + error.message);
      }
    }
  };

  const createCustomAdmin = async () => {
    if (!credentials.email) {
      setError("Lütfen önce email adresinizi girin");
      return;
    }

    const defaultPassword = "admin123";
    const name = credentials.email.split('@')[0];
    
    try {
      await simpleAuthManager.createCustomAdmin(credentials.email, defaultPassword, name, "Admin");
      setError("");
      alert(`Admin hesabı oluşturuldu!\nEmail: ${credentials.email}\nŞifre: ${defaultPassword}`);
      // Auto-fill the password field
      setCredentials({...credentials, password: defaultPassword});
    } catch (error: any) {
      if (error.message.includes('zaten kullanılıyor')) {
        alert(`Bu email ile admin hesabı zaten mevcut!\nEmail: ${credentials.email}\nŞifre: admin123 (varsayılan)`);
        setCredentials({...credentials, password: "admin123"});
        setError("");
      } else {
        setError("Admin hesabı oluşturulamadı: " + error.message);
      }
    }
  };

  return (
    <>
      <Head>
        <title>SportsCRM Cloud - Giriş</title>
        <meta name="description" content="SportsCRM Cloud sistemine giriş yapın" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="relative">
                <Trophy className="h-8 w-8 text-primary" />
                <Cloud className="h-4 w-4 text-blue-500 absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold text-primary">SportsCRM</span>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Cloud</span>
            </div>
            <p className="text-muted-foreground">Bulut tabanlı spor okulu yönetimi</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Giriş Yap</span>
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Kayıt Ol</span>
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Sign In */}
                <TabsContent value="signin">
                  <motion.form onSubmit={handleSignIn} variants={fadeInUp}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="email@example.com"
                          value={credentials.email}
                          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="signin-password">Şifre</Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
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
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                      </Button>
                    </div>
                  </motion.form>

                  <div className="mt-4 text-center space-y-2">
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={createDefaultAdmin}
                        className="text-xs"
                      >
                        Varsayılan Admin Oluştur
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={createCustomAdmin}
                        className="text-xs"
                        disabled={!credentials.email}
                      >
                        Bu Email ile Admin Oluştur
                      </Button>
                    </div>
                    {!credentials.email && (
                      <p className="text-xs text-muted-foreground">
                        Özel admin hesabı için önce email girin
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup">
                  <motion.form onSubmit={handleSignUp} variants={fadeInUp}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="email@example.com"
                          value={credentials.email}
                          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-password">Şifre</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            required
                            minLength={6}
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
                        <p className="text-xs text-muted-foreground mt-1">
                          En az 6 karakter olmalıdır
                        </p>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
                      </Button>
                    </div>
                  </motion.form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <Cloud className="w-3 h-3" />
                  <span>Verileriniz güvenli bulut altyapısında saklanır</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="text-center text-sm text-muted-foreground">
                <h4 className="font-medium mb-2">Giriş Seçenekleri</h4>
                <div className="space-y-1 text-xs">
                  <p><strong>Varsayılan Admin:</strong> admin@sportscr.com / admin123</p>
                  <p><strong>Özel Admin:</strong> Email girin → "Bu Email ile Admin Oluştur"</p>
                  <p><strong>Yeni Hesap:</strong> Kayıt ol sekmesinden oluşturabilirsiniz</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}