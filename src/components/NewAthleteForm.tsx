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
import { User, Users, Phone, Mail, MapPin, Heart, Trophy, AlertTriangle, X, Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { validateTCKimlikNo, cleanTCKimlikNo } from "@/util/tcValidation";

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

interface NewAthleteFormProps {
  onClose: () => void;
}

export default function NewAthleteForm({ onClose }: NewAthleteFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      // Calculate age from birth date
      const studentAge = calculateAge(formData.studentBirthDate);

      // Create new student object
      const newStudent = {
        id: Date.now().toString(),
        studentName: formData.studentName,
        studentSurname: formData.studentSurname,
        studentTcNo: formData.studentTcNo,
        studentBirthDate: formData.studentBirthDate,
        studentAge: studentAge,
        studentGender: formData.studentGender,
        studentSchool: formData.studentSchool,
        studentClass: formData.studentClass,
        sportsBranches: formData.selectedSports,
        
        // Physical info
        studentHeight: formData.studentHeight,
        studentWeight: formData.studentWeight,
        bloodType: formData.bloodType,
        dominantHand: formData.dominantHand,
        dominantFoot: formData.dominantFoot,
        sportsPosition: formData.sportsPosition,
        
        // Parent info
        parentName: formData.parentName,
        parentSurname: formData.parentSurname,
        parentTcNo: formData.parentTcNo,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        parentRelation: formData.parentRelation,
        parentOccupation: formData.parentOccupation,
        
        // Second parent
        secondParentName: formData.secondParentName,
        secondParentSurname: formData.secondParentSurname,
        secondParentPhone: formData.secondParentPhone,
        secondParentEmail: formData.secondParentEmail,
        secondParentRelation: formData.secondParentRelation,
        
        // Contact info
        address: formData.address,
        city: formData.city,
        district: formData.district,
        postalCode: formData.postalCode,
        
        // Health info
        hasHealthIssues: formData.hasHealthIssues,
        healthIssuesDetail: formData.healthIssuesDetail,
        medications: formData.medications,
        allergies: formData.allergies,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
        specialDiet: formData.specialDiet,
        
        // Sports background
        previousClubs: formData.previousClubs,
        achievements: formData.achievements,
        sportsGoals: formData.sportsGoals,
        motivation: formData.motivation,
        
        // Other info
        howDidYouHear: formData.howDidYouHear,
        previousSportsExperience: formData.previousSportsExperience,
        expectations: formData.expectations,
        
        // Permissions
        photoVideoPermission: formData.photoVideoPermission,
        
        // Photo
        photo: formData.photo,
        
        // System fields
        status: 'Aktif',
        paymentStatus: 'Güncel',
        registrationDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
      };

      // Save to localStorage
      const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
      existingStudents.push(newStudent);
      localStorage.setItem('students', JSON.stringify(existingStudents));

      toast.success("Sporcu başarıyla kaydedildi!");
      
      // Trigger a page reload to refresh the athletes list
      window.location.reload();
      
      onClose();
    } catch (err) {
      setError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
    
    setLoading(false);
  };

  return (
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

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Kayıt yapılıyor..." : "Sporcu Kaydet"}
        </Button>
      </div>
    </form>
  );
}