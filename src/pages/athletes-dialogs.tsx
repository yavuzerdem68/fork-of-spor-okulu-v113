import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Plus,
  Edit,
  Trash2,
  Calculator,
  AlertTriangle,
  CheckCircle,
  X,
  UserX,
  UserCheck,
  Key
} from "lucide-react";

// This file contains the missing dialog components that were truncated from athletes.tsx

export function AccountManagementDialog({ 
  isOpen, 
  onClose, 
  selectedAthlete, 
  accountEntries, 
  newEntry, 
  setNewEntry, 
  saveAccountEntry, 
  calculateVatAmount, 
  getTotalBalance 
}: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                    ₺{accountEntries.filter((e: any) => e.type === 'debit').reduce((sum: number, e: any) => sum + e.amountIncludingVat, 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Toplam Alacak</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₺{accountEntries.filter((e: any) => e.type === 'credit').reduce((sum: number, e: any) => sum + e.amountIncludingVat, 0).toFixed(2)}
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
                    onChange={(e) => setNewEntry((prev: any) => ({ ...prev, month: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">İşlem Türü</Label>
                  <Select value={newEntry.type} onValueChange={(value) => setNewEntry((prev: any) => ({ ...prev, type: value }))}>
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
                    onChange={(e) => setNewEntry((prev: any) => ({ ...prev, description: e.target.value }))}
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
                  <Select value={newEntry.unitCode} onValueChange={(value) => setNewEntry((prev: any) => ({ ...prev, unitCode: value }))}>
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
                    {accountEntries.map((entry: any) => (
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
                              // Handle delete entry
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
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StatusChangeDialog({ 
  isOpen, 
  onClose, 
  selectedAthlete, 
  changeAthleteStatus 
}: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {selectedAthlete?.status === 'Aktif' ? 
              <UserX className="h-5 w-5 text-orange-600" /> : 
              <UserCheck className="h-5 w-5 text-green-600" />
            }
            <span>Sporcu Durumu Değiştir</span>
          </DialogTitle>
          <DialogDescription>
            {selectedAthlete?.studentName} {selectedAthlete?.studentSurname} adlı sporcunun durumunu değiştirin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Mevcut Durum:</span>
              <Badge variant={selectedAthlete?.status === 'Aktif' ? 'default' : 'secondary'}>
                {selectedAthlete?.status || 'Aktif'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sporcu durumunu değiştirmek istediğinizden emin misiniz?
            </p>
            
            {selectedAthlete?.status === 'Aktif' ? (
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
              onClick={onClose}
            >
              İptal
            </Button>
            <Button 
              onClick={() => changeAthleteStatus(selectedAthlete?.status === 'Aktif' ? 'Pasif' : 'Aktif')}
              variant={selectedAthlete?.status === 'Aktif' ? 'destructive' : 'default'}
            >
              {selectedAthlete?.status === 'Aktif' ? 
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
  );
}

export function EditAthleteDialog({ 
  isOpen, 
  onClose, 
  selectedAthlete, 
  onSave 
}: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Sporcu Düzenle - {selectedAthlete?.studentName} {selectedAthlete?.studentSurname}</span>
          </DialogTitle>
          <DialogDescription>
            Sporcu bilgilerini düzenleyin
          </DialogDescription>
        </DialogHeader>

        {selectedAthlete && (
          <div className="p-4">
            <p className="text-center text-muted-foreground">
              Sporcu düzenleme formu burada görüntülenecek
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function DeleteAthleteDialog({ 
  isOpen, 
  onClose, 
  selectedAthlete, 
  deleteAthlete 
}: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <span>Sporcu Sil</span>
          </DialogTitle>
          <DialogDescription>
            {selectedAthlete?.studentName} {selectedAthlete?.studentSurname} adlı sporcuyu silmek istediğinizden emin misiniz?
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
                <span className="font-medium">{selectedAthlete?.studentName} {selectedAthlete?.studentSurname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Veli:</span>
                <span className="font-medium">{selectedAthlete?.parentName} {selectedAthlete?.parentSurname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kayıt Tarihi:</span>
                <span className="font-medium">
                  {selectedAthlete && new Date(selectedAthlete.registrationDate || selectedAthlete.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
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
  );
}

export function ParentAccountDialog({ 
  isOpen, 
  onClose, 
  parentAccountsToCreate, 
  createParentAccounts,
  generateParentCredentials 
}: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                    {parentAccountsToCreate.map((account: any, index: number) => {
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
              onClick={onClose}
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
  );
}