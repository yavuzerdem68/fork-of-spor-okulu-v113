import React, { useState, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Users, Phone, Mail, MapPin, Heart, Trophy, AlertTriangle, X, Camera, Upload, Send, FileText } from "lucide-react";
import { toast } from "sonner";
import { validateTCKimlikNo, cleanTCKimlikNo } from "@/util/tcValidation";
import { sanitizeInput } from "@/utils/security";

const sports = [
  "Basketbol", "Hentbol", "Yüzme", "Akıl ve Zeka Oyunları", "Satranç", "Futbol", "Voleybol",
  "Tenis", "Badminton", "Masa Tenisi", "Atletizm", "Jimnastik", "Karate", "Taekwondo",
  "Judo", "Boks", "Güreş", "Halter", "Bisiklet", "Kayak", "Buz Pateni", "Eskrim", "Hareket Eğitimi"
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

export default function ParentRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tcErrors, setTcErrors] = useState({
    studentTcNo: "",
    parentTcNo: ""
  });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    previousSportsExperience: "",
    
    // Diğer Bilgiler
    howDidYouHear: "",
    expectations: "",
    
    // Onaylar
    agreementAccepted: false,
    dataProcessingAccepted: false,
    photoVideoPermission: false,
    
    // Photo
    photo: ""
  });

  // TC Kimlik numarası validation function
  const validateTcNo = (tcNo: string): string => {
    if (!tcNo) return "";
    
    const validation = validateTCKimlikNo(tcNo);
    return validation.isValid ? "" : (validation.error || "Geçersiz TC Kimlik No");
  };

  const handleInputChange = (field: string, value: any) => {
    // Sanitize input based on field type
    let sanitizedValue = value;
    
    if (typeof value === 'string') {
      // For text fields, sanitize input
      if (field.includes('Name') || field.includes('Surname') || field === 'parentRelation' || 
          field === 'emergencyContactRelation' || field === 'parentOccupation') {
        sanitizedValue = sanitizeInput(value, 100);
      }
      // For email fields
      else if (field.includes('Email')) {
        sanitizedValue = sanitizeInput(value, 100).toLowerCase();
      }
      // For phone fields
      else if (field.includes('Phone')) {
        sanitizedValue = sanitizeInput(value.replace(/[^\d\s\+\-\(\)]/g, ''), 20);
      }
      // For address and text areas
      else if (field === 'address' || field.includes('Detail') || field.includes('medications') || 
               field.includes('allergies') || field.includes('expectations')) {
        sanitizedValue = sanitizeInput(value, 500);
      }
      // For other text fields
      else if (typeof value === 'string') {
        sanitizedValue = sanitizeInput(value, 200);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
    
    // Validate TC numbers on change
    if (field === 'studentTcNo' || field === 'parentTcNo') {
      const error = validateTcNo(sanitizedValue);
      setTcErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleTcNoChange = (field: string, value: string) => {
    const cleanValue = cleanTCKimlikNo(value).slice(0, 11);
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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Fotoğraf boyutu 5MB'dan küçük olmalıdır");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Lütfen geçerli bir resim dosyası seçin");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedPhoto(result);
        handleInputChange("photo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    handleInputChange("photo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  const downloadFormData = () => {
    const studentAge = calculateAge(formData.studentBirthDate);
    
    const formDataForDownload = {
      ...formData,
      studentAge,
      submissionDate: new Date().toISOString(),
      formVersion: "1.0"
    };

    const dataStr = JSON.stringify(formDataForDownload, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sporcu-kayit-${formData.studentName}-${formData.studentSurname}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

    try {
      // Send form via email
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success("Form başarıyla gönderildi! E-posta ile iletildi.");
      } else {
        setError(result.message || "Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setError("Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mt-8">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Form Başarıyla Gönderildi!</CardTitle>
              <CardDescription className="text-lg">
                Sporcu kayıt formunuz başarıyla oluşturuldu ve e-posta ile gönderildi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Önemli:</strong> Sporcu kayıt formunuz e-posta ile spor okulu yönetimine gönderildi. 
                  Kayıt işleminiz en kısa sürede değerlendirilecektir.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Dosya adı: <strong>sporcu-kayit-{formData.studentName}-{formData.studentSurname}-{new Date().toISOString().split('T')[0]}.json</strong>
                </p>
                
                <div className="space-y-2">
                  <Button onClick={downloadFormData} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Dosyayı Tekrar İndir
                  </Button>
                  
                  <Button onClick={() => window.location.reload()} className="w-full">
                    Yeni Form Doldur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Spor Okulu Kayıt Formu</CardTitle>
            <CardDescription className="text-lg">
              Lütfen aşağıdaki formu eksiksiz doldurun. Form doldurulduktan sonra e-posta ile 
              spor okulu yönetimine gönderilecektir.
            </CardDescription>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedPhoto || ""} />
                    <AvatarFallback className="text-lg">
                      {formData.studentName && formData.studentSurname 
                        ? getInitials(formData.studentName, formData.studentSurname)
                        : <Camera className="w-8 h-8" />
                      }
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center">
                    <Label className="text-sm font-medium">Sporcu Fotoğrafı</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Kayıt sırasında sporcu fotoğrafı ekleyebilirsiniz (Opsiyonel)
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Fotoğraf Seç
                  </Button>
                  
                  {selectedPhoto && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removePhoto}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Kaldır
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                <p className="text-xs text-muted-foreground text-center">
                  Desteklenen formatlar: JPG, PNG, GIF (Maksimum 5MB)
                </p>
              </div>

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

              <div className="grid md:grid-cols-2 gap-4">
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

              {/* İkinci Veli Bilgileri */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">İkinci Veli Bilgileri (Opsiyonel)</h4>
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

                <div className="grid md:grid-cols-3 gap-4 mt-4">
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
                <Label htmlFor="specialDiet">Özel Diyet İhtiyacı</Label>
                <Textarea
                  id="specialDiet"
                  placeholder="Varsa özel diyet ihtiyaçlarını belirtin"
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
                <span>Sporcu Geçmişi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="previousSportsExperience">Daha Önce Spor Deneyimi Var mı?</Label>
                <Textarea
                  id="previousSportsExperience"
                  placeholder="Daha önce yaptığı sporlar, süre, seviye vb."
                  value={formData.previousSportsExperience}
                  onChange={(e) => handleInputChange("previousSportsExperience", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="previousClubs">Daha Önce Üye Olduğu Kulüpler</Label>
                <Textarea
                  id="previousClubs"
                  placeholder="Varsa daha önce üye olduğu kulüpler"
                  value={formData.previousClubs}
                  onChange={(e) => handleInputChange("previousClubs", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="achievements">Başarılar ve Ödüller</Label>
                <Textarea
                  id="achievements"
                  placeholder="Varsa sporda elde ettiği başarılar"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange("achievements", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="sportsGoals">Spordaki Hedefleri</Label>
                <Textarea
                  id="sportsGoals"
                  placeholder="Sporda ulaşmak istediği hedefler"
                  value={formData.sportsGoals}
                  onChange={(e) => handleInputChange("sportsGoals", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Diğer Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Diğer Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="howDidYouHear">Spor okulunu nasıl duydunuz?</Label>
                <Select value={formData.howDidYouHear} onValueChange={(value) => handleInputChange("howDidYouHear", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internet">İnternet</SelectItem>
                    <SelectItem value="sosyal-medya">Sosyal Medya</SelectItem>
                    <SelectItem value="arkadas-tavsiye">Arkadaş Tavsiyesi</SelectItem>
                    <SelectItem value="gazete-dergi">Gazete/Dergi</SelectItem>
                    <SelectItem value="okul">Okul</SelectItem>
                    <SelectItem value="diğer">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expectations">Spor okulundan beklentileriniz</Label>
                <Textarea
                  id="expectations"
                  placeholder="Spor okulundan beklentilerinizi belirtin"
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreement"
                  checked={formData.agreementAccepted}
                  onCheckedChange={(checked) => handleInputChange("agreementAccepted", checked)}
                />
                <Label htmlFor="agreement" className="text-sm leading-relaxed">
                  Spor okulu kurallarını ve şartlarını okudum, kabul ediyorum. *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dataProcessing"
                  checked={formData.dataProcessingAccepted}
                  onCheckedChange={(checked) => handleInputChange("dataProcessingAccepted", checked)}
                />
                <Label htmlFor="dataProcessing" className="text-sm leading-relaxed">
                  Kişisel verilerimin işlenmesine ve KVKK kapsamında kullanılmasına onay veriyorum. *
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
            <Button type="submit" disabled={loading} size="lg" className="w-full max-w-md">
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Form Gönderiliyor..." : "Formu Gönder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}