import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileText, 
  User, 
  Users, 
  MapPin, 
  Heart, 
  Trophy, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Download,
  Eye,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/router";

interface FormData {
  studentName: string;
  studentSurname: string;
  studentTcNo: string;
  studentBirthDate: string;
  studentAge?: string;
  studentGender: string;
  studentSchool: string;
  studentClass: string;
  selectedSports: string[];
  studentHeight: string;
  studentWeight: string;
  bloodType: string;
  dominantHand: string;
  dominantFoot: string;
  parentName: string;
  parentSurname: string;
  parentTcNo: string;
  parentPhone: string;
  parentEmail: string;
  parentRelation: string;
  parentOccupation: string;
  secondParentName: string;
  secondParentSurname: string;
  secondParentPhone: string;
  secondParentEmail: string;
  secondParentRelation: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  hasHealthIssues: string;
  healthIssuesDetail: string;
  medications: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  specialDiet: string;
  previousClubs: string;
  achievements: string;
  sportsGoals: string;
  previousSportsExperience: string;
  howDidYouHear: string;
  expectations: string;
  agreementAccepted: boolean;
  dataProcessingAccepted: boolean;
  photoVideoPermission: boolean;
  photo: string;
  submissionDate?: string;
  formVersion?: string;
}

export default function FormIntegration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError("Lütfen geçerli bir JSON dosyası seçin");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content) as FormData;
        
        // Validate required fields
        if (!parsedData.studentName || !parsedData.studentSurname || !parsedData.studentTcNo) {
          setError("Form dosyası eksik bilgiler içeriyor");
          return;
        }

        setFormData(parsedData);
        setShowPreview(true);
        setError("");
        toast.success("Form dosyası başarıyla yüklendi");
      } catch (err) {
        setError("Dosya formatı geçersiz. Lütfen geçerli bir JSON dosyası seçin.");
      }
    };
    reader.readAsText(file);
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

  const handleIntegrateForm = async () => {
    if (!formData) return;

    setLoading(true);
    try {
      // Calculate age from birth date
      const studentAge = calculateAge(formData.studentBirthDate);

      // Create student object
      const studentData = {
        id: Date.now().toString(),
        studentName: formData.studentName,
        studentSurname: formData.studentSurname,
        studentTcNo: formData.studentTcNo,
        studentBirthDate: formData.studentBirthDate,
        studentAge: studentAge,
        studentGender: formData.studentGender,
        studentSchool: formData.studentSchool,
        studentClass: formData.studentClass,
        licenseNumber: "", // Not in parent form
        sportsBranches: formData.selectedSports,
        
        // Physical info
        studentHeight: formData.studentHeight,
        studentWeight: formData.studentWeight,
        bloodType: formData.bloodType,
        dominantHand: formData.dominantHand,
        dominantFoot: formData.dominantFoot,
        sportsPosition: "", // Not in parent form
        
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
        motivation: "", // Not in parent form
        
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
        registrationDate: formData.submissionDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'parent-form'
      };

      // Check for duplicate TC numbers
      const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const duplicateStudent = existingStudents.find((student: any) => 
        student.studentTcNo === formData.studentTcNo
      );

      if (duplicateStudent) {
        setError(`Bu TC kimlik numarası ile kayıtlı bir sporcu zaten mevcut: ${duplicateStudent.studentName} ${duplicateStudent.studentSurname}`);
        setLoading(false);
        return;
      }

      // Save to localStorage
      existingStudents.push(studentData);
      localStorage.setItem('students', JSON.stringify(existingStudents));
      
      setSuccess(`${formData.studentName} ${formData.studentSurname} başarıyla sisteme eklendi!`);
      toast.success("Sporcu başarıyla sisteme entegre edildi!");
      
      // Reset form
      setFormData(null);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError("Entegrasyon sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
    
    setLoading(false);
  };

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  const resetForm = () => {
    setFormData(null);
    setShowPreview(false);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-primary flex items-center space-x-2">
                  <Upload className="w-6 h-6" />
                  <span>Veli Formları Entegrasyonu</span>
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Veliler tarafından doldurulan kayıt formlarını sisteme manuel olarak entegre edin
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/athletes')}
              >
                Sporcu Listesine Dön
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Nasıl Kullanılır?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Veli Formu Paylaşın</p>
                  <p className="text-sm text-muted-foreground">
                    <a 
                      href="/parent-registration-form" 
                      target="_blank" 
                      className="text-primary hover:underline"
                    >
                      Bu linki
                    </a> velilerle paylaşın. Veliler formu doldurduktan sonra bir JSON dosyası indirecekler.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Dosyayı Yükleyin</p>
                  <p className="text-sm text-muted-foreground">
                    Velilerden aldığınız JSON dosyasını aşağıdaki alana yükleyin.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Önizleme ve Entegrasyon</p>
                  <p className="text-sm text-muted-foreground">
                    Form bilgilerini kontrol edin ve sisteme entegre edin.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Form Dosyası Yükleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center space-y-4 p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <Label className="text-lg font-medium">JSON Form Dosyası Seçin</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Veliler tarafından indirilen .json uzantılı dosyayı seçin
                  </p>
                </div>
                
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Dosya Seç
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Preview */}
        {showPreview && formData && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Form Önizlemesi</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4 mr-2" />
                    İptal
                  </Button>
                  <Button onClick={handleIntegrateForm} disabled={loading}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading ? "Entegre Ediliyor..." : "Sisteme Entegre Et"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Student Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Öğrenci Bilgileri</span>
                    </h3>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={formData.photo || ""} />
                        <AvatarFallback className="text-lg">
                          {getInitials(formData.studentName, formData.studentSurname)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-lg">
                          {formData.studentName} {formData.studentSurname}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          TC: {formData.studentTcNo}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formData.studentBirthDate} ({calculateAge(formData.studentBirthDate)} yaş)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Cinsiyet:</span> {formData.studentGender}
                      </div>
                      <div>
                        <span className="font-medium">Sınıf:</span> {formData.studentClass || "Belirtilmemiş"}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Okul:</span> {formData.studentSchool || "Belirtilmemiş"}
                      </div>
                    </div>

                    {formData.selectedSports.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-sm">Spor Branşları:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.selectedSports.map((sport) => (
                            <Badge key={sport} variant="secondary" className="text-xs">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Physical Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Fiziksel Bilgiler</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Boy:</span> {formData.studentHeight || "Belirtilmemiş"} cm
                      </div>
                      <div>
                        <span className="font-medium">Kilo:</span> {formData.studentWeight || "Belirtilmemiş"} kg
                      </div>
                      <div>
                        <span className="font-medium">Kan Grubu:</span> {formData.bloodType || "Belirtilmemiş"}
                      </div>
                      <div>
                        <span className="font-medium">Dominant El:</span> {formData.dominantHand || "Belirtilmemiş"}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Health Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Sağlık Bilgileri</span>
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Sağlık Sorunu:</span> {formData.hasHealthIssues}
                      </div>
                      {formData.hasHealthIssues === "evet" && formData.healthIssuesDetail && (
                        <div>
                          <span className="font-medium">Detay:</span> {formData.healthIssuesDetail}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Acil Durum:</span> {formData.emergencyContactName} ({formData.emergencyContactPhone})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Parent Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Veli Bilgileri</span>
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">
                          {formData.parentName} {formData.parentSurname}
                        </p>
                        <p className="text-muted-foreground">
                          {formData.parentRelation} - TC: {formData.parentTcNo}
                        </p>
                        <p className="text-muted-foreground">
                          {formData.parentPhone} | {formData.parentEmail}
                        </p>
                        {formData.parentOccupation && (
                          <p className="text-muted-foreground">
                            Meslek: {formData.parentOccupation}
                          </p>
                        )}
                      </div>

                      {formData.secondParentName && (
                        <div className="pt-2 border-t">
                          <p className="font-medium">
                            {formData.secondParentName} {formData.secondParentSurname}
                          </p>
                          <p className="text-muted-foreground">
                            {formData.secondParentRelation}
                          </p>
                          <p className="text-muted-foreground">
                            {formData.secondParentPhone} | {formData.secondParentEmail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>İletişim Bilgileri</span>
                    </h3>
                    <div className="text-sm">
                      <p>{formData.address}</p>
                      <p>{formData.district} / {formData.city}</p>
                      {formData.postalCode && <p>Posta Kodu: {formData.postalCode}</p>}
                    </div>
                  </div>

                  <Separator />

                  {/* Sports Background */}
                  {(formData.previousSportsExperience || formData.previousClubs || formData.achievements) && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>Sporcu Geçmişi</span>
                      </h3>
                      <div className="space-y-2 text-sm">
                        {formData.previousSportsExperience && (
                          <div>
                            <span className="font-medium">Deneyim:</span>
                            <p className="text-muted-foreground">{formData.previousSportsExperience}</p>
                          </div>
                        )}
                        {formData.previousClubs && (
                          <div>
                            <span className="font-medium">Önceki Kulüpler:</span>
                            <p className="text-muted-foreground">{formData.previousClubs}</p>
                          </div>
                        )}
                        {formData.achievements && (
                          <div>
                            <span className="font-medium">Başarılar:</span>
                            <p className="text-muted-foreground">{formData.achievements}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Other Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Diğer Bilgiler</h3>
                    <div className="space-y-2 text-sm">
                      {formData.howDidYouHear && (
                        <div>
                          <span className="font-medium">Nasıl Duydu:</span> {formData.howDidYouHear}
                        </div>
                      )}
                      {formData.expectations && (
                        <div>
                          <span className="font-medium">Beklentiler:</span>
                          <p className="text-muted-foreground">{formData.expectations}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Form Tarihi:</span> {
                          formData.submissionDate 
                            ? new Date(formData.submissionDate).toLocaleDateString('tr-TR')
                            : "Belirtilmemiş"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}