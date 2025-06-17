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
            <div className="text-center mb-6">
              <h2 className="font-bold text-lg mb-2">G7 SPOR KULÜBÜ & TOFAŞ BASKETBOL SPOR OKULU</h2>
              <h3 className="font-semibold text-base">KATILIM VE MUVAFAKAT BEYANI</h3>
            </div>

            <p className="mb-4">
              Tarafımızca, aşağıda kimlik bilgileri yer alan çocuğumuzun, G7 Spor Kulübü ("G7SK") çatısı altında yürütülen "Tofaş Basketbol Spor Okulu" faaliyetlerine katılımı için gerekli kayıt işlemleri tamamlanmıştır.
            </p>

            <p className="mb-6">
              Veli/Vasi sıfatıyla, kayıt formunda bilgilerini paylaştığımız çocuğumuzun spor yapmasına engel teşkil edecek bir sağlık problemi bulunmadığını; tarafımızdan temin edilen ve ekte sunulan sağlık raporu ile belgelendirdiğimizi beyan ederiz. Aynı zamanda, kayıt tarihi itibarıyla çocuğumuzun spor yapmaya elverişli genel sağlık durumuna sahip olduğunu da onaylarız.
            </p>

            <section className="mb-6">
              <h3 className="font-semibold text-base mb-3 border-b pb-1">1. SORUMLULUK BİLGİLENDİRMESİ</h3>
              <p className="mb-3">
                G7 Spor Kulübü ve Tofaş Basketbol Okulu tarafından düzenlenen antrenman, maç, kamp, seyahat ve benzeri sportif faaliyetler kapsamında, azami özen gösterilmekte olup, tüm organizasyonlar çocuklarımızın güvenliği öncelenerek planlanmaktadır. Ancak, bu faaliyetlerin doğası gereği ortaya çıkabilecek sağlık sorunları (yaralanma, hastalık, geçici veya kalıcı sakatlık gibi) ve çeşitli kazalar (seyahat, tesis kullanımı vb.) risklerine ilişkin olarak kulübün ve eğitmen kadrosunun sınırlı sorumluluğu bulunduğunu, bu durumları anlayışla karşıladığımızı ve gerekli önlemleri kendi sorumluluğumuzda da alacağımızı kabul ederiz.
              </p>
              <p className="text-sm italic">
                <strong>Not:</strong> G7SK'nin Tofaş markası altında faaliyet göstermesi, Tofaş'ın doğrudan sorumluluğu altında olduğu anlamına gelmemektedir. Tarafımız bu iş birliği modelini ve kapsamını bilerek kabul etmekteyiz.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="font-semibold text-base mb-3 border-b pb-1">2. GÖRSEL ve TANITIM AMAÇLI PAYLAŞIM ONAYI</h3>
              <p>
                Çocuğumuzun, G7SK ve Tofaş Basketbol Okulu bünyesinde yer aldığı etkinliklerde çekilen görüntüleri ve videoları, sadece kulüp tanıtımı amacıyla, sosyal medya hesapları ve resmi tanıtım materyallerinde kullanılabilir. Bu içeriklerin etik kurallar çerçevesinde, çocuğumuzun saygınlığına uygun şekilde paylaşılması koşuluyla, süresiz ve ücretsiz olarak kullanılmasına onay vermekteyiz.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="font-semibold text-base mb-3 border-b pb-1">3. VERİ İLETİŞİMİ VE TANITIM ONAYI</h3>
              <p>
                G7SK, Tofaş Basketbol Okulu ve iş birliği içinde olduğu paydaşların; duyuru, etkinlik, bilgilendirme ve gelişim süreçleri hakkında tarafımıza ulaşmasına KVKK kapsamında izin verdiğimizi, SMS, e-posta veya diğer iletişim araçlarıyla bilgilendirme yapılmasına açık rıza gösterdiğimizi beyan ederiz.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="font-semibold text-base mb-3 border-b pb-1">4. KİŞİSEL EŞYALARLA İLGİLİ SORUMLULUK</h3>
              <p>
                Çocuğumuzun kendi sorumluluğunda olan kıyafet, para, elektronik cihazlar gibi kişisel eşyalarının kulüp faaliyetleri süresince kaybolması veya zarar görmesi durumunda G7SK ve Tofaş Basketbol Okulu'nun sorumlu tutulamayacağını kabul ederiz.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="font-semibold text-base mb-3 border-b pb-1">5. SPORTİF FAALİYET VE SEYAHAT MUVAFAKATI</h3>
              <p className="mb-3">Aşağıda belirtilen kimlik bilgilerine sahip çocuğumuzun:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Tofaş Basketbol Spor Okulu antrenman ve müsabakalarına katılımına,</li>
                <li>G7 Spor Kulübü yarışma takımlarında yer almasına,</li>
                <li>Yurt içi ve yurt dışı kamp, turnuva ve benzeri organizasyonlara katılmasına,</li>
                <li>Lisans, pasaport ve diğer resmi işlemlerinin yürütülmesine</li>
              </ul>
              <p className="mt-3">
                veli/vasi sıfatıyla onay verdiğimizi ve gerekli hallerde refakat olmadan katılımına da muvafakat ettiğimizi beyan ederiz.
              </p>
            </section>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Bilgilendirme Notu:</h4>
              <p className="text-sm">
                Bu belge, G7 Spor Kulübü ile Tofaş Basketbol Okulu'nun iş birliği çerçevesinde hazırlanan ortak bir bilgilendirme ve muvafakat metnidir. Tüm faaliyetler, ilgili kurumların profesyonel sorumluluk anlayışı içinde yürütülmekte olup, veli onayı gerektiren alanlar şeffaflıkla açıklanmıştır.
              </p>
            </div>

            <p className="text-center font-medium border-t pt-4">
              İmzalanmak suretiyle yürürlüğe girecek olan bu metin, veli/vasi olarak bilgilendirilmiş ve onaylanmış iradeyi temsil eder.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};