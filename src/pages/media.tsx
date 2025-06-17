import React, { useState } from "react";
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
import { 
  Camera, 
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
  MessageCircle,
  Calendar,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Eye,
  Upload,
  Image,
  Video,
  Share,
  Heart,
  MessageSquare,
  Play,
  Folder,
  Grid,
  List,
  Star,
  ExternalLink
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Load media data from localStorage
const loadMediaData = () => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('mediaItems') || '[]');
  }
  return [];
};

const loadAlbumsData = () => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('mediaAlbums') || '[]');
  }
  return [];
};

const saveMediaData = (mediaItems: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mediaItems', JSON.stringify(mediaItems));
  }
};

const saveAlbumsData = (albums: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mediaAlbums', JSON.stringify(albums));
  }
};

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Sporcular", href: "/athletes" },
  { icon: CreditCard, label: "Ödemeler", href: "/payments" },
  { icon: Calendar, label: "Antrenmanlar", href: "/trainings" },
  { icon: UserCheck, label: "Yoklama", href: "/attendance" },
  { icon: MessageCircle, label: "Mesajlar", href: "/messages" },
  { icon: Camera, label: "Medya", href: "/media", active: true },
  { icon: FileText, label: "Raporlar", href: "/reports" },
  { icon: Settings, label: "Ayarlar", href: "/settings" }
];

const sports = ["Basketbol", "Futbol", "Voleybol", "Hentbol", "Yüzme", "Satranç", "Akıl ve Zeka Oyunları"];

