-- ============================================================
-- TEST VERİSİ — Supabase SQL Editor'da çalıştır
-- ============================================================

-- Üniversiteler
INSERT INTO universities (id, name, city, slug) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Çankaya Üniversitesi',  'Ankara', 'cankaya'),
  ('11111111-0000-0000-0000-000000000002', 'Atılım Üniversitesi',   'Ankara', 'atilim'),
  ('11111111-0000-0000-0000-000000000003', 'Bilkent Üniversitesi',  'Ankara', 'bilkent');

-- Fakülteler
INSERT INTO faculties (id, university_id, name) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Mühendislik Fakültesi'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Mühendislik Fakültesi'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', 'Mühendislik Fakültesi');

-- Bölümler
INSERT INTO departments (id, faculty_id, name, code) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Bilgisayar Mühendisliği', 'CMPE'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Bilgisayar Mühendisliği', 'CMPE'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'Bilgisayar Mühendisliği', 'CS');

-- Dersler — Çankaya CMPE
INSERT INTO courses (id, department_id, code, name, language) VALUES
  ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'CMPE101', 'Programlamaya Giriş',   'tr'),
  ('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'CMPE201', 'Veri Yapıları',         'tr'),
  ('44444444-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000001', 'CMPE301', 'İşletim Sistemleri',   'tr');

-- Dersler — Atılım CMPE
INSERT INTO courses (id, department_id, code, name, language) VALUES
  ('44444444-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000002', 'SE101',  'Yazılım Mühendisliğine Giriş', 'tr'),
  ('44444444-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000002', 'SE201',  'Nesne Yönelimli Programlama',  'tr'),
  ('44444444-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000002', 'SE301',  'Yazılım Mimarisi',             'tr');

-- Dersler — Bilkent CS
INSERT INTO courses (id, department_id, code, name, language) VALUES
  ('44444444-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000003', 'CS101', 'Introduction to Programming', 'en'),
  ('44444444-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000003', 'CS201', 'Algorithms',                 'en'),
  ('44444444-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000003', 'CS315', 'Database Systems',           'en');
