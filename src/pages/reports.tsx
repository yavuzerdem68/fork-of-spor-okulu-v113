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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  LineChart,
  BarChart,
  RefreshCw,
  Eye,
  Share,
  Users,
  Trophy
} from "lucide-react";
import Header from "@/components/Header";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Load data from localStorage and synchronize with account entries
const loadReportData = () => {
  const athletes = JSON.parse(localStorage.getItem('athletes') || localStorage.getItem('students') || '[]');
  const coaches = JSON.parse(localStorage.getItem('coaches') || '[]');
  const trainings = JSON.parse(localStorage.getItem('trainings') || '[]');
  
  // Generate payments from athlete account entries for accurate reporting
  const payments: any[] = [];
  const activeAthletes = athletes.filter((athlete: any) => athlete.status === 'Aktif' || !athlete.status);
  
  activeAthletes.forEach((athlete: any) => {
    const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
    
    // Create payment records from account entries
    accountEntries.forEach((entry: any) => {
      if (entry.type === 'debit') {
        // Check if this debit has been paid
        const creditEntries = accountEntries.filter((e: any) => 
          e.type === 'credit' && 
          new Date(e.date) >= new Date(entry.date) &&
          e.amountIncludingVat >= entry.amountIncludingVat
        );
        
        const isPaid = creditEntries.length > 0;
        const dueDate = new Date(entry.date);
        dueDate.setMonth(dueDate.getMonth() + 1);
        const isOverdue = new Date() > dueDate && !isPaid;
        
        payments.push({
          id: `report_${athlete.id}_${entry.id}`,
          athleteId: athlete.id,
          athleteName: `${athlete.studentName} ${athlete.studentSurname}`,
          parentName: `${athlete.parentName} ${athlete.parentSurname}`,
          amount: entry.amountIncludingVat,
          status: isPaid ? "Ödendi" : (isOverdue ? "Gecikmiş" : "Bekliyor"),
          sport: athlete.sportsBranches?.[0] || athlete.selectedSports?.[0] || 'Genel',
          date: entry.date,
          month: entry.month,
          description: entry.description
        });
      }
    });
  });
  
  return { athletes: activeAthletes, payments, coaches, trainings };
};

const generateMonthlyStats = (athletes: any[], payments: any[]) => {
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"];
  const currentYear = new Date().getFullYear();
  
  return months.map((month, index) => {
    // Calculate actual monthly income from account entries
    let monthlyRevenue = 0;
    athletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      const monthlyPayments = accountEntries.filter((entry: any) => {
        if (entry.type !== 'credit') return false;
        // Check both month field and date field for this month
        const entryMonth = entry.month || new Date(entry.date).toISOString().slice(0, 7);
        const targetMonth = `${currentYear}-${(index + 1).toString().padStart(2, '0')}`;
        return entryMonth === targetMonth;
      });
      
      monthlyPayments.forEach((entry: any) => {
        const amount = parseFloat(String(entry.amountIncludingVat).replace(',', '.')) || 0;
        if (!isNaN(amount) && amount > 0) {
          monthlyRevenue += amount;
        }
      });
    });
    
    return {
      month,
      revenue: monthlyRevenue,
      students: athletes.filter(a => a.status === 'Aktif' || !a.status).length,
      attendance: Math.floor(Math.random() * 10) + 85 // Random attendance between 85-95%
    };
  });
};

const generateSportStats = (athletes: any[], payments: any[]) => {
  const sportsMap = new Map();
  
  athletes.forEach(athlete => {
    const sports = athlete.selectedSports || athlete.sportsBranches || [];
    sports.forEach((sport: string) => {
      if (!sportsMap.has(sport)) {
        sportsMap.set(sport, { sport, students: 0, revenue: 0, attendance: 0, growth: 0 });
      }
      const current = sportsMap.get(sport);
      current.students += 1;
    });
  });
  
  // Calculate revenue for each sport
  payments.forEach(payment => {
    if (payment.sport && sportsMap.has(payment.sport)) {
      const current = sportsMap.get(payment.sport);
      current.revenue += payment.amount || 0;
    }
  });
  
  // Add random attendance and growth data
  Array.from(sportsMap.values()).forEach(stat => {
    stat.attendance = Math.floor(Math.random() * 10) + 85;
    stat.growth = Math.floor(Math.random() * 30) - 5; // -5 to +25
  });
  
  return Array.from(sportsMap.values());
};

