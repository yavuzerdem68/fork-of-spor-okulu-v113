import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Shield, Eye, EyeOff, ArrowLeft, User, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { simpleAuthManager } from "@/lib/simple-auth";

export default function SimpleLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const createDefaultAdmin = async () => {
    try {
      await simpleAuthManager.createDefaultAdmin();
      setError("");
      alert("Varsayılan admin hesabı oluşturuldu!\nEmail: admin@sportscr.com\nŞifre: admin123");
      setCredentials({ email: "admin@sportscr.com", password: "admin123" });
    } catch (error: any) {
      if (error.message.includes('zaten kullanılıyor')) {
        alert("Varsayılan admin hesabı zaten mevcut!\nEmail: admin@sportscr.com\nŞifre: admin123");
        setCredentials({ email: "admin@sportscr.com", password: "admin123" });
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
        <title>SportsCRM - Basit Giriş</title>
        <meta name="description" content="SportsCRM sistemine basit giriş" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">SportsCRM</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Basit</span>
            </div>
            <p className="text-muted-foreground">Basit şifreli giriş sistemi</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Giriş Yap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Input
                      id="password"
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
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">Hızlı Admin Hesabı Oluştur</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={createDefaultAdmin}
                      className="text-xs"
                    >
                      Varsayılan Admin
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={createCustomAdmin}
                      className="text-xs"
                      disabled={!credentials.email}
                    >
                      Bu Email ile Admin
                    </Button>
                  </div>
                  {!credentials.email && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Özel admin hesabı için önce email girin
                    </p>
                  )}
                </div>

                <div className="text-center pt-4 border-t">
                  <Link href="/login-diagnostic" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                    <Settings className="w-4 h-4 mr-2" />
                    Giriş Tanılama
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="text-center text-sm text-muted-foreground">
                <h4 className="font-medium mb-2">Varsayılan Hesaplar</h4>
                <div className="space-y-1 text-xs">
                  <p><strong>Admin:</strong> admin@sportscr.com / admin123</p>
                  <p><strong>Antrenör:</strong> coach@sportscr.com / coach123</p>
                  <p><strong>Veli:</strong> parent@sportscr.com / parent123</p>
                </div>
                <p className="text-xs mt-3 text-green-600">
                  ✅ Şifreler düz metin olarak saklanır (basit sistem)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}