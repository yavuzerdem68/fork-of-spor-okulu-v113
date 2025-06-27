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
  Mail,
  Clock,
  MapPin,
  UserCheck,
  Image,
  Video,
  Download,
  ChevronRight
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

  const getAthleteTrainings = () => {
    if (!linkedAthletes || linkedAthletes.length === 0) {
      return [];
    }

    const storedTrainings = localStorage.getItem('trainings');
    if (!storedTrainings) {
      return [];
    }

    const allTrainings = JSON.parse(storedTrainings);
    const linkedAthleteIds = linkedAthletes.map(athlete => athlete.id.toString());

    // Get current week date range
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    const athleteTrainings: any[] = [];

    // Check each training
    allTrainings.forEach((training: any) => {
      // Check if any linked athlete is assigned to this training
      const hasLinkedAthlete = training.assignedAthletes && 
        training.assignedAthletes.some((athleteId: string) => 
          linkedAthleteIds.includes(athleteId)
        );

      if (!hasLinkedAthlete) return;

      // Check if training occurs this week
      if (training.isRecurring && training.recurringDays && training.recurringDays.length > 0) {
        // For recurring trainings, check each day of the week
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayLabels = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        
        training.recurringDays.forEach((dayName: string) => {
          const dayIndex = dayNames.indexOf(dayName);
          if (dayIndex === -1) return;

          // Calculate the date for this day in the current week
          const trainingDate = new Date(startOfWeek);
          trainingDate.setDate(startOfWeek.getDate() + (dayIndex === 0 ? 6 : dayIndex - 1)); // Adjust for Sunday

          // Check if training period covers this week
          const trainingStartDate = new Date(training.startDate || training.date);
          const trainingEndDate = training.endDate ? new Date(training.endDate) : trainingStartDate;

          if (trainingDate >= trainingStartDate && trainingDate <= trainingEndDate && 
              trainingDate >= startOfWeek && trainingDate <= endOfWeek) {
            athleteTrainings.push({
              ...training,
              actualDate: trainingDate,
              dayLabel: dayLabels[dayIndex],
              isRecurringInstance: true
            });
          }
        });
      } else {
        // For single-day trainings
        const trainingDate = new Date(training.startDate || training.date);
        
        if (trainingDate >= startOfWeek && trainingDate <= endOfWeek) {
          const dayIndex = trainingDate.getDay();
          const dayLabels = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
          
          athleteTrainings.push({
            ...training,
            actualDate: trainingDate,
            dayLabel: dayLabels[dayIndex],
            isRecurringInstance: false
          });
        }
      }
    });

    // Sort by date and time
    return athleteTrainings.sort((a, b) => {
      const dateCompare = a.actualDate.getTime() - b.actualDate.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const getWeeklyTrainingCount = () => {
    return getAthleteTrainings().length;
  };

  const getAttendanceData = () => {
    // Load attendance data from localStorage
    const storedAttendance = localStorage.getItem('attendance');
    if (!storedAttendance) return [];

    const allAttendance = JSON.parse(storedAttendance);
    const linkedAthleteIds = linkedAthletes.map(athlete => athlete.id.toString());

    return allAttendance.filter((record: any) => 
      linkedAthleteIds.includes(record.athleteId?.toString())
    );
  };

  const getTrainingMedia = () => {
    // Load media data from localStorage
    const storedMedia = localStorage.getItem('trainingMedia');
    if (!storedMedia) return [];

    const allMedia = JSON.parse(storedMedia);
    const athleteTrainings = getAthleteTrainings();
    const trainingIds = athleteTrainings.map(t => t.id);

    return allMedia.filter((media: any) => 
      trainingIds.includes(media.trainingId)
    );
  };

  // Add a test function to create sample data for debugging
  const createTestData = () => {
    // Create test athletes
    const testAthletes = [
      {
        id: 'test-athlete-1',
        studentName: 'Test',
        studentSurname: 'Sporcu',
        parentName: 'Test',
        parentSurname: 'Veli',
        parentPhone: '+905551234567',
        parentEmail: 'test@test.com',
        sportsBranches: ['Basketbol'],
        status: 'Aktif'
      }
    ];
    
    // Create test parent user
    const testParentUser = {
      id: 'test-parent-1',
      username: 'testveli1234',
      password: 'TV1234',
      firstName: 'Test',
      lastName: 'Veli',
      phone: '+905551234567',
      email: 'test@test.com',
      linkedAthletes: ['test-athlete-1'],
      role: 'parent',
      isActive: true,
      isTemporaryPassword: true
    };
    
    // Create test trainings for this week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    const testTrainings = [
      {
        id: 'test-training-1',
        title: 'Basketbol Antrenmanı',
        sport: 'Basketbol',
        coach: 'Ahmet Yılmaz',
        location: 'Ana Salon',
        startDate: new Date(startOfWeek.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tuesday
        date: new Date(startOfWeek.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '17:30',
        assignedAthletes: ['test-athlete-1'],
        isRecurring: false,
        status: 'Aktif'
      },
      {
        id: 'test-training-2',
        title: 'Basketbol Teknik Antrenman',
        sport: 'Basketbol',
        coach: 'Mehmet Demir',
        location: 'Yan Salon',
        startDate: new Date(startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Friday
        date: new Date(startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '18:00',
        endTime: '19:30',
        assignedAthletes: ['test-athlete-1'],
        isRecurring: false,
        status: 'Aktif'
      },
      {
        id: 'test-training-3',
        title: 'Haftalık Basketbol Antrenmanı',
        sport: 'Basketbol',
        coach: 'Ali Kaya',
        location: 'Ana Salon',
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: new Date(startOfWeek.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next month
        startTime: '17:00',
        endTime: '18:30',
        assignedAthletes: ['test-athlete-1'],
        isRecurring: true,
        recurringDays: ['wednesday', 'saturday'],
        status: 'Aktif'
      }
    ];
    
    // Create test attendance data
    const testAttendance = [
      {
        id: 'att-1',
        athleteId: 'test-athlete-1',
        trainingId: 'test-training-1',
        trainingTitle: 'Basketbol Antrenmanı',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last week
        status: 'present'
      },
      {
        id: 'att-2',
        athleteId: 'test-athlete-1',
        trainingId: 'test-training-2',
        trainingTitle: 'Basketbol Teknik Antrenman',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        status: 'present'
      },
      {
        id: 'att-3',
        athleteId: 'test-athlete-1',
        trainingId: 'test-training-3',
        trainingTitle: 'Haftalık Basketbol Antrenmanı',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        status: 'late'
      },
      {
        id: 'att-4',
        athleteId: 'test-athlete-1',
        trainingId: 'test-training-1',
        trainingTitle: 'Basketbol Antrenmanı',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        status: 'absent'
      }
    ];
    
    // Create test media data
    const testMedia = [
      {
        id: 'media-1',
        trainingId: 'test-training-1',
        title: 'Antrenman Fotoğrafları',
        type: 'image',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        url: '/sample-image.jpg'
      },
      {
        id: 'media-2',
        trainingId: 'test-training-2',
        title: 'Teknik Çalışma Videosu',
        type: 'video',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        url: '/sample-video.mp4'
      },
      {
        id: 'media-3',
        trainingId: 'test-training-3',
        title: 'Maç Görüntüleri',
        type: 'video',
        date: new Date().toISOString(),
        url: '/sample-match.mp4'
      }
    ];
    
    // Save test data
    localStorage.setItem('students', JSON.stringify(testAthletes));
    localStorage.setItem('parentUsers', JSON.stringify([testParentUser]));
    localStorage.setItem('trainings', JSON.stringify(testTrainings));
    localStorage.setItem('attendance', JSON.stringify(testAttendance));
    localStorage.setItem('trainingMedia', JSON.stringify(testMedia));
    
    console.log('Comprehensive test data created:', { 
      testAthletes, 
      testParentUser, 
      testTrainings, 
      testAttendance, 
      testMedia 
    });
    
    alert('Kapsamlı test verisi oluşturuldu! Şimdi test@test.com / TV1234 ile giriş yapabilirsiniz. Antrenman detayları, yoklama ve medya bölümleri test edilebilir.');
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
              <Button variant="outline" onClick={createTestData}>
                Test Verisi Oluştur
              </Button>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
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
                    <p className="text-2xl font-bold">{getWeeklyTrainingCount()}</p>
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

          {/* Training Details Section */}
          <motion.div 
            className="space-y-6 mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Bu Haftaki Antrenmanlar</span>
                </CardTitle>
                <CardDescription>
                  Sporcunuzun bu hafta katılacağı antrenman programı
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getAthleteTrainings().length > 0 ? (
                  <div className="space-y-4">
                    {getAthleteTrainings().map((training, index) => (
                      <div key={`${training.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center">
                            {training.sport.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium">{training.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{training.dayLabel}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{training.startTime} - {training.endTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{training.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{training.coach}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Bu hafta antrenman bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance and Media Section */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {/* Attendance Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Yoklama Durumu</span>
                </CardTitle>
                <CardDescription>
                  Sporcunuzun antrenman katılım durumu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getAttendanceData().length > 0 ? (
                  <div className="space-y-3">
                    {getAttendanceData().slice(0, 5).map((attendance, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{attendance.trainingTitle || 'Antrenman'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attendance.date).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          attendance.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : attendance.status === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attendance.status === 'present' ? 'Katıldı' : 
                           attendance.status === 'absent' ? 'Katılmadı' : 'Geç Kaldı'}
                        </div>
                      </div>
                    ))}
                    {getAttendanceData().length > 5 && (
                      <Button variant="outline" size="sm" className="w-full">
                        Tümünü Görüntüle ({getAttendanceData().length - 5} daha)
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz yoklama kaydı bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-5 w-5" />
                  <span>Antrenman Medyaları</span>
                </CardTitle>
                <CardDescription>
                  Sporcunuzun katıldığı antrenmanlardan fotoğraf ve videolar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getTrainingMedia().length > 0 ? (
                  <div className="space-y-3">
                    {getTrainingMedia().slice(0, 4).map((media, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            {media.type === 'video' ? (
                              <Video className="h-4 w-4 text-primary" />
                            ) : (
                              <Image className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{media.title || 'Medya'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(media.date).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {getTrainingMedia().length > 4 && (
                      <Button variant="outline" size="sm" className="w-full">
                        Tümünü Görüntüle ({getTrainingMedia().length - 4} daha)
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz medya bulunmuyor</p>
                  </div>
                )}
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