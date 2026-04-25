-- ============================================================
-- 003 — Üniversite, Fakülte, Bölüm ve Ders Genişletilmiş Seed
-- ON CONFLICT DO NOTHING / WHERE NOT EXISTS ile idempotent
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ÜNİVERSİTELER
-- (Bilkent, Çankaya, Atılım 002'de eklendi — slug conflict'te atlanır)
-- ============================================================
INSERT INTO universities (name, city, slug) VALUES
  ('ODTÜ',                                   'Ankara',   'odtu'),
  ('Boğaziçi Üniversitesi',                  'İstanbul', 'bogazici'),
  ('İTÜ',                                    'İstanbul', 'itu'),
  ('Hacettepe Üniversitesi',                 'Ankara',   'hacettepe'),
  ('Ankara Üniversitesi',                    'Ankara',   'ankara'),
  ('Gazi Üniversitesi',                      'Ankara',   'gazi'),
  ('TED Üniversitesi',                       'Ankara',   'ted'),
  ('Başkent Üniversitesi',                   'Ankara',   'baskent'),
  ('Ankara Yıldırım Beyazıt Üniversitesi',   'Ankara',   'yildirim-beyazit')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. FAKÜLTELER
-- ============================================================

-- Mühendislik, Fen Edebiyat, İİBF — tüm yeni üniversiteler
INSERT INTO faculties (university_id, name)
SELECT u.id, f.name
FROM universities u
CROSS JOIN (VALUES
  ('Mühendislik Fakültesi'),
  ('Fen Edebiyat Fakültesi'),
  ('İktisadi ve İdari Bilimler Fakültesi')
) AS f(name)
WHERE u.slug IN (
  'odtu','bogazici','itu','hacettepe','ankara','gazi','ted','baskent','yildirim-beyazit'
)
AND NOT EXISTS (
  SELECT 1 FROM faculties ef
  WHERE ef.university_id = u.id AND ef.name = f.name
);

-- Tıp Fakültesi — yalnızca ilgili üniversiteler
INSERT INTO faculties (university_id, name)
SELECT u.id, 'Tıp Fakültesi'
FROM universities u
WHERE u.slug IN ('hacettepe','ankara','gazi','baskent','yildirim-beyazit')
AND NOT EXISTS (
  SELECT 1 FROM faculties ef
  WHERE ef.university_id = u.id AND ef.name = 'Tıp Fakültesi'
);

-- ============================================================
-- 3. BÖLÜMLER
-- ============================================================

-- Mühendislik Fakültesi
INSERT INTO departments (faculty_id, name, code)
SELECT f.id, d.name, d.code
FROM faculties f
JOIN universities u ON f.university_id = u.id
CROSS JOIN (VALUES
  ('Bilgisayar Mühendisliği',          'CENG'),
  ('Elektrik-Elektronik Mühendisliği', 'EEE'),
  ('Endüstri Mühendisliği',            'IE'),
  ('Makine Mühendisliği',              'ME'),
  ('İnşaat Mühendisliği',              'CE')
) AS d(name, code)
WHERE f.name = 'Mühendislik Fakültesi'
AND u.slug IN (
  'odtu','bogazici','itu','hacettepe','ankara','gazi','ted','baskent','yildirim-beyazit'
)
AND NOT EXISTS (
  SELECT 1 FROM departments ed
  WHERE ed.faculty_id = f.id AND ed.name = d.name
);

-- Fen Edebiyat Fakültesi
INSERT INTO departments (faculty_id, name, code)
SELECT f.id, d.name, d.code
FROM faculties f
JOIN universities u ON f.university_id = u.id
CROSS JOIN (VALUES
  ('Matematik', 'MAT'),
  ('Fizik',     'FIZ'),
  ('Kimya',     'KIM'),
  ('Psikoloji', 'PSI')
) AS d(name, code)
WHERE f.name = 'Fen Edebiyat Fakültesi'
AND u.slug IN (
  'odtu','bogazici','itu','hacettepe','ankara','gazi','ted','baskent','yildirim-beyazit'
)
AND NOT EXISTS (
  SELECT 1 FROM departments ed
  WHERE ed.faculty_id = f.id AND ed.name = d.name
);

-- İktisadi ve İdari Bilimler Fakültesi
INSERT INTO departments (faculty_id, name, code)
SELECT f.id, d.name, d.code
FROM faculties f
JOIN universities u ON f.university_id = u.id
CROSS JOIN (VALUES
  ('İşletme',               'ISL'),
  ('İktisat',               'IKT'),
  ('Uluslararası İlişkiler','UIL')
) AS d(name, code)
WHERE f.name = 'İktisadi ve İdari Bilimler Fakültesi'
AND u.slug IN (
  'odtu','bogazici','itu','hacettepe','ankara','gazi','ted','baskent','yildirim-beyazit'
)
AND NOT EXISTS (
  SELECT 1 FROM departments ed
  WHERE ed.faculty_id = f.id AND ed.name = d.name
);

-- ============================================================
-- 4. DERSLER
-- ============================================================

