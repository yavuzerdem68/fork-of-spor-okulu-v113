import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Shield, Users, Eye, EyeOff, Zap, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { simpleAuthManager } from "@/lib/simple-auth";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  const [parentCredentials, setParentCredentials] = useState({ email: "", password: "" });
  const [coachCredentials, setCoachCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize auth without automatic redirect
  useEffect(() => {
    const initAuth = async () => {
      await simpleAuthManager.initialize();
      await simpleAuthManager.initializeDefaultUsers();
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
      console.error('Login error:', error);
      setError(error.message || "Giriş sırasında bir hata oluştu");
    }
    
    setLoading(false);
  };

  const createQuickAdmin = async () => {
    try {
      await simpleAuthManager.createDefaultAdmin();
      setError("");
      alert("Varsayılan admin hesabı oluşturuldu!\nEmail: yavuz@g7spor.org\nŞifre: 444125yA/");
      setAdminCredentials({ email: "yavuz@g7spor.org", password: "444125yA/" });
    } catch (error: any) {
      if (error.message.includes('zaten kullanılıyor')) {
        alert("Varsayılan admin hesabı zaten mevcut!\nEmail: yavuz@g7spor.org\nŞifre: 444125yA/");
        setAdminCredentials({ email: "yavuz@g7spor.org", password: "444125yA/" });
        setError("");
      } else {
        setError("Admin hesabı oluşturulamadı: " + error.message);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Giriş Yap - G7 Spor Okulu Yönetim Sistemi</title>
        <meta name="description" content="G7 Spor Okulu Yönetim Sistemi'ne giriş yapın" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
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
            
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/g7-spor-kulubu-logo-1543f61.png" 
                alt="G7 Spor Kulübü Logo" 
                className="h-12 w-12 object-contain"
              />
              <span className="text-2xl font-bold text-primary">G7 Spor Okulu</span>
            </div>
            <p className="text-muted-foreground">Hesabınıza giriş yapın</p>
          </div>

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
                          placeholder="yavuz@g7spor.org"
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

                      <div className="text-center">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          onClick={createQuickAdmin}
                          className="text-xs"
                        >
                          Hızlı Admin Oluştur
                        </Button>
                      </div>
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

              <div className="mt-6 text-center space-y-2">
                <Link href="/parent-signup" className="text-sm text-primary hover:underline block">
                  Hesabınız yok mu? Kayıt olun
                </Link>
                <div className="pt-4 border-t border-border/50 mt-4">
                  <Link href="/login-diagnostic" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                    <Settings className="w-4 h-4 mr-2" />
                    Giriş Tanılama
                  </Link>
                </div>
              </div>

              {/* Info Card */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center text-sm text-muted-foreground">
                  <h4 className="font-medium mb-2">Varsayılan Hesaplar</h4>
                  <div className="space-y-1 text-xs">
                    <p><strong>Admin:</strong> yavuz@g7spor.org / 444125yA/</p>
                    <p><strong>Antrenör:</strong> coach@sportscr.com / coach123</p>
                    <p><strong>Veli:</strong> parent@sportscr.com / parent123</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}