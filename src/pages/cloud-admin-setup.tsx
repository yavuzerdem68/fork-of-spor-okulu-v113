import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Shield, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cloudAuthManager } from "@/lib/cloud-auth";
import { sanitizeInput } from "@/utils/security";

export default function CloudAdminSetup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate inputs
    const name = sanitizeInput(credentials.name.trim(), 50);
    const surname = sanitizeInput(credentials.surname.trim(), 50);
    const email = sanitizeInput(credentials.email.trim(), 100);
    const password = credentials.password;
    const confirmPassword = credentials.confirmPassword;

    if (!name || !surname || !email || !password) {
      setError("Tüm alanları doldurun");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setLoading(false);
      return;
    }

    try {
      // Create admin user using cloud auth manager
      const cloudUser = await cloudAuthManager.signUp(email, password, {
        name,
        surname,
        role: 'admin'
      });

      setSuccess("Admin hesabı başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      console.error('Admin setup error:', error);
      setError(error.message || "Hesap oluşturulurken bir hata oluştu");
    }
    
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Admin Hesabı Kurulumu - SportsCRM</title>
        <meta name="description" content="SportsCRM bulut admin hesabı kurulumu" />
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
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">SportsCRM</span>
            </div>
            <p className="text-muted-foreground">Bulut Admin Hesabı Kurulumu</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Admin Hesabı Oluştur</span>
              </CardTitle>
              <CardDescription>
                Vercel bulut ortamı için yönetici hesabınızı oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4" variant="default" className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Ad</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Adınız"
                      value={credentials.name}
                      onChange={(e) => setCredentials({...credentials, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname">Soyad</Label>
                    <Input
                      id="surname"
                      type="text"
                      placeholder="Soyadınız"
                      value={credentials.surname}
                      onChange={(e) => setCredentials({...credentials, surname: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
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

                <div>
                  <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={credentials.confirmPassword}
                    onChange={(e) => setCredentials({...credentials, confirmPassword: e.target.value})}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Hesap oluşturuluyor..." : "Admin Hesabı Oluştur"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Zaten hesabınız var mı? Giriş yapın
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}