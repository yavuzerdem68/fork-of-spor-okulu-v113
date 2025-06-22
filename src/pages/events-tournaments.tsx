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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Trophy, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Medal, 
  Target, 
  Clock, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Star,
  Award,
  Flag,
  CheckCircle,
  AlertCircle,
  Timer,
  Filter,
  FileText,
  Camera,
  Share2,
  Bell,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Sidebar from '@/components/Sidebar';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'tournament' | 'competition' | 'friendly' | 'training_camp' | 'ceremony';
  sport: string;
  date: string;
  endDate?: string;
  location: string;
  organizer: string;
  maxParticipants?: number;
  registrationDeadline: string;
  fee?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  participants: {
    athleteId: string;
    athleteName: string;
    athletePhoto?: string;
    registrationDate: string;
    status: 'registered' | 'confirmed' | 'participated' | 'absent';
    category?: string;
    result?: {
      position: number;
      score?: string;
      medal?: 'gold' | 'silver' | 'bronze';
      notes?: string;
    };
  }[];
  results?: {
    category: string;
    rankings: {
      position: number;
      athleteId: string;
      athleteName: string;
      score?: string;
      medal?: 'gold' | 'silver' | 'bronze';
      notes?: string;
    }[];
  }[];
  photos?: string[];
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const EventsTournaments = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    type: 'tournament',
    sport: '',
    date: '',
    endDate: '',
    location: '',
    organizer: '',
    maxParticipants: undefined,
    registrationDeadline: '',
    fee: undefined,
    status: 'upcoming',
    participants: [],
    results: [],
    photos: [],
    documents: []
  });

  const eventTypes = [
    { value: 'tournament', label: 'Turnuva', icon: Trophy },
    { value: 'competition', label: 'Müsabaka', icon: Medal },
    { value: 'friendly', label: 'Dostluk Maçı', icon: Users },
    { value: 'training_camp', label: 'Antrenman Kampı', icon: Target },
    { value: 'ceremony', label: 'Tören', icon: Award }
  ];

  const sports = [
    'Basketbol', 'Hentbol', 'Yüzme', 'Futbol', 'Voleybol', 
    'Jimnastik', 'Satranç', 'Zihin Oyunları', 'Hareket Antrenmanı'
  ];

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

    // Load events
    const eventsData = JSON.parse(localStorage.getItem('eventsTournaments') || '[]');
    setEvents(eventsData);
  };

  const saveEvents = (eventsData: Event[]) => {
    localStorage.setItem('eventsTournaments', JSON.stringify(eventsData));
    setEvents(eventsData);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location || !newEvent.sport) {
      setMessage({ type: 'error', text: 'Lütfen zorunlu alanları doldurunuz.' });
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title || '',
      description: newEvent.description || '',
      type: newEvent.type as Event['type'] || 'tournament',
      sport: newEvent.sport || '',
      date: newEvent.date || '',
      endDate: newEvent.endDate,
      location: newEvent.location || '',
      organizer: newEvent.organizer || '',
      maxParticipants: newEvent.maxParticipants,
      registrationDeadline: newEvent.registrationDeadline || '',
      fee: newEvent.fee,
      status: 'upcoming',
      participants: [],
      results: [],
      photos: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedEvents = [...events, event];
    saveEvents(updatedEvents);

    // Reset form
    setNewEvent({
      title: '',
      description: '',
      type: 'tournament',
      sport: '',
      date: '',
      endDate: '',
      location: '',
      organizer: '',
      maxParticipants: undefined,
      registrationDeadline: '',
      fee: undefined,
      status: 'upcoming',
      participants: [],
      results: [],
      photos: [],
      documents: []
    });

    setIsAddEventDialogOpen(false);
    setMessage({ type: 'success', text: 'Etkinlik başarıyla oluşturuldu!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    const updatedEvents = events.map(event => 
      event.id === updatedEvent.id 
        ? { ...updatedEvent, updatedAt: new Date().toISOString() }
        : event
    );
    saveEvents(updatedEvents);
    setSelectedEvent({ ...updatedEvent, updatedAt: new Date().toISOString() });
    setIsEditMode(false);
    setMessage({ type: 'success', text: 'Etkinlik güncellendi!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    saveEvents(updatedEvents);
    setSelectedEvent(null);
    setMessage({ type: 'success', text: 'Etkinlik silindi!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRegisterAthlete = (eventId: string, athleteId: string) => {
    const athlete = athletes.find(a => a.id === athleteId);
    if (!athlete) return;

    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        const isAlreadyRegistered = event.participants.some(p => p.athleteId === athleteId);
        if (isAlreadyRegistered) return event;

        const newParticipant = {
          athleteId,
          athleteName: `${athlete.name} ${athlete.surname}`,
          athletePhoto: athlete.photo,
          registrationDate: new Date().toISOString(),
          status: 'registered' as const,
          category: athlete.sport
        };

        return {
          ...event,
          participants: [...event.participants, newParticipant],
          updatedAt: new Date().toISOString()
        };
      }
      return event;
    });

    saveEvents(updatedEvents);
    if (selectedEvent?.id === eventId) {
      const updatedEvent = updatedEvents.find(e => e.id === eventId);
      if (updatedEvent) setSelectedEvent(updatedEvent);
    }
    setMessage({ type: 'success', text: 'Sporcu etkinliğe kaydedildi!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateParticipantResult = (eventId: string, athleteId: string, result: any) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          participants: event.participants.map(p => 
            p.athleteId === athleteId 
              ? { ...p, result, status: 'participated' as const }
              : p
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return event;
    });

    saveEvents(updatedEvents);
    if (selectedEvent?.id === eventId) {
      const updatedEvent = updatedEvents.find(e => e.id === eventId);
      if (updatedEvent) setSelectedEvent(updatedEvent);
    }
    setMessage({ type: 'success', text: 'Sonuç güncellendi!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Yaklaşan';
      case 'ongoing': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const getMedalIcon = (medal?: string) => {
    switch (medal) {
      case 'gold': return <Medal className="h-4 w-4 text-yellow-500" />;
      case 'silver': return <Medal className="h-4 w-4 text-gray-400" />;
      case 'bronze': return <Medal className="h-4 w-4 text-amber-600" />;
      default: return null;
    }
  };

  if (!userRole) return null;

  return (
    <>
      <Head>
        <title>Etkinlik ve Turnuva Yönetimi - SportsCRM</title>
        <meta name="description" content="Spor etkinlikleri ve turnuva yönetimi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPath="/events-tournaments" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Etkinlik ve Turnuva Yönetimi
                </h1>
                <p className="text-muted-foreground">Spor etkinlikleri, turnuvalar ve müsabakaları yönetin</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Etkinlik ara..." 
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/system-settings')}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 space-y-6">
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

            {/* Header Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-end"
            >
              <div className="flex items-center gap-4">
                <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Yeni Etkinlik
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
                      <DialogDescription>
                        Turnuva, müsabaka veya etkinlik oluşturun
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Temel Bilgiler */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Etkinlik Adı *</Label>
                          <Input
                            value={newEvent.title}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Etkinlik adını giriniz"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Etkinlik Türü</Label>
                            <Select 
                              value={newEvent.type} 
                              onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value as Event['type'] }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tür seçiniz" />
                              </SelectTrigger>
                              <SelectContent>
                                {eventTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <type.icon className="h-4 w-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Spor Branşı *</Label>
                            <Select 
                              value={newEvent.sport} 
                              onValueChange={(value) => setNewEvent(prev => ({ ...prev, sport: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Branş seçiniz" />
                              </SelectTrigger>
                              <SelectContent>
                                {sports.map(sport => (
                                  <SelectItem key={sport} value={sport}>
                                    {sport}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Açıklama</Label>
                          <Textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Etkinlik açıklaması"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Tarih ve Yer */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Başlangıç Tarihi *</Label>
                            <Input
                              type="datetime-local"
                              value={newEvent.date}
                              onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Bitiş Tarihi</Label>
                            <Input
                              type="datetime-local"
                              value={newEvent.endDate}
                              onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Konum *</Label>
                          <Input
                            value={newEvent.location}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Etkinlik konumu"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Organizatör</Label>
                          <Input
                            value={newEvent.organizer}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, organizer: e.target.value }))}
                            placeholder="Organizatör adı"
                          />
                        </div>
                      </div>

                      {/* Kayıt Bilgileri */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Maksimum Katılımcı</Label>
                            <Input
                              type="number"
                              value={newEvent.maxParticipants || ''}
                              onChange={(e) => setNewEvent(prev => ({ 
                                ...prev, 
                                maxParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                              }))}
                              placeholder="Sınırsız"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Katılım Ücreti (₺)</Label>
                            <Input
                              type="number"
                              value={newEvent.fee || ''}
                              onChange={(e) => setNewEvent(prev => ({ 
                                ...prev, 
                                fee: e.target.value ? parseFloat(e.target.value) : undefined 
                              }))}
                              placeholder="Ücretsiz"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Kayıt Son Tarihi</Label>
                          <Input
                            type="datetime-local"
                            value={newEvent.registrationDeadline}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleAddEvent}>
                        Etkinlik Oluştur
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tür filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="upcoming">Yaklaşan</SelectItem>
                    <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Content */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Events List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Etkinlikler ({filteredEvents.length})</CardTitle>
                    <CardDescription>
                      Etkinlik ve turnuva listesi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => {
                          const typeInfo = getEventTypeInfo(event.type);
                          return (
                            <div
                              key={event.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedEvent?.id === event.id 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <typeInfo.icon className="h-4 w-4 text-primary" />
                                  <h4 className="font-medium text-sm">{event.title}</h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CalendarIcon className="h-3 w-3" />
                                  {new Date(event.date).toLocaleDateString('tr-TR')}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {event.sport}
                                  </Badge>
                                  <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                                    {getStatusText(event.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {event.participants.length} katılımcı
                                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Henüz etkinlik bulunmuyor</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            İlk etkinliği oluşturun
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                {selectedEvent ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const typeInfo = getEventTypeInfo(selectedEvent.type);
                            return <typeInfo.icon className="h-8 w-8 text-primary" />;
                          })()}
                          <div>
                            <CardTitle>{selectedEvent.title}</CardTitle>
                            <CardDescription>
                              {selectedEvent.sport} • {new Date(selectedEvent.date).toLocaleDateString('tr-TR')}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(selectedEvent.status)}`}>
                            {getStatusText(selectedEvent.status)}
                          </Badge>
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
                            onClick={() => handleDeleteEvent(selectedEvent.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="details" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="details">Detaylar</TabsTrigger>
                          <TabsTrigger value="participants">Katılımcılar</TabsTrigger>
                          <TabsTrigger value="results">Sonuçlar</TabsTrigger>
                          <TabsTrigger value="media">Medya</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Tarih</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span>{new Date(selectedEvent.date).toLocaleDateString('tr-TR')}</span>
                                  {selectedEvent.endDate && (
                                    <span> - {new Date(selectedEvent.endDate).toLocaleDateString('tr-TR')}</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Konum</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{selectedEvent.location}</span>
                                </div>
                              </div>
                              {selectedEvent.organizer && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Organizatör</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Users className="h-4 w-4" />
                                    <span>{selectedEvent.organizer}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              {selectedEvent.maxParticipants && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Katılımcı Limiti</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Target className="h-4 w-4" />
                                    <span>{selectedEvent.participants.length} / {selectedEvent.maxParticipants}</span>
                                  </div>
                                </div>
                              )}
                              {selectedEvent.fee && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Katılım Ücreti</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="font-medium">₺{selectedEvent.fee}</span>
                                  </div>
                                </div>
                              )}
                              {selectedEvent.registrationDeadline && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Kayıt Son Tarihi</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{new Date(selectedEvent.registrationDeadline).toLocaleDateString('tr-TR')}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {selectedEvent.description && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Açıklama</Label>
                              <p className="mt-2 text-sm text-foreground bg-accent/50 p-3 rounded-lg">
                                {selectedEvent.description}
                              </p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="participants" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">
                              Katılımcılar ({selectedEvent.participants.length})
                            </h3>
                            <Select onValueChange={(athleteId) => handleRegisterAthlete(selectedEvent.id, athleteId)}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Sporcu ekle" />
                              </SelectTrigger>
                              <SelectContent>
                                {athletes
                                  .filter(athlete => 
                                    !selectedEvent.participants.some(p => p.athleteId === athlete.id) &&
                                    (athlete.sport === selectedEvent.sport || selectedEvent.sport === 'Genel')
                                  )
                                  .map(athlete => (
                                  <SelectItem key={athlete.id} value={athlete.id}>
                                    {athlete.name} {athlete.surname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            {selectedEvent.participants.length > 0 ? (
                              selectedEvent.participants.map((participant) => (
                                <div key={participant.athleteId} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage src={participant.athletePhoto} />
                                        <AvatarFallback>
                                          {participant.athleteName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h4 className="font-medium">{participant.athleteName}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {participant.category}
                                          </Badge>
                                          <Badge 
                                            className={`text-xs ${
                                              participant.status === 'participated' ? 'bg-green-100 text-green-800' :
                                              participant.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                              participant.status === 'absent' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}
                                          >
                                            {participant.status === 'participated' ? 'Katıldı' :
                                             participant.status === 'confirmed' ? 'Onaylandı' :
                                             participant.status === 'absent' ? 'Katılmadı' :
                                             'Kayıtlı'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {participant.result?.medal && getMedalIcon(participant.result.medal)}
                                      {participant.result?.position && (
                                        <Badge variant="secondary">
                                          {participant.result.position}. sıra
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {participant.result?.score && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                      <strong>Skor:</strong> {participant.result.score}
                                    </div>
                                  )}
                                  {participant.result?.notes && (
                                    <div className="mt-1 text-sm text-muted-foreground">
                                      <strong>Notlar:</strong> {participant.result.notes}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Henüz katılımcı bulunmuyor</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Sporcuları etkinliğe kaydedin
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="results" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Sonuçlar</h3>
                            {selectedEvent.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Sonuçları İndir
                              </Button>
                            )}
                          </div>

                          {selectedEvent.status === 'completed' ? (
                            <div className="space-y-4">
                              {/* Medal Winners */}
                              <div className="grid grid-cols-3 gap-4">
                                {['gold', 'silver', 'bronze'].map((medal, index) => {
                                  const winner = selectedEvent.participants.find(p => p.result?.medal === medal);
                                  return (
                                    <div key={medal} className="text-center p-4 border rounded-lg">
                                      <div className="flex justify-center mb-2">
                                        {getMedalIcon(medal)}
                                      </div>
                                      <div className="text-sm font-medium">
                                        {index === 0 ? 'Altın' : index === 1 ? 'Gümüş' : 'Bronz'}
                                      </div>
                                      {winner ? (
                                        <div className="mt-2">
                                          <div className="font-medium text-sm">{winner.athleteName}</div>
                                          {winner.result?.score && (
                                            <div className="text-xs text-muted-foreground">{winner.result.score}</div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-muted-foreground mt-2">-</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* All Results */}
                              <div className="border rounded-lg">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Sıra</TableHead>
                                      <TableHead>Sporcu</TableHead>
                                      <TableHead>Skor</TableHead>
                                      <TableHead>Madalya</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedEvent.participants
                                      .filter(p => p.result?.position)
                                      .sort((a, b) => (a.result?.position || 0) - (b.result?.position || 0))
                                      .map((participant) => (
                                      <TableRow key={participant.athleteId}>
                                        <TableCell>{participant.result?.position}</TableCell>
                                        <TableCell>{participant.athleteName}</TableCell>
                                        <TableCell>{participant.result?.score || '-'}</TableCell>
                                        <TableCell>
                                          {participant.result?.medal && getMedalIcon(participant.result.medal)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">Sonuçlar henüz açıklanmadı</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Etkinlik tamamlandıktan sonra sonuçlar burada görünecek
                              </p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="media" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Medya</h3>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Fotoğraf Yükle
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Belge Yükle
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Photos */}
                            <div>
                              <h4 className="font-medium mb-3">Fotoğraflar</h4>
                              {selectedEvent.photos && selectedEvent.photos.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                  {selectedEvent.photos.map((photo, index) => (
                                    <div key={index} className="aspect-square bg-accent/50 rounded-lg flex items-center justify-center">
                                      <Camera className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                  <p className="text-muted-foreground">Henüz fotoğraf yüklenmedi</p>
                                </div>
                              )}
                            </div>

                            {/* Documents */}
                            <div>
                              <h4 className="font-medium mb-3">Belgeler</h4>
                              {selectedEvent.documents && selectedEvent.documents.length > 0 ? (
                                <div className="space-y-2">
                                  {selectedEvent.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="font-medium">{doc.name}</span>
                                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                                      </div>
                                      <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                  <p className="text-muted-foreground">Henüz belge yüklenmedi</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                          Etkinlik Seçin
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Detayları görüntülemek için sol taraftan bir etkinlik seçin
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default EventsTournaments;