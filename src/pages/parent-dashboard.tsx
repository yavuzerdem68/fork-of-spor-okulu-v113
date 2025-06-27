import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  LogOut,
  Users,
  Calendar,
  CreditCard,
  Phone,
  Mail
} from "lucide-react";
import { useRouter } from "next/router";
import { hashPassword, verifyPassword } from "@/utils/security";
import { SessionManager } from "@/utils/security";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function ParentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [linkedAthletes, setLinkedAthletes] = useState<any[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = setTimeout(() => {
      const { isValid, session } = SessionManager.validateSession();
      const role = localStorage.getItem("userRole");
      const user = localStorage.getItem("currentUser");
      
      if (!isValid || role !== "parent" || !user) {
        SessionManager.destroySession();
        router.replace("/login");
        return;
      }
      
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      
      // Load linked athletes
      loadLinkedAthletes(userData);
      
      // Check if user has temporary password
      if (userData.isTemporaryPassword) {
        setShowPasswordDialog(true);
      }
    }, 50);

    return () => clearTimeout(checkAuth);
  }, [router]);

  const loadLinkedAthletes = (user: any) => {
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const userAthletes = allStudents.filter((student: any) => 
      user.linkedAthletes && user.linkedAthletes.includes(student.id)
    );
    setLinkedAthletes(userAthletes);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      // Validate form
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setPasswordError('Lütfen tüm alanları doldurun');
        setLoading(false);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError('Yeni şifreler eşleşmiyor');
        setLoading(false);
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setPasswordError('Yeni şifre en az 6 karakter olmalıdır');
        setLoading(false);
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = currentUser.password && currentUser.password.length > 50
        ? await verifyPassword(passwordForm.currentPassword, currentUser.password)
        : passwordForm.currentPassword === currentUser.password;

      if (!isCurrentPasswordValid) {
        setPasswordError('Mevcut şifre yanlış');
        setLoading(false);
        return;
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(passwordForm.newPassword);

      // Update user password
      const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
      const updatedParentUsers = parentUsers.map((parent: any) => 
        parent.id === currentUser.id 
          ? { 
              ...parent, 
              password: hashedNewPassword, 
              isTemporaryPassword: false,
              updatedAt: new Date().toISOString() 
            }
          : parent
      );

      localStorage.setItem('parentUsers', JSON.stringify(updatedParentUsers));

      // Update current user in localStorage
      const updatedCurrentUser = {
        ...currentUser,
        password: hashedNewPassword,
        isTemporaryPassword: false,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
      setCurrentUser(updatedCurrentUser);

      setPasswordSuccess('Şifreniz başarıyla değiştirildi');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close dialog after success
      setTimeout(() => {
        setShowPasswordDialog(false);
        setPasswordSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError('Şifre değiştirme sırasında bir hata oluştu');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    SessionManager.destroySession();
    router.replace("/");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Veli Paneli - SportsCRM</title>
        <meta name="description" content="Veli dashboard" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Veli Paneli</h1>
              <p className="text-muted-foreground">Hoş geldiniz, {currentUser.firstName} {currentUser.lastName}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                <Lock className="h-4 w-4 mr-2" />
                Şifre Değiştir
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Message */}
          {currentUser.isTemporaryPassword && (
            <motion.div 
              className="mb-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Güvenlik Uyarısı:</strong> Geçici şifre kullanıyorsunuz. Güvenliğiniz için lütfen şifrenizi değiştirin.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* User Info */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Kişisel Bilgiler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ad Soyad</Label>
                  <p className="font-medium">{currentUser.firstName} {currentUser.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Telefon</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{currentUser.phone}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Kullanıcı Adı</Label>
                  <p className="font-medium">{currentUser.username}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Sporcularım</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {linkedAthletes.length > 0 ? (
                  <div className="space-y-3">
                    {linkedAthletes.map((athlete, index) => (
                      <div key={athlete.id || index} className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center">
                          {athlete.studentName?.charAt(0)}{athlete.studentSurname?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{athlete.studentName} {athlete.studentSurname}</p>
                          <p className="text-sm text-muted-foreground">
                            {athlete.sportsBranches?.join(', ') || 'Branş belirtilmemiş'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz bağlı sporcu bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Sporcu</p>
                    <p className="text-2xl font-bold">{linkedAthletes.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bu Hafta Antrenman</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ödeme Durumu</p>
                    <p className="text-2xl font-bold">Güncel</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Password Change Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Şifre Değiştir</span>
              </DialogTitle>
              <DialogDescription>
                {currentUser.isTemporaryPassword 
                  ? "Güvenliğiniz için geçici şifrenizi değiştirin"
                  : "Yeni şifrenizi belirleyin"
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {passwordSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">En az 6 karakter olmalıdır</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {!currentUser.isTemporaryPassword && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPasswordDialog(false)}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}