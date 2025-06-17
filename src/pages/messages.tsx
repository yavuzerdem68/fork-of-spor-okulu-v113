import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageCircle, 
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Clock,
  Users,
  Trophy,
  Home,
  CreditCard,
  FileText,
  Camera,
  Calendar,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Eye,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Group,
  Zap,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Copy,
  ExternalLink
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Data loading functions
const loadWhatsAppGroups = () => {
  const saved = localStorage.getItem('whatsappGroups');
  return saved ? JSON.parse(saved) : [];
};

const saveWhatsAppGroups = (groups: any[]) => {
  localStorage.setItem('whatsappGroups', JSON.stringify(groups));
};

const loadMessageTemplates = () => {
  const saved = localStorage.getItem('messageTemplates');
  if (saved) {
    return JSON.parse(saved);
  }
  
  // Default templates for first time use
  const defaultTemplates = [
    {
      id: 1,
      title: "Antrenman Hatırlatması",
      content: "Merhaba {veli_adi}, {sporcu_adi}'nın yarınki {spor} antrenmanı {saat}'te {lokasyon}'da olacaktır. Lütfen zamanında gelmesini sağlayın.",
      category: "Antrenman",
      usageCount: 0
    },
    {
      id: 2,
      title: "Devamsızlık Bildirimi",
      content: "Sayın {veli_adi}, {sporcu_adi} bugünkü {spor} antrenmanına katılmamıştır. Herhangi bir sorun varsa lütfen bizimle iletişime geçin.",
      category: "Devamsızlık",
      usageCount: 0
    },
    {
      id: 3,
      title: "Ödeme Hatırlatması",
      content: "Merhaba {veli_adi}, {sporcu_adi}'nın {ay} ayı aidat ödemesi {tutar} TL'dir. Son ödeme tarihi {tarih}'tir.",
      category: "Ödeme",
      usageCount: 0
    },
    {
      id: 4,
      title: "Maç/Müsabaka Duyurusu",
      content: "Sevgili veliler, {sporcu_adi}'nın {tarih} tarihinde {saat}'te {lokasyon}'da maçı bulunmaktadır. Desteklerinizi bekliyoruz!",
      category: "Etkinlik",
      usageCount: 0
    }
  ];
  
  localStorage.setItem('messageTemplates', JSON.stringify(defaultTemplates));
  return defaultTemplates;
};

const saveMessageTemplates = (templates: any[]) => {
  localStorage.setItem('messageTemplates', JSON.stringify(templates));
};

const loadSentMessages = () => {
  const saved = localStorage.getItem('sentMessages');
  return saved ? JSON.parse(saved) : [];
};

const saveSentMessages = (messages: any[]) => {
  localStorage.setItem('sentMessages', JSON.stringify(messages));
};

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages", active: true },
  { icon: Camera, label: "Medya", href: "/media" },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

