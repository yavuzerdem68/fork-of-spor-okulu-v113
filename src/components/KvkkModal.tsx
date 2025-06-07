import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KvkkModalProps {
  children: React.ReactNode;
}

export const KvkkModal: React.FC<KvkkModalProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Veri Sorumlusu</h3>
              <p>
                Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, 
                veri sorumlusu sıfatıyla [Spor Okulu Adı] tarafından aşağıda açıklanan kapsamda işlenmektedir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Kişisel Verilerin İşlenme Amacı</h3>
              <p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Spor eğitimi hizmetlerinin sunulması</li>
                <li>Öğrenci kayıt işlemlerinin gerçekleştirilmesi</li>
                <li>Ödeme takibi ve fatura düzenleme</li>
                <li>İletişim faaliyetlerinin yürütülmesi</li>
                <li>Devamsızlık takibi ve bilgilendirme</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Güvenlik önlemlerinin alınması</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. İşlenen Kişisel Veri Türleri</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Kimlik bilgileri (ad, soyad, TC kimlik numarası, doğum tarihi)</li>
                <li>İletişim bilgileri (telefon, e-posta, adres)</li>
                <li>Sağlık bilgileri (sağlık durumu, alerjiler)</li>
                <li>Finansal bilgiler (ödeme bilgileri)</li>
                <li>Görsel ve işitsel kayıtlar (fotoğraf, video)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Kişisel Verilerin Toplanma Yöntemi</h3>
              <p>
                Kişisel verileriniz, kayıt formları, web sitesi, telefon görüşmeleri, 
                e-posta yazışmaları ve fiziksel ortamda düzenlenen belgeler aracılığıyla toplanmaktadır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Kişisel Verilerin Aktarılması</h3>
              <p>
                Toplanan kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlar dahilinde:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Yasal yükümlülüklerin yerine getirilmesi için kamu kurum ve kuruluşlarına</li>
                <li>Hizmet sağlayıcılarına (ödeme sistemleri, iletişim platformları)</li>
                <li>İş ortaklarımıza aktarılabilir</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Kişisel Veri Sahibinin Hakları</h3>
              <p>KVKK'nın 11. maddesi uyarınca sahip olduğunuz haklar:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
                <li>İşlenen kişisel veriler hakkında bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme veya yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Başvuru Yöntemi</h3>
              <p>
                Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici gerekli bilgiler ile 
                talebinizin konusunu açıkça belirttiğiniz başvurunuzu aşağıdaki yöntemlerle iletebilirsiniz:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>E-posta: kvkk@sporokulu.com</li>
                <li>Posta: [Spor Okulu Adresi]</li>
                <li>Fiziksel başvuru: Kayıtlı elektronik posta (KEP) adresi</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Veri Saklama Süresi</h3>
              <p>
                Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama 
                yükümlülüklerimiz çerçevesinde saklanacaktır. Bu süre sonunda verileriniz silinecek, 
                yok edilecek veya anonim hale getirilecektir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. İletişim</h3>
              <p>
                KVKK kapsamındaki sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>E-posta: info@sporokulu.com</li>
                <li>Telefon: [Telefon Numarası]</li>
                <li>Adres: [Spor Okulu Adresi]</li>
              </ul>
            </section>

            <p className="text-xs text-muted-foreground mt-6">
              Bu aydınlatma metni [Tarih] tarihinde güncellenmiştir.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};