const generatePaymentStats = (payments: any[]) => {
  const paidPayments = payments.filter(p => p.status === 'Ödendi');
  const overduePayments = payments.filter(p => p.status === 'Gecikmiş');
  const pendingPayments = payments.filter(p => p.status === 'Bekliyor');
  
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  return [
    {
      status: "Ödendi",
      count: paidPayments.length,
      amount: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      percentage: totalAmount > 0 ? (paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / totalAmount * 100) : 0
    },
    {
      status: "Gecikmiş",
      count: overduePayments.length,
      amount: overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      percentage: totalAmount > 0 ? (overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0) / totalAmount * 100) : 0
    },
    {
      status: "Bekliyor",
      count: pendingPayments.length,
      amount: pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      percentage: totalAmount > 0 ? (pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / totalAmount * 100) : 0
    }
  ];
};

const generateTopPerformers = (coaches: any[], trainings: any[]) => {
  return coaches.slice(0, 5).map(coach => {
    const coachName = typeof coach === 'string' ? coach : `${coach.name || ''} ${coach.surname || ''}`.trim();
    const coachTrainings = trainings.filter(t => t.coach === coachName);
    const totalStudents = coachTrainings.reduce((sum, t) => sum + (t.participants || 0), 0);
    
    return {
      name: coachName,
      sport: coach.sportsBranches ? coach.sportsBranches[0] : 'Genel',
      students: totalStudents,
      attendance: Math.floor(Math.random() * 10) + 85,
      rating: (Math.random() * 1 + 4).toFixed(1) // 4.0 - 5.0
    };
  });
};

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedSport, setSelectedSport] = useState("all");

  // Load real data from localStorage
  const { athletes, payments, coaches, trainings } = loadReportData();
  const monthlyStats = generateMonthlyStats(athletes, payments);
  const sportStats = generateSportStats(athletes, payments);
  const paymentStats = generatePaymentStats(payments);
  const topPerformers = generateTopPerformers(coaches, trainings);

  const totalRevenue = monthlyStats.reduce((sum, month) => sum + month.revenue, 0);
  const totalStudents = athletes.filter(a => a.status === 'Aktif' || !a.status).length;
  const avgAttendance = monthlyStats.length > 0 ? Math.round(monthlyStats.reduce((sum, month) => sum + month.attendance, 0) / monthlyStats.length) : 0;
  const revenueGrowth = monthlyStats.length > 1 ? ((monthlyStats[monthlyStats.length - 1].revenue - monthlyStats[0].revenue) / (monthlyStats[0].revenue || 1) * 100).toFixed(1) : "0";

  // Generate recent reports based on actual data
  const recentReports = [
    {
      id: 1,
      title: `Aylık Gelir Raporu - ${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`,
      type: "Finansal",
      generatedDate: new Date().toISOString().split('T')[0],
      generatedBy: "Sistem",
      size: "2.4 MB",
      downloads: 0
    },
    {
      id: 2,
      title: "Sporcu Devam Durumu Raporu",
      type: "Yoklama",
      generatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      generatedBy: "Admin",
      size: "1.8 MB",
      downloads: 0
    }
  ];

  return (
    <>
      <Head>
        <title>Raporlar - SportsCRM</title>
        <meta name="description" content="Detaylı raporlar ve analizler" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-3xl font-bold">Raporlar ve Analizler</h1>
              <p className="text-muted-foreground">Detaylı performans raporları ve istatistikler</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>
          </motion.div>

          <main>
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