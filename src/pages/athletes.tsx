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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Phone,
  Mail,
  UserCheck,
  Eye,
  UserPlus,
  ArrowLeft,
  CreditCard,
  Calculator,
  Calendar,
  TrendingUp,
  Minus,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  X,
  UserX,
  Key,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import NewAthleteForm from "@/components/NewAthleteForm";
import * as XLSX from 'xlsx';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const sports = [
  "Basketbol", "Hentbol", "Yüzme", "Akıl ve Zeka Oyunları", "Satranç", "Futbol", "Voleybol",
  "Tenis", "Badminton", "Masa Tenisi", "Atletizm", "Jimnastik", "Karate", "Taekwondo",
  "Judo", "Boks", "Güreş", "Halter", "Bisiklet", "Kayak", "Buz Pateni", "Eskrim"
];

// Edit Athlete Form Component
function EditAthleteForm({ athlete, onSave, onCancel }: { 
  athlete: any; 
  onSave: (athlete: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    // Sporcu Bilgileri
    studentName: athlete.studentName || '',
    studentSurname: athlete.studentSurname || '',
    studentTcNo: athlete.studentTcNo || '',
    studentBirthDate: athlete.studentBirthDate || '',
    studentAge: athlete.studentAge || '',
    studentGender: athlete.studentGender || '',
    studentSchool: athlete.studentSchool || '',
    studentClass: athlete.studentClass || '',
    sportsBranches: athlete.sportsBranches || [],
    
    // Fiziksel Bilgiler
    studentHeight: athlete.studentHeight || '',
    studentWeight: athlete.studentWeight || '',
    bloodType: athlete.bloodType || '',
    dominantHand: athlete.dominantHand || '',
    dominantFoot: athlete.dominantFoot || '',
    sportsPosition: athlete.sportsPosition || '',
    
    // Veli Bilgileri
    parentName: athlete.parentName || '',
    parentSurname: athlete.parentSurname || '',
    parentTcNo: athlete.parentTcNo || '',
    parentPhone: athlete.parentPhone || '',
    parentEmail: athlete.parentEmail || '',
    parentRelation: athlete.parentRelation || '',
    parentOccupation: athlete.parentOccupation || '',
    
    // İkinci Veli Bilgileri
    secondParentName: athlete.secondParentName || '',
    secondParentSurname: athlete.secondParentSurname || '',
    secondParentPhone: athlete.secondParentPhone || '',
    secondParentEmail: athlete.secondParentEmail || '',
    secondParentRelation: athlete.secondParentRelation || '',
    
    // İletişim Bilgileri
    address: athlete.address || '',
    city: athlete.city || '',
    district: athlete.district || '',
    postalCode: athlete.postalCode || '',
    
    // Sağlık Bilgileri
    hasHealthIssues: athlete.hasHealthIssues || 'Hayır',
    healthIssuesDetail: athlete.healthIssuesDetail || '',
    medications: athlete.medications || '',
    allergies: athlete.allergies || '',
    emergencyContactName: athlete.emergencyContactName || '',
    emergencyContactPhone: athlete.emergencyContactPhone || '',
    emergencyContactRelation: athlete.emergencyContactRelation || '',
    specialDiet: athlete.specialDiet || '',
    
    // Sporcu Geçmişi
    previousClubs: athlete.previousClubs || '',
    achievements: athlete.achievements || '',
    sportsGoals: athlete.sportsGoals || '',
    motivation: athlete.motivation || '',
    
    // Diğer Bilgiler
    howDidYouHear: athlete.howDidYouHear || '',
    previousSportsExperience: athlete.previousSportsExperience || '',
    expectations: athlete.expectations || '',
    
    // Onaylar
    agreementAccepted: athlete.agreementAccepted || false,
    dataProcessingAccepted: athlete.dataProcessingAccepted || false,
    photoVideoPermission: athlete.photoVideoPermission || false
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
    
    // Auto-calculate age when birth date changes
    if (field === 'studentBirthDate' && value) {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      setFormData(prev => ({ ...prev, studentAge: age.toString() }));
    }
  };

  const handleSportsBranchChange = (sport: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sportsBranches: checked 
        ? [...prev.sportsBranches, sport]
        : prev.sportsBranches.filter((s: string) => s !== sport)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Required fields validation
    if (!formData.studentName.trim()) newErrors.studentName = 'Öğrenci adı zorunludur';
    if (!formData.studentSurname.trim()) newErrors.studentSurname = 'Öğrenci soyadı zorunludur';
    if (!formData.studentTcNo.trim()) newErrors.studentTcNo = 'TC Kimlik No zorunludur';
    if (!formData.parentName.trim()) newErrors.parentName = 'Veli adı zorunludur';
    if (!formData.parentSurname.trim()) newErrors.parentSurname = 'Veli soyadı zorunludur';
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Veli telefonu zorunludur';
    if (!formData.parentEmail.trim()) newErrors.parentEmail = 'Veli email zorunludur';

    // TC No validation
    if (formData.studentTcNo && formData.studentTcNo.replace(/\D/g, '').length !== 11) {
      newErrors.studentTcNo = 'TC Kimlik No 11 haneli olmalıdır';
    }
    if (formData.parentTcNo && formData.parentTcNo.replace(/\D/g, '').length !== 11) {
      newErrors.parentTcNo = 'Veli TC Kimlik No 11 haneli olmalıdır';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.parentEmail && !emailRegex.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Geçerli bir email adresi girin';
    }
    if (formData.secondParentEmail && !emailRegex.test(formData.secondParentEmail)) {
      newErrors.secondParentEmail = 'Geçerli bir email adresi girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const updatedAthlete = {
      ...athlete,
      ...formData,
      studentTcNo: formData.studentTcNo.replace(/\D/g, ''),
      parentTcNo: formData.parentTcNo.replace(/\D/g, ''),
      sportsBranches: formData.sportsBranches, // Ensure sports branches are saved
      selectedSports: formData.sportsBranches, // Also save as selectedSports for compatibility
      updatedAt: new Date().toISOString()
    };

    onSave(updatedAthlete);
  };

  return (
    <div className="space-y-6">
      {/* Sporcu Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sporcu Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Öğrenci Adı *</Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className={errors.studentName ? 'border-red-500' : ''}
              />
              {errors.studentName && <p className="text-sm text-red-500">{errors.studentName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentSurname">Öğrenci Soyadı *</Label>
              <Input
                id="studentSurname"
                value={formData.studentSurname}
                onChange={(e) => handleInputChange('studentSurname', e.target.value)}
                className={errors.studentSurname ? 'border-red-500' : ''}
              />
              {errors.studentSurname && <p className="text-sm text-red-500">{errors.studentSurname}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentTcNo">TC Kimlik No *</Label>
              <Input
                id="studentTcNo"
                value={formData.studentTcNo}
                onChange={(e) => handleInputChange('studentTcNo', e.target.value)}
                maxLength={11}
                className={errors.studentTcNo ? 'border-red-500' : ''}
              />
              {errors.studentTcNo && <p className="text-sm text-red-500">{errors.studentTcNo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentBirthDate">Doğum Tarihi</Label>
              <Input
                id="studentBirthDate"
                type="date"
                value={formData.studentBirthDate}
                onChange={(e) => handleInputChange('studentBirthDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentAge">Yaş</Label>
              <Input
                id="studentAge"
                value={formData.studentAge}
                onChange={(e) => handleInputChange('studentAge', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentGender">Cinsiyet</Label>
              <Select value={formData.studentGender} onValueChange={(value) => handleInputChange('studentGender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Cinsiyet seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Erkek">Erkek</SelectItem>
                  <SelectItem value="Kız">Kız</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentSchool">Okul</Label>
              <Input
                id="studentSchool"
                value={formData.studentSchool}
                onChange={(e) => handleInputChange('studentSchool', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentClass">Sınıf</Label>
              <Input
                id="studentClass"
                value={formData.studentClass}
                onChange={(e) => handleInputChange('studentClass', e.target.value)}
              />
            </div>
          </div>

          {/* Spor Branşları */}
          <div className="space-y-2 mt-4">
            <Label>Spor Branşları</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {sports.map((sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`sport-${sport}`}
                    checked={formData.sportsBranches.includes(sport)}
                    onChange={(e) => handleSportsBranchChange(sport, e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor={`sport-${sport}`} className="text-sm">{sport}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fiziksel Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fiziksel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentHeight">Boy (cm)</Label>
              <Input
                id="studentHeight"
                type="number"
                value={formData.studentHeight}
                onChange={(e) => handleInputChange('studentHeight', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentWeight">Kilo (kg)</Label>
              <Input
                id="studentWeight"
                type="number"
                value={formData.studentWeight}
                onChange={(e) => handleInputChange('studentWeight', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Kan Grubu</Label>
              <Select value={formData.bloodType} onValueChange={(value) => handleInputChange('bloodType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kan grubu seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Rh+">A Rh+</SelectItem>
                  <SelectItem value="A Rh-">A Rh-</SelectItem>
                  <SelectItem value="B Rh+">B Rh+</SelectItem>
                  <SelectItem value="B Rh-">B Rh-</SelectItem>
                  <SelectItem value="AB Rh+">AB Rh+</SelectItem>
                  <SelectItem value="AB Rh-">AB Rh-</SelectItem>
                  <SelectItem value="0 Rh+">0 Rh+</SelectItem>
                  <SelectItem value="0 Rh-">0 Rh-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veli Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Veli Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">Veli Adı *</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => handleInputChange('parentName', e.target.value)}
                className={errors.parentName ? 'border-red-500' : ''}
              />
              {errors.parentName && <p className="text-sm text-red-500">{errors.parentName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentSurname">Veli Soyadı *</Label>
              <Input
                id="parentSurname"
                value={formData.parentSurname}
                onChange={(e) => handleInputChange('parentSurname', e.target.value)}
                className={errors.parentSurname ? 'border-red-500' : ''}
              />
              {errors.parentSurname && <p className="text-sm text-red-500">{errors.parentSurname}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentTcNo">Veli TC Kimlik No</Label>
              <Input
                id="parentTcNo"
                value={formData.parentTcNo}
                onChange={(e) => handleInputChange('parentTcNo', e.target.value)}
                maxLength={11}
                className={errors.parentTcNo ? 'border-red-500' : ''}
              />
              {errors.parentTcNo && <p className="text-sm text-red-500">{errors.parentTcNo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentPhone">Veli Telefon *</Label>
              <Input
                id="parentPhone"
                value={formData.parentPhone}
                onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                className={errors.parentPhone ? 'border-red-500' : ''}
              />
              {errors.parentPhone && <p className="text-sm text-red-500">{errors.parentPhone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail">Veli Email *</Label>
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                className={errors.parentEmail ? 'border-red-500' : ''}
              />
              {errors.parentEmail && <p className="text-sm text-red-500">{errors.parentEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentRelation">Yakınlık Derecesi</Label>
              <Select value={formData.parentRelation} onValueChange={(value) => handleInputChange('parentRelation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Yakınlık seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anne">Anne</SelectItem>
                  <SelectItem value="Baba">Baba</SelectItem>
                  <SelectItem value="Büyükanne">Büyükanne</SelectItem>
                  <SelectItem value="Büyükbaba">Büyükbaba</SelectItem>
                  <SelectItem value="Teyze">Teyze</SelectItem>
                  <SelectItem value="Amca">Amca</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İletişim Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">İl</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">İlçe</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sağlık Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sağlık Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sağlık Sorunu Var mı?</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="health-yes"
                    name="hasHealthIssues"
                    value="Evet"
                    checked={formData.hasHealthIssues === 'Evet'}
                    onChange={(e) => handleInputChange('hasHealthIssues', e.target.value)}
                  />
                  <Label htmlFor="health-yes">Evet</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="health-no"
                    name="hasHealthIssues"
                    value="Hayır"
                    checked={formData.hasHealthIssues === 'Hayır'}
                    onChange={(e) => handleInputChange('hasHealthIssues', e.target.value)}
                  />
                  <Label htmlFor="health-no">Hayır</Label>
                </div>
              </div>
            </div>

            {formData.hasHealthIssues === 'Evet' && (
              <div className="space-y-2">
                <Label htmlFor="healthIssuesDetail">Sağlık Sorunu Detayı</Label>
                <Textarea
                  id="healthIssuesDetail"
                  value={formData.healthIssuesDetail}
                  onChange={(e) => handleInputChange('healthIssuesDetail', e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medications">Kullandığı İlaçlar</Label>
                <Textarea
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Alerjileri</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Acil Durum İletişim Adı</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Acil Durum Telefon</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">Yakınlık</Label>
                <Input
                  id="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button onClick={handleSubmit}>
          <Edit className="h-4 w-4 mr-2" />
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  );
}

export default function Athletes() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isBulkFeeDialogOpen, setIsBulkFeeDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [accountEntries, setAccountEntries] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkFeeFile, setBulkFeeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAthleteForStatus, setSelectedAthleteForStatus] = useState<any>(null);
  const [isParentAccountDialogOpen, setIsParentAccountDialogOpen] = useState(false);
  const [parentAccountsToCreate, setParentAccountsToCreate] = useState<any[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAthleteForView, setSelectedAthleteForView] = useState<any>(null);
  const [selectedAthleteForEdit, setSelectedAthleteForEdit] = useState<any>(null);
  const [selectedAthleteForDelete, setSelectedAthleteForDelete] = useState<any>(null);
  const [newEntry, setNewEntry] = useState({
    month: new Date().toISOString().slice(0, 7),
    description: '',
    amountExcludingVat: '',
    vatRate: '20',
    amountIncludingVat: '',
    unitCode: 'Ay',
    type: 'debit' // debit (borç) or credit (alacak)
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const user = localStorage.getItem("currentUser");
    
    if (!role || (role !== "admin" && role !== "coach")) {
      router.push("/login");
      return;
    }

    setUserRole(role);
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    loadAthletes(role, user ? JSON.parse(user) : null);
  }, [router]);

  const loadAthletes = (role: string, user: any) => {
    // Load students from localStorage
    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    let studentsToShow = allStudents;
    
    // If user is a coach, filter students based on their training groups and sports branches
    if (role === 'coach' && user) {
      studentsToShow = allStudents.filter((student: any) => {
        // Check if student is in any of the coach's training groups
        const isInTrainingGroup = user.trainingGroups?.some((group: string) => 
          student.trainingGroups?.includes(group)
        );
        
        // Check if student plays any of the coach's sports branches
        const isInSportsBranch = user.sportsBranches?.some((branch: string) => 
          student.sportsBranches?.includes(branch)
        );
        
        return isInTrainingGroup || isInSportsBranch;
      });
    }
    
    setAthletes(studentsToShow);
    setFilteredAthletes(studentsToShow);
  };

  useEffect(() => {
    const filtered = athletes.filter(athlete => {
      const matchesSearch = athlete.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           athlete.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = selectedSport === "all" || athlete.sportsBranches?.includes(selectedSport);
      const matchesStatus = selectedStatus === "all" || athlete.status === selectedStatus;
      
      return matchesSearch && matchesSport && matchesStatus;
    });
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedSport, selectedStatus, athletes]);

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  const activeAthletes = athletes.filter(a => a.status === 'Aktif').length;
  const thisMonthRegistrations = athletes.filter(a => {
    const regDate = new Date(a.registrationDate || a.createdAt);
    const thisMonth = new Date();
    return regDate.getMonth() === thisMonth.getMonth() && regDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  const loadAccountEntries = (athleteId: string) => {
    const entries = JSON.parse(localStorage.getItem(`account_${athleteId}`) || '[]');
    setAccountEntries(entries);
  };

  const saveAccountEntry = () => {
    if (!selectedAthlete || !newEntry.description || !newEntry.amountExcludingVat) {
      return;
    }

    const amountExcluding = parseFloat(newEntry.amountExcludingVat);
    const vatRate = parseFloat(newEntry.vatRate);
    const vatAmount = (amountExcluding * vatRate) / 100;
    const amountIncluding = amountExcluding + vatAmount;

    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      month: newEntry.month,
      description: newEntry.description,
      amountExcludingVat: amountExcluding,
      vatRate: vatRate,
      vatAmount: vatAmount,
      amountIncludingVat: amountIncluding,
      unitCode: newEntry.unitCode,
      type: newEntry.type
    };

    const updatedEntries = [...accountEntries, entry];
    setAccountEntries(updatedEntries);
    localStorage.setItem(`account_${selectedAthlete.id}`, JSON.stringify(updatedEntries));

    // Reset form
    setNewEntry({
      month: new Date().toISOString().slice(0, 7),
      description: '',
      amountExcludingVat: '',
      vatRate: '20',
      amountIncludingVat: '',
      unitCode: 'Ay',
      type: 'debit'
    });
  };

  const openAccountDialog = (athlete: any) => {
    setSelectedAthlete(athlete);
    loadAccountEntries(athlete.id);
    setIsAccountDialogOpen(true);
  };

  const calculateVatAmount = (excludingVat: string, vatRate: string) => {
    const excluding = parseFloat(excludingVat) || 0;
    const rate = parseFloat(vatRate) || 0;
    const vatAmount = (excluding * rate) / 100;
    const including = excluding + vatAmount;
    
    setNewEntry(prev => ({
      ...prev,
      amountExcludingVat: excludingVat,
      vatRate: vatRate,
      amountIncludingVat: including.toFixed(2)
    }));
  };

  const getTotalBalance = () => {
    return accountEntries.reduce((total, entry) => {
      return entry.type === 'debit' 
        ? total + entry.amountIncludingVat 
        : total - entry.amountIncludingVat;
    }, 0);
  };

  // Export active athletes function
  const exportActiveAthletes = () => {
    const activeAthletes = athletes.filter(athlete => athlete.status === 'Aktif' || !athlete.status);
    
    if (activeAthletes.length === 0) {
      alert('Dışa aktarılacak aktif sporcu bulunamadı!');
      return;
    }

    const exportData = activeAthletes.map((athlete, index) => ({
      'Sıra No': index + 1,
      'Sporcu Adı': athlete.studentName || '',
      'Sporcu Soyadı': athlete.studentSurname || '',
      'TC Kimlik No': athlete.studentTcNo || '',
      'Doğum Tarihi': athlete.studentBirthDate || '',
      'Yaş': athlete.studentAge || '',
      'Cinsiyet': athlete.studentGender || '',
      'Okul': athlete.studentSchool || '',
      'Sınıf': athlete.studentClass || '',
      'Spor Branşları': athlete.sportsBranches?.join(', ') || '',
      'Boy (cm)': athlete.studentHeight || '',
      'Kilo (kg)': athlete.studentWeight || '',
      'Kan Grubu': athlete.bloodType || '',
      'Veli Adı': athlete.parentName || '',
      'Veli Soyadı': athlete.parentSurname || '',
      'Veli TC': athlete.parentTcNo || '',
      'Veli Telefon': athlete.parentPhone || '',
      'Veli Email': athlete.parentEmail || '',
      'Yakınlık': athlete.parentRelation || '',
      'Adres': athlete.address || '',
      'İl': athlete.city || '',
      'İlçe': athlete.district || '',
      'Kayıt Tarihi': athlete.registrationDate ? new Date(athlete.registrationDate).toLocaleDateString('tr-TR') : '',
      'Durum': athlete.status || 'Aktif'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aktif Sporcular');
    
    // Set column widths
    const colWidths = Object.keys(exportData[0]).map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
    const fileName = `Aktif_Sporcular_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert(`${activeAthletes.length} aktif sporcu Excel dosyasına aktarıldı! (${fileName})`);
  };

  // Generate bulk fee template
  const generateBulkFeeTemplate = () => {
    const activeAthletes = athletes.filter(athlete => athlete.status === 'Aktif' || !athlete.status);
    
    if (activeAthletes.length === 0) {
      alert('Şablon oluşturulacak aktif sporcu bulunamadı!');
      return;
    }

    const templateData = activeAthletes.map(athlete => ({
      'Sporcu Adı Soyadı': `${athlete.studentName || ''} ${athlete.studentSurname || ''}`.trim(),
      'Açıklama': '',
      'Tutar': '',
      'KDV Oranı (%)': '10',
      'Toplam': '',
      'Birim Kod': 'Ay'
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Toplu Aidat Şablonu');
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // Sporcu Adı Soyadı
      { wch: 30 }, // Açıklama
      { wch: 12 }, // Tutar
      { wch: 15 }, // KDV Oranı
      { wch: 12 }, // Toplam
      { wch: 12 }  // Birim Kod
    ];
    ws['!cols'] = colWidths;
    
    // Add formulas for automatic total calculation
    for (let row = 1; row <= activeAthletes.length; row++) {
      const totalCell = XLSX.utils.encode_cell({ r: row, c: 4 }); // Toplam column
      ws[totalCell] = {
        f: `C${row + 1}*(1+D${row + 1}/100)`,
        t: 'n'
      };
    }
    
    const fileName = `Toplu_Aidat_Sablonu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert(`${activeAthletes.length} sporcu için toplu aidat şablonu oluşturuldu! (${fileName})\n\nŞablonu doldurup tekrar yükleyebilirsiniz.`);
  };

  // Handle bulk fee file upload
  const handleBulkFeeFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        alert("Lütfen Excel dosyası (.xlsx veya .xls) seçin");
        return;
      }
      setBulkFeeFile(file);
    }
  };

  // Process bulk fee file
  const processBulkFeeFile = async () => {
    if (!bulkFeeFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const data = await bulkFeeFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let processedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        setUploadProgress(((i + 1) / jsonData.length) * 100);

        try {
          const athleteName = row['Sporcu Adı Soyadı']?.toString().trim();
          const description = row['Açıklama']?.toString().trim();
          const amount = parseFloat(row['Tutar']?.toString().replace(',', '.') || '0');
          const vatRate = parseFloat(row['KDV Oranı (%)']?.toString() || '10');
          const unitCode = row['Birim Kod']?.toString().trim() || 'Ay';

          if (!athleteName || !description || !amount) {
            errors.push(`Satır ${i + 2}: Sporcu adı, açıklama veya tutar eksik`);
            errorCount++;
            continue;
          }

          // Find athlete by name
          const athlete = athletes.find(a => {
            const fullName = `${a.studentName || ''} ${a.studentSurname || ''}`.trim();
            return fullName.toLowerCase() === athleteName.toLowerCase();
          });

          if (!athlete) {
            errors.push(`Satır ${i + 2}: "${athleteName}" adlı sporcu bulunamadı`);
            errorCount++;
            continue;
          }

          // Calculate VAT and total
          const vatAmount = (amount * vatRate) / 100;
          const totalAmount = amount + vatAmount;

          // Create account entry
          const entry = {
            id: Date.now() + Math.random(),
            date: new Date().toISOString(),
            month: new Date().toISOString().slice(0, 7),
            description: description,
            amountExcludingVat: amount,
            vatRate: vatRate,
            vatAmount: vatAmount,
            amountIncludingVat: totalAmount,
            unitCode: unitCode,
            type: 'debit'
          };

          // Add to athlete's account
          const existingEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
          existingEntries.push(entry);
          localStorage.setItem(`account_${athlete.id}`, JSON.stringify(existingEntries));

          processedCount++;
        } catch (error) {
          errors.push(`Satır ${i + 2}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          errorCount++;
        }
      }

      if (errors.length > 0) {
        const errorMessage = errors.slice(0, 10).join('\n') + (errors.length > 10 ? `\n... ve ${errors.length - 10} hata daha` : '');
        alert(`Toplu aidat girişi tamamlandı!\n\n✅ Başarılı: ${processedCount} kayıt\n❌ Hatalı: ${errorCount} kayıt\n\nHatalar:\n${errorMessage}`);
      } else {
        alert(`Toplu aidat girişi başarıyla tamamlandı!\n${processedCount} sporcu için aidat kaydı eklendi.`);
      }

      setBulkFeeFile(null);
      setIsBulkFeeDialogOpen(false);
      
    } catch (error) {
      alert('Excel dosyası işlenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Bulk Upload Functions
  const generateBulkUploadTemplate = () => {
    const templateData = [
      {
        'Öğrenci Adı': '',
        'Öğrenci Soyadı': '',
        'TC Kimlik No': '',
        'Doğum Tarihi (DD/MM/YYYY)': '',
        'Veli Adı': '',
        'Veli Soyadı': '',
        'Veli TC Kimlik No': '',
        'Veli Telefon': '',
        'Veli Email': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sporcu Toplu Yükleme Şablonu');
    
    // Set column widths
    const colWidths = Object.keys(templateData[0]).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, 'Sporcu_Toplu_Yukleme_Sablonu.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadErrors([]);
      setUploadResults([]);
    }
  };

  const processExcelFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setUploadErrors([]);
    setUploadResults([]);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const results: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        setUploadProgress(((i + 1) / jsonData.length) * 100);

        try {
          // Validate required fields
          if (!row['Öğrenci Adı'] || !row['Öğrenci Soyadı'] || !row['TC Kimlik No'] || 
              !row['Veli Adı'] || !row['Veli Soyadı'] || !row['Veli Telefon'] || !row['Veli Email']) {
            errors.push(`Satır ${i + 2}: Zorunlu alanlar eksik`);
            continue;
          }

          // Validate TC numbers
          const studentTc = row['TC Kimlik No']?.toString().replace(/\D/g, '');
          const parentTc = row['Veli TC Kimlik No']?.toString().replace(/\D/g, '');
          
          if (studentTc?.length !== 11) {
            errors.push(`Satır ${i + 2}: Öğrenci TC Kimlik numarası 11 haneli olmalıdır`);
            continue;
          }
          
          if (parentTc && parentTc.length !== 11) {
            errors.push(`Satır ${i + 2}: Veli TC Kimlik numarası 11 haneli olmalıdır`);
            continue;
          }

          // Parse birth date
          let birthDate = '';
          if (row['Doğum Tarihi (DD/MM/YYYY)']) {
            const dateStr = row['Doğum Tarihi (DD/MM/YYYY)'].toString();
            const dateParts = dateStr.split('/');
            if (dateParts.length === 3) {
              birthDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            }
          }

          // Calculate age
          let age = '';
          if (birthDate) {
            const today = new Date();
            const birth = new Date(birthDate);
            age = (today.getFullYear() - birth.getFullYear()).toString();
          }

          const athleteData = {
            id: Date.now() + i,
            // Öğrenci Bilgileri
            studentName: row['Öğrenci Adı'],
            studentSurname: row['Öğrenci Soyadı'],
            studentTcNo: studentTc,
            studentBirthDate: birthDate,
            studentAge: age,
            studentGender: '',
            studentSchool: '',
            studentClass: '',
            sportsBranches: [],
            selectedSports: [],
            
            // Fiziksel Bilgiler
            studentHeight: '',
            studentWeight: '',
            bloodType: '',
            dominantHand: '',
            dominantFoot: '',
            sportsPosition: '',
            
            // Veli Bilgileri
            parentName: row['Veli Adı'],
            parentSurname: row['Veli Soyadı'],
            parentTcNo: parentTc || '',
            parentPhone: row['Veli Telefon'],
            parentEmail: row['Veli Email'],
            parentRelation: '',
            parentOccupation: '',
            
            // İkinci Veli Bilgileri
            secondParentName: '',
            secondParentSurname: '',
            secondParentPhone: '',
            secondParentEmail: '',
            secondParentRelation: '',
            
            // İletişim Bilgileri
            address: '',
            city: '',
            district: '',
            postalCode: '',
            
            // Sağlık Bilgileri
            hasHealthIssues: 'Hayır',
            healthIssuesDetail: '',
            medications: '',
            allergies: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelation: '',
            specialDiet: '',
            
            // Sporcu Geçmişi
            previousClubs: '',
            achievements: '',
            sportsGoals: '',
            motivation: '',
            
            // Diğer Bilgiler
            howDidYouHear: '',
            previousSportsExperience: '',
            expectations: '',
            
            // Sistem Bilgileri
            status: 'Aktif',
            paymentStatus: 'Güncel',
            registrationDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            
            // Onaylar (default values for bulk upload)
            agreementAccepted: true,
            dataProcessingAccepted: true,
            photoVideoPermission: false
          };

          results.push(athleteData);
        } catch (error) {
          errors.push(`Satır ${i + 2}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
      }

      setUploadResults(results);
      setUploadErrors(errors);
      
    } catch (error) {
      setUploadErrors(['Excel dosyası işlenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')]);
    } finally {
      setIsProcessing(false);
      setUploadProgress(100);
    }
  };

  const confirmBulkUpload = () => {
    if (uploadResults.length === 0) return;

    // Get existing students
    const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Check for duplicates and merge
    const mergedStudents = [...existingStudents];
    let addedCount = 0;
    let mergedCount = 0;
    
    uploadResults.forEach(newStudent => {
      // Check for duplicate by TC number or name
      const existingIndex = mergedStudents.findIndex(existing => 
        existing.studentTcNo === newStudent.studentTcNo ||
        (existing.studentName === newStudent.studentName && 
         existing.studentSurname === newStudent.studentSurname)
      );
      
      if (existingIndex >= 0) {
        // Merge with existing student (update with new data)
        mergedStudents[existingIndex] = {
          ...mergedStudents[existingIndex],
          ...newStudent,
          id: mergedStudents[existingIndex].id, // Keep original ID
          updatedAt: new Date().toISOString()
        };
        mergedCount++;
      } else {
        // Add as new student
        mergedStudents.push(newStudent);
        addedCount++;
      }
    });
    
    localStorage.setItem('students', JSON.stringify(mergedStudents));
    
    // Check for parent accounts that need to be created
    const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    const accountsToCreate: any[] = [];
    
    uploadResults.forEach(athlete => {
      // Check if parent account already exists
      const existingParent = parentUsers.find((parent: any) => 
        parent.email === athlete.parentEmail || 
        (parent.phone && parent.phone === athlete.parentPhone)
      );
      
      if (!existingParent) {
        accountsToCreate.push({
          athleteId: athlete.id,
          athleteName: `${athlete.studentName} ${athlete.studentSurname}`,
          parentName: athlete.parentName,
          parentSurname: athlete.parentSurname,
          parentEmail: athlete.parentEmail,
          parentPhone: athlete.parentPhone,
          parentTcNo: athlete.parentTcNo || '',
          parentRelation: athlete.parentRelation || ''
        });
      }
    });
    
    // If there are parent accounts to create, show the dialog
    if (accountsToCreate.length > 0) {
      setParentAccountsToCreate(accountsToCreate);
      setIsParentAccountDialogOpen(true);
    }
    
    // Reload athletes
    loadAthletes(userRole!, currentUser);
    
    // Reset upload state
    setUploadedFile(null);
    setUploadResults([]);
    setUploadErrors([]);
    setUploadProgress(0);
    setIsBulkUploadDialogOpen(false);
    
    // Show success message
    alert(`Toplu yükleme tamamlandı!\n\n✅ Yeni eklenen: ${addedCount} sporcu\n🔄 Güncellenen: ${mergedCount} sporcu\n\n${accountsToCreate.length > 0 ? `${accountsToCreate.length} veli için hesap oluşturma gerekiyor.` : 'Tüm işlemler tamamlandı.'}`);
  };

  // Status change functions
  const openStatusDialog = (athlete: any) => {
    setSelectedAthleteForStatus(athlete);
    setIsStatusDialogOpen(true);
  };

  const changeAthleteStatus = (newStatus: string) => {
    if (!selectedAthleteForStatus) return;

    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedStudents = allStudents.map((student: any) => 
      student.id === selectedAthleteForStatus.id 
        ? { ...student, status: newStatus, statusChangedAt: new Date().toISOString() }
        : student
    );
    
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    loadAthletes(userRole!, currentUser);
    setIsStatusDialogOpen(false);
    setSelectedAthleteForStatus(null);
  };

  // Parent account creation functions
  const generateParentCredentials = (parentName: string, parentSurname: string, parentEmail: string) => {
    // Generate username from name and surname
    const baseUsername = `${parentName.toLowerCase()}${parentSurname.toLowerCase()}`.replace(/[^a-z]/g, '');
    
    // Generate a simple password (in real app, this should be more secure)
    const password = `${baseUsername}123`;
    
    return {
      username: baseUsername,
      password: password
    };
  };

  const createParentAccounts = () => {
    const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]');
    const newParentAccounts: any[] = [];
    
    parentAccountsToCreate.forEach(accountData => {
      const credentials = generateParentCredentials(
        accountData.parentName, 
        accountData.parentSurname, 
        accountData.parentEmail
      );
      
      const newParentUser = {
        id: Date.now() + Math.random(),
        firstName: accountData.parentName,
        lastName: accountData.parentSurname,
        email: accountData.parentEmail,
        phone: accountData.parentPhone,
        tcNo: accountData.parentTcNo,
        relation: accountData.parentRelation,
        username: credentials.username,
        password: credentials.password,
        role: 'parent',
        createdAt: new Date().toISOString(),
        isActive: true,
        createdBy: 'bulk_upload',
        linkedAthletes: [accountData.athleteId]
      };
      
      parentUsers.push(newParentUser);
      newParentAccounts.push({
        ...newParentUser,
        athleteName: accountData.athleteName
      });
    });
    
    localStorage.setItem('parentUsers', JSON.stringify(parentUsers));
    
    // Show success message with credentials
    const credentialsText = newParentAccounts.map(account => 
      `${account.firstName} ${account.lastName} (${account.athleteName}): Kullanıcı Adı: ${account.username}, Şifre: ${account.password}`
    ).join('\n');
    
    alert(`${newParentAccounts.length} veli hesabı oluşturuldu!\n\nGiriş Bilgileri:\n${credentialsText}\n\nBu bilgileri velilere iletin.`);
    
    setIsParentAccountDialogOpen(false);
    setParentAccountsToCreate([]);
  };

  // Action button functions
  const openViewDialog = (athlete: any) => {
    setSelectedAthleteForView(athlete);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (athlete: any) => {
    setSelectedAthleteForEdit(athlete);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (athlete: any) => {
    setSelectedAthleteForDelete(athlete);
    setIsDeleteDialogOpen(true);
  };

  const deleteAthlete = () => {
    if (!selectedAthleteForDelete) return;

    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedStudents = allStudents.filter((student: any) => 
      student.id !== selectedAthleteForDelete.id
    );
    
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    
    // Also remove account entries
    localStorage.removeItem(`account_${selectedAthleteForDelete.id}`);
    
    loadAthletes(userRole!, currentUser);
    setIsDeleteDialogOpen(false);
    setSelectedAthleteForDelete(null);
    
    alert(`${selectedAthleteForDelete.studentName} ${selectedAthleteForDelete.studentSurname} adlı sporcu başarıyla silindi.`);
  };

  return (
    <>
      <Head>
        <title>Sporcular - SportsCRM</title>
        <meta name="description" content="Sporcu yönetimi" />
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
                <Link href={userRole === 'coach' ? '/coach-dashboard' : '/dashboard'} className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">
                  {userRole === 'coach' ? 'Sporcularım' : 'Sporcular'}
                </h1>
              </div>
              <p className="text-muted-foreground">
                {userRole === 'coach' 
                  ? 'Antrenman gruplarınızdaki sporcuları görüntüleyin' 
                  : 'Sporcu kayıtlarını yönetin'
                }
              </p>
            </div>
            
            {userRole === 'admin' && (
              <div className="flex space-x-2">
                <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Toplu Yükleme
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        <span>Sporcu Toplu Yükleme</span>
                      </DialogTitle>
                      <DialogDescription>
                        Excel dosyası ile birden fazla sporcu kaydını sisteme toplu olarak ekleyin
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Template Download */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">1. Şablon İndir</CardTitle>
                          <CardDescription>
                            Önce Excel şablonunu indirin ve sporcu bilgilerini doldurun
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button onClick={generateBulkUploadTemplate} variant="outline" className="w-full">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Excel Şablonunu İndir
                          </Button>
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Şablon Bilgileri:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Kayıt formundaki tüm alanları içerir</li>
                              <li>• Zorunlu alanlar: Öğrenci Adı, Soyadı, TC No, Veli Adı, Soyadı, Telefon, Email</li>
                              <li>• TC Kimlik numaraları 11 haneli olmalıdır</li>
                              <li>• Spor branşları virgülle ayrılmalıdır (örn: Basketbol, Futbol)</li>
                              <li>• Tarih formatı: DD/MM/YYYY</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      {/* File Upload */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">2. Dosya Yükle</CardTitle>
                          <CardDescription>
                            Doldurduğunuz Excel dosyasını seçin
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="bulk-upload-file"
                              />
                              <label htmlFor="bulk-upload-file" className="cursor-pointer">
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                  Excel dosyasını seçin
                                </p>
                                <p className="text-sm text-gray-500">
                                  .xlsx veya .xls formatında olmalıdır
                                </p>
                              </label>
                            </div>

                            {uploadedFile && (
                              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                  <span className="text-sm font-medium text-green-900">
                                    {uploadedFile.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUploadedFile(null);
                                    setUploadResults([]);
                                    setUploadErrors([]);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {uploadedFile && (
                              <Button 
                                onClick={processExcelFile} 
                                disabled={isProcessing}
                                className="w-full"
                              >
                                {isProcessing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    İşleniyor...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Dosyayı İşle
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Progress */}
                      {isProcessing && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>İşleniyor...</span>
                                <span>{Math.round(uploadProgress)}%</span>
                              </div>
                              <Progress value={uploadProgress} className="w-full" />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Results */}
                      {(uploadResults.length > 0 || uploadErrors.length > 0) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">3. Sonuçlar</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {uploadResults.length > 0 && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium text-green-900">
                                      {uploadResults.length} sporcu başarıyla işlendi
                                    </span>
                                  </div>
                                  <div className="max-h-32 overflow-y-auto">
                                    {uploadResults.slice(0, 5).map((result, index) => (
                                      <div key={index} className="text-sm text-green-800">
                                        • {result.studentName} {result.studentSurname}
                                      </div>
                                    ))}
                                    {uploadResults.length > 5 && (
                                      <div className="text-sm text-green-700 mt-1">
                                        ... ve {uploadResults.length - 5} sporcu daha
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {uploadErrors.length > 0 && (
                                <div className="p-4 bg-red-50 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <span className="font-medium text-red-900">
                                      {uploadErrors.length} hata bulundu
                                    </span>
                                  </div>
                                  <div className="max-h-32 overflow-y-auto space-y-1">
                                    {uploadErrors.map((error, index) => (
                                      <div key={index} className="text-sm text-red-800">
                                        • {error}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {uploadResults.length > 0 && (
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setUploadedFile(null);
                                      setUploadResults([]);
                                      setUploadErrors([]);
                                      setUploadProgress(0);
                                    }}
                                  >
                                    Temizle
                                  </Button>
                                  <Button onClick={confirmBulkUpload}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {uploadResults.length} Sporcuyu Sisteme Ekle
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsBulkUploadDialogOpen(false);
                          setUploadedFile(null);
                          setUploadResults([]);
                          setUploadErrors([]);
                          setUploadProgress(0);
                        }}
                      >
                        Kapat
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Sporcu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Yeni Sporcu Kaydı</DialogTitle>
                      <DialogDescription>
                        Veli kayıt formu + sporcu bilgileri aşamasından kayıt yapmamış sporcu eklemek için tüm bilgileri girin
                      </DialogDescription>
                    </DialogHeader>
                    
                    <NewAthleteForm onClose={() => setIsAddDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {userRole === 'coach' ? 'Sporcularım' : 'Toplam Sporcu'}
                    </p>
                    <p className="text-2xl font-bold">{athletes.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktif Sporcu</p>
                    <p className="text-2xl font-bold">{activeAthletes}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bu Ay Kayıt</p>
                    <p className="text-2xl font-bold">{thisMonthRegistrations}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            {userRole === 'admin' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ödeme Gecikmiş</p>
                      <p className="text-2xl font-bold">
                        {athletes.filter(a => a.paymentStatus === 'Gecikmiş').length}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Sporcu veya veli adı ara..." 
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
                    
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Durum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Pasif">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {userRole === 'admin' && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={exportActiveAthletes}>
                        <Download className="h-4 w-4 mr-2" />
                        Aktif Sporcuları Dışa Aktar
                      </Button>
                      <Dialog open={isBulkFeeDialogOpen} onOpenChange={setIsBulkFeeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Toplu Aidat Girişi
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <FileSpreadsheet className="h-5 w-5" />
                              <span>Toplu Aidat Girişi</span>
                            </DialogTitle>
                            <DialogDescription>
                              Excel dosyası ile tüm aktif sporcular için toplu aidat girişi yapın
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Bu işlem aktif sporcuların cari hesaplarına aidat kaydı ekleyecektir. Önce şablonu indirip doldurun.
                              </AlertDescription>
                            </Alert>

                            {/* Template Download */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">1. Şablon İndir ve Doldur</CardTitle>
                                <CardDescription>
                                  Aktif sporcular için aidat şablonunu indirin
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Button onClick={generateBulkFeeTemplate} variant="outline" className="w-full">
                                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                                  Toplu Aidat Şablonunu İndir
                                </Button>
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                  <h4 className="font-medium text-blue-900 mb-2">Şablon Özellikleri:</h4>
                                  <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Sporcu Adı Soyadı: Otomatik doldurulur</li>
                                    <li>• Açıklama: Aidat açıklaması (örn: "Haziran 2024 Aylık Aidat")</li>
                                    <li>• Tutar: KDV hariç tutar</li>
                                    <li>• KDV Oranı: 10 veya 20 seçin</li>
                                    <li>• Toplam: Otomatik hesaplanır</li>
                                    <li>• Birim Kod: "Ay" (aidat için) veya "Adet" (forma vb. için)</li>
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>

                            {/* File Upload */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">2. Doldurulmuş Dosyayı Yükle</CardTitle>
                                <CardDescription>
                                  Aidat bilgilerini doldurduğunuz Excel dosyasını seçin
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                      type="file"
                                      accept=".xlsx,.xls"
                                      onChange={handleBulkFeeFileUpload}
                                      className="hidden"
                                      id="bulk-fee-file"
                                    />
                                    <label htmlFor="bulk-fee-file" className="cursor-pointer">
                                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                      <p className="text-lg font-medium text-gray-900 mb-2">
                                        Doldurulmuş Excel dosyasını seçin
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        .xlsx veya .xls formatında olmalıdır
                                      </p>
                                    </label>
                                  </div>

                                  {bulkFeeFile && (
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                      <div className="flex items-center space-x-2">
                                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                        <span className="text-sm font-medium text-green-900">
                                          {bulkFeeFile.name}
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setBulkFeeFile(null)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}

                                  {bulkFeeFile && (
                                    <Button 
                                      onClick={processBulkFeeFile} 
                                      disabled={isProcessing}
                                      className="w-full"
                                    >
                                      {isProcessing ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          İşleniyor...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Toplu Aidat Girişini Başlat
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Progress */}
                            {isProcessing && (
                              <Card>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Aidat kayıtları ekleniyor...</span>
                                      <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="w-full" />
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Example Data */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Örnek Veri Formatı</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Sporcu Adı Soyadı</TableHead>
                                      <TableHead>Açıklama</TableHead>
                                      <TableHead>Tutar</TableHead>
                                      <TableHead>KDV Oranı (%)</TableHead>
                                      <TableHead>Toplam</TableHead>
                                      <TableHead>Birim Kod</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>Ahmet Yılmaz</TableCell>
                                      <TableCell>Haziran 2024 Aylık Aidat</TableCell>
                                      <TableCell>350</TableCell>
                                      <TableCell>10</TableCell>
                                      <TableCell>385 (otomatik)</TableCell>
                                      <TableCell>Ay</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Elif Demir</TableCell>
                                      <TableCell>Forma Ücreti</TableCell>
                                      <TableCell>150</TableCell>
                                      <TableCell>20</TableCell>
                                      <TableCell>180 (otomatik)</TableCell>
                                      <TableCell>Adet</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="flex justify-end space-x-2 mt-6">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setIsBulkFeeDialogOpen(false);
                                setBulkFeeFile(null);
                                setUploadProgress(0);
                              }}
                            >
                              Kapat
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Athletes Table */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle>
                  {userRole === 'coach' ? 'Sporcularım' : 'Sporcu Listesi'} ({filteredAthletes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAthletes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sporcu</TableHead>
                        <TableHead>Yaş</TableHead>
                        <TableHead>Branş</TableHead>
                        <TableHead>Veli</TableHead>
                        <TableHead>İletişim</TableHead>
                        <TableHead>Durum</TableHead>
                        {userRole === 'admin' && <TableHead>Ödeme</TableHead>}
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAthletes.map((athlete, index) => (
                        <TableRow key={athlete.id || index}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(athlete.studentName, athlete.studentSurname)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{athlete.studentName} {athlete.studentSurname}</p>
                                <p className="text-sm text-muted-foreground">
                                  Kayıt: {new Date(athlete.registrationDate || athlete.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{athlete.studentAge}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {athlete.sportsBranches?.map((branch: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {branch}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{athlete.parentName} {athlete.parentSurname}</p>
                              <p className="text-sm text-muted-foreground">{athlete.parentRelation || 'Veli'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3" />
                                <span>{athlete.parentPhone}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3" />
                                <span>{athlete.parentEmail}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={athlete.status === 'Aktif' ? 'default' : 'secondary'}>
                              {athlete.status || 'Aktif'}
                            </Badge>
                          </TableCell>
                          {userRole === 'admin' && (
                            <TableCell>
                              <Badge variant={athlete.paymentStatus === 'Güncel' ? 'default' : 'destructive'}>
                                {athlete.paymentStatus || 'Güncel'}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openViewDialog(athlete)}
                                title="Görüntüle"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {userRole === 'admin' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openAccountDialog(athlete)}
                                    title="Cari Hesap"
                                  >
                                    <Calculator className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openStatusDialog(athlete)}
                                    title="Durum Değiştir"
                                  >
                                    {athlete.status === 'Aktif' ? 
                                      <ToggleRight className="h-4 w-4 text-green-600" /> : 
                                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                                    }
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openEditDialog(athlete)}
                                    title="Düzenle"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openDeleteDialog(athlete)}
                                    title="Sil"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {userRole === 'coach' 
                        ? 'Henüz atanmış sporcu bulunmuyor' 
                        : 'Henüz sporcu kaydı bulunmuyor'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Management Dialog */}
          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Cari Hesap - {selectedAthlete?.studentName} {selectedAthlete?.studentSurname}</span>
                </DialogTitle>
                <DialogDescription>
                  Sporcu için aylık aidat ve ödeme kayıtlarını yönetin
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Balance Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Toplam Borç</p>
                        <p className="text-2xl font-bold text-red-600">
                          ₺{accountEntries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amountIncludingVat, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Toplam Alacak</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₺{accountEntries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amountIncludingVat, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Net Bakiye</p>
                        <p className={`text-2xl font-bold ${getTotalBalance() >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₺{Math.abs(getTotalBalance()).toFixed(2)} {getTotalBalance() >= 0 ? '(Borç)' : '(Alacak)'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* New Entry Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Yeni Kayıt Ekle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="month">Ay/Yıl</Label>
                        <Input
                          id="month"
                          type="month"
                          value={newEntry.month}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, month: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">İşlem Türü</Label>
                        <Select value={newEntry.type} onValueChange={(value) => setNewEntry(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debit">Borç (Aidat/Ücret)</SelectItem>
                            <SelectItem value="credit">Alacak (Ödeme)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Input
                          id="description"
                          placeholder="Örn: Haziran 2024 Basketbol Aidatı"
                          value={newEntry.description}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amountExcludingVat">Tutar (KDV Hariç) ₺</Label>
                        <Input
                          id="amountExcludingVat"
                          type="number"
                          step="0.01"
                          placeholder="350.00"
                          value={newEntry.amountExcludingVat}
                          onChange={(e) => calculateVatAmount(e.target.value, newEntry.vatRate)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vatRate">KDV Oranı (%)</Label>
                        <Select value={newEntry.vatRate} onValueChange={(value) => calculateVatAmount(newEntry.amountExcludingVat, value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">%10</SelectItem>
                            <SelectItem value="20">%20</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>KDV Tutarı ₺</Label>
                        <Input
                          value={newEntry.amountExcludingVat && newEntry.vatRate ? 
                            ((parseFloat(newEntry.amountExcludingVat) * parseFloat(newEntry.vatRate)) / 100).toFixed(2) : '0.00'}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unitCode">Birim Kod</Label>
                        <Select value={newEntry.unitCode} onValueChange={(value) => setNewEntry(prev => ({ ...prev, unitCode: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ay">Ay (Aylık aidat için)</SelectItem>
                            <SelectItem value="Adet">Adet (Forma, çanta vb. için)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Toplam Tutar (KDV Dahil) ₺</Label>
                        <Input
                          value={newEntry.amountIncludingVat}
                          disabled
                          className="bg-muted font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button onClick={saveAccountEntry} disabled={!newEntry.description || !newEntry.amountExcludingVat}>
                        <Plus className="h-4 w-4 mr-2" />
                        Kayıt Ekle
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Entries Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hesap Hareketleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {accountEntries.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Ay/Yıl</TableHead>
                            <TableHead>Açıklama</TableHead>
                            <TableHead>Tür</TableHead>
                            <TableHead>KDV Hariç</TableHead>
                            <TableHead>KDV</TableHead>
                            <TableHead>KDV Dahil</TableHead>
                            <TableHead>İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accountEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{new Date(entry.date).toLocaleDateString('tr-TR')}</TableCell>
                              <TableCell>{entry.month}</TableCell>
                              <TableCell>{entry.description}</TableCell>
                              <TableCell>
                                <Badge variant={entry.type === 'debit' ? 'destructive' : 'default'}>
                                  {entry.type === 'debit' ? 'Borç' : 'Alacak'}
                                </Badge>
                              </TableCell>
                              <TableCell>₺{entry.amountExcludingVat.toFixed(2)}</TableCell>
                              <TableCell>₺{entry.vatAmount.toFixed(2)} (%{entry.vatRate})</TableCell>
                              <TableCell className="font-bold">₺{entry.amountIncludingVat.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const updatedEntries = accountEntries.filter(e => e.id !== entry.id);
                                    setAccountEntries(updatedEntries);
                                    localStorage.setItem(`account_${selectedAthlete.id}`, JSON.stringify(updatedEntries));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Henüz hesap hareketi bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Status Change Dialog */}
          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {selectedAthleteForStatus?.status === 'Aktif' ? 
                    <UserX className="h-5 w-5 text-orange-600" /> : 
                    <UserCheck className="h-5 w-5 text-green-600" />
                  }
                  <span>Sporcu Durumu Değiştir</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedAthleteForStatus?.studentName} {selectedAthleteForStatus?.studentSurname} adlı sporcunun durumunu değiştirin
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Mevcut Durum:</span>
                    <Badge variant={selectedAthleteForStatus?.status === 'Aktif' ? 'default' : 'secondary'}>
                      {selectedAthleteForStatus?.status || 'Aktif'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Sporcu durumunu değiştirmek istediğinizden emin misiniz?
                  </p>
                  
                  {selectedAthleteForStatus?.status === 'Aktif' ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Sporcu pasif duruma geçirilecek. Bu durumda sporcu antrenman listelerinde görünmeyecek ve yeni ödemeler alınamayacaktır.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Sporcu aktif duruma geçirilecek. Bu durumda sporcu tüm antrenman ve ödeme işlemlerine dahil olacaktır.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsStatusDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={() => changeAthleteStatus(selectedAthleteForStatus?.status === 'Aktif' ? 'Pasif' : 'Aktif')}
                    variant={selectedAthleteForStatus?.status === 'Aktif' ? 'destructive' : 'default'}
                  >
                    {selectedAthleteForStatus?.status === 'Aktif' ? 
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Pasif Yap
                      </> : 
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Aktif Yap
                      </>
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Parent Account Creation Dialog */}
          <Dialog open={isParentAccountDialogOpen} onOpenChange={setIsParentAccountDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Veli Hesapları Oluştur</span>
                </DialogTitle>
                <DialogDescription>
                  Toplu yüklenen sporcuların velileri için sistem hesapları oluşturun
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {parentAccountsToCreate.length} veli için sistem hesabı oluşturulacak. Bu veliler sisteme giriş yaparak çocuklarının bilgilerini görüntüleyebilecekler.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Oluşturulacak Hesaplar</CardTitle>
                    <CardDescription>
                      Aşağıdaki veliler için otomatik kullanıcı adı ve şifre oluşturulacak
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Veli Adı</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Sporcu</TableHead>
                            <TableHead>Oluşturulacak Kullanıcı Adı</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parentAccountsToCreate.map((account, index) => {
                            const credentials = generateParentCredentials(account.parentName, account.parentSurname, account.parentEmail);
                            return (
                              <TableRow key={index}>
                                <TableCell>{account.parentName} {account.parentSurname}</TableCell>
                                <TableCell>{account.parentEmail}</TableCell>
                                <TableCell>{account.parentPhone}</TableCell>
                                <TableCell>{account.athleteName}</TableCell>
                                <TableCell className="font-mono text-sm">{credentials.username}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Önemli Bilgiler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Kullanıcı adları veli adı ve soyadından otomatik oluşturulacak</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Şifreler basit ve güvenli olacak (kullanıcıadı + 123)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Veliler sisteme giriş yaparak çocuklarının bilgilerini görüntüleyebilecek</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span>Giriş bilgilerini velilere WhatsApp veya email ile iletmeyi unutmayın</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsParentAccountDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button onClick={createParentAccounts}>
                    <Key className="h-4 w-4 mr-2" />
                    {parentAccountsToCreate.length} Hesap Oluştur
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Athlete Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Sporcu Detayları - {selectedAthleteForView?.studentName} {selectedAthleteForView?.studentSurname}</span>
                </DialogTitle>
                <DialogDescription>
                  Sporcu bilgilerini görüntüleyin
                </DialogDescription>
              </DialogHeader>

              {selectedAthleteForView && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sporcu Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sporcu Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ad Soyad:</span>
                          <span className="font-medium">{selectedAthleteForView.studentName} {selectedAthleteForView.studentSurname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">TC Kimlik No:</span>
                          <span className="font-medium">{selectedAthleteForView.studentTcNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Doğum Tarihi:</span>
                          <span className="font-medium">{selectedAthleteForView.studentBirthDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Yaş:</span>
                          <span className="font-medium">{selectedAthleteForView.studentAge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cinsiyet:</span>
                          <span className="font-medium">{selectedAthleteForView.studentGender || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Okul:</span>
                          <span className="font-medium">{selectedAthleteForView.studentSchool || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sınıf:</span>
                          <span className="font-medium">{selectedAthleteForView.studentClass || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Veli Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Veli Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ad Soyad:</span>
                          <span className="font-medium">{selectedAthleteForView.parentName} {selectedAthleteForView.parentSurname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">TC Kimlik No:</span>
                          <span className="font-medium">{selectedAthleteForView.parentTcNo || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefon:</span>
                          <span className="font-medium">{selectedAthleteForView.parentPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{selectedAthleteForView.parentEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Yakınlık:</span>
                          <span className="font-medium">{selectedAthleteForView.parentRelation || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Meslek:</span>
                          <span className="font-medium">{selectedAthleteForView.parentOccupation || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Spor Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Spor Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Spor Branşları:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedAthleteForView.sportsBranches?.map((branch: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {branch}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Boy:</span>
                          <span className="font-medium">{selectedAthleteForView.studentHeight || '-'} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kilo:</span>
                          <span className="font-medium">{selectedAthleteForView.studentWeight || '-'} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kan Grubu:</span>
                          <span className="font-medium">{selectedAthleteForView.bloodType || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sistem Bilgileri */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sistem Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durum:</span>
                          <Badge variant={selectedAthleteForView.status === 'Aktif' ? 'default' : 'secondary'}>
                            {selectedAthleteForView.status || 'Aktif'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ödeme Durumu:</span>
                          <Badge variant={selectedAthleteForView.paymentStatus === 'Güncel' ? 'default' : 'destructive'}>
                            {selectedAthleteForView.paymentStatus || 'Güncel'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kayıt Tarihi:</span>
                          <span className="font-medium">
                            {new Date(selectedAthleteForView.registrationDate || selectedAthleteForView.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Kapat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Athlete Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Sporcu Düzenle - {selectedAthleteForEdit?.studentName} {selectedAthleteForEdit?.studentSurname}</span>
                </DialogTitle>
                <DialogDescription>
                  Sporcu bilgilerini düzenleyin
                </DialogDescription>
              </DialogHeader>

              {selectedAthleteForEdit && (
                <EditAthleteForm 
                  athlete={selectedAthleteForEdit}
                  onSave={(updatedAthlete) => {
                    try {
                      // Update athlete in localStorage
                      const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
                      const updatedStudents = allStudents.map((student: any) => 
                        student.id === updatedAthlete.id ? {
                          ...student,
                          ...updatedAthlete,
                          updatedAt: new Date().toISOString()
                        } : student
                      );
                      localStorage.setItem('students', JSON.stringify(updatedStudents));
                      
                      // Reload athletes
                      loadAthletes(userRole!, currentUser);
                      
                      // Close dialog
                      setIsEditDialogOpen(false);
                      setSelectedAthleteForEdit(null);
                      
                      // Show success message
                      alert(`${updatedAthlete.studentName} ${updatedAthlete.studentSurname} adlı sporcunun bilgileri başarıyla güncellendi.`);
                    } catch (error) {
                      console.error('Error saving athlete:', error);
                      alert('Sporcu bilgileri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
                    }
                  }}
                  onCancel={() => {
                    setIsEditDialogOpen(false);
                    setSelectedAthleteForEdit(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Athlete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <span>Sporcu Sil</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedAthleteForDelete?.studentName} {selectedAthleteForDelete?.studentSurname} adlı sporcuyu silmek istediğinizden emin misiniz?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Bu işlem geri alınamaz! Sporcu kaydı ve tüm ilişkili veriler (cari hesap, ödemeler vb.) silinecektir.
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sporcu:</span>
                      <span className="font-medium">{selectedAthleteForDelete?.studentName} {selectedAthleteForDelete?.studentSurname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Veli:</span>
                      <span className="font-medium">{selectedAthleteForDelete?.parentName} {selectedAthleteForDelete?.parentSurname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kayıt Tarihi:</span>
                      <span className="font-medium">
                        {selectedAthleteForDelete && new Date(selectedAthleteForDelete.registrationDate || selectedAthleteForDelete.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={deleteAthlete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sporcuyu Sil
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}