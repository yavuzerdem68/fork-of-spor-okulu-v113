import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowLeft, User, Users, Phone, Mail, MapPin, Calendar, Heart, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import TermsModal from "@/components/TermsModal";
import { KvkkModal } from "@/components/KvkkModal";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const sports = [
  "Basketbol", "Hentbol", "Yüzme", "Akıl ve Zeka Oyunları", "Satranç", "Futbol", "Voleybol",
  "Tenis", "Badminton", "Masa Tenisi", "Atletizm", "Jimnastik", "Karate", "Taekwondo",
  "Judo", "Boks", "Güreş", "Halter", "Bisiklet", "Kayak", "Buz Pateni", "Eskrim"
];

const cities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
  "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum",
  "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin",
  "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
  "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak"
];

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isParentLoggedIn, setIsParentLoggedIn] = useState(false);
  const [tcErrors, setTcErrors] = useState({
    studentTcNo: "",
    parentTcNo: ""
  });

  // Check if parent is logged in
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');
    
    if (userRole === 'parent' && currentUser) {
      setIsParentLoggedIn(true);
      const user = JSON.parse(currentUser);
      // Pre-fill parent information
      setFormData(prev => ({
        ...prev,
        parentName: user.firstName,
        parentSurname: user.lastName,
        parentEmail: user.email,
        parentPhone: user.phone
      }));
    } else {
      // Redirect to parent signup if not logged in
      router.push('/parent-signup');
    }
  }, [router]);

  const [formData, setFormData] = useState({
    // Öğrenci Bilgileri
    studentName: "",
    studentSurname: "",
    studentTcNo: "",
    studentBirthDate: "",
    studentGender: "",
    studentSchool: "",
    studentClass: "",
    selectedSports: [] as string[],
    
    // Fiziksel Bilgiler
    studentHeight: "",
    studentWeight: "",
    bloodType: "",
    dominantHand: "",
    dominantFoot: "",
    sportsPosition: "",
    
    // Veli Bilgileri
    parentName: "",
    parentSurname: "",
    parentTcNo: "",
    parentPhone: "",
    parentEmail: "",
    parentRelation: "",
    parentOccupation: "",
    
    // İkinci Veli Bilgileri
    secondParentName: "",
    secondParentSurname: "",
    secondParentPhone: "",
    secondParentEmail: "",
    secondParentRelation: "",
    
    // İletişim Bilgileri
    address: "",
    city: "",
    district: "",
    postalCode: "",
    
    // Sağlık Bilgileri
    hasHealthIssues: "",
    healthIssuesDetail: "",
    medications: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    specialDiet: "",
    
    // Sporcu Geçmişi
    previousClubs: "",
    achievements: "",
    sportsGoals: "",
    motivation: "",
    
    // Diğer Bilgiler
    howDidYouHear: "",
    previousSportsExperience: "",
    expectations: "",
    
    // Onaylar
    agreementAccepted: false,
    dataProcessingAccepted: false,
    photoVideoPermission: false
  });

  // TC Kimlik numarası validation function
  const validateTcNo = (tcNo: string): string => {
    if (!tcNo) return "";
    
    // Remove any non-digit characters
    const cleanTcNo = tcNo.replace(/\D/g, '');
    
    if (cleanTcNo.length !== 11) {
      return "TC Kimlik numarası 11 haneli olmalıdır";
    }
    
    if (!/^\d{11}$/.test(cleanTcNo)) {
      return "TC Kimlik numarası sadece rakamlardan oluşmalıdır";
    }
    
    if (cleanTcNo[0] === '0') {
      return "TC Kimlik numarası 0 ile başlayamaz";
    }
    
    return "";
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate TC numbers on change
    if (field === 'studentTcNo' || field === 'parentTcNo') {
      const error = validateTcNo(value);
      setTcErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleTcNoChange = (field: string, value: string) => {
    // Only allow digits and limit to 11 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 11);
    handleInputChange(field, cleanValue);
  };

  const handleSportSelection = (sport: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedSports: checked 
        ? [...prev.selectedSports, sport]
        : prev.selectedSports.filter(s => s !== sport)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TC Kimlik numarası validation
    const studentTcError = validateTcNo(formData.studentTcNo);
    const parentTcError = validateTcNo(formData.parentTcNo);
    
    if (studentTcError || parentTcError) {
      setTcErrors({
        studentTcNo: studentTcError,
        parentTcNo: parentTcError
      });
      setError("Lütfen TC Kimlik numaralarını doğru formatta girin");
      setLoading(false);
      return;
    }

    // Other validations
    if (!formData.agreementAccepted || !formData.dataProcessingAccepted) {
      setError("Lütfen gerekli onayları işaretleyin");
      setLoading(false);
      return;
    }

    if (formData.selectedSports.length === 0) {
      setError("Lütfen en az bir spor branşı seçin");
      setLoading(false);
      return;
    }

    // Mock registration - replace with real API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Kayıt Başarılı!</h2>
          <p className="text-muted-foreground mb-4">Kaydınız başarıyla tamamlandı. Giriş sayfasına yönlendiriliyorsunuz...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Kayıt Ol - SportsCRM</title>
        <meta name="description" content="SportsCRM sistemine kayıt olun" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">SportsCRM</span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Sporcu Kayıt Formu</h1>
            <p className="text-muted-foreground">Spor okulumuzda eğitim almak için kayıt formunu doldurun</p>
          </div>

          <motion.form onSubmit={handleSubmit} variants={fadeInUp}>
            <div className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Öğrenci Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Öğrenci Bilgileri</span>
                  </CardTitle>
                  <CardDescription>Sporcu adayının kişisel bilgilerini girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">Ad *</Label>
                      <Input
                        id="studentName"
                        value={formData.studentName}
                        onChange={(e) => handleInputChange("studentName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentSurname">Soyad *</Label>
                      <Input
                        id="studentSurname"
                        value={formData.studentSurname}
                        onChange={(e) => handleInputChange("studentSurname", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentTcNo">T.C. Kimlik No *</Label>
                      <Input
                        id="studentTcNo"
                        value={formData.studentTcNo}
                        onChange={(e) => handleTcNoChange("studentTcNo", e.target.value)}
                        maxLength={11}
                        placeholder="11 haneli TC kimlik numarası"
                        className={tcErrors.studentTcNo ? "border-red-500" : ""}
                        required
                      />
                      {tcErrors.studentTcNo && (
                        <p className="text-sm text-red-500 mt-1">{tcErrors.studentTcNo}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="studentBirthDate">Doğum Tarihi *</Label>
                      <Input
                        id="studentBirthDate"
                        type="date"
                        value={formData.studentBirthDate}
                        onChange={(e) => handleInputChange("studentBirthDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Cinsiyet *</Label>
                      <RadioGroup 
                        value={formData.studentGender} 
                        onValueChange={(value) => handleInputChange("studentGender", value)}
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="erkek" id="erkek" />
                          <Label htmlFor="erkek">Erkek</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="kız" id="kız" />
                          <Label htmlFor="kız">Kız</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label htmlFor="studentClass">Sınıf</Label>
                      <Input
                        id="studentClass"
                        placeholder="Örn: 5. Sınıf"
                        value={formData.studentClass}
                        onChange={(e) => handleInputChange("studentClass", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="studentSchool">Okul</Label>
                    <Input
                      id="studentSchool"
                      placeholder="Öğrencinin devam ettiği okul"
                      value={formData.studentSchool}
                      onChange={(e) => handleInputChange("studentSchool", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Katılmak İstediği Spor Branşları * (Birden fazla seçebilirsiniz)</Label>
                    
                    {/* Selected Sports Display */}
                    {formData.selectedSports.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 mb-4">
                        {formData.selectedSports.map((sport) => (
                          <Badge key={sport} variant="default" className="flex items-center gap-1">
                            {sport}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => handleSportSelection(sport, false)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-3 gap-3 mt-2">
                      {sports.map((sport) => (
                        <div key={sport} className="flex items-center space-x-2">
                          <Checkbox
                            id={sport}
                            checked={formData.selectedSports.includes(sport)}
                            onCheckedChange={(checked) => handleSportSelection(sport, checked as boolean)}
                          />
                          <Label htmlFor={sport} className="text-sm">{sport}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fiziksel Bilgiler */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Fiziksel Bilgiler</span>
                  </CardTitle>
                  <CardDescription>Sporcu performansı için gerekli fiziksel bilgiler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="studentHeight">Boy (cm)</Label>
                      <Input
                        id="studentHeight"
                        type="number"
                        placeholder="170"
                        value={formData.studentHeight}
                        onChange={(e) => handleInputChange("studentHeight", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentWeight">Kilo (kg)</Label>
                      <Input
                        id="studentWeight"
                        type="number"
                        placeholder="65"
                        value={formData.studentWeight}
                        onChange={(e) => handleInputChange("studentWeight", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bloodType">Kan Grubu</Label>
                      <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kan grubu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A Rh+</SelectItem>
                          <SelectItem value="A-">A Rh-</SelectItem>
                          <SelectItem value="B+">B Rh+</SelectItem>
                          <SelectItem value="B-">B Rh-</SelectItem>
                          <SelectItem value="AB+">AB Rh+</SelectItem>
                          <SelectItem value="AB-">AB Rh-</SelectItem>
                          <SelectItem value="0+">0 Rh+</SelectItem>
                          <SelectItem value="0-">0 Rh-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dominantHand">Dominant El</Label>
                      <Select value={formData.dominantHand} onValueChange={(value) => handleInputChange("dominantHand", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sag">Sağ</SelectItem>
                          <SelectItem value="sol">Sol</SelectItem>
                          <SelectItem value="her-ikisi">Her İkisi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dominantFoot">Dominant Ayak</Label>
                      <Select value={formData.dominantFoot} onValueChange={(value) => handleInputChange("dominantFoot", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sag">Sağ</SelectItem>
                          <SelectItem value="sol">Sol</SelectItem>
                          <SelectItem value="her-ikisi">Her İkisi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sportsPosition">Tercih Edilen Pozisyon</Label>
                      <Input
                        id="sportsPosition"
                        placeholder="Örn: Kaleci, Forvet, Guard"
                        value={formData.sportsPosition}
                        onChange={(e) => handleInputChange("sportsPosition", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Veli Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Veli Bilgileri</span>
                  </CardTitle>
                  <CardDescription>Velinin iletişim ve kimlik bilgilerini girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentName">Veli Adı *</Label>
                      <Input
                        id="parentName"
                        value={formData.parentName}
                        onChange={(e) => handleInputChange("parentName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentSurname">Veli Soyadı *</Label>
                      <Input
                        id="parentSurname"
                        value={formData.parentSurname}
                        onChange={(e) => handleInputChange("parentSurname", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentTcNo">Veli T.C. Kimlik No *</Label>
                      <Input
                        id="parentTcNo"
                        value={formData.parentTcNo}
                        onChange={(e) => handleTcNoChange("parentTcNo", e.target.value)}
                        maxLength={11}
                        placeholder="11 haneli TC kimlik numarası"
                        className={tcErrors.parentTcNo ? "border-red-500" : ""}
                        required
                      />
                      {tcErrors.parentTcNo && (
                        <p className="text-sm text-red-500 mt-1">{tcErrors.parentTcNo}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="parentRelation">Yakınlık Derecesi *</Label>
                      <Select value={formData.parentRelation} onValueChange={(value) => handleInputChange("parentRelation", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anne">Anne</SelectItem>
                          <SelectItem value="baba">Baba</SelectItem>
                          <SelectItem value="vasi">Vasi</SelectItem>
                          <SelectItem value="büyükanne">Büyükanne</SelectItem>
                          <SelectItem value="büyükbaba">Büyükbaba</SelectItem>
                          <SelectItem value="diğer">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="parentPhone">Telefon Numarası *</Label>
                      <Input
                        id="parentPhone"
                        type="tel"
                        placeholder="0555 123 45 67"
                        value={formData.parentPhone}
                        onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentEmail">Email Adresi *</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        placeholder="veli@example.com"
                        value={formData.parentEmail}
                        onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentOccupation">Meslek</Label>
                      <Input
                        id="parentOccupation"
                        placeholder="Meslek bilgisi"
                        value={formData.parentOccupation}
                        onChange={(e) => handleInputChange("parentOccupation", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* İkinci Veli Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>İkinci Veli Bilgileri (Opsiyonel)</span>
                  </CardTitle>
                  <CardDescription>İkinci velinin iletişim bilgilerini girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secondParentName">İkinci Veli Adı</Label>
                      <Input
                        id="secondParentName"
                        value={formData.secondParentName}
                        onChange={(e) => handleInputChange("secondParentName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondParentSurname">İkinci Veli Soyadı</Label>
                      <Input
                        id="secondParentSurname"
                        value={formData.secondParentSurname}
                        onChange={(e) => handleInputChange("secondParentSurname", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="secondParentPhone">Telefon Numarası</Label>
                      <Input
                        id="secondParentPhone"
                        type="tel"
                        placeholder="0555 123 45 67"
                        value={formData.secondParentPhone}
                        onChange={(e) => handleInputChange("secondParentPhone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondParentEmail">Email Adresi</Label>
                      <Input
                        id="secondParentEmail"
                        type="email"
                        placeholder="veli2@example.com"
                        value={formData.secondParentEmail}
                        onChange={(e) => handleInputChange("secondParentEmail", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondParentRelation">Yakınlık Derecesi</Label>
                      <Select value={formData.secondParentRelation} onValueChange={(value) => handleInputChange("secondParentRelation", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anne">Anne</SelectItem>
                          <SelectItem value="baba">Baba</SelectItem>
                          <SelectItem value="vasi">Vasi</SelectItem>
                          <SelectItem value="büyükanne">Büyükanne</SelectItem>
                          <SelectItem value="büyükbaba">Büyükbaba</SelectItem>
                          <SelectItem value="diğer">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* İletişim Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>İletişim Bilgileri</span>
                  </CardTitle>
                  <CardDescription>Adres ve iletişim bilgilerini girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Adres *</Label>
                    <Textarea
                      id="address"
                      placeholder="Tam adres bilgisi"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">İl *</Label>
                      <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="İl seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="district">İlçe *</Label>
                      <Input
                        id="district"
                        placeholder="İlçe"
                        value={formData.district}
                        onChange={(e) => handleInputChange("district", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Posta Kodu</Label>
                      <Input
                        id="postalCode"
                        placeholder="34000"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sağlık Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Sağlık Bilgileri</span>
                  </CardTitle>
                  <CardDescription>Öğrencinin sağlık durumu ile ilgili bilgiler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Kronik hastalık veya sağlık sorunu var mı? *</Label>
                    <RadioGroup 
                      value={formData.hasHealthIssues} 
                      onValueChange={(value) => handleInputChange("hasHealthIssues", value)}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="evet" id="health-yes" />
                        <Label htmlFor="health-yes">Evet</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hayır" id="health-no" />
                        <Label htmlFor="health-no">Hayır</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.hasHealthIssues === "evet" && (
                    <div>
                      <Label htmlFor="healthIssuesDetail">Sağlık sorunu detayı</Label>
                      <Textarea
                        id="healthIssuesDetail"
                        placeholder="Lütfen detayları belirtin"
                        value={formData.healthIssuesDetail}
                        onChange={(e) => handleInputChange("healthIssuesDetail", e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medications">Kullandığı İlaçlar</Label>
                      <Textarea
                        id="medications"
                        placeholder="Varsa kullandığı ilaçları belirtin"
                        value={formData.medications}
                        onChange={(e) => handleInputChange("medications", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="allergies">Alerjiler</Label>
                      <Textarea
                        id="allergies"
                        placeholder="Bilinen alerjileri belirtin"
                        value={formData.allergies}
                        onChange={(e) => handleInputChange("allergies", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Acil Durum İletişim Kişisi *</Label>
                      <Input
                        id="emergencyContactName"
                        placeholder="Ad Soyad"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Acil Durum Telefonu *</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        placeholder="0555 123 45 67"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelation">Yakınlık Derecesi *</Label>
                      <Input
                        id="emergencyContactRelation"
                        placeholder="Anne, Baba, vb."
                        value={formData.emergencyContactRelation}
                        onChange={(e) => handleInputChange("emergencyContactRelation", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialDiet">Özel Diyet Gereksinimleri</Label>
                    <Textarea
                      id="specialDiet"
                      placeholder="Varsa özel beslenme gereksinimleri belirtin"
                      value={formData.specialDiet}
                      onChange={(e) => handleInputChange("specialDiet", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sporcu Geçmişi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Sporcu Geçmişi ve Hedefler</span>
                  </CardTitle>
                  <CardDescription>Sporcunun geçmiş deneyimleri ve gelecek hedefleri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="previousClubs">Önceki Kulüp Deneyimleri</Label>
                    <Textarea
                      id="previousClubs"
                      placeholder="Daha önce üye olduğu spor kulüpleri varsa belirtin"
                      value={formData.previousClubs}
                      onChange={(e) => handleInputChange("previousClubs", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="achievements">Başarılar ve Ödüller</Label>
                    <Textarea
                      id="achievements"
                      placeholder="Aldığı ödüller, başarılar, dereceler varsa belirtin"
                      value={formData.achievements}
                      onChange={(e) => handleInputChange("achievements", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sportsGoals">Spor Hedefleri</Label>
                    <Textarea
                      id="sportsGoals"
                      placeholder="Sporda ulaşmak istediği hedefler"
                      value={formData.sportsGoals}
                      onChange={(e) => handleInputChange("sportsGoals", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="motivation">Motivasyon ve İlgi Alanları</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Sporu neden seçtiği, motivasyon kaynakları"
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Diğer Bilgiler */}
              <Card>
                <CardHeader>
                  <CardTitle>Diğer Bilgiler</CardTitle>
                  <CardDescription>Ek bilgiler ve beklentiler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="howDidYouHear">Bizi nasıl duydunuz?</Label>
                    <Select value={formData.howDidYouHear} onValueChange={(value) => handleInputChange("howDidYouHear", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sosyal-medya">Sosyal Medya</SelectItem>
                        <SelectItem value="arkadas-tavsiye">Arkadaş Tavsiyesi</SelectItem>
                        <SelectItem value="internet-arama">İnternet Araması</SelectItem>
                        <SelectItem value="gazete-dergi">Gazete/Dergi</SelectItem>
                        <SelectItem value="okul">Okul</SelectItem>
                        <SelectItem value="diğer">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="previousSportsExperience">Önceki Spor Deneyimi</Label>
                    <Textarea
                      id="previousSportsExperience"
                      placeholder="Daha önce yaptığı sporlar varsa belirtin"
                      value={formData.previousSportsExperience}
                      onChange={(e) => handleInputChange("previousSportsExperience", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expectations">Beklentileriniz</Label>
                    <Textarea
                      id="expectations"
                      placeholder="Spor okulumuzdan beklentilerinizi belirtin"
                      value={formData.expectations}
                      onChange={(e) => handleInputChange("expectations", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Onaylar */}
              <Card>
                <CardHeader>
                  <CardTitle>Onaylar</CardTitle>
                  <CardDescription>Lütfen aşağıdaki onayları okuyup işaretleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreement"
                      checked={formData.agreementAccepted}
                      onCheckedChange={(checked) => handleInputChange("agreementAccepted", checked)}
                    />
                    <Label htmlFor="agreement" className="text-sm leading-relaxed">
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary underline hover:text-primary/80"
                      >
                        Spor okulu kurallarını ve şartlarını
                      </button>
                      {" "}okudum, kabul ediyorum. *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="dataProcessing"
                      checked={formData.dataProcessingAccepted}
                      onCheckedChange={(checked) => handleInputChange("dataProcessingAccepted", checked)}
                    />
                    <Label htmlFor="dataProcessing" className="text-sm leading-relaxed">
                      Kişisel verilerimin işlenmesine ve{" "}
                      <KvkkModal>
                        <button
                          type="button"
                          className="text-primary underline hover:text-primary/80"
                        >
                          KVKK kapsamında
                        </button>
                      </KvkkModal>
                      {" "}kullanılmasına onay veriyorum. *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="photoVideo"
                      checked={formData.photoVideoPermission}
                      onCheckedChange={(checked) => handleInputChange("photoVideoPermission", checked)}
                    />
                    <Label htmlFor="photoVideo" className="text-sm leading-relaxed">
                      Çocuğumun antrenman ve etkinliklerde çekilen fotoğraf/videolarının paylaşılmasına izin veriyorum.
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button type="submit" size="lg" disabled={loading} className="px-12">
                  {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                </Button>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Zaten hesabınız var mı? Giriş yapın
                </Link>
              </div>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
    </>
  );
}