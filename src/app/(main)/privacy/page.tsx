export const metadata = { title: 'Gizlilik Politikası — UniNot' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="text-gray-700 space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Gizlilik Politikası</h1>
      <p className="text-sm text-muted-foreground mb-8">Son güncelleme: Nisan 2025 · KVKK uyumlu</p>

      <Section title="1. Veri Sorumlusu">
        <p>
          UniNot platformu kapsamında kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması
          Kanunu (KVKK) çerçevesinde <strong>UniNot</strong> tarafından işlenmektedir.
          Sorularınız için: <a href="mailto:iletisim@uninot.com" className="text-blue-600 hover:underline">iletisim@uninot.com</a>
        </p>
      </Section>

      <Section title="2. Toplanan Veriler">
        <p>Platformu kullanırken aşağıdaki veriler toplanmaktadır:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Hesap bilgileri:</strong> E-posta adresi, ad soyad</li>
          <li><strong>Eğitim bilgileri:</strong> Üniversite, bölüm</li>
          <li><strong>İçerik verileri:</strong> Yüklenen PDF dosyaları, not başlıkları ve açıklamaları</li>
          <li><strong>Kullanım istatistikleri:</strong> Görüntülenme sayısı, indirme sayısı, görüntüleme süresi</li>
          <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı türü (Supabase altyapısı tarafından otomatik kaydedilir)</li>
        </ul>
      </Section>

      <Section title="3. Verilerin Kullanım Amacı">
        <ul className="list-disc pl-5 space-y-1">
          <li>Platformun temel hizmetlerini (not yükleme, görüntüleme, indirme) sunmak</li>
          <li>Reklam geliri paylaşım sistemini yönetmek ve tahmini kazancı hesaplamak</li>
          <li>Kullanıcı hesabını doğrulamak ve güvenliğini sağlamak</li>
          <li>İçerik moderasyonu (admin incelemesi) yapmak</li>
          <li>Platform performansını iyileştirmek</li>
        </ul>
      </Section>

      <Section title="4. Üçüncü Taraf Hizmetler">
        <p>Verileriniz aşağıdaki üçüncü taraf hizmet sağlayıcılarla paylaşılmaktadır:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>Supabase Inc.</strong> — Veritabanı ve dosya depolama (ABD merkezli, GDPR uyumlu).
            <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">Gizlilik politikası</a>
          </li>
          <li>
            <strong>Vercel Inc.</strong> — Web hosting ve CDN hizmeti (ABD merkezli, GDPR uyumlu).
            <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">Gizlilik politikası</a>
          </li>
        </ul>
        <p className="mt-2">Bu sağlayıcılar dışında kişisel verileriniz üçüncü taraflarla satılmaz veya paylaşılmaz.</p>
      </Section>

      <Section title="5. Veri Saklama Süresi">
        <p>
          Hesabınız aktif olduğu sürece verileriniz saklanır. Hesabınızı silmek
          istediğinizde tüm kişisel verileriniz ve yüklediğiniz içerikler 30 gün
          içinde kalıcı olarak silinir.
        </p>
      </Section>

      <Section title="6. KVKK Kapsamındaki Haklarınız">
        <p>6698 sayılı KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenen verilere erişim ve kopyasını talep etme</li>
          <li>Hatalı veya eksik verilerin düzeltilmesini isteme</li>
          <li>Verilerinizin silinmesini veya yok edilmesini talep etme</li>
          <li>Otomatik sistemler aracılığıyla aleyhinize oluşan sonuçlara itiraz etme</li>
        </ul>
        <p className="mt-2">
          Bu haklarınızı kullanmak için:
          <a href="mailto:iletisim@uninot.com" className="text-blue-600 hover:underline ml-1">iletisim@uninot.com</a> adresine yazabilirsiniz.
        </p>
      </Section>

      <Section title="7. Çerezler">
        <p>
          Platform, yalnızca kimlik doğrulama amacıyla zorunlu oturum çerezleri kullanmaktadır.
          Reklam veya analitik amaçlı üçüncü taraf çerez kullanılmamaktadır.
        </p>
      </Section>

      <Section title="8. Değişiklikler">
        <p>
          Bu politika, mevzuat değişiklikleri veya hizmet güncellemeleri doğrultusunda
          değiştirilebilir. Önemli değişikliklerde kayıtlı e-posta adresinize bildirim gönderilir.
        </p>
      </Section>
    </div>
  )
}