export default function Media() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);

  // Load data on component mount
  React.useEffect(() => {
    setMediaItems(loadMediaData());
    setAlbums(loadAlbumsData());
  }, []);

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === "all" || item.sport === selectedSport;
    const matchesType = selectedType === "all" || item.type === selectedType;
    
    return matchesSearch && matchesSport && matchesType;
  });

  const totalMedia = mediaItems.length;
  const totalImages = mediaItems.filter(item => item.type === "image").length;
  const totalVideos = mediaItems.filter(item => item.type === "video").length;
  const totalViews = mediaItems.reduce((sum, item) => sum + item.views, 0);

  const getTypeIcon = (type: string) => {
    return type === "video" ? Video : Image;
  };

  return (
    <>
      <Head>
        <title>Medya - SportsCRM</title>
        <meta name="description" content="Fotoğraf ve video paylaşımı" />
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
                <h1 className="text-2xl font-bold text-foreground">Medya Galerisi</h1>
                <p className="text-muted-foreground">Fotoğraf ve video paylaşımı</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Toplam Medya</p>
                        <p className="text-2xl font-bold">{totalMedia}</p>
                      </div>
                      <Camera className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fotoğraflar</p>
                        <p className="text-2xl font-bold">{totalImages}</p>
                      </div>
                      <Image className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Videolar</p>
                        <p className="text-2xl font-bold">{totalVideos}</p>
                      </div>
                      <Video className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Toplam Görüntüleme</p>
                        <p className="text-2xl font-bold">{totalViews}</p>
                      </div>
                      <Eye className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="gallery" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="gallery">Galeri</TabsTrigger>
                  <TabsTrigger value="albums">Albümler</TabsTrigger>
                  <TabsTrigger value="shared">Paylaşılanlar</TabsTrigger>
                </TabsList>

                <TabsContent value="gallery" className="space-y-6">
                  {/* Filters and Actions */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                          <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input 
                              placeholder="Medya ara..." 
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
                          
                          <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Tür" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tümü</SelectItem>
                              <SelectItem value="image">Fotoğraf</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex border rounded-lg">
                            <Button 
                              variant={viewMode === "grid" ? "default" : "ghost"} 
                              size="sm"
                              onClick={() => setViewMode("grid")}
                            >
                              <Grid className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant={viewMode === "list" ? "default" : "ghost"} 
                              size="sm"
                              onClick={() => setViewMode("list")}
                            >
                              <List className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                            <DialogTrigger asChild>
                              <Button>
                                <Upload className="h-4 w-4 mr-2" />
                                Medya Yükle
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Medya Yükle</DialogTitle>
                                <DialogDescription>
                                  Fotoğraf veya video yükleyin
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="title">Başlık</Label>
                                  <Input id="title" placeholder="Medya başlığı" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="sport">Spor Branşı</Label>
                                  <Select>
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
                                  <Textarea id="description" placeholder="Medya açıklaması" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Dosya Seç</Label>
                                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      Dosyaları buraya sürükleyin veya tıklayın
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                                  İptal
                                </Button>
                                <Button onClick={() => setIsUploadDialogOpen(false)}>
                                  Yükle
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Media Gallery */}
                  {filteredMedia.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Henüz medya yok</h3>
                        <p className="text-muted-foreground mb-4">
                          Fotoğraf ve videolarınızı yükleyerek medya galerinizi oluşturmaya başlayın.
                        </p>
                        <Button onClick={() => setIsUploadDialogOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          İlk Medyanızı Yükleyin
                        </Button>
                      </CardContent>
                    </Card>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredMedia.map((item) => {
                        const TypeIcon = getTypeIcon(item.type);
                        return (
                          <motion.div key={item.id} variants={fadeInUp}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="relative">
                                <img 
                                  src={item.thumbnail} 
                                  alt={item.title}
                                  className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 left-2">
                                  <Badge variant="secondary" className="flex items-center space-x-1">
                                    <TypeIcon className="h-3 w-3" />
                                    <span className="text-xs">{item.type === "video" ? "Video" : "Foto"}</span>
                                  </Badge>
                                </div>
                                {item.type === "video" && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/50 rounded-full p-3">
                                      <Play className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                )}
                                {item.duration && (
                                  <div className="absolute bottom-2 right-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {item.duration}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {item.sport}
                                  </Badge>
                                </div>
                                
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                  {item.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                  <span>{item.uploadedBy}</span>
                                  <span>{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Heart className="h-3 w-3" />
                                      <span>{item.likes}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageSquare className="h-3 w-3" />
                                      <span>{item.comments}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{item.views}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex space-x-1">
                                    <Button variant="ghost" size="sm">
                                      <Share className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medya</TableHead>
                              <TableHead>Tür</TableHead>
                              <TableHead>Spor</TableHead>
                              <TableHead>Yükleyen</TableHead>
                              <TableHead>Tarih</TableHead>
                              <TableHead>İstatistikler</TableHead>
                              <TableHead>İşlemler</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredMedia.map((item) => {
                              const TypeIcon = getTypeIcon(item.type);
                              return (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <img 
                                        src={item.thumbnail} 
                                        alt={item.title}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                      <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                          {item.description}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      <TypeIcon className="h-4 w-4" />
                                      <span className="capitalize">{item.type}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{item.sport}</Badge>
                                  </TableCell>
                                  <TableCell>{item.uploadedBy}</TableCell>
                                  <TableCell>
                                    {new Date(item.date).toLocaleDateString('tr-TR')}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-3 text-sm text-muted-foreground">
                                      <span>👁 {item.views}</span>
                                      <span>❤️ {item.likes}</span>
                                      <span>💬 {item.comments}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Share className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="albums" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Medya Albümleri</CardTitle>
                          <CardDescription>
                            Organize edilmiş medya koleksiyonları
                          </CardDescription>
                        </div>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Yeni Albüm
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {albums.length === 0 ? (
                        <div className="p-12 text-center">
                          <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium mb-2">Henüz albüm yok</h3>
                          <p className="text-muted-foreground mb-4">
                            Medyalarınızı organize etmek için albümler oluşturun.
                          </p>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            İlk Albümünüzü Oluşturun
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {albums.map((album) => (
                            <Card key={album.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                              <div className="relative">
                                <img 
                                  src={album.coverImage} 
                                  alt={album.name}
                                  className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                  <Badge variant="secondary">
                                    {album.itemCount} öğe
                                  </Badge>
                                </div>
                              </div>
                              
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium">{album.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {album.sport}
                                  </Badge>
                                </div>
                                
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <p>Oluşturulma: {new Date(album.createdDate).toLocaleDateString('tr-TR')}</p>
                                  <p>Son güncelleme: {new Date(album.lastUpdated).toLocaleDateString('tr-TR')}</p>
                                </div>
                                
                                <div className="flex justify-between items-center mt-3">
                                  <Button variant="outline" size="sm">
                                    <Folder className="h-3 w-3 mr-1" />
                                    Aç
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Share className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shared" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paylaşılan Medyalar</CardTitle>
                      <CardDescription>
                        Velilerle paylaşılan fotoğraf ve videolar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredMedia.filter(item => item.shared).length === 0 ? (
                        <div className="p-12 text-center">
                          <Share className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium mb-2">Henüz paylaşılan medya yok</h3>
                          <p className="text-muted-foreground mb-4">
                            Velilerle paylaştığınız fotoğraf ve videolar burada görünecek.
                          </p>
                          <Button onClick={() => setIsUploadDialogOpen(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Medya Yükle ve Paylaş
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredMedia.filter(item => item.shared).map((item) => {
                            const TypeIcon = getTypeIcon(item.type);
                            return (
                              <Card key={item.id} className="overflow-hidden">
                                <div className="relative">
                                  <img 
                                    src={item.thumbnail} 
                                    alt={item.title}
                                    className="w-full h-48 object-cover"
                                  />
                                  <div className="absolute top-2 left-2">
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Paylaşıldı
                                    </Badge>
                                  </div>
                                </div>
                                
                                <CardContent className="p-4">
                                  <h3 className="font-medium mb-2">{item.title}</h3>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {item.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                                    <div className="flex items-center space-x-2">
                                      <span>👁 {item.views}</span>
                                      <span>❤️ {item.likes}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
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