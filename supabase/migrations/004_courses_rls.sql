-- ============================================================
-- 004 — courses tablosuna RLS + politikalar
-- Supabase SQL Editor'da çalıştır
-- ============================================================

-- RLS'yi etkinleştir
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Herkes dersleri okuyabilir (not sayfaları için gerekli)
CREATE POLICY "Herkes dersleri görebilir"
  ON courses FOR SELECT
  USING (true);

-- Giriş yapmış kullanıcılar yeni ders ekleyebilir
CREATE POLICY "Authenticated kullanıcılar ders ekleyebilir"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- universities, faculties, departments tabloları da public read olmalı
-- (Cascade dropdown'lar için — RLS kapalıysa zaten okunur, kapalıysa aşağıdakiler gerekir)
ALTER TABLE universities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties     ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes üniversiteleri görebilir"
  ON universities FOR SELECT USING (true);

CREATE POLICY "Herkes fakülteleri görebilir"
  ON faculties FOR SELECT USING (true);

CREATE POLICY "Herkes bölümleri görebilir"
  ON departments FOR SELECT USING (true);
