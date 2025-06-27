import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, ArrowLeft, Mail, CheckCircle, AlertTriangle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { sanitizeInput } from "@/utils/security";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Sanitize input
    const sanitizedEmail = sanitizeInput(email.trim(), 100);

    if (!sanitizedEmail) {
      setError("Lütfen geçerli bir email adresi girin");
      setLoading(false);
      return;
    }

    try {
      let userFound = false;
      let foundUser = null;
      let userType = "";

      // Check admin users
      const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const admin = adminUsers.find((a: any) => a.email === sanitizedEmail);
      
      if (admin) {
        userFound = true;
        foundUser = admin;
        userType = "admin";
      }

      // Check coach users if not found in admin
      if (!userFound) {
        const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
        const coach = coaches.find((c: any) => c.email === sanitizedEmail);
        
        if (coach) {
          userFound = true;
          foundUser = coach;
          userType = "coach";
        }
      }

      // Check parent users if not found in coach
      if (!userFound) {
        const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
        const parent = parentUsers.find((p: any) => p.email === sanitizedEmail);
        
        if (parent) {
          userFound = true;
          foundUser = parent;
          userType = "parent";
        }
      }

      if (!userFound) {
        setError("Bu email adresi ile kayıtlı kullanıcı bulunamadı");
        setLoading(false);
        return;
      }

      // Call API to send password reset email
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu');
      }

      // Update user password in localStorage with the hashed password from API
      if (userType === "admin") {
        const updatedAdmins = adminUsers.map((a: any) => 
          a.id === foundUser.id 
            ? { 
                ...a, 
                password: data.hashedPassword, 
                isTemporaryPassword: true,
                passwordResetAt: new Date().toISOString() 
              }
            : a
        );
        localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
      } else if (userType === "coach") {
        const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
        const updatedCoaches = coaches.map((c: any) => 
          c.id === foundUser.id 
            ? { 
                ...c, 
                password: data.hashedPassword, 
                isTemporaryPassword: true,
                passwordResetAt: new Date().toISOString() 
              }
            : c
        );
        localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
      } else if (userType === "parent") {
        const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
        const updatedParents = parentUsers.map((p: any) => 
          p.id === foundUser.id 
            ? { 
                ...p, 
                password: data.hashedPassword, 
                isTemporaryPassword: true,
                passwordResetAt: new Date().toISOString() 
              }
            : p
        );
        localStorage.setItem('parentUsers', JSON.stringify(updatedParents));
      }

      // Show success dialog
      setUserInfo({
        name: foundUser.name || foundUser.firstName || 'Kullanıcı',
        surname: foundUser.surname || foundUser.lastName || '',
        email: foundUser.email,
        type: userType
      });
      setShowSuccessDialog(true);

    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || "Şifre sıfırlama sırasında bir hata oluştu");
    }
    
    setLoading(false);
  };

  const handleBackToLogin = () => {
    setShowSuccessDialog(false);
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Şifremi Unuttum - SportsCRM</title>
        <meta name="description" content="SportsCRM şifre sıfırlama" />
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
            <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Giriş Sayfasına Dön
            </Link>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">SportsCRM</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Şifremi Unuttum</h1>
            <p className="text-muted-foreground">Email adresinizi girin, yeni şifrenizi e-posta ile gönderelim</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <motion.form onSubmit={handlePasswordReset} variants={fadeInUp}>
                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="email">Email Adresi</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Kayıtlı email adresinizi girin. Yönetici, antrenör veya veli hesabınız olabilir.
                    </p>
                  </div>

                  <Alert>
                    <Send className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Güvenlik:</strong> Yeni şifreniz güvenli bir şekilde email adresinize gönderilecektir.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "E-posta gönderiliyor..." : "Şifre Sıfırlama E-postası Gönder"}
                  </Button>
                </div>
              </motion.form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Şifrenizi hatırladınız mı? Giriş yapın
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>E-posta Başarıyla Gönderildi</span>
              </DialogTitle>
              <DialogDescription>
                Şifre sıfırlama e-postası gönderildi. E-posta kutunuzu kontrol edin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-accent/50 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Kullanıcı</Label>
                    <p className="font-medium">{userInfo?.name} {userInfo?.surname}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="font-medium">{userInfo?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Hesap Türü</Label>
                    <p className="font-medium capitalize">
                      {userInfo?.type === 'admin' ? 'Yönetici' : 
                       userInfo?.type === 'coach' ? 'Antrenör' : 'Veli'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">E-posta Gönderildi</Label>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Yeni geçici şifreniz <strong>{userInfo?.email}</strong> adresine gönderildi.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Önemli Talimatlar:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• E-posta kutunuzu (gelen kutusu ve spam klasörü) kontrol edin</li>
                    <li>• E-postadaki geçici şifre ile giriş yapın</li>
                    <li>• Güvenliğiniz için giriş yaptıktan sonra mutlaka şifrenizi değiştirin</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleBackToLogin} className="w-full">
                  Giriş Sayfasına Git
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}