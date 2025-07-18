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

      // Get which athletes from this parent are assigned
      const assignedLinkedAthletes = linkedAthletes.filter(athlete => 
        training.assignedAthletes && training.assignedAthletes.includes(athlete.id.toString())
      );

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
          const trainingEndDate = training.endDate ? new Date(training.endDate) : new Date(trainingStartDate.getTime() + 365 * 24 * 60 * 60 * 1000); // Default to 1 year if no end date

          if (trainingDate >= trainingStartDate && trainingDate <= trainingEndDate && 
              trainingDate >= startOfWeek && trainingDate <= endOfWeek) {
            athleteTrainings.push({
              ...training,
              actualDate: trainingDate,
              dayLabel: dayLabels[dayIndex],
              isRecurringInstance: true,
              assignedLinkedAthletes: assignedLinkedAthletes
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
            isRecurringInstance: false,
            assignedLinkedAthletes: assignedLinkedAthletes
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

  // Get weekly training schedule organized by days
  const getWeeklySchedule = () => {
    const trainings = getAthleteTrainings();
    const schedule: { [key: string]: any[] } = {
      'Pazartesi': [],
      'Salı': [],
      'Çarşamba': [],
      'Perşembe': [],
      'Cuma': [],
      'Cumartesi': [],
      'Pazar': []
    };

    trainings.forEach(training => {
      if (schedule[training.dayLabel]) {
        schedule[training.dayLabel].push(training);
      }
    });

    return schedule;
  };

  // Get next upcoming training
  const getNextTraining = () => {
    const trainings = getAthleteTrainings();
    const now = new Date();
    
    const upcomingTrainings = trainings.filter(training => {
      const trainingDateTime = new Date(training.actualDate);
      const [hours, minutes] = training.startTime.split(':');
      trainingDateTime.setHours(parseInt(hours), parseInt(minutes));
      return trainingDateTime > now;
    });

    return upcomingTrainings.length > 0 ? upcomingTrainings[0] : null;
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

  // FIXED: Add function to calculate total debt for all linked athletes
  const getTotalDebt = () => {
    if (!linkedAthletes || linkedAthletes.length === 0) {
      return 0;
    }

    let totalDebt = 0;

    linkedAthletes.forEach(athlete => {
      // Load account entries for this athlete
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      
      // Calculate balance (debit - credit) with proper number handling
      const balance = accountEntries.reduce((total: number, entry: any) => {
        const amount = parseFloat(String(entry.amountIncludingVat || 0).replace(',', '.')) || 0;
        return entry.type === 'debit' 
          ? total + amount
          : total - amount;
      }, 0);
      
      // Round to 2 decimal places to avoid floating point errors
      const roundedBalance = Math.round(balance * 100) / 100;
      
      // Only add positive balances (debts)
      if (roundedBalance > 0) {
        totalDebt += roundedBalance;
      }
    });

    return Math.round(totalDebt * 100) / 100;
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
                    <p className="text-sm font-medium text-muted-foreground">Toplam Borç</p>
                    <p className={`text-2xl font-bold ${getTotalDebt() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₺{getTotalDebt().toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
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
            {/* Next Training Card */}
            {getNextTraining() && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Clock className="h-5 w-5" />
                    <span>Sıradaki Antrenman</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const nextTraining = getNextTraining();
                    if (!nextTraining) return null;
                    
                    return (
                      <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center">
                            {nextTraining.sport.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{nextTraining.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{nextTraining.dayLabel}, {nextTraining.actualDate.toLocaleDateString('tr-TR')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{nextTraining.startTime} - {nextTraining.endTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{nextTraining.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-sm text-muted-foreground">Katılacak sporcular:</span>
                              {nextTraining.assignedLinkedAthletes?.map((athlete: any, idx: number) => (
                                <span key={athlete.id} className="text-sm font-medium text-primary">
                                  {athlete.studentName} {athlete.studentSurname}
                                  {idx < nextTraining.assignedLinkedAthletes.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Weekly Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Haftalık Antrenman Programı</span>
                </CardTitle>
                <CardDescription>
                  Sporcularınızın bu hafta katılacağı tüm antrenmanlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getAthleteTrainings().length > 0 ? (
                  <div className="space-y-6">
                    {/* Weekly Calendar View */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {Object.entries(getWeeklySchedule()).map(([day, dayTrainings]) => (
                        <div key={day} className="space-y-2">
                          <h4 className="font-medium text-sm text-center p-2 bg-muted rounded-lg">
                            {day}
                          </h4>
                          <div className="space-y-2 min-h-[100px]">
                            {dayTrainings.map((training, index) => (
                              <div key={`${training.id}-${index}`} className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <div className="text-xs font-medium text-primary mb-1">
                                  {training.startTime} - {training.endTime}
                                </div>
                                <div className="text-xs font-medium mb-1">
                                  {training.title}
                                </div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  {training.location}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {training.assignedLinkedAthletes?.map((athlete: any) => athlete.studentName).join(', ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detailed List View */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Detaylı Antrenman Listesi</h4>
                      <div className="space-y-3">
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
                                    <span>{training.dayLabel}, {training.actualDate.toLocaleDateString('tr-TR')}</span>
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
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-muted-foreground">Katılacak:</span>
                                  {training.assignedLinkedAthletes?.map((athlete: any, idx: number) => (
                                    <span key={athlete.id} className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                                      {athlete.studentName} {athlete.studentSurname}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {training.isRecurringInstance ? 'Haftalık' : 'Tek Seferlik'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {training.sport} - {training.ageGroup || 'Genel'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Bu hafta antrenman bulunmuyor</p>
                    <p className="text-sm text-muted-foreground">
                      Antrenman programı henüz oluşturulmamış olabilir veya sporcunuz herhangi bir antrenmana atanmamış olabilir.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Account Section - ADDED */}
          <motion.div 
            className="space-y-6 mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Cari Hesap Durumu</span>
                </CardTitle>
                <CardDescription>
                  Sporcularınızın ödeme ve borç durumu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {linkedAthletes.length > 0 ? (
                  <div className="space-y-4">
                    {linkedAthletes.map((athlete, index) => {
                      // Calculate balance for this athlete
                      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
                      const balance = accountEntries.reduce((total: number, entry: any) => {
                        const amount = parseFloat(String(entry.amountIncludingVat || 0).replace(',', '.')) || 0;
                        return entry.type === 'debit' 
                          ? total + amount
                          : total - amount;
                      }, 0);
                      const roundedBalance = Math.round(balance * 100) / 100;
                      
                      // Get recent entries - FIXED: Sort chronologically (oldest to newest) for proper display
                      const recentEntries = accountEntries
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(-3) // Get last 3 entries (most recent)
                        .reverse(); // Show most recent first in display

                      return (
                        <Card key={athlete.id || index} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center">
                                  {athlete.studentName?.charAt(0)}{athlete.studentSurname?.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-medium">{athlete.studentName} {athlete.studentSurname}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {athlete.sportsBranches?.join(', ') || 'Branş belirtilmemiş'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Bakiye</p>
                                <p className={`text-lg font-bold ${roundedBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ₺{Math.abs(roundedBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {roundedBalance > 0 ? 'Borç' : roundedBalance < 0 ? 'Alacak' : 'Sıfır'}
                                </p>
                              </div>
                            </div>
                            
                            {recentEntries.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Son Hareketler</h4>
                                <div className="space-y-2">
                                  {recentEntries.map((entry: any, entryIndex: number) => (
                                    <div key={entryIndex} className="flex items-center justify-between p-2 bg-accent/30 rounded">
                                      <div>
                                        <p className="text-sm font-medium">{entry.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(entry.date).toLocaleDateString('tr-TR')}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className={`text-sm font-medium ${entry.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                          {entry.type === 'debit' ? '+' : '-'}₺{Math.round(entry.amountIncludingVat * 100) / 100}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {entry.type === 'debit' ? 'Borç' : 'Ödeme'}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {accountEntries.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center mt-2">
                                    ... ve {accountEntries.length - 3} hareket daha
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {accountEntries.length === 0 && (
                              <div className="text-center py-4">
                                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Henüz cari hesap hareketi bulunmuyor</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {/* Total Summary */}
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Toplam Borç Durumu</h3>
                            <p className="text-sm text-muted-foreground">Tüm sporcular için</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-bold ${getTotalDebt() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ₺{getTotalDebt().toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getTotalDebt() > 0 ? 'Toplam Borç' : 'Borç Yok'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz bağlı sporcu bulunmuyor</p>
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