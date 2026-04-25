export const metadata = { title: 'Kullanım Şartları — UniNot' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="text-gray-700 space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Kullanım Şartları</h1>
      <p className="text-sm text-muted-foreground mb-8">Son güncelleme: Nisan 2025</p>

      <Section title="1. Genel">
        <p>
          UniNot&apos;u kullanarak bu şartları kabul etmiş sayılırsınız.
          Platformun amacı, üniversite öğrencilerinin kendi hazırladıkları ders notlarını
          güvenli ve yasal bir şekilde paylaşmasını sağlamaktır.
        </p>
      </Section>

      <Section title="2. İçerik Kuralları">
        <p>Platforma yalnızca <strong>özgün, kendinizin hazırladığı</strong> içerikler yüklenebilir.</p>
        <p className="font-medium mt-3 text-red-700">Kesinlikle yasak olan içerikler:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Hocaların izinsiz paylaşılan ders slaytları</li>
          <li>Yayınevlerine ait kitap veya ders kitabı PDF&apos;leri</li>
          <li>Telif hakkı koruması altındaki herhangi bir materyal</li>
          <li>Başka öğrencilerin izinsiz alınan notları</li>
          <li>Kötü amaçlı yazılım içeren dosyalar</li>
        </ul>
        <p className="mt-3">
          Yüklediğiniz içeriklerin telif hakkı konusunda tamamen size ait olduğunu
          beyan etmiş sayılırsınız.
        </p>
      </Section>

      <Section title="3. Telif Hakkı İhlalleri">
        <p>
          Telif hakkı ihlali tespit edildiğinde ya da şikayet alındığında:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>İlgili içerik derhal yayından kaldırılır</li>
          <li>Kullanıcıya bildirim yapılır</li>
          <li>Tekrarlayan ihlallerde hesap kalıcı olarak kapatılabilir</li>
          <li>Birikmiş kazanç ödemeleri durdurulabilir</li>
        </ul>
        <p className="mt-2">
          Telif hakkı şikayetleri için:
          <a href="mailto:iletisim@uninot.com" className="text-blue-600 hover:underline ml-1">iletisim@uninot.com</a>
        </p>
      </Section>

      <Section title="4. Gelir Paylaşım Sistemi">
        <p>UniNot, onaylanan notlar için şu gelir paylaşım modelini uygular:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Platforma gelen reklam gelirinin <strong>%70&apos;i</strong> içerik üreticilere aktarılır</li>
          <li>Kazanç, geçerli görüntülenme ve indirme sayılarına göre hesaplanır</li>
          <li>Geçerli görüntülenme: en az 30 saniye süren okuma oturumu</li>
          <li>Geçerli indirme: kullanıcı başına ilk indirme</li>
          <li>Ödeme detayları ve eşikleri ayrıca duyurulacaktır</li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Platform, önceden haber vermeksizin gelir paylaşım oranlarını veya
          hesaplama yöntemini değiştirme hakkını saklı tutar.
        </p>
      </Section>

      <Section title="5. İçerik Moderasyonu">
        <p>
          Yüklenen her not admin incelemesinden geçer. Admin onayından önce not
          yayınlanmaz. UniNot, herhangi bir içeriği gerekçe göstermeksizin
          reddetme veya kaldırma hakkını saklı tutar.
        </p>
      </Section>

      <Section title="6. Sorumluluk Sınırı">
        <p>
          UniNot, kullanıcılar tarafından yüklenen içeriklerin doğruluğundan,
          güncelliğinden veya telif hakkı durumundan sorumlu tutulamaz.
          İçerik sorumluluğu tamamen yükleyen kullanıcıya aittir.
        </p>
      </Section>

      <Section title="7. Hesap Kapatma">
        <p>
          Hesabınızı kapatmak veya verilerinizin silinmesini talep etmek için
          <a href="mailto:iletisim@uninot.com" className="text-blue-600 hover:underline ml-1">iletisim@uninot.com</a>
          adresine yazabilirsiniz. Hesap kapatma işlemi 30 gün içinde tamamlanır.
        </p>
      </Section>

      <Section title="8. Değişiklikler">
        <p>
          Bu şartlar önceden bildirimsiz değiştirilebilir. Platforma erişmeye
          devam etmek güncel şartları kabul etmek anlamına gelir.
        </p>
      </Section>

      <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
        Sorularınız için:{' '}
        <a href="mailto:iletisim@uninot.com" className="text-blue-600 hover:underline">iletisim@uninot.com</a>
      </div>
    </div>
  )
}
