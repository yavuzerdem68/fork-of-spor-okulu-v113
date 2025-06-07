import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download,
  Calendar,
  Users,
  Trophy,
  Home,
  CreditCard,
  MessageCircle,
  Camera,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  PieChart,
  LineChart,
  BarChart,
  Filter,
  RefreshCw,
  Eye,
  Share
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Mock data
const monthlyStats = [
  { month: "Ocak", revenue: 42500, students: 485, attendance: 92 },
  { month: "Şubat", revenue: 45200, students: 498, attendance: 89 },
  { month: "Mart", revenue: 48100, students: 512, attendance: 94 },
  { month: "Nisan", revenue: 46800, students: 507, attendance: 91 },
  { month: "Mayıs", revenue: 49300, students: 524, attendance: 88 },
  { month: "Haziran", revenue: 51200, students: 532, attendance: 93 }
];

const sportStats = [
  { sport: "Futbol", students: 145, revenue: 14500, attendance: 91, growth: 8 },
  { sport: "Basketbol", students: 98, revenue: 9800, attendance: 94, growth: 12 },
  { sport: "Yüzme", students: 87, revenue: 10440, attendance: 89, growth: 5 },
  { sport: "Voleybol", students: 76, revenue: 7600, attendance: 92, growth: -2 },
  { sport: "Hentbol", students: 65, revenue: 6500, attendance: 88, growth: 15 },
  { sport: "Satranç", students: 42, revenue: 3360, attendance: 96, growth: 22 },
  { sport: "Akıl Oyunları", students: 19, revenue: 1520, attendance: 94, growth: 18 }
];

const paymentStats = [
  { status: "Ödendi", count: 487, amount: 48700, percentage: 91.5 },
  { status: "Gecikmiş", count: 28, amount: 2800, percentage: 5.3 },
  { status: "Bekliyor", count: 17, amount: 1700, percentage: 3.2 }
];

const topPerformers = [
  { name: "Mehmet Özkan", sport: "Basketbol", students: 25, attendance: 96, rating: 4.9 },
  { name: "Ayşe Kaya", sport: "Yüzme", students: 22, attendance: 94, rating: 4.8 },
  { name: "Ali Demir", sport: "Futbol", students: 28, attendance: 92, rating: 4.7 },
  { name: "Fatma Şen", sport: "Hentbol", students: 20, attendance: 95, rating: 4.8 },
  { name: "Hasan Yıldız", sport: "Voleybol", students: 18, attendance: 91, rating: 4.6 }
];

