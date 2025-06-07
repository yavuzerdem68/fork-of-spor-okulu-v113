import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DollarSign,
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

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

// Mock data
const stats = [
  {
    title: "Toplam Sporcu",
    value: "524",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Aylık Gelir",
    value: "₺45,280",
    change: "+8%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    title: "Aktif Antrenman",
    value: "28",
    change: "+3",
    trend: "up",
    icon: Activity,
    color: "text-purple-600"
  },
  {
    title: "Bekleyen Ödeme",
    value: "₺8,450",
    change: "-15%",
    trend: "down",
    icon: Clock,
    color: "text-orange-600"
  }
];

const recentActivities = [
  {
    id: 1,
    type: "payment",
    message: "Ahmet Yılmaz aidat ödemesi yaptı",
    time: "2 dakika önce",
    amount: "₺350"
  },
  {
    id: 2,
    type: "registration",
    message: "Yeni sporcu kaydı: Elif Demir",
    time: "15 dakika önce",
    sport: "Basketbol"
  },
  {
    id: 3,
    type: "attendance",
    message: "Futbol antrenmanı tamamlandı",
    time: "1 saat önce",
    participants: "18 sporcu"
  },
  {
    id: 4,
    type: "message",
    message: "WhatsApp grubu oluşturuldu: Yüzme U12",
    time: "2 saat önce"
  }
];

const upcomingTrainings = [
  {
    id: 1,
    sport: "Basketbol",
    time: "16:00 - 17:30",
    date: "Bugün",
    participants: 15,
    coach: "Mehmet Özkan"
  },
  {
    id: 2,
    sport: "Yüzme",
    time: "18:00 - 19:00",
    date: "Bugün",
    participants: 12,
    coach: "Ayşe Kaya"
  },
  {
    id: 3,
    sport: "Futbol",
    time: "09:00 - 10:30",
    date: "Yarın",
    participants: 22,
    coach: "Ali Demir"
  }
];

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
                  <p className="text-sm font-medium">Ahmet Yönetici</p>
                  <p className="text-xs text-muted-foreground">Yönetici</p>
                </div>
              )}
              <Button variant="ghost" size="sm">
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
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 space-y-6">
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
                      {recentActivities.map((activity) => (
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
                      ))}
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
                      {upcomingTrainings.map((training) => (
                        <div key={training.id} className="p-3 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{training.sport}</h4>
                            <Badge variant="outline" className="text-xs">
                              {training.date}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {training.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {training.participants} sporcu • {training.coach}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Yeni Sporcu</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <CreditCard className="h-6 w-6" />
                      <span className="text-sm">Ödeme Kaydet</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Antrenman Planla</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-sm">Mesaj Gönder</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}