import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Üyelik Sözleşmesi ve Şartlar</DialogTitle>
          <DialogDescription>
            Spor okulu üyelik şartları ve koşulları
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3">1. GENEL HÜKÜMLER</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  1.1. Bu sözleşme, spor okulu ile sporcu/veli arasında imzalanan üyelik sözleşmesidir.
                </p>
                <p>
                  1.2. Sporcu, spor okulunun belirlediği kurallara uymayı kabul eder.
                </p>
                <p>
                  1.3. Bu sözleşme, imzalandığı tarihten itibaren geçerlidir.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">2. ÖDEME KOŞULLARI</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  2.1. Aylık ücretler her ayın ilk haftası içinde ödenmelidir.
                </p>
                <p>
                  2.2. Geciken ödemeler için %2 gecikme faizi uygulanır.
                </p>
                <p>
                  2.3. Ödeme yapılmayan durumlarda üyelik dondurulabilir.
                </p>
                <p>
                  2.4. İade talepleri yazılı olarak bildirilmelidir.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">3. DEVAM KOŞULLARI</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  3.1. Sporcu, antrenman saatlerine düzenli olarak katılmalıdır.
                </p>
                <p>
                  3.2. Mazeretsiz devamsızlık durumunda ders telafi edilmez.
                </p>
                <p>
                  3.3. Hastalık durumunda hekim raporu ibraz edilmelidir.
                </p>
                <p>
                  3.4. Uzun süreli devamsızlık durumunda üyelik dondurulabilir.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">4. SAĞLIK VE GÜVENLİK</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  4.1. Sporcu, sağlık durumunu spor yapmaya uygun olduğunu beyan eder.
                </p>
                <p>
                  4.2. Kronik hastalık durumunda hekim onayı gereklidir.
                </p>
                <p>
                  4.3. Antrenman sırasında meydana gelebilecek yaralanmalardan sporcu sorumludur.
                </p>
                <p>
                  4.4. Spor okulu, gerekli güvenlik önlemlerini almakla yükümlüdür.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">5. DAVRANIŞ KURALLARI</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  5.1. Sporcu, antrenörlere ve diğer sporculara saygılı davranmalıdır.
                </p>
                <p>
                  5.2. Spor aletlerine özen gösterilmelidir.
                </p>
                <p>
                  5.3. Uygunsuz davranış durumunda uyarı verilir.
                </p>
                <p>
                  5.4. Tekrarlanan uygunsuz davranışlarda üyelik sonlandırılabilir.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">6. KİŞİSEL VERİLERİN KORUNMASI</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  6.1. Kişisel veriler, 6698 sayılı KVKK kapsamında işlenir.
                </p>
                <p>
                  6.2. Veriler sadece spor okulu faaliyetleri için kullanılır.
                </p>
                <p>
                  6.3. Üçüncü kişilerle paylaşılmaz.
                </p>
                <p>
                  6.4. Veri sahibi, verilerinin silinmesini talep edebilir.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">7. FOTOĞRAF VE VİDEO ÇEKİMİ</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  7.1. Antrenman ve müsabaka sırasında fotoğraf/video çekilebilir.
                </p>
                <p>
                  7.2. Çekilen materyaller tanıtım amaçlı kullanılabilir.
                </p>
                <p>
                  7.3. Veli/sporcu, bu duruma onay verdiğini beyan eder.
                </p>
                <p>
                  7.4. İstenmeyen paylaşımlar için yazılı bildirim yapılabilir.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">8. SÖZLEŞMENİN SONA ERMESİ</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  8.1. Sözleşme, taraflardan birinin yazılı bildirimiyle sona erer.
                </p>
                <p>
                  8.2. Fesih bildirimi 30 gün önceden yapılmalıdır.
                </p>
                <p>
                  8.3. Ödenen ücretler, kullanılan süre düşülerek iade edilir.
                </p>
                <p>
                  8.4. Sözleşme ihlali durumunda derhal fesih yapılabilir.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">9. UYUŞMAZLIK ÇÖZÜMÜ</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  9.1. Uyuşmazlıklar öncelikle dostane yollarla çözülmeye çalışılır.
                </p>
                <p>
                  9.2. Çözülemezse yetkili mahkemeler görevlidir.
                </p>
                <p>
                  9.3. Türk hukuku uygulanır.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-base mb-3">10. DİĞER HÜKÜMLER</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  10.1. Bu sözleşme, tarafların karşılıklı anlaşmasıyla değiştirilebilir.
                </p>
                <p>
                  10.2. Sözleşmenin bir maddesi geçersiz olsa da diğer maddeler geçerliliğini korur.
                </p>
                <p>
                  10.3. Bu sözleşme 2 nüsha düzenlenmiş olup, taraflar birer nüshasını almıştır.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;