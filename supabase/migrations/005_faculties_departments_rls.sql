-- ============================================================
-- 005 — faculties ve departments INSERT politikaları
-- Supabase SQL Editor'da çalıştır
-- (004_courses_rls.sql çalıştırıldıktan sonra)
-- ============================================================

-- faculties — authenticated kullanıcılar ekleyebilir
CREATE POLICY "Authenticated kullanıcılar fakülte ekleyebilir"
  ON faculties FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- departments — authenticated kullanıcılar ekleyebilir
CREATE POLICY "Authenticated kullanıcılar bölüm ekleyebilir"
  ON departments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
