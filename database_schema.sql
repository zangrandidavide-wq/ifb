-- =========================================
-- SCHEMA DEL DATABASE - GESTIONALE SPORTIVO
-- =========================================

-- 1. PROFILES: estensione della tabella auth.users di Supabase
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('presidente', 'allenatore', 'atleta')),
  full_name TEXT NOT NULL,
  recovery_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSES: sessioni e corsi gestiti dalla società
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENROLLMENTS: iscrizione degli atleti ai corsi
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, athlete_id)
);

-- 4. ATTENDANCE: registro presenze/assenze per le singole sessioni
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('presente', 'assente', 'da_definire')) DEFAULT 'da_definire',
  notified_at TIMESTAMPTZ, -- Registra il momento in cui l'atleta segnala l'assenza
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================
-- ABILITAZIONE ROW LEVEL SECURITY (RLS)
-- =========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ==========================
-- POLICY: PROFILES
-- ==========================
CREATE POLICY "Presidenti: full access profiles" ON profiles
FOR ALL USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'presidente' );

CREATE POLICY "Utenti: read own profile" ON profiles
FOR SELECT USING ( id = auth.uid() );

CREATE POLICY "Utenti: update own profile" ON profiles
FOR UPDATE USING ( id = auth.uid() );

-- ==========================
-- POLICY: COURSES
-- ==========================
CREATE POLICY "Presidenti: full access courses" ON courses
FOR ALL USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'presidente' );

CREATE POLICY "Allenatori: access own courses" ON courses
FOR ALL USING ( coach_id = auth.uid() );

CREATE POLICY "Atleti: read all courses" ON courses
FOR SELECT USING ( true );

-- ==========================
-- POLICY: ENROLLMENTS
-- ==========================
CREATE POLICY "Presidenti: full access enrollments" ON enrollments
FOR ALL USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'presidente' );

CREATE POLICY "Allenatori: read enrollments for own courses" ON enrollments
FOR SELECT USING (
  course_id IN (SELECT id FROM courses WHERE coach_id = auth.uid())
);

CREATE POLICY "Atleti: read own enrollments" ON enrollments
FOR SELECT USING ( athlete_id = auth.uid() );

-- ==========================
-- POLICY: ATTENDANCE
-- ==========================
CREATE POLICY "Presidenti: full access attendance" ON attendance
FOR ALL USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'presidente' );

CREATE POLICY "Allenatori: gestire presenze dei propri corsi" ON attendance
FOR ALL USING (
  enrollment_id IN (
    SELECT e.id FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE c.coach_id = auth.uid()
  )
);

CREATE POLICY "Atleti: segnare la propria assenza o leggere dati" ON attendance
FOR UPDATE USING (
  enrollment_id IN (SELECT id FROM enrollments WHERE athlete_id = auth.uid())
);

CREATE POLICY "Atleti: possono leggere presenze" ON attendance
FOR SELECT USING (
  enrollment_id IN (SELECT id FROM enrollments WHERE athlete_id = auth.uid())
);


-- =========================================
-- LOGICA DEL TOKEN DI RECUPERO (24H)
-- =========================================

-- Funzione eseguita dal Trigger
CREATE OR REPLACE FUNCTION handle_absence_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Reagisce solo se lo status viene impostato per la prima volta ad 'assente'
  IF NEW.status = 'assente' AND (OLD.status IS DISTINCT FROM 'assente') THEN
    
    -- Calcola se il preavviso all'allenamento è uguale o superiore a 24 ore.
    IF (NEW.session_date - COALESCE(NEW.notified_at, NOW())) >= INTERVAL '24 hours' THEN
      
      -- Aggiunge +1 token all'atleta iscritto allo specifico corso
      UPDATE profiles
      SET recovery_tokens = recovery_tokens + 1
      WHERE id = (
        SELECT athlete_id 
        FROM enrollments 
        WHERE id = NEW.enrollment_id
      );
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creazione del Trigger associato alla tabella attendance
CREATE TRIGGER trigger_absence_token
BEFORE UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION handle_absence_token();