-- Bilgisayar Mühendisliği
INSERT INTO courses (department_id, code, name, language)
SELECT d.id, c.code, c.name, 'tr'
FROM departments d
JOIN faculties f ON d.faculty_id = f.id
CROSS JOIN (VALUES
  ('CENG201', 'Nesne Yönelimli Programlama'),
  ('CENG301', 'Veri Yapıları ve Algoritmalar'),
  ('CENG302', 'İşletim Sistemleri'),
  ('CENG303', 'Bilgisayar Ağları'),
  ('CENG401', 'Veritabanı Sistemleri'),
  ('CENG402', 'Yazılım Mühendisliği'),
  ('CENG451', 'Yapay Zeka'),
  ('CENG452', 'Makine Öğrenmesi'),
  ('MATH251', 'Diferansiyel Denklemler'),
  ('MATH252', 'Lineer Cebir')
) AS c(code, name)
WHERE d.name = 'Bilgisayar Mühendisliği'
AND f.name = 'Mühendislik Fakültesi'
AND NOT EXISTS (
  SELECT 1 FROM courses ec
  WHERE ec.department_id = d.id AND ec.name = c.name
);

-- Elektrik-Elektronik Mühendisliği
INSERT INTO courses (department_id, code, name, language)
SELECT d.id, c.code, c.name, 'tr'
FROM departments d
JOIN faculties f ON d.faculty_id = f.id
CROSS JOIN (VALUES
  ('EEE201', 'Devre Analizi'),
  ('EEE301', 'Elektronik I'),
  ('EEE302', 'Elektromanyetik Alan Teorisi'),
  ('EEE303', 'Sinyal ve Sistemler'),
  ('EEE401', 'Mikrodenetleyiciler'),
  ('EEE402', 'Haberleşme Sistemleri')
) AS c(code, name)
WHERE d.name = 'Elektrik-Elektronik Mühendisliği'
AND f.name = 'Mühendislik Fakültesi'
AND NOT EXISTS (
  SELECT 1 FROM courses ec
  WHERE ec.department_id = d.id AND ec.name = c.name
);

-- Endüstri Mühendisliği
INSERT INTO courses (department_id, code, name, language)
SELECT d.id, c.code, c.name, 'tr'
FROM departments d
JOIN faculties f ON d.faculty_id = f.id
CROSS JOIN (VALUES
  ('IE201', 'İstatistik'),
  ('IE301', 'Yöneylem Araştırması'),
  ('IE302', 'Üretim Planlama'),
  ('IE401', 'Simülasyon'),
  ('IE402', 'Tesis Tasarımı')
) AS c(code, name)
WHERE d.name = 'Endüstri Mühendisliği'
AND f.name = 'Mühendislik Fakültesi'
AND NOT EXISTS (
  SELECT 1 FROM courses ec
  WHERE ec.department_id = d.id AND ec.name = c.name
);

-- Makine Mühendisliği
INSERT INTO courses (department_id, code, name, language)
SELECT d.id, c.code, c.name, 'tr'
FROM departments d
JOIN faculties f ON d.faculty_id = f.id
CROSS JOIN (VALUES
  ('ME201', 'Dinamik'),
  ('ME301', 'Termodinamik'),
  ('ME302', 'Akışkanlar Mekaniği'),
  ('ME303', 'Mukavemet'),
  ('ME401', 'Isı Transferi')
) AS c(code, name)
WHERE d.name = 'Makine Mühendisliği'
AND f.name = 'Mühendislik Fakültesi'
AND NOT EXISTS (
  SELECT 1 FROM courses ec
  WHERE ec.department_id = d.id AND ec.name = c.name
);

-- İşletme
INSERT INTO courses (department_id, code, name, language)
SELECT d.id, c.code, c.name, 'tr'
FROM departments d
JOIN faculties f ON d.faculty_id = f.id
CROSS JOIN (VALUES
  ('ISL201', 'Muhasebe'),
  ('ISL301', 'Finansman'),
  ('ISL302', 'Pazarlama'),
  ('ISL401', 'Stratejik Yönetim'),
  ('ISL402', 'İnsan Kaynakları Yönetimi')
) AS c(code, name)
WHERE d.name = 'İşletme'
AND f.name = 'İktisadi ve İdari Bilimler Fakültesi'
AND NOT EXISTS (
  SELECT 1 FROM courses ec
  WHERE ec.department_id = d.id AND ec.name = c.name
);

-- İktisat
INSERT INTO courses (department_id, code, name, language)
SELECT d.id, c.code, c.name, 'tr'
FROM departments d
JOIN faculties f ON d.faculty_id = f.id
CROSS JOIN (VALUES
  ('IKT201', 'Mikroekonomi'),
  ('IKT202', 'Makroekonomi'),
  ('IKT301', 'Ekonometri'),
  ('IKT302', 'Para ve Banka')
) AS c(code, name)
WHERE d.name = 'İktisat'
AND f.name = 'İktisadi ve İdari Bilimler Fakültesi'
AND NOT EXISTS (
  SELECT 1 FROM courses ec
  WHERE ec.department_id = d.id AND ec.name = c.name
);

-- Matematik
INSERT INTO courses (department_id, code, name, language)
SELECT d.id, c.code, c.name, 'tr'
FROM departments d
JOIN faculties f ON d.faculty_id = f.id
CROSS JOIN (VALUES
  ('MAT101', 'Analiz I'),
  ('MAT102', 'Analiz II'),
  ('MAT201', 'Lineer Cebir'),
  ('MAT202', 'Diferansiyel Denklemler'),
  ('MAT301', 'Sayısal Analiz')
) AS c(code, name)
WHERE d.name = 'Matematik'
AND f.name = 'Fen Edebiyat Fakültesi'
AND NOT EXISTS (
  SELECT 1 FROM courses ec
  WHERE ec.department_id = d.id AND ec.name = c.name
);