const sports = ["Basketbol", "Futbol", "Voleybol", "Hentbol", "Yüzme", "Satranç", "Akıl ve Zeka Oyunları"];

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    sport: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Data state
  const [whatsappGroups, setWhatsappGroups] = useState<any[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<any[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);

  useEffect(() => {
    // Load data from localStorage on component mount
    setWhatsappGroups(loadWhatsAppGroups());
    setMessageTemplates(loadMessageTemplates());
    setSentMessages(loadSentMessages());
  }, []);

  const filteredGroups = whatsappGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || group.sport === selectedSport;
    
    return matchesSearch && matchesSport;
  });

  const totalGroups = whatsappGroups.length;
  const totalMembers = whatsappGroups.reduce((sum, group) => sum + group.memberCount, 0);
  const activeGroups = whatsappGroups.filter(g => g.status === "Aktif").length;
  const totalMessages = sentMessages.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>;
      case "Pasif":
        return <Badge variant="secondary">Pasif</Badge>;
      case "Gönderildi":
        return <Badge variant="outline">Gönderildi</Badge>;
      case "Okundu":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Okundu</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id.toString() === templateId);
    if (template) {
      setMessageContent(template.content);
    }
    setSelectedTemplate(templateId);
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!groupFormData.name || !groupFormData.sport) {
      setError("Lütfen grup adı ve spor branşı alanlarını doldurun");
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: groupFormData.name,
      sport: groupFormData.sport,
      description: groupFormData.description,
      memberCount: 0,
      parentCount: 0,
      coachCount: 0,
      status: "Aktif",
      createdDate: new Date().toISOString(),
      lastMessage: "Grup oluşturuldu",
      lastMessageTime: new Date().toISOString()
    };

    const updatedGroups = [...whatsappGroups, newGroup];
    setWhatsappGroups(updatedGroups);
    saveWhatsAppGroups(updatedGroups);
    
    setSuccess("WhatsApp grubu başarıyla oluşturuldu");
    resetGroupForm();
    setIsGroupDialogOpen(false);
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: "",
      sport: "",
      description: ""
    });
    setError("");
  };

  return (
    <>
      <Head>
        <title>Mesajlar - SportsCRM</title>
        <meta name="description" content="WhatsApp entegrasyonu ve mesajlaşma sistemi" />
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
                <h1 className="text-2xl font-bold text-foreground">Mesajlaşma Sistemi</h1>
                <p className="text-muted-foreground">WhatsApp entegrasyonu ve iletişim yönetimi</p>
              </div>
              
              <div className="flex items-center space-x-4">
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
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Toplam Grup</p>
                        <p className="text-2xl font-bold">{totalGroups}</p>
                      </div>
                      <Group className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Toplam Üye</p>
                        <p className="text-2xl font-bold">{totalMembers}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Aktif Grup</p>
                        <p className="text-2xl font-bold">{activeGroups}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gönderilen Mesaj</p>
                        <p className="text-2xl font-bold">{totalMessages}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="groups" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="groups">WhatsApp Grupları</TabsTrigger>
                  <TabsTrigger value="send-message">Mesaj Gönder</TabsTrigger>
                  <TabsTrigger value="templates">Mesaj Şablonları</TabsTrigger>
                  <TabsTrigger value="history">Mesaj Geçmişi</TabsTrigger>
                </TabsList>

                <TabsContent value="groups" className="space-y-6">
                  {/* Filters and Actions */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                          <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input 
                              placeholder="Grup adı ara..." 
                              className="pl-10"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          
                          <Select value={selectedSport} onValueChange={setSelectedSport}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Spor Branşı" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tüm Branşlar</SelectItem>
                              {sports.map(sport => (
                                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Yeni Grup Oluştur
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Yeni WhatsApp Grubu</DialogTitle>
                              <DialogDescription>
                                Yeni grup bilgilerini girin
                              </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={handleGroupSubmit}>
                              {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                  <p className="text-sm text-red-600">{error}</p>
                                </div>
                              )}
                              
                              {success && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                  <p className="text-sm text-green-600">{success}</p>
                                </div>
                              )}

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="groupName">Grup Adı *</Label>
                                  <Input 
                                    id="groupName" 
                                    placeholder="U14 Basketbol Takımı"
                                    value={groupFormData.name}
                                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                                    required
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="sport">Spor Branşı *</Label>
                                  <Select value={groupFormData.sport} onValueChange={(value) => setGroupFormData({...groupFormData, sport: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Branş seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sports.map(sport => (
                                        <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="description">Açıklama</Label>
                                  <Textarea 
                                    id="description" 
                                    placeholder="Grup açıklaması"
                                    value={groupFormData.description}
                                    onChange={(e) => setGroupFormData({...groupFormData, description: e.target.value})}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => {
                                  setIsGroupDialogOpen(false);
                                  resetGroupForm();
                                }}>
                                  İptal
                                </Button>
                                <Button type="submit">
                                  Grup Oluştur
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Groups Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>WhatsApp Grupları ({filteredGroups.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Grup Adı</TableHead>
                            <TableHead>Spor Branşı</TableHead>
                            <TableHead>Üye Sayısı</TableHead>
                            <TableHead>Son Mesaj</TableHead>
                            <TableHead>Oluşturma Tarihi</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGroups.length > 0 ? (
                            filteredGroups.map((group) => (
                              <TableRow key={group.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <MessageCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{group.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {group.parentCount} veli, {group.coachCount} antrenör
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{group.sport}</Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">{group.memberCount}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="text-sm truncate">{group.lastMessage}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(group.lastMessageTime).toLocaleString('tr-TR')}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(group.createdDate).toLocaleDateString('tr-TR')}
                                </TableCell>
                                <TableCell>{getStatusBadge(group.status)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                <div className="flex flex-col items-center space-y-3">
                                  <Group className="w-12 h-12 text-muted-foreground" />
                                  <div>
                                    <p className="text-muted-foreground font-medium">Henüz WhatsApp grubu bulunmuyor</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      WhatsApp entegrasyonu kurulduktan sonra gruplar burada görünecek
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="send-message" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mesaj Gönder</CardTitle>
                      <CardDescription>
                        Bireysel veya toplu mesaj gönderin
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Alıcı Türü</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Alıcı türü seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="individual">Bireysel Mesaj</SelectItem>
                                <SelectItem value="group">Grup Mesajı</SelectItem>
                                <SelectItem value="sport">Spor Branşına Göre</SelectItem>
                                <SelectItem value="all">Tüm Veliler</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Mesaj Şablonu</Label>
                            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                              <SelectTrigger>
                                <SelectValue placeholder="Şablon seçin (opsiyonel)" />
                              </SelectTrigger>
                              <SelectContent>
                                {messageTemplates.map(template => (
                                  <SelectItem key={template.id} value={template.id.toString()}>
                                    {template.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Mesaj İçeriği</Label>
                            <Textarea 
                              placeholder="Mesajınızı yazın..."
                              className="min-h-32"
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Değişkenler: {"{veli_adi}"}, {"{sporcu_adi}"}, {"{spor}"}, {"{saat}"}, {"{lokasyon}"}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button className="flex-1">
                              <Send className="h-4 w-4 mr-2" />
                              Mesaj Gönder
                            </Button>
                            <Button variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Önizle
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Hızlı İşlemler</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <Button variant="outline" className="justify-start h-auto p-4">
                              <div className="text-left">
                                <p className="font-medium">Devamsızlık Bildirimi</p>
                                <p className="text-sm text-muted-foreground">Bugün gelmeyenlere otomatik mesaj</p>
                              </div>
                            </Button>
                            
                            <Button variant="outline" className="justify-start h-auto p-4">
                              <div className="text-left">
                                <p className="font-medium">Antrenman Hatırlatması</p>
                                <p className="text-sm text-muted-foreground">Yarınki antrenmanlar için hatırlatma</p>
                              </div>
                            </Button>
                            
                            <Button variant="outline" className="justify-start h-auto p-4">
                              <div className="text-left">
                                <p className="font-medium">Ödeme Hatırlatması</p>
                                <p className="text-sm text-muted-foreground">Geciken ödemeler için bildirim</p>
                              </div>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Mesaj Şablonları</CardTitle>
                          <CardDescription>
                            Hazır mesaj şablonlarını yönetin
                          </CardDescription>
                        </div>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Yeni Şablon
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {messageTemplates.map((template) => (
                          <Card key={template.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium">{template.title}</h4>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {template.category}
                                  </Badge>
                                </div>
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                {template.content}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{template.usageCount} kez kullanıldı</span>
                                <Button size="sm" variant="outline">
                                  Kullan
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mesaj Geçmişi</CardTitle>
                      <CardDescription>
                        Gönderilen mesajların geçmişi
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Alıcı</TableHead>
                            <TableHead>Sporcu</TableHead>
                            <TableHead>Mesaj</TableHead>
                            <TableHead>Gönderim Zamanı</TableHead>
                            <TableHead>Tür</TableHead>
                            <TableHead>Şablon</TableHead>
                            <TableHead>Durum</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sentMessages.length > 0 ? (
                            sentMessages.map((message) => (
                              <TableRow key={message.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{message.recipient}</p>
                                    <Badge variant="outline" className="text-xs">{message.sport}</Badge>
                                  </div>
                                </TableCell>
                                <TableCell>{message.athleteName}</TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="text-sm truncate">{message.message}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(message.sentTime).toLocaleString('tr-TR')}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={message.type === "Grup" ? "default" : "secondary"}>
                                    {message.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{message.template}</TableCell>
                                <TableCell>{getStatusBadge(message.status)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                <div className="flex flex-col items-center space-y-3">
                                  <MessageSquare className="w-12 h-12 text-muted-foreground" />
                                  <div>
                                    <p className="text-muted-foreground font-medium">Henüz mesaj gönderilmemiş</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Gönderilen mesajlar burada görünecek
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
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