const recentReports = [
  {
    id: 1,
    title: "Aylık Gelir Raporu - Haziran 2024",
    type: "Finansal",
    generatedDate: "2024-06-30",
    generatedBy: "Sistem",
    size: "2.4 MB",
    downloads: 12
  },
  {
    id: 2,
    title: "Sporcu Devam Durumu Raporu",
    type: "Yoklama",
    generatedDate: "2024-06-28",
    generatedBy: "Ahmet Yönetici",
    size: "1.8 MB",
    downloads: 8
  },
  {
    id: 3,
    title: "Branş Bazında Performans Analizi",
    type: "Analiz",
    generatedDate: "2024-06-25",
    generatedBy: "Sistem",
    size: "3.1 MB",
    downloads: 15
  },
  {
    id: 4,
    title: "Antrenör Değerlendirme Raporu",
    type: "Performans",
    generatedDate: "2024-06-20",
    generatedBy: "Ahmet Yönetici",
    size: "1.2 MB",
    downloads: 6
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
  { icon: FileText, label: "Raporlar", href: "/reports", active: true },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedSport, setSelectedSport] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const totalRevenue = monthlyStats.reduce((sum, month) => sum + month.revenue, 0);
  const totalStudents = monthlyStats[monthlyStats.length - 1].students;
  const avgAttendance = Math.round(monthlyStats.reduce((sum, month) => sum + month.attendance, 0) / monthlyStats.length);
  const revenueGrowth = ((monthlyStats[monthlyStats.length - 1].revenue - monthlyStats[0].revenue) / monthlyStats[0].revenue * 100).toFixed(1);

  return (
    <>
      <Head>
        <title>Raporlar - SportsCRM</title>
        <meta name="description" content="Detaylı raporlar ve analizler" />
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
                <h1 className="text-2xl font-bold text-foreground">Raporlar ve Analizler</h1>
                <p className="text-muted-foreground">Detaylı performans raporları ve istatistikler</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Toplam Gelir</p>
                        <p className="text-2xl font-bold">₺{totalRevenue.toLocaleString()}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">+{revenueGrowth}%</span>
                        </div>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Aktif Sporcu</p>
                        <p className="text-2xl font-bold">{totalStudents}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">+9.7%</span>
                        </div>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ortalama Devam</p>
                        <p className="text-2xl font-bold">{avgAttendance}%</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">+2.1%</span>
                        </div>
                      </div>
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Spor Branşı</p>
                        <p className="text-2xl font-bold">{sportStats.length}</p>
                        <div className="flex items-center mt-1">
                          <Target className="h-3 w-3 text-orange-600 mr-1" />
                          <span className="text-xs text-orange-600">Aktif</span>
                        </div>
                      </div>
                      <Trophy className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                  <TabsTrigger value="financial">Finansal</TabsTrigger>
                  <TabsTrigger value="sports">Branş Analizi</TabsTrigger>
                  <TabsTrigger value="performance">Performans</TabsTrigger>
                  <TabsTrigger value="generated">Oluşturulan Raporlar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Filters */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4">
                          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Dönem Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Haftalık</SelectItem>
                              <SelectItem value="monthly">Aylık</SelectItem>
                              <SelectItem value="quarterly">Çeyreklik</SelectItem>
                              <SelectItem value="yearly">Yıllık</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select value={selectedSport} onValueChange={setSelectedSport}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Spor Branşı" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tüm Branşlar</SelectItem>
                              {sportStats.map(sport => (
                                <SelectItem key={sport.sport} value={sport.sport}>{sport.sport}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Rapor İndir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <LineChart className="h-5 w-5 mr-2" />
                          Aylık Gelir Trendi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {monthlyStats.map((month, index) => (
                            <div key={month.month} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{month.month}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(month.revenue / 60000) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-20 text-right">
                                  ₺{month.revenue.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart className="h-5 w-5 mr-2" />
                          Sporcu Sayısı Trendi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {monthlyStats.map((month, index) => (
                            <div key={month.month} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{month.month}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(month.students / 600) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-16 text-right">
                                  {month.students}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ödeme Durumu Analizi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {paymentStats.map((stat) => (
                            <div key={stat.status} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{stat.status}</span>
                                <span className="text-sm text-muted-foreground">{stat.percentage}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    stat.status === 'Ödendi' ? 'bg-green-600' :
                                    stat.status === 'Bekliyor' ? 'bg-orange-600' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${stat.percentage}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{stat.count} ödeme</span>
                                <span>₺{stat.amount.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Branş Bazında Gelir</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {sportStats.slice(0, 5).map((sport) => (
                            <div key={sport.sport} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{sport.sport}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(sport.revenue / 15000) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-16 text-right">
                                  ₺{sport.revenue.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="sports" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Spor Branşları Detaylı Analizi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Spor Branşı</TableHead>
                            <TableHead>Sporcu Sayısı</TableHead>
                            <TableHead>Aylık Gelir</TableHead>
                            <TableHead>Devam Oranı</TableHead>
                            <TableHead>Büyüme</TableHead>
                            <TableHead>Durum</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sportStats.map((sport) => (
                            <TableRow key={sport.sport}>
                              <TableCell className="font-medium">{sport.sport}</TableCell>
                              <TableCell>{sport.students}</TableCell>
                              <TableCell>₺{sport.revenue.toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span>{sport.attendance}%</span>
                                  <div className="w-16 bg-muted rounded-full h-1">
                                    <div 
                                      className="bg-green-600 h-1 rounded-full" 
                                      style={{ width: `${sport.attendance}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  {sport.growth > 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                  )}
                                  <span className={sport.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {sport.growth > 0 ? '+' : ''}{sport.growth}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={sport.growth > 0 ? 'default' : 'destructive'}>
                                  {sport.growth > 0 ? 'Büyüyor' : 'Azalıyor'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>En İyi Performans Gösteren Antrenörler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topPerformers.map((performer, index) => (
                          <div key={performer.name} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                              {index + 1}
                            </div>
                            
                            <Avatar>
                              <AvatarFallback>{performer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{performer.name}</h4>
                              <p className="text-sm text-muted-foreground">{performer.sport}</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm font-medium">{performer.students}</p>
                              <p className="text-xs text-muted-foreground">Sporcu</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm font-medium">{performer.attendance}%</p>
                              <p className="text-xs text-muted-foreground">Devam</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium">{performer.rating}</span>
                                <span className="text-yellow-500">⭐</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Puan</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="generated" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Oluşturulan Raporlar</CardTitle>
                          <CardDescription>
                            Daha önce oluşturulmuş raporlar
                          </CardDescription>
                        </div>
                        <Button>
                          <FileText className="h-4 w-4 mr-2" />
                          Yeni Rapor Oluştur
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rapor Adı</TableHead>
                            <TableHead>Tür</TableHead>
                            <TableHead>Oluşturulma Tarihi</TableHead>
                            <TableHead>Oluşturan</TableHead>
                            <TableHead>Boyut</TableHead>
                            <TableHead>İndirme</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{report.type}</Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(report.generatedDate).toLocaleDateString('tr-TR')}
                              </TableCell>
                              <TableCell>{report.generatedBy}</TableCell>
                              <TableCell>{report.size}</TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {report.downloads} kez
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Share className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}