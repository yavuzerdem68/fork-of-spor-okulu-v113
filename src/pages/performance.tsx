import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3,
  Calendar,
  Trophy,
  Home,
  Users,
  CreditCard,
  FileText,
  MessageCircle,
  Camera,
  UserCheck,
  Settings,
  LogOut,
  Plus,
  Eye,
  Download
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/router";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Mock performance data
const athletes = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    sport: "Basketbol",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    performance: {
      overall: 85,
      technical: 88,
      physical: 82,
      mental: 87,
      teamwork: 90
    },
    goals: [
      { title: "Serbest atış %80", current: 75, target: 80, status: "progress" },
      { title: "Kondisyon testi", current: 85, target: 90, status: "progress" },
      { title: "Takım oyunu", current: 90, target: 85, status: "completed" }
    ],
    achievements: [
      { title: "En İyi Oyuncu", date: "2024-11-15", type: "monthly" },
      { title: "Serbest Atış Rekoru", date: "2024-10-20", type: "skill" }
    ]
  },
  {
    id: 2,
    name: "Elif Demir",
    sport: "Yüzme",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    performance: {
      overall: 92,
      technical: 95,
      physical: 88,
      mental: 90,
      teamwork: 85
    },
    goals: [
      { title: "50m Serbest 30sn", current: 32, target: 30, status: "progress" },
      { title: "Teknik mükemmellik", current: 95, target: 90, status: "completed" }
    ],
    achievements: [
      { title: "Bölge Şampiyonu", date: "2024-12-01", type: "competition" },
      { title: "Teknik Gelişim", date: "2024-11-10", type: "skill" }
    ]
  }
];

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: TrendingUp, label: "Performans", href: "/performance", active: true },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

export default function Performance() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState(athletes[0]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
      return;
    }
  }, [router]);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGoalStatus = (goal: any) => {
    if (goal.status === "completed") return "text-green-600";
    if (goal.current >= goal.target * 0.8) return "text-blue-600";
    return "text-yellow-600";
  };

  return (
    <>
      <Head>
        <title>Performans Takibi - SportsCRM</title>
        <meta name="description" content="Sporcu performans analizi ve takibi" />
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
                <h1 className="text-2xl font-bold text-foreground">Performans Takibi</h1>
                <p className="text-muted-foreground">Sporcu gelişimini analiz edin ve takip edin</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Rapor İndir
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Değerlendirme
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Athletes List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Sporcular</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {athletes.map((athlete) => (
                        <div
                          key={athlete.id}
                          onClick={() => setSelectedAthlete(athlete)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedAthlete.id === athlete.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={athlete.avatar} />
                              <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{athlete.name}</p>
                              <p className="text-xs opacity-70">{athlete.sport}</p>
                            </div>
                            <div className={`text-sm font-bold ${getPerformanceColor(athlete.performance.overall)}`}>
                              {athlete.performance.overall}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Details */}
              <div className="lg:col-span-3">
                <motion.div 
                  key={selectedAthlete.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Athlete Header */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={selectedAthlete.avatar} />
                          <AvatarFallback>{selectedAthlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold">{selectedAthlete.name}</h2>
                          <p className="text-muted-foreground">{selectedAthlete.sport}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">Genel Performans</Badge>
                            <span className={`text-2xl font-bold ${getPerformanceColor(selectedAthlete.performance.overall)}`}>
                              {selectedAthlete.performance.overall}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="performance" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="performance">Performans Analizi</TabsTrigger>
                      <TabsTrigger value="goals">Hedefler</TabsTrigger>
                      <TabsTrigger value="achievements">Başarılar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Performance Metrics */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Performans Metrikleri</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {Object.entries(selectedAthlete.performance).map(([key, value]) => {
                              const labels = {
                                overall: "Genel",
                                technical: "Teknik",
                                physical: "Fiziksel",
                                mental: "Mental",
                                teamwork: "Takım Oyunu"
                              };
                              return (
                                <div key={key} className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">{labels[key as keyof typeof labels]}</span>
                                    <span className={`text-sm font-bold ${getPerformanceColor(value as number)}`}>
                                      {value}%
                                    </span>
                                  </div>
                                  <Progress value={value as number} className="h-2" />
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>

                        {/* Performance Chart Placeholder */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Gelişim Grafiği</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">Performans grafiği burada görüntülenecek</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="goals">
                      <Card>
                        <CardHeader>
                          <CardTitle>Hedefler ve İlerleme</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedAthlete.goals.map((goal, index) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{goal.title}</h4>
                                  <Badge variant={goal.status === "completed" ? "default" : "secondary"}>
                                    {goal.status === "completed" ? "Tamamlandı" : "Devam Ediyor"}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Mevcut: {goal.current}</span>
                                      <span>Hedef: {goal.target}</span>
                                    </div>
                                    <Progress 
                                      value={(goal.current / goal.target) * 100} 
                                      className="h-2" 
                                    />
                                  </div>
                                  <div className={`text-sm font-bold ${getGoalStatus(goal)}`}>
                                    {Math.round((goal.current / goal.target) * 100)}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="achievements">
                      <Card>
                        <CardHeader>
                          <CardTitle>Başarılar ve Ödüller</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedAthlete.achievements.map((achievement, index) => (
                              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Award className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{achievement.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(achievement.date).toLocaleDateString('tr-TR')}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {achievement.type === "monthly" && "Aylık"}
                                  {achievement.type === "skill" && "Beceri"}
                                  {achievement.type === "competition" && "Yarışma"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}