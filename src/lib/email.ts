import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Domain doğrulanana kadar Resend'in sandbox adresini kullan
// Domain doğrulandıktan sonra 'noreply@uninot.com' ile değiştir
const FROM = 'UniNot <onboarding@resend.dev>'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uninot.com'

// ─── HTML template helper ──────────────────────────────────────────────────
function wrap(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">
        <!-- Header -->
        <tr>
          <td style="background:#2563eb;padding:24px 32px">
            <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">UniNot</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;color:#111827;font-size:15px;line-height:1.6">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280">
            UniNot — Üniversite Ders Notları Platformu<br>
            Bu e-postayı almak istemiyorsan 
            <a href="${BASE_URL}/profile" style="color:#2563eb;text-decoration:none">profil sayfandan</a> bildirim tercihlerini düzenleyebilirsin.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function button(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-top:16px">${text}</a>`
}

// ─── Email fonksiyonları ───────────────────────────────────────────────────

export async function sendNoteApproved(to: string, noteTitle: string, noteId: string) {
  const html = wrap('Notun Yayınlandı', `
    <h2 style="margin:0 0 16px;font-size:20px">Notun onaylandı! 🎉</h2>
    <p>Harika haber — <strong>${noteTitle}</strong> adlı notun incelendi ve yayına alındı.</p>
    <p>Artık tüm öğrenciler notuna erişebilir, görüntüleyebilir ve indirebilir.</p>
    <p>Her geçerli görüntülenme ve indirme tahmini kazancına katkıda bulunmaya başlar.</p>
    ${button('Notunu Görüntüle', `${BASE_URL}/notes/${noteId}`)}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Notun yayına alındı: ${noteTitle}`,
    html,
  })
}

export async function sendNoteRejected(to: string, noteTitle: string) {
  const html = wrap('Not Reddedildi', `
    <h2 style="margin:0 0 16px;font-size:20px">Notun incelendi</h2>
    <p><strong>${noteTitle}</strong> adlı notun inceleme sürecinin ardından yayınlanamadı.</p>
    <p style="color:#6b7280">Olası nedenler:</p>
    <ul style="color:#6b7280;padding-left:20px">
      <li>İçerik özgün değil veya telif hakkı endişesi var</li>
      <li>PDF okunaksız veya düzensiz</li>
      <li>İçerik platforma uygun değil</li>
    </ul>
    <p>Düzenleyerek yeni bir not yükleyebilirsin.</p>
    ${button('Yeni Not Yükle', `${BASE_URL}/upload`)}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Notun hakkında bilgi: ${noteTitle}`,
    html,
  })
}

export async function sendNewComment(
  to: string,
  noteTitle: string,
  noteId: string,
  commenterName: string,
  comment: string | null,
  rating: number,
) {
  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  const html = wrap('Notuna Yeni Değerlendirme', `
    <h2 style="margin:0 0 16px;font-size:20px">Notuna yeni bir değerlendirme geldi</h2>
    <p><strong>${commenterName}</strong>, <strong>${noteTitle}</strong> adlı notuna puan verdi:</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #2563eb">
      <p style="margin:0 0 8px;font-size:20px">${stars}</p>
      ${comment ? `<p style="margin:0;color:#374151;font-style:italic">"${comment}"</p>` : '<p style="margin:0;color:#9ca3af">Yorum yazılmadı.</p>'}
    </div>
    ${button('Değerlendirmeleri Gör', `${BASE_URL}/notes/${noteId}#reviews`)}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `${stars} Notuna yeni değerlendirme: ${noteTitle}`,
    html,
  })
}

export async function sendWelcome(to: string, fullName: string) {
  const html = wrap('UniNot\'a Hoş Geldin', `
    <h2 style="margin:0 0 16px;font-size:20px">Hoş geldin, ${fullName}! 🎓</h2>
    <p>UniNot hesabın oluşturuldu. Artık ders notlarını paylaşabilir, diğer öğrencilerin notlarına erişebilir ve notlarından kazanç elde edebilirsin.</p>
    <p style="color:#6b7280;font-size:14px"><strong>Nasıl çalışır?</strong></p>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:8px 0;font-size:14px">📄 <strong>Not Yükle</strong></td>
        <td style="padding:8px 0;font-size:14px;color:#6b7280">PDF notunu yükle, admin onayından geçsin</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px">🔍 <strong>Keşfet</strong></td>
        <td style="padding:8px 0;font-size:14px;color:#6b7280">Üniversite ve derse göre filtrele</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px">💰 <strong>Kazan</strong></td>
        <td style="padding:8px 0;font-size:14px;color:#6b7280">Her görüntülenme ve indirme kazancına katkıda bulunur</td>
      </tr>
    </table>
    ${button('Platforma Git', BASE_URL)}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'UniNot\'a hoş geldin! 🎓',
    html,
  })
}
