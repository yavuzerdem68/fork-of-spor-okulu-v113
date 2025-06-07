import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Building
} from 'lucide-react';
import { useRouter } from 'next/router';

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
    whatsappNumber: '+90 XXX XXX XX XX',
    enableWhatsapp: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    invoicePrefix: 'SPR',
    taxNumber: '',
    taxOffice: '',
    bankAccount: '',
    iban: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      router.push('/login');
      return;
    }
    setUserRole(role);

    // Load existing settings
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, [router]);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="branding">Marka & Logo</TabsTrigger>
            <TabsTrigger value="contact">İletişim</TabsTrigger>
            <TabsTrigger value="financial">Mali Bilgiler</TabsTrigger>
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
                  <Label>Bildirim Ayarları</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="whatsapp">WhatsApp Bildirimleri</Label>
                        <p className="text-sm text-muted-foreground">Devamsızlık ve ödemeler için WhatsApp mesajı gönder</p>
                      </div>
                      <Switch
                        id="whatsapp"
                        checked={settings.enableWhatsapp}
                        onCheckedChange={(checked) => handleInputChange('enableWhatsapp', checked)}
                      />
                    </div>
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
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="whatsappNumber">WhatsApp Numarası</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsappNumber"
                        value={settings.whatsappNumber}
                        onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                        placeholder="+90 XXX XXX XX XX"
                        className="pl-10"
                      />
                    </div>
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

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Mali Bilgiler</CardTitle>
                <CardDescription>
                  Fatura ve ödeme bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Fatura Ön Eki</Label>
                    <Input
                      id="invoicePrefix"
                      value={settings.invoicePrefix}
                      onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                      placeholder="SPR"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Vergi Numarası</Label>
                    <Input
                      id="taxNumber"
                      value={settings.taxNumber}
                      onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                  <Input
                    id="taxOffice"
                    value={settings.taxOffice}
                    onChange={(e) => handleInputChange('taxOffice', e.target.value)}
                    placeholder="Vergi dairesi adı"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Banka Hesap No</Label>
                  <Input
                    id="bankAccount"
                    value={settings.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={settings.iban}
                    onChange={(e) => handleInputChange('iban', e.target.value)}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
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
  );
};

export default SystemSettings;