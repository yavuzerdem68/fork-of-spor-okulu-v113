import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  CreditCard, 
  Calendar, 
  UserCheck, 
  Camera, 
  MessageCircle,
  Download,
  Eye,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Bell
} from "lucide-react";
import { useRouter } from "next/router";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Mock data for parent's children
const mockChildren = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    age: 12,
    sports: ["Basketbol", "Yüzme"],
    class: "7. Sınıf",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 2,
    name: "Zeynep Yılmaz",
    age: 9,
    sports: ["Voleybol"],
    class: "4. Sınıf",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  }
];

const mockPayments = [
  { id: 1, childName: "Ahmet Yılmaz", month: "Aralık 2024", amount: 500, status: "paid", dueDate: "2024-12-01" },
  { id: 2, childName: "Zeynep Yılmaz", month: "Aralık 2024", amount: 300, status: "paid", dueDate: "2024-12-01" },
  { id: 3, childName: "Ahmet Yılmaz", month: "Ocak 2025", amount: 500, status: "pending", dueDate: "2025-01-01" },
  { id: 4, childName: "Zeynep Yılmaz", month: "Ocak 2025", amount: 300, status: "pending", dueDate: "2025-01-01" }
];

const mockAttendance = [
  { id: 1, childName: "Ahmet Yılmaz", sport: "Basketbol", date: "2024-12-20", status: "present" },
  { id: 2, childName: "Ahmet Yılmaz", sport: "Yüzme", date: "2024-12-19", status: "present" },
  { id: 3, childName: "Zeynep Yılmaz", sport: "Voleybol", date: "2024-12-20", status: "absent" },
  { id: 4, childName: "Ahmet Yılmaz", sport: "Basketbol", date: "2024-12-18", status: "present" },
  { id: 5, childName: "Zeynep Yılmaz", sport: "Voleybol", date: "2024-12-17", status: "present" }
];

const mockSchedule = [
  { id: 1, childName: "Ahmet Yılmaz", sport: "Basketbol", day: "Pazartesi", time: "16:00-17:30", coach: "Mehmet Hoca" },
  { id: 2, childName: "Ahmet Yılmaz", sport: "Yüzme", day: "Çarşamba", time: "17:00-18:00", coach: "Ayşe Hoca" },
  { id: 3, childName: "Zeynep Yılmaz", sport: "Voleybol", day: "Salı", time: "15:30-16:30", coach: "Fatma Hoca" },
  { id: 4, childName: "Zeynep Yılmaz", sport: "Voleybol", day: "Cuma", time: "15:30-16:30", coach: "Fatma Hoca" }
];

const mockMedia = [
  { id: 1, title: "Basketbol Antrenmanı", date: "2024-12-20", type: "photo", childName: "Ahmet Yılmaz" },
  { id: 2, title: "Yüzme Yarışması", date: "2024-12-18", type: "video", childName: "Ahmet Yılmaz" },
  { id: 3, title: "Voleybol Maçı", date: "2024-12-15", type: "photo", childName: "Zeynep Yılmaz" }
];

