import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  CreditCard, 
  FileText, 
  Calendar, 
  MessageCircle, 
  Camera, 
  UserCheck, 
  BarChart3,
  Trophy,
  Target,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Plus,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  LogOut,
  Home,
  Banknote,
  TrendingUp,
  Activity,
  Clock,
  Heart,
  Package,
  ShoppingCart,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/router";
import { SessionManager } from "@/utils/security";
import { hashPassword, verifyPassword } from "@/utils/security";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
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
  const [stats, setStats] = useState([
    {
      title: "Toplam Sporcu",
      value: "0",
      change: "0%",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Aylık Gelir",
      value: "₺0",
      change: "0%",
      trend: "up",
      icon: Banknote,
      color: "text-green-600"
    },
    {
      title: "Aktif Antrenman",
      value: "0",
      change: "0",
      trend: "up",
      icon: Activity,
      color: "text-purple-600"
    },
    {
      title: "Bekleyen Ödeme",
      value: "₺0",
      change: "0%",
      trend: "down",
      icon: Clock,
      color: "text-orange-600"
    }
  ]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingTrainings, setUpcomingTrainings] = useState<any[]>([]);

  useEffect(() => {
    // Immediate check to prevent flickering
    const { isValid, session } = SessionManager.validateSession();
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    const user = localStorage.getItem("currentUser");
    
    if (!isValid || role !== "admin") {
      SessionManager.destroySession();
      router.replace("/login");
      return;
    }
    
    setUserRole(role);
    setUserEmail(email || "");
    
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      
      // Check if user has temporary password
      if (userData.isTemporaryPassword) {
        setShowPasswordDialog(true);
      }
    }
    
    // Load real data from localStorage
    loadDashboardData();
  }, [router]);

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
      const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const updatedAdminUsers = adminUsers.map((admin: any) => 
        admin.id === currentUser.id 
          ? { 
              ...admin, 
              password: hashedNewPassword, 
              isTemporaryPassword: false,
              updatedAt: new Date().toISOString() 
            }
          : admin
      );

      localStorage.setItem('adminUsers', JSON.stringify(updatedAdminUsers));

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

  const loadDashboardData = () => {
    // Load athletes
    const athletes = JSON.parse(localStorage.getItem('students') || '[]');
    const activeAthletes = athletes.filter((a: any) => a.status === 'Aktif' || !a.status);
    
    // Load trainings
    const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todayTrainings = trainings.filter((t: any) => t.date === todayStr || t.startDate === todayStr);
    const tomorrowTrainings = trainings.filter((t: any) => t.date === tomorrowStr || t.startDate === tomorrowStr);
    
    // Calculate monthly income (fixed calculation)
    const thisMonth = new Date().toISOString().slice(0, 7);
    let monthlyIncome = 0;
    athletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      const thisMonthPayments = accountEntries.filter((entry: any) => {
        // Check both month field and date field for this month
        const entryMonth = entry.month || new Date(entry.date).toISOString().slice(0, 7);
        return entryMonth === thisMonth && entry.type === 'credit';
      });
      thisMonthPayments.forEach((entry: any) => {
        const amount = parseFloat(String(entry.amountIncludingVat).replace(',', '.')) || 0;
        if (!isNaN(amount) && amount > 0) {
          monthlyIncome += amount;
        }
      });
    });

    // Calculate pending payments
    let pendingPayments = 0;
    athletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      const balance = accountEntries.reduce((total: number, entry: any) => {
        return entry.type === 'debit' 
          ? total + (entry.amountIncludingVat || 0)
          : total - (entry.amountIncludingVat || 0);
      }, 0);
      if (balance > 0) {
        pendingPayments += balance;
      }
    });

    // Update stats
    setStats([
      {
        title: "Toplam Sporcu",
        value: athletes.length.toString(),
        change: "0%",
        trend: "up",
        icon: Users,
        color: "text-blue-600"
      },
      {
        title: "Aylık Gelir",
        value: `₺${Math.round(monthlyIncome).toLocaleString('tr-TR')}`,
        change: "0%",
        trend: "up",
        icon: Banknote,
        color: "text-green-600"
      },
      {
        title: "Aktif Antrenman",
        value: trainings.filter((t: any) => t.status === 'Aktif' || !t.status).length.toString(),
        change: "0",
        trend: "up",
        icon: Activity,
        color: "text-purple-600"
      },
      {
        title: "Bekleyen Ödeme",
        value: `₺${Math.round(pendingPayments).toLocaleString('tr-TR')}`,
        change: "0%",
        trend: "down",
        icon: Clock,
        color: "text-orange-600"
      }
    ]);

    // Set upcoming trainings
    const upcomingList = [
      ...todayTrainings.map((t: any) => ({ ...t, displayDate: "Bugün" })),
      ...tomorrowTrainings.map((t: any) => ({ ...t, displayDate: "Yarın" }))
    ].slice(0, 5);
    
    setUpcomingTrainings(upcomingList);

    // Set recent activities (empty for now, will be populated as users use the system)
    setRecentActivities([]);
  };

  const handleLogout = () => {
    SessionManager.destroySession();
    router.replace("/");
  };

  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Users, label: "Sporcular", href: "/athletes" },
    { icon: Zap, label: "Antrenörler", href: "/coaches" },
    { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
    { icon: UserCheck, label: "Yoklama", href: "/attendance" },
    { icon: CreditCard, label: "Ödemeler", href: "/payments" },
    { icon: Package, label: "Stok ve Satış", href: "/inventory-sales" },
    { icon: Trophy, label: "Etkinlikler", href: "/events-tournaments" },
    { icon: Heart, label: "Sağlık Kayıtları", href: "/health-records" },
    { icon: BarChart3, label: "Performans", href: "/performance" },
    { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
    { icon: Camera, label: "Medya", href: "/media" },
    { icon: FileText, label: "Raporlar", href: "/reports" },
    { icon: Settings, label: "Ayarlar", href: "/settings" },
    { icon: Shield, label: "Yönetici Ayarları", href: "/admin-settings" }
  ];

  return (
    <>
      <Head>
        <title>Dashboard - SportsCRM</title>
        <meta name="description" content="Spor okulu yönetim paneli" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <motion.aside 
          className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300 flex flex-col`}
          initial={{ x: -100 }}
          animate={{ x: 0 }}
        >
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              {sidebarOpen && (
                <span className="text-xl font-bold text-primary">SportsCRM</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item, index) => (
                <motion.li 
                  key={item.label}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.1 }}
                >
                  <a
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
                <AvatarFallback>AY</AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium">Yönetici</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Spor okulu genel durumu</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Ara..." 
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/system-settings')}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Temporary Password Warning */}
            {currentUser?.isTemporaryPassword && (
              <motion.div 
                className="mb-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Güvenlik Uyarısı:</strong> Geçici şifre kullanıyorsunuz. Güvenliğiniz için lütfen şifrenizi değiştirin.
                    <Button 
                      variant="link" 
                      className="p-0 ml-2 h-auto"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      Şifreyi Değiştir
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {stats.map((stat, index) => (
                <motion.div key={stat.title} variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change} geçen aydan
                          </p>
                        </div>
                        <div className={`p-3 rounded-full bg-accent ${stat.color}`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts and Activities */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activities */}
              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Son Aktiviteler</CardTitle>
                    <CardDescription>
                      Sistemdeki son hareketler
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-accent/50">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.message}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                            {activity.amount && (
                              <Badge variant="secondary">{activity.amount}</Badge>
                            )}
                            {activity.sport && (
                              <Badge variant="outline">{activity.sport}</Badge>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Henüz aktivite bulunmuyor</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Sistem kullanıldıkça aktiviteler burada görünecek
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upcoming Trainings */}
              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <Card>
                  <CardHeader>
                    <CardTitle>Yaklaşan Antrenmanlar</CardTitle>
                    <CardDescription>
                      Bugün ve yarın
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingTrainings.length > 0 ? (
                        upcomingTrainings.map((training) => (
                          <div key={training.id} className="p-3 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{training.title || training.sport}</h4>
                              <Badge variant="outline" className="text-xs">
                                {training.displayDate}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {training.startTime} - {training.endTime}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {training.assignedAthletes?.length || 0} sporcu • {training.coach}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">Yaklaşan antrenman yok</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Antrenman programı oluşturun
                          </p>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => router.push('/trainings')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Antrenman
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Card>
                <CardHeader>
                  <CardTitle>Hızlı İşlemler</CardTitle>
                  <CardDescription>
                    Sık kullanılan işlemler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => router.push('/athletes')}
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Yeni Sporcu</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => router.push('/payments')}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span className="text-sm">Ödeme Kaydet</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => router.push('/inventory-sales')}
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-sm">Yeni Satış</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => router.push('/trainings')}
                    >
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Antrenman Planla</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => router.push('/events-tournaments')}
                    >
                      <Trophy className="h-6 w-6" />
                      <span className="text-sm">Yeni Etkinlik</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => router.push('/health-records')}
                    >
                      <Heart className="h-6 w-6" />
                      <span className="text-sm">Sağlık Kaydı</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col space-y-2"
                      onClick={() => router.push('/messages')}
                    >
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-sm">Mesaj Gönder</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
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
                {currentUser?.isTemporaryPassword 
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
                {!currentUser?.isTemporaryPassword && (
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