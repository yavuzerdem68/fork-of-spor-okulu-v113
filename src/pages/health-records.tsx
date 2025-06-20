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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  Stethoscope,
  Pill,
  Activity,
  Shield,
  Eye,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HealthRecord {
  id: string;
  athleteId: string;
  athleteName: string;
  athletePhoto?: string;
  bloodType: string;
  allergies: string[];
  chronicDiseases: string[];
  medications: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  doctorInfo: {
    name: string;
    phone: string;
    hospital: string;
  };
  vaccinations: {
    name: string;
    date: string;
    nextDue?: string;
  }[];
  injuries: {
    id: string;
    date: string;
    type: string;
    description: string;
    treatment: string;
    status: 'active' | 'recovered';
    returnDate?: string;
  }[];
  medicalReports: {
    id: string;
    date: string;
    type: string;
    doctor: string;
    summary: string;
    fileUrl?: string;
  }[];
  lastUpdated: string;
  createdAt: string;
}

const HealthRecords = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isAddRecordDialogOpen, setIsAddRecordDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    athleteId: '',
    bloodType: '',
    allergies: [],
    chronicDiseases: [],
    medications: [],
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
    doctorInfo: {
      name: '',
      phone: '',
      hospital: ''
    },
    vaccinations: [],
    injuries: [],
    medicalReports: []
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newDisease, setNewDisease] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newVaccination, setNewVaccination] = useState({ name: '', date: '', nextDue: '' });
  const [newInjury, setNewInjury] = useState({
    date: '',
    type: '',
    description: '',
    treatment: '',
    status: 'active' as 'active' | 'recovered',
    returnDate: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role || (role !== 'admin' && role !== 'coach')) {
      router.push('/login');
      return;
    }
    setUserRole(role);

    loadData();
  }, [router]);

  const loadData = () => {
    // Load athletes
    const athletesData = JSON.parse(localStorage.getItem('students') || '[]');
    setAthletes(athletesData);

    // Load health records
    const healthData = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    setHealthRecords(healthData);
  };

  const saveHealthRecords = (records: HealthRecord[]) => {
    localStorage.setItem('healthRecords', JSON.stringify(records));
    setHealthRecords(records);
  };

  const handleAddRecord = () => {
    if (!newRecord.athleteId || !newRecord.bloodType) {
      setMessage({ type: 'error', text: 'Lütfen sporcu ve kan grubu bilgilerini giriniz.' });
      return;
    }

    const athlete = athletes.find(a => a.id === newRecord.athleteId);
    if (!athlete) {
      setMessage({ type: 'error', text: 'Sporcu bulunamadı.' });
      return;
    }

    const record: HealthRecord = {
      id: Date.now().toString(),
      athleteId: newRecord.athleteId,
      athleteName: `${athlete.name} ${athlete.surname}`,
      athletePhoto: athlete.photo,
      bloodType: newRecord.bloodType || '',
      allergies: newRecord.allergies || [],
      chronicDiseases: newRecord.chronicDiseases || [],
      medications: newRecord.medications || [],
      emergencyContact: newRecord.emergencyContact || { name: '', relation: '', phone: '' },
      doctorInfo: newRecord.doctorInfo || { name: '', phone: '', hospital: '' },
      vaccinations: newRecord.vaccinations || [],
      injuries: newRecord.injuries || [],
      medicalReports: newRecord.medicalReports || [],
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const updatedRecords = [...healthRecords, record];
    saveHealthRecords(updatedRecords);

    // Reset form
    setNewRecord({
      athleteId: '',
      bloodType: '',
      allergies: [],
      chronicDiseases: [],
      medications: [],
      emergencyContact: { name: '', relation: '', phone: '' },
      doctorInfo: { name: '', phone: '', hospital: '' },
      vaccinations: [],
      injuries: [],
      medicalReports: []
    });

    setIsAddRecordDialogOpen(false);
    setMessage({ type: 'success', text: 'Sağlık kaydı başarıyla oluşturuldu!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateRecord = (updatedRecord: HealthRecord) => {
    const updatedRecords = healthRecords.map(record => 
      record.id === updatedRecord.id 
        ? { ...updatedRecord, lastUpdated: new Date().toISOString() }
        : record
    );
    saveHealthRecords(updatedRecords);
    setSelectedRecord({ ...updatedRecord, lastUpdated: new Date().toISOString() });
    setIsEditMode(false);
    setMessage({ type: 'success', text: 'Sağlık kaydı güncellendi!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteRecord = (recordId: string) => {
    const updatedRecords = healthRecords.filter(record => record.id !== recordId);
    saveHealthRecords(updatedRecords);
    setSelectedRecord(null);
    setMessage({ type: 'success', text: 'Sağlık kaydı silindi!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setNewRecord(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const addDisease = () => {
    if (newDisease.trim()) {
      setNewRecord(prev => ({
        ...prev,
        chronicDiseases: [...(prev.chronicDiseases || []), newDisease.trim()]
      }));
      setNewDisease('');
    }
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setNewRecord(prev => ({
        ...prev,
        medications: [...(prev.medications || []), newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const addVaccination = () => {
    if (newVaccination.name && newVaccination.date) {
      setNewRecord(prev => ({
        ...prev,
        vaccinations: [...(prev.vaccinations || []), { ...newVaccination }]
      }));
      setNewVaccination({ name: '', date: '', nextDue: '' });
    }
  };

  const addInjury = () => {
    if (newInjury.date && newInjury.type && newInjury.description) {
      const injury = {
        id: Date.now().toString(),
        ...newInjury
      };
      setNewRecord(prev => ({
        ...prev,
        injuries: [...(prev.injuries || []), injury]
      }));
      setNewInjury({
        date: '',
        type: '',
        description: '',
        treatment: '',
        status: 'active',
        returnDate: ''
      });
    }
  };

  const filteredRecords = healthRecords.filter(record =>
    record.athleteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthStatus = (record: HealthRecord) => {
    const hasActiveInjuries = record.injuries.some(injury => injury.status === 'active');
    const hasAllergies = record.allergies.length > 0;
    const hasChronicDiseases = record.chronicDiseases.length > 0;

    if (hasActiveInjuries) return { status: 'warning', text: 'Aktif Yaralanma', color: 'bg-red-100 text-red-800' };
    if (hasChronicDiseases) return { status: 'caution', text: 'Kronik Hastalık', color: 'bg-yellow-100 text-yellow-800' };
    if (hasAllergies) return { status: 'info', text: 'Alerji Var', color: 'bg-blue-100 text-blue-800' };
    return { status: 'good', text: 'Sağlıklı', color: 'bg-green-100 text-green-800' };
  };

  if (!userRole) return null;

  return (
    <>
      <Head>
        <title>Sağlık Kayıtları - SportsCRM</title>
        <meta name="description" content="Sporcu sağlık kayıtları ve tıbbi takip" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Heart className="h-8 w-8 text-red-500" />
                  Sağlık Kayıtları
                </h1>
                <p className="text-muted-foreground mt-2">
                  Sporcu sağlık bilgileri ve tıbbi takip sistemi
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Dialog open={isAddRecordDialogOpen} onOpenChange={setIsAddRecordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Yeni Sağlık Kaydı
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Yeni Sağlık Kaydı Oluştur</DialogTitle>
                      <DialogDescription>
                        Sporcu için kapsamlı sağlık kaydı oluşturun
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Sporcu Seçimi */}
                      <div className="space-y-2">
                        <Label>Sporcu Seçin</Label>
                        <Select 
                          value={newRecord.athleteId} 
                          onValueChange={(value) => setNewRecord(prev => ({ ...prev, athleteId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sporcu seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {athletes
                              .filter(athlete => !healthRecords.some(record => record.athleteId === athlete.id))
                              .map(athlete => (
                              <SelectItem key={athlete.id} value={athlete.id}>
                                {athlete.name} {athlete.surname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Temel Bilgiler */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Kan Grubu</Label>
                          <Select 
                            value={newRecord.bloodType} 
                            onValueChange={(value) => setNewRecord(prev => ({ ...prev, bloodType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kan grubu seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A Rh+</SelectItem>
                              <SelectItem value="A-">A Rh-</SelectItem>
                              <SelectItem value="B+">B Rh+</SelectItem>
                              <SelectItem value="B-">B Rh-</SelectItem>
                              <SelectItem value="AB+">AB Rh+</SelectItem>
                              <SelectItem value="AB-">AB Rh-</SelectItem>
                              <SelectItem value="O+">O Rh+</SelectItem>
                              <SelectItem value="O-">O Rh-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Acil Durum İletişim */}
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Acil Durum İletişim</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>İsim</Label>
                            <Input
                              value={newRecord.emergencyContact?.name || ''}
                              onChange={(e) => setNewRecord(prev => ({
                                ...prev,
                                emergencyContact: { ...prev.emergencyContact!, name: e.target.value }
                              }))}
                              placeholder="Acil durum kişisi"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Yakınlık</Label>
                            <Input
                              value={newRecord.emergencyContact?.relation || ''}
                              onChange={(e) => setNewRecord(prev => ({
                                ...prev,
                                emergencyContact: { ...prev.emergencyContact!, relation: e.target.value }
                              }))}
                              placeholder="Anne, Baba, vb."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Telefon</Label>
                          <Input
                            value={newRecord.emergencyContact?.phone || ''}
                            onChange={(e) => setNewRecord(prev => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact!, phone: e.target.value }
                            }))}
                            placeholder="+90 XXX XXX XX XX"
                          />
                        </div>
                      </div>

                      {/* Doktor Bilgileri */}
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Aile Doktoru Bilgileri</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Doktor Adı</Label>
                            <Input
                              value={newRecord.doctorInfo?.name || ''}
                              onChange={(e) => setNewRecord(prev => ({
                                ...prev,
                                doctorInfo: { ...prev.doctorInfo!, name: e.target.value }
                              }))}
                              placeholder="Dr. Adı Soyadı"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Telefon</Label>
                            <Input
                              value={newRecord.doctorInfo?.phone || ''}
                              onChange={(e) => setNewRecord(prev => ({
                                ...prev,
                                doctorInfo: { ...prev.doctorInfo!, phone: e.target.value }
                              }))}
                              placeholder="+90 XXX XXX XX XX"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Hastane/Klinik</Label>
                          <Input
                            value={newRecord.doctorInfo?.hospital || ''}
                            onChange={(e) => setNewRecord(prev => ({
                              ...prev,
                              doctorInfo: { ...prev.doctorInfo!, hospital: e.target.value }
                            }))}
                            placeholder="Hastane veya klinik adı"
                          />
                        </div>
                      </div>

                      {/* Alerjiler */}
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Alerjiler</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newAllergy}
                            onChange={(e) => setNewAllergy(e.target.value)}
                            placeholder="Alerji ekleyin"
                            onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                          />
                          <Button type="button" onClick={addAllergy}>Ekle</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newRecord.allergies?.map((allergy, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {allergy}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => setNewRecord(prev => ({
                                  ...prev,
                                  allergies: prev.allergies?.filter((_, i) => i !== index)
                                }))}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddRecordDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleAddRecord}>
                        Sağlık Kaydı Oluştur
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {/* Message */}
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

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Sporcu adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Records List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sağlık Kayıtları ({filteredRecords.length})</CardTitle>
                  <CardDescription>
                    Sporcu sağlık kayıtları listesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => {
                        const healthStatus = getHealthStatus(record);
                        return (
                          <div
                            key={record.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedRecord?.id === record.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedRecord(record)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={record.athletePhoto} />
                                <AvatarFallback>
                                  {record.athleteName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-medium">{record.athleteName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {record.bloodType}
                                  </Badge>
                                  <Badge className={`text-xs ${healthStatus.color}`}>
                                    {healthStatus.text}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz sağlık kaydı bulunmuyor</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          İlk sağlık kaydını oluşturun
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Record Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              {selectedRecord ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedRecord.athletePhoto} />
                          <AvatarFallback>
                            {selectedRecord.athleteName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{selectedRecord.athleteName}</CardTitle>
                          <CardDescription>
                            Sağlık Kaydı • Son güncelleme: {new Date(selectedRecord.lastUpdated).toLocaleDateString('tr-TR')}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditMode(!isEditMode)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRecord(selectedRecord.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="basic" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
                        <TabsTrigger value="medical">Tıbbi Bilgiler</TabsTrigger>
                        <TabsTrigger value="injuries">Yaralanmalar</TabsTrigger>
                        <TabsTrigger value="reports">Raporlar</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Kan Grubu</Label>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-red-500" />
                              <span className="font-medium">{selectedRecord.bloodType}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Acil Durum İletişim</Label>
                            <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{selectedRecord.emergencyContact.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {selectedRecord.emergencyContact.relation}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{selectedRecord.emergencyContact.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Aile Doktoru</Label>
                            <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Stethoscope className="h-4 w-4" />
                                <span className="font-medium">{selectedRecord.doctorInfo.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Phone className="h-4 w-4" />
                                <span>{selectedRecord.doctorInfo.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>{selectedRecord.doctorInfo.hospital}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="medical" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Alerjiler</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedRecord.allergies.length > 0 ? (
                                selectedRecord.allergies.map((allergy, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {allergy}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">Bilinen alerji yok</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Kronik Hastalıklar</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedRecord.chronicDiseases.length > 0 ? (
                                selectedRecord.chronicDiseases.map((disease, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {disease}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">Bilinen kronik hastalık yok</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Kullanılan İlaçlar</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedRecord.medications.length > 0 ? (
                                selectedRecord.medications.map((medication, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Pill className="h-3 w-3 mr-1" />
                                    {medication}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">Düzenli kullanılan ilaç yok</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Aşılar</Label>
                            <div className="mt-2 space-y-2">
                              {selectedRecord.vaccinations.length > 0 ? (
                                selectedRecord.vaccinations.map((vaccination, index) => (
                                  <div key={index} className="p-2 bg-accent/50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{vaccination.name}</span>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(vaccination.date).toLocaleDateString('tr-TR')}
                                      </div>
                                    </div>
                                    {vaccination.nextDue && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Sonraki: {new Date(vaccination.nextDue).toLocaleDateString('tr-TR')}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">Aşı kaydı bulunmuyor</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="injuries" className="space-y-4">
                        <div className="space-y-3">
                          {selectedRecord.injuries.length > 0 ? (
                            selectedRecord.injuries.map((injury) => (
                              <div key={injury.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      className={injury.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                                    >
                                      {injury.status === 'active' ? 'Aktif' : 'İyileşti'}
                                    </Badge>
                                    <span className="font-medium">{injury.type}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(injury.date).toLocaleDateString('tr-TR')}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{injury.description}</p>
                                {injury.treatment && (
                                  <p className="text-sm"><strong>Tedavi:</strong> {injury.treatment}</p>
                                )}
                                {injury.returnDate && (
                                  <p className="text-sm text-green-600 mt-1">
                                    <strong>Dönüş Tarihi:</strong> {new Date(injury.returnDate).toLocaleDateString('tr-TR')}
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                              <p className="text-muted-foreground">Yaralanma kaydı bulunmuyor</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Bu sporcu için yaralanma kaydı yok
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="reports" className="space-y-4">
                        <div className="space-y-3">
                          {selectedRecord.medicalReports.length > 0 ? (
                            selectedRecord.medicalReports.map((report) => (
                              <div key={report.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="font-medium">{report.type}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(report.date).toLocaleDateString('tr-TR')}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  <strong>Doktor:</strong> {report.doctor}
                                </p>
                                <p className="text-sm">{report.summary}</p>
                                {report.fileUrl && (
                                  <Button variant="outline" size="sm" className="mt-2">
                                    <Download className="h-3 w-3 mr-1" />
                                    Raporu İndir
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">Tıbbi rapor bulunmuyor</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Tıbbi raporlar burada görünecek
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Sağlık Kaydı Seçin
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Detayları görüntülemek için sol taraftan bir sağlık kaydı seçin
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HealthRecords;