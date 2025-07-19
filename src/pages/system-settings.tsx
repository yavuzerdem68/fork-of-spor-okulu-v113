import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Save,
  Image as ImageIcon,
  Palette,
  Building,
  Shield,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  ArrowLeft,
  Home
} from 'lucide-react';
import { useRouter } from 'next/router';
import { simpleAuthManager } from '@/lib/simple-auth';

const SystemSettings = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    schoolName: 'Spor Okulu CRM',
    logo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    phone: '+90 XXX XXX XX XX',
    email: 'info@sporokulu.com',
    address: 'Spor Okulu Adresi',
    website: 'www.sporokulu.com',
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    invoicePrefix: 'SPR',
    taxNumber: '',
    taxOffice: '',
    bankAccount: '',
    iban: '',
    trainingLocations: ['Ana Salon', 'Yan Salon', 'Dış Saha'],
    // Email configuration
    emailHost: 'smtp.gmail.com',
    emailPort: '587',
    emailSecure: false,
    emailUser: '',
    emailPassword: '',
    emailFrom: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Admin hesapları için state'ler
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    role: 'admin'
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Initialize auth manager first
        await simpleAuthManager.initialize();
        
        // Check if user is authenticated and has admin role
        const currentUser = simpleAuthManager.getCurrentUser();
        if (!currentUser || !simpleAuthManager.isAdmin()) {
          router.push("/login");
          return;
        }

        setUserRole(currentUser.role);

        // Load existing settings
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
          setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
        }

        // Load admin users
        loadAdminUsers();
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const loadAdminUsers = () => {
    const savedAdmins = localStorage.getItem('adminUsers');
    if (savedAdmins) {
      setAdminUsers(JSON.parse(savedAdmins));
    } else {
      // İlk kurulum için varsayılan admin hesabı
      const defaultAdmin = {
        id: 'default-admin',
        name: 'Sistem',
        surname: 'Yöneticisi',
        email: 'admin@sportscr.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        isDefault: true
      };
      setAdminUsers([defaultAdmin]);
      localStorage.setItem('adminUsers', JSON.stringify([defaultAdmin]));
    }
  };

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.surname || !newAdmin.email || !newAdmin.password) {
      setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    // Email kontrolü
    const existingAdmin = adminUsers.find(admin => admin.email === newAdmin.email);
    if (existingAdmin) {
      setMessage({ type: 'error', text: 'Bu email adresi zaten kullanılıyor.' });
      return;
    }

    const adminToAdd = {
      id: Date.now().toString(),
      ...newAdmin,
      createdAt: new Date().toISOString(),
      isDefault: false
    };

    const updatedAdmins = [...adminUsers, adminToAdd];
    setAdminUsers(updatedAdmins);
    localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));

    // Form'u temizle
    setNewAdmin({
      name: '',
      surname: '',
      email: '',
      password: '',
      role: 'admin'
    });

    setIsAddAdminDialogOpen(false);
    setMessage({ type: 'success', text: 'Admin hesabı başarıyla oluşturuldu!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAdmin = (adminId: string) => {
    const adminToDelete = adminUsers.find(admin => admin.id === adminId);
    if (adminToDelete?.isDefault) {
      setMessage({ type: 'error', text: 'Varsayılan admin hesabı silinemez.' });
      return;
    }

    const updatedAdmins = adminUsers.filter(admin => admin.id !== adminId);
    setAdminUsers(updatedAdmins);
    localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));

    setMessage({ type: 'success', text: 'Admin hesabı başarıyla silindi!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const togglePasswordVisibility = (adminId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAdmin(prev => ({ ...prev, password }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSettings(prev => ({
          ...prev,
          logo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken bir hata oluştu.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Sistem Ayarları - SportsCRM</title>
        <meta name="description" content="Spor okulu sistem ayarları ve yapılandırma" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard'a Dön
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Sistem Ayarları
            </h1>
            <p className="text-gray-600 mt-2">
              Spor okulu bilgilerini ve sistem ayarlarını yönetin
            </p>
          </motion.div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
              <TabsTrigger value="branding">Marka & Logo</TabsTrigger>
              <TabsTrigger value="contact">İletişim</TabsTrigger>
              <TabsTrigger value="email">E-posta Ayarları</TabsTrigger>
              <TabsTrigger value="admins">Admin Hesapları</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Genel Ayarlar
                  </CardTitle>
                  <CardDescription>
                    Spor okulu temel bilgileri ve sistem ayarları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">Spor Okulu Adı</Label>
                    <Input
                      id="schoolName"
                      value={settings.schoolName}
                      onChange={(e) => handleInputChange('schoolName', e.target.value)}
                      placeholder="Spor okulu adını giriniz"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Antrenman Lokasyonları</Label>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Antrenman programlarında kullanılacak lokasyonları yönetin
                      </p>
                      <div className="space-y-2">
                        {settings.trainingLocations.map((location, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={location}
                              onChange={(e) => {
                                const newLocations = [...settings.trainingLocations];
                                newLocations[index] = e.target.value;
                                setSettings(prev => ({ ...prev, trainingLocations: newLocations }));
                              }}
                              placeholder="Lokasyon adı"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newLocations = settings.trainingLocations.filter((_, i) => i !== index);
                                setSettings(prev => ({ ...prev, trainingLocations: newLocations }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSettings(prev => ({ 
                              ...prev, 
                              trainingLocations: [...prev.trainingLocations, 'Yeni Lokasyon'] 
                            }));
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Lokasyon Ekle
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Bildirim Ayarları</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email">E-posta Bildirimleri</Label>
                          <p className="text-sm text-muted-foreground">Fatura ve bilgilendirme e-postaları gönder</p>
                        </div>
                        <Switch
                          id="email"
                          checked={settings.enableEmailNotifications}
                          onCheckedChange={(checked) => handleInputChange('enableEmailNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms">SMS Bildirimleri</Label>
                          <p className="text-sm text-muted-foreground">Acil durumlar için SMS gönder</p>
                        </div>
                        <Switch
                          id="sms"
                          checked={settings.enableSmsNotifications}
                          onCheckedChange={(checked) => handleInputChange('enableSmsNotifications', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Marka & Logo
                  </CardTitle>
                  <CardDescription>
                    Logo ve renk ayarlarını düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                      {settings.logo ? (
                        <div className="w-24 h-24 border rounded-lg overflow-hidden">
                          <img 
                            src={settings.logo} 
                            alt="Logo" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Button variant="outline" className="flex items-center gap-2" asChild>
                            <span>
                              <Upload className="h-4 w-4" />
                              Logo Yükle
                            </span>
                          </Button>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          PNG, JPG veya SVG formatında, maksimum 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Ana Renk</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={settings.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">İkincil Renk</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={settings.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    İletişim Bilgileri
                  </CardTitle>
                  <CardDescription>
                    Spor okulu iletişim bilgilerini güncelleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+90 XXX XXX XX XX"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={settings.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="info@sporokulu.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Web Sitesi</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        value={settings.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="www.sporokulu.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adres</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        value={settings.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Spor okulu adresini giriniz"
                        className="pl-10 min-h-[80px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    E-posta Yapılandırması
                  </CardTitle>
                  <CardDescription>
                    E-posta gönderimi için SMTP ayarlarını yapılandırın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Önemli:</strong> E-posta gönderimi için bu ayarları doğru şekilde yapılandırmanız gerekir. 
                      Gmail kullanıyorsanız, "Uygulama Şifresi" oluşturmanız gerekebilir.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailHost">SMTP Sunucusu</Label>
                      <Input
                        id="emailHost"
                        value={settings.emailHost}
                        onChange={(e) => handleInputChange('emailHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        Gmail: smtp.gmail.com, Outlook: smtp-mail.outlook.com
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailPort">Port</Label>
                      <Input
                        id="emailPort"
                        value={settings.emailPort}
                        onChange={(e) => handleInputChange('emailPort', e.target.value)}
                        placeholder="587"
                      />
                      <p className="text-xs text-muted-foreground">
                        Genellikle 587 (TLS) veya 465 (SSL)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailUser">E-posta Adresi</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="emailUser"
                        type="email"
                        value={settings.emailUser}
                        onChange={(e) => handleInputChange('emailUser', e.target.value)}
                        placeholder="your-email@gmail.com"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      E-posta gönderiminde kullanılacak hesap
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailPassword">E-posta Şifresi</Label>
                    <Input
                      id="emailPassword"
                      type="password"
                      value={settings.emailPassword}
                      onChange={(e) => handleInputChange('emailPassword', e.target.value)}
                      placeholder="••••••••••••••••"
                    />
                    <p className="text-xs text-muted-foreground">
                      Gmail için "Uygulama Şifresi" kullanmanız önerilir
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailFrom">Gönderen Adı</Label>
                    <Input
                      id="emailFrom"
                      value={settings.emailFrom}
                      onChange={(e) => handleInputChange('emailFrom', e.target.value)}
                      placeholder="Spor Okulu CRM <noreply@sporokulu.com>"
                    />
                    <p className="text-xs text-muted-foreground">
                      E-postalarda görünecek gönderen bilgisi
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <Label htmlFor="emailSecure">Güvenli Bağlantı (SSL/TLS)</Label>
                      <p className="text-sm text-muted-foreground">Port 465 için SSL, Port 587 için TLS kullanın</p>
                    </div>
                    <Switch
                      id="emailSecure"
                      checked={settings.emailSecure}
                      onCheckedChange={(checked) => handleInputChange('emailSecure', checked)}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Gmail Kurulum Rehberi:</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>1. Gmail hesabınızda "2 Adımlı Doğrulama"yı etkinleştirin</p>
                      <p>2. "Uygulama Şifreleri" bölümünden yeni bir şifre oluşturun</p>
                      <p>3. Oluşturulan 16 haneli şifreyi yukarıdaki "E-posta Şifresi" alanına girin</p>
                      <p>4. SMTP Sunucusu: smtp.gmail.com, Port: 587</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admins">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin Hesapları
                  </CardTitle>
                  <CardDescription>
                    Sistem yöneticisi hesaplarını yönetin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Mevcut Admin Hesapları</h3>
                      <p className="text-sm text-muted-foreground">
                        Sisteme erişim yetkisi olan yönetici hesapları
                      </p>
                    </div>
                    <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Yeni Admin Ekle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Yeni Admin Hesabı Oluştur</DialogTitle>
                          <DialogDescription>
                            Sisteme erişim yetkisi olan yeni bir yönetici hesabı oluşturun.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="admin-name">Ad</Label>
                              <Input
                                id="admin-name"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Admin adı"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="admin-surname">Soyad</Label>
                              <Input
                                id="admin-surname"
                                value={newAdmin.surname}
                                onChange={(e) => setNewAdmin(prev => ({ ...prev, surname: e.target.value }))}
                                placeholder="Admin soyadı"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="admin-email">E-posta</Label>
                            <Input
                              id="admin-email"
                              type="email"
                              value={newAdmin.email}
                              onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="admin@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="admin-password">Şifre</Label>
                            <div className="flex gap-2">
                              <Input
                                id="admin-password"
                                type="text"
                                value={newAdmin.password}
                                onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Güçlü bir şifre girin"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={generateRandomPassword}
                                className="shrink-0"
                              >
                                Oluştur
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              En az 6 karakter uzunluğunda olmalıdır
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddAdminDialogOpen(false)}>
                            İptal
                          </Button>
                          <Button onClick={handleAddAdmin}>
                            Admin Hesabı Oluştur
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ad Soyad</TableHead>
                          <TableHead>E-posta</TableHead>
                          <TableHead>Şifre</TableHead>
                          <TableHead>Oluşturulma</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">
                              {admin.name} {admin.surname}
                              {admin.isDefault && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Varsayılan
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">
                                  {showPasswords[admin.id] ? admin.password : '••••••••'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePasswordVisibility(admin.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {showPasswords[admin.id] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(admin.createdAt).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">Aktif</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {!admin.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Güvenlik Uyarısı:</strong> Admin hesapları sisteme tam erişim sağlar. 
                      Sadece güvenilir kişilere admin yetkisi verin ve güçlü şifreler kullanın.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end mt-6"
          >
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SystemSettings;