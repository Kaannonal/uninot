-- ============================================================
-- 006 — reviews tablosu RLS politikaları + unique constraint
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- Herkes yorumları okuyabilir
CREATE POLICY "Herkes yorumları görebilir"
  ON reviews FOR SELECT
  USING (true);

-- Giriş yapmış kullanıcılar kendi yorumlarını ekleyebilir
CREATE POLICY "Kullanıcı yorum ekleyebilir"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi yorumlarını güncelleyebilir (puanı değiştirme)
CREATE POLICY "Kullanıcı kendi yorumunu güncelleyebilir"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi yorumlarını silebilir
CREATE POLICY "Kullanıcı kendi yorumunu silebilir"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Not başına kullanıcı başına tek yorum — upsert için gerekli
ALTER TABLE reviews ADD CONSTRAINT reviews_note_user_unique UNIQUE (note_id, user_id);
