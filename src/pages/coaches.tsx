import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Zap, 
  Edit, 
  Trash2, 
  Users, 
  Trophy, 
  Phone, 
  Mail,
  Target,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const sportsBranches = [
  "Basketbol", "Futbol", "Voleybol", "Hentbol", "Yüzme", 
  "Tenis", "Jimnastik", "Atletizm", "Satranç", "Zihin Oyunları"
];

export default function Coaches() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    sportsBranches: [] as string[]
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      router.push("/login");
      return;
    }
    loadCoaches();
  }, [router]);

  const loadCoaches = () => {
    const savedCoaches = JSON.parse(localStorage.getItem('coaches') || '[]');
    setCoaches(savedCoaches);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name || !formData.surname || !formData.email || !formData.phone) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (!formData.password && !editingCoach) {
      setError("Şifre gereklidir");
      return;
    }

    if (formData.sportsBranches.length === 0) {
      setError("En az bir spor branşı seçin");
      return;
    }

    const newCoach = {
      id: editingCoach ? editingCoach.id : Date.now().toString(),
      ...formData,
      trainingCount: editingCoach ? editingCoach.trainingCount || 0 : 0, // Başlangıçta sıfır antrenman
      athleteCount: editingCoach ? editingCoach.athleteCount || 0 : 0,  // Başlangıçta sıfır sporcu
      createdAt: editingCoach ? editingCoach.createdAt : new Date().toISOString()
    };

    let updatedCoaches;
    if (editingCoach) {
      updatedCoaches = coaches.map(coach => 
        coach.id === editingCoach.id ? newCoach : coach
      );
      setSuccess("Antrenör başarıyla güncellendi");
    } else {
      // Check if email already exists
      const existingCoach = coaches.find(coach => coach.email === formData.email);
      if (existingCoach) {
        setError("Bu email adresi zaten kullanılıyor");
        return;
      }
      updatedCoaches = [...coaches, newCoach];
      setSuccess("Antrenör başarıyla eklendi");
    }

    localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
    setCoaches(updatedCoaches);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (coach: any) => {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      surname: coach.surname,
      email: coach.email,
      password: "",
      phone: coach.phone,
      specialization: coach.specialization,
      experience: coach.experience,
      sportsBranches: coach.sportsBranches || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (coachId: string) => {
    if (confirm("Bu antrenörü silmek istediğinizden emin misiniz?")) {
      const updatedCoaches = coaches.filter(coach => coach.id !== coachId);
      localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
      setCoaches(updatedCoaches);
      setSuccess("Antrenör başarıyla silindi");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      surname: "",
      email: "",
      password: "",
      phone: "",
      specialization: "",
      experience: "",
      sportsBranches: []
    });
    setEditingCoach(null);
    setError("");
  };

  const handleSportsBranchChange = (branch: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        sportsBranches: [...prev.sportsBranches, branch]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sportsBranches: prev.sportsBranches.filter(b => b !== branch)
      }));
    }
  };

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <>
      <Head>
        <title>Antrenör Yönetimi - SportsCRM</title>
        <meta name="description" content="Antrenörleri yönetin" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Zap className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">Antrenör Yönetimi</h1>
              </div>
              <p className="text-muted-foreground">
                Antrenörleri ekleyin, düzenleyin ve yönetin. Antrenman grupları antrenman sayfasından manuel olarak atanacaktır.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Antrenör
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoach ? "Antrenör Düzenle" : "Yeni Antrenör Ekle"}
                  </DialogTitle>
                  <DialogDescription>
                    Antrenör bilgilerini girin. Antrenman grupları daha sonra antrenman sayfasından atanacaktır.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Ad *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="surname">Soyad *</Label>
                      <Input
                        id="surname"
                        value={formData.surname}
                        onChange={(e) => setFormData({...formData, surname: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">
                        {editingCoach ? "Şifre (Değiştirmek için doldurun)" : "Şifre *"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required={!editingCoach}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Deneyim</Label>
                      <Input
                        id="experience"
                        placeholder="Örn: 5 yıl"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialization">Uzmanlık Alanı</Label>
                    <Input
                      id="specialization"
                      placeholder="Örn: Basketbol Antrenörü"
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Spor Branşları *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
                      {sportsBranches.map((branch) => (
                        <div key={branch} className="flex items-center space-x-2">
                          <Checkbox
                            id={`branch-${branch}`}
                            checked={formData.sportsBranches.includes(branch)}
                            onCheckedChange={(checked) => 
                              handleSportsBranchChange(branch, checked as boolean)
                            }
                          />
                          <Label htmlFor={`branch-${branch}`} className="text-sm">
                            {branch}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit">
                      {editingCoach ? "Güncelle" : "Ekle"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Stats */}
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
                    <p className="text-sm font-medium text-muted-foreground">Toplam Antrenör</p>
                    <p className="text-2xl font-bold">{coaches.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktif Branş</p>
                    <p className="text-2xl font-bold">
                      {Array.from(new Set(coaches.flatMap(c => c.sportsBranches || []))).length}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Antrenman</p>
                    <p className="text-2xl font-bold">
                      {coaches.reduce((total, coach) => total + (coach.trainingCount || 0), 0)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coaches Table */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Antrenörler</span>
                </CardTitle>
                <CardDescription>
                  Tüm antrenörleri görüntüleyin ve yönetin. Antrenman grupları antrenman sayfasından atanacaktır.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coaches.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Antrenör</TableHead>
                        <TableHead>İletişim</TableHead>
                        <TableHead>Spor Branşları</TableHead>
                        <TableHead>Antrenman/Sporcu</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coaches.map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(coach.name, coach.surname)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{coach.name} {coach.surname}</p>
                                <p className="text-sm text-muted-foreground">
                                  {coach.specialization}
                                </p>
                                {coach.experience && (
                                  <p className="text-xs text-muted-foreground">
                                    {coach.experience} deneyim
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="w-3 h-3" />
                                <span>{coach.email}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="w-3 h-3" />
                                <span>{coach.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {coach.sportsBranches?.map((branch: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {branch}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium">{coach.trainingCount || 0}</span> antrenman
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">{coach.athleteCount || 0}</span> sporcu
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(coach)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(coach.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz antrenör eklenmemiş</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Antrenörü Ekle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}