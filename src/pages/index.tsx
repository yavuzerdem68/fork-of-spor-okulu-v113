import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
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
import { verifyPassword, hashPassword } from "@/utils/security";
import { RateLimiter, SessionManager } from "@/utils/security";
import { sanitizeInput } from "@/utils/security";

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
  const [rateLimiter] = useState(() => new RateLimiter(5, 15 * 60 * 1000)); // 5 attempts per 15 minutes

  // Check if user is already logged in
  useEffect(() => {
    // Immediate check without delay to prevent flickering
    const { isValid, session } = SessionManager.validateSession();
    if (isValid && session) {
      // Redirect based on role immediately
      switch (session.userRole) {
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
          SessionManager.destroySession();
      }
    }
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Sanitize inputs
    const email = sanitizeInput(adminCredentials.email.trim(), 100);
    const password = adminCredentials.password;

    // Rate limiting
    const clientId = `admin_${email}`;
    if (!rateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientId) / 1000 / 60);
      setError(`Çok fazla başarısız deneme. ${remainingTime} dakika sonra tekrar deneyin.`);
      setLoading(false);
      return;
    }

    try {
      // Initialize default admin if no admin users exist
      let adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      
      if (adminUsers.length === 0) {
        // Create default admin with hashed password
        const hashedPassword = await hashPassword('admin123');
        const defaultAdmin = {
          id: 'default-admin',
          name: 'Sistem',
          surname: 'Yöneticisi',
          email: 'admin@sportscr.com',
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date().toISOString(),
          isDefault: true
        };
        adminUsers = [defaultAdmin];
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
      }

      // Find admin by email
      const admin = adminUsers.find((a: any) => a.email === email);

      if (admin) {
        // Verify password
        const isPasswordValid = admin.isDefault && admin.password === 'admin123' 
          ? password === 'admin123' // Backward compatibility for default admin
          : await verifyPassword(password, admin.password);

        if (isPasswordValid) {
          // If using old plain text password, update to hashed
          if (admin.isDefault && admin.password === 'admin123') {
            admin.password = await hashPassword('admin123');
            const updatedAdmins = adminUsers.map((a: any) => a.id === admin.id ? admin : a);
            localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
          }

          // Create secure session
          const sessionId = SessionManager.createSession(admin.id, 'admin');
          
          // Update last login
          admin.lastLogin = new Date().toISOString();
          const updatedAdmins = adminUsers.map((a: any) => a.id === admin.id ? admin : a);
          localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));

          // Set legacy localStorage for compatibility
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("currentUser", JSON.stringify(admin));
          localStorage.setItem("userEmail", admin.email);

          // Reset rate limiter on successful login
          rateLimiter.reset(clientId);
          
          router.push("/dashboard");
        } else {
          setError("Geçersiz email veya şifre");
        }
      } else {
        setError("Geçersiz email veya şifre");
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError("Giriş sırasında bir hata oluştu");
    }
    
    setLoading(false);
  };

  const handleCoachLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Sanitize inputs
    const email = sanitizeInput(coachCredentials.email.trim(), 100);
    const password = coachCredentials.password;

    // Rate limiting
    const clientId = `coach_${email}`;
    if (!rateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientId) / 1000 / 60);
      setError(`Çok fazla başarısız deneme. ${remainingTime} dakika sonra tekrar deneyin.`);
      setLoading(false);
      return;
    }

    try {
      // Check against registered coaches
      const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
      const coach = coaches.find((c: any) => c.email === email);

      if (coach) {
        // Verify password (handle both hashed and plain text for backward compatibility)
        const isPasswordValid = coach.password && coach.password.length > 50
          ? await verifyPassword(password, coach.password)
          : password === coach.password;

        if (isPasswordValid) {
          // If using old plain text password, update to hashed
          if (coach.password && coach.password.length <= 50) {
            coach.password = await hashPassword(coach.password);
            const updatedCoaches = coaches.map((c: any) => c.id === coach.id ? coach : c);
            localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
          }

          // Create secure session
          const sessionId = SessionManager.createSession(coach.id, 'coach');
          
          // Set legacy localStorage for compatibility
          localStorage.setItem("userRole", "coach");
          localStorage.setItem("currentUser", JSON.stringify(coach));

          // Reset rate limiter on successful login
          rateLimiter.reset(clientId);
          
          router.push("/coach-dashboard");
        } else {
          setError("Geçersiz email veya şifre");
        }
      } else {
        setError("Geçersiz email veya şifre");
      }
    } catch (error) {
      console.error('Coach login error:', error);
      setError("Giriş sırasında bir hata oluştu");
    }
    
    setLoading(false);
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Sanitize inputs
    const emailOrUsername = sanitizeInput(parentCredentials.email.trim(), 100);
    const password = parentCredentials.password;

    // Rate limiting
    const clientId = `parent_${emailOrUsername}`;
    if (!rateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientId) / 1000 / 60);
      setError(`Çok fazla başarısız deneme. ${remainingTime} dakika sonra tekrar deneyin.`);
      setLoading(false);
      return;
    }

    try {
      // Check against registered parent users
      const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
      const user = parentUsers.find((u: any) => 
        u.email === emailOrUsername || u.username === emailOrUsername
      );

      if (user) {
        // Verify password (handle both hashed and plain text for backward compatibility)
        const isPasswordValid = user.password && user.password.length > 50
          ? await verifyPassword(password, user.password)
          : password === user.password;

        if (isPasswordValid) {
          // If using old plain text password, update to hashed
          if (user.password && user.password.length <= 50) {
            user.password = await hashPassword(user.password);
            const updatedUsers = parentUsers.map((u: any) => u.id === user.id ? user : u);
            localStorage.setItem('parentUsers', JSON.stringify(updatedUsers));
          }

          // Create secure session
          const sessionId = SessionManager.createSession(user.id, 'parent');
          
          // Set legacy localStorage for compatibility
          localStorage.setItem("userRole", "parent");
          localStorage.setItem("currentUser", JSON.stringify(user));
          localStorage.setItem("userEmail", user.email);

          // Reset rate limiter on successful login
          rateLimiter.reset(clientId);
          
          router.push("/parent-dashboard");
        } else {
          setError("Geçersiz kullanıcı adı/email veya şifre");
        }
      } else {
        setError("Geçersiz kullanıcı adı/email veya şifre");
      }
    } catch (error) {
      console.error('Parent login error:', error);
      setError("Giriş sırasında bir hata oluştu");
    }
    
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>SportsCRM - Spor Okulu Yönetim Sistemi</title>
        <meta name="description" content="SportsCRM sistemine giriş yapın" />
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
              <Trophy className="h-12 w-12 text-primary" />
              <span className="text-3xl font-bold text-primary">SportsCRM</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Spor Okulu
              <span className="text-primary block">Yönetim Sistemi</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Spor okulunuzu dijitalleştirin. Sporcu kayıtları, aidat takibi, 
              antrenman programları ve daha fazlası için kapsamlı CRM sistemi.
            </p>

            {/* Sports Images */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative overflow-hidden rounded-lg shadow-lg"
              >
                <Image
                  src="https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/1-bdbef90.jpg"
                  alt="Spor Okulu Aktiviteleri"
                  width={300}
                  height={200}
                  className="object-cover w-full h-32 hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="relative overflow-hidden rounded-lg shadow-lg"
              >
                <Image
                  src="https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/2-776160b.jpg"
                  alt="Spor Okulu Antrenmanları"
                  width={300}
                  height={200}
                  className="object-cover w-full h-32 hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            </div>

            {/* Features */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex flex-col items-center space-y-2">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Sporcu Yönetimi</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Trophy className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Performans Takibi</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Güvenli Sistem</span>
              </div>
            </motion.div>

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
                    <motion.form onSubmit={handleAdminLogin} variants={fadeInUp}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="admin-email">Email</Label>
                          <Input
                            id="admin-email"
                            type="email"
                            placeholder="admin@sportscr.com"
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
                    <motion.form onSubmit={handleCoachLogin} variants={fadeInUp}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="coach-email">Email</Label>
                          <Input
                            id="coach-email"
                            type="email"
                            placeholder="antrenor@example.com"
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
                    <motion.form onSubmit={handleParentLogin} variants={fadeInUp}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="parent-email">Email / Kullanıcı Adı</Label>
                          <Input
                            id="parent-email"
                            type="text"
                            placeholder="veli@example.com"
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
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline block">
                    Şifremi Unuttum
                  </Link>
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