export default function ParentDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Check if user is logged in and has parent role
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    
    if (role !== "parent") {
      router.push("/login");
      return;
    }
    
    setUserEmail(email || "");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  const getAttendanceRate = (childName: string) => {
    const childAttendance = mockAttendance.filter(a => a.childName === childName);
    const presentCount = childAttendance.filter(a => a.status === "present").length;
    return childAttendance.length > 0 ? Math.round((presentCount / childAttendance.length) * 100) : 0;
  };

  const getPendingPayments = () => {
    return mockPayments.filter(p => p.status === "pending");
  };

  return (
    <>
      <Head>
        <title>Veli Paneli - SportsCRM</title>
        <meta name="description" content="Çocuklarınızın spor okulu bilgilerini takip edin" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">SportsCRM</span>
              <Badge variant="secondary">Veli Paneli</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-primary mb-2">Hoş Geldiniz!</h1>
            <p className="text-muted-foreground">Çocuklarınızın spor okulu bilgilerini buradan takip edebilirsiniz.</p>
          </motion.div>

          {/* Children Cards */}
          <motion.div 
            className="grid md:grid-cols-2 gap-6 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {mockChildren.map((child) => (
              <motion.div key={child.id} variants={fadeInUp}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={child.photo} 
                        alt={child.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">{child.class} • {child.age} yaş</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {child.sports.map((sport) => (
                            <Badge key={sport} variant="outline" className="text-xs">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{getAttendanceRate(child.name)}%</div>
                        <div className="text-xs text-muted-foreground">Devam Oranı</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid md:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{getPendingPayments().length}</div>
                      <div className="text-xs text-muted-foreground">Bekleyen Ödeme</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{mockSchedule.length}</div>
                      <div className="text-xs text-muted-foreground">Haftalık Antrenman</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-8 h-8 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round(mockAttendance.filter(a => a.status === "present").length / mockAttendance.length * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Genel Devam</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">{mockMedia.length}</div>
                      <div className="text-xs text-muted-foreground">Yeni Medya</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="payments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="payments" className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Ödemeler</span>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Program</span>
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Devam</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Medya</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Mesajlar</span>
                </TabsTrigger>
              </TabsList>

              {/* Payments Tab */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Ödeme Durumu</CardTitle>
                    <CardDescription>Çocuklarınızın ödeme bilgilerini görüntüleyin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Öğrenci</TableHead>
                          <TableHead>Dönem</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Son Ödeme</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.childName}</TableCell>
                            <TableCell>{payment.month}</TableCell>
                            <TableCell>₺{payment.amount}</TableCell>
                            <TableCell>{new Date(payment.dueDate).toLocaleDateString('tr-TR')}</TableCell>
                            <TableCell>
                              <Badge variant={payment.status === "paid" ? "default" : "destructive"}>
                                {payment.status === "paid" ? "Ödendi" : "Bekliyor"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Fatura
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Antrenman Programı</CardTitle>
                    <CardDescription>Çocuklarınızın haftalık antrenman programı</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Öğrenci</TableHead>
                          <TableHead>Spor</TableHead>
                          <TableHead>Gün</TableHead>
                          <TableHead>Saat</TableHead>
                          <TableHead>Antrenör</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSchedule.map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell className="font-medium">{schedule.childName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{schedule.sport}</Badge>
                            </TableCell>
                            <TableCell>{schedule.day}</TableCell>
                            <TableCell>{schedule.time}</TableCell>
                            <TableCell>{schedule.coach}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attendance Tab */}
              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Devam Durumu</CardTitle>
                    <CardDescription>Çocuklarınızın antrenman devam durumu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockChildren.map((child) => (
                        <div key={child.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{child.name}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Devam Oranı:</span>
                              <Badge variant="outline">{getAttendanceRate(child.name)}%</Badge>
                            </div>
                          </div>
                          <Progress value={getAttendanceRate(child.name)} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <h4 className="font-semibold mb-4">Son Devam Kayıtları</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Öğrenci</TableHead>
                            <TableHead>Spor</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Durum</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockAttendance.slice(0, 10).map((attendance) => (
                            <TableRow key={attendance.id}>
                              <TableCell className="font-medium">{attendance.childName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{attendance.sport}</Badge>
                              </TableCell>
                              <TableCell>{new Date(attendance.date).toLocaleDateString('tr-TR')}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {attendance.status === "present" ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span>{attendance.status === "present" ? "Katıldı" : "Katılmadı"}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle>Medya Galerisi</CardTitle>
                    <CardDescription>Çocuklarınızın antrenman fotoğraf ve videoları</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {mockMedia.map((media) => (
                        <Card key={media.id}>
                          <CardContent className="p-4">
                            <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                              <Camera className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h4 className="font-medium mb-1">{media.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{media.childName}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(media.date).toLocaleDateString('tr-TR')}
                              </span>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Görüntüle
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Mesajlar</CardTitle>
                    <CardDescription>Spor okulundan gelen mesajlar ve duyurular</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Bell className="w-5 h-5 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium">Basketbol Turnuvası Duyurusu</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Ahmet'in katıldığı basketbol grubunda turnuva düzenlenecektir. Detaylar için...
                            </p>
                            <span className="text-xs text-muted-foreground">2 gün önce</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Bell className="w-5 h-5 text-orange-500 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium">Ödeme Hatırlatması</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Ocak ayı ödemelerinizin son tarihi yaklaşmaktadır.
                            </p>
                            <span className="text-xs text-muted-foreground">1 hafta önce</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Bell className="w-5 h-5 text-green-500 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium">Yeni Fotoğraflar Eklendi</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Zeynep'in voleybol antrenmanından yeni fotoğraflar galeriye eklendi.
                            </p>
                            <span className="text-xs text-muted-foreground">3 gün önce</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
}