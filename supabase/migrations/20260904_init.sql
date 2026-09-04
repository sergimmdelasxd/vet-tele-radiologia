CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CLINIC', 'RADIOLOGIST', 'ADMIN')),
    clinic_name TEXT,
    crmv TEXT,
    cnpj TEXT,
    phone TEXT,
    uf TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    clinic_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    clinic_name TEXT NOT NULL,
    requesting_vet TEXT NOT NULL,
    clinic_phone TEXT,
    modality TEXT NOT NULL CHECK (modality IN ('RADIOGRAFIA', 'ULTRASSOM')),
    patient_name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    age TEXT,
    weight TEXT,
    gender TEXT CHECK (gender IN ('Macho', 'Fêmea')),
    is_castrated BOOLEAN DEFAULT FALSE,
    owner_name TEXT,
    region TEXT NOT NULL,
    projections TEXT[] DEFAULT '{}',
    clinical_history TEXT,
    suspected_diagnosis TEXT,
    priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'REPORTED', 'CANCELLED')),
    fasting_hours TEXT,
    trichotomy_done BOOLEAN,
    ultrasound_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deadline TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS exam_images (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    label TEXT,
    projection TEXT,
    thumbnail_url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    exam_id TEXT UNIQUE NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    radiologist_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    radiologist_name TEXT NOT NULL,
    radiologist_crmv TEXT NOT NULL,
    technique TEXT,
    findings TEXT,
    conclusion TEXT,
    recommendations TEXT,
    vhs_score TEXT,
    norberg_angle TEXT,
    ultrasound_organs TEXT[] DEFAULT '{}',
    key_image_ids TEXT[] DEFAULT '{}',
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    digital_signature_hash TEXT NOT NULL
);

INSERT INTO users (id, name, email, password, role, clinic_name, crmv, cnpj, phone, uf, created_at)
VALUES 
  ('user-clinic-vetlife', 'Dra. Mariana Souza (VetLife)', 'clinica@vetlife.com.br', '$2b$10$7zBqmZ8gH8YJzH1y0GfHw.NnScmfJ2j6D8t4Fq1k2l3m4n5o6p7q8', 'CLINIC', 'Clínica Veterinária VetLife 24h', 'CRMV-SP 33.120', '12.345.678/0001-90', '(11) 98765-4321', 'SP', NOW()),
  ('user-clinic-petcare', 'Dr. Lucas Silveira (PetCare)', 'contato@petcare24h.com.br', '$2b$10$7zBqmZ8gH8YJzH1y0GfHw.NnScmfJ2j6D8t4Fq1k2l3m4n5o6p7q8', 'CLINIC', 'Hospital Veterinário PetCare', 'CRMV-RJ 28.940', '98.765.432/0001-11', '(21) 99888-7766', 'RJ', NOW()),
  ('user-rad-camila', 'Dra. Camila Siqueira', 'radiologista@vetrad.com.br', '$2b$10$7zBqmZ8gH8YJzH1y0GfHw.NnScmfJ2j6D8t4Fq1k2l3m4n5o6p7q8', 'RADIOLOGIST', NULL, 'CRMV-SP 38.412', NULL, '(11) 97111-2233', 'SP', NOW()),
  ('user-admin-ricardo', 'Dr. Ricardo Valença', 'admin@vetrad.com.br', '$2b$10$mB5k4Cq5v2t1w9r8y7u6i.NnScmfJ2j6D8t4Fq1k2l3m4n5o6p7q8', 'ADMIN', NULL, 'CRMV-SP 21.050', NULL, '(11) 99999-0000', 'SP', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO exams (id, clinic_id, clinic_name, requesting_vet, clinic_phone, modality, patient_name, species, breed, age, weight, gender, is_castrated, owner_name, region, projections, clinical_history, suspected_diagnosis, priority, status, created_at, deadline)
VALUES 
  ('VET-2026-101', 'user-clinic-vetlife', 'Clínica Veterinária VetLife 24h', 'Dra. Mariana Souza - CRMV-SP 33.120', '(11) 98765-4321', 'RADIOGRAFIA', 'Thor', 'Canino', 'Golden Retriever', '4 anos', '32.5 kg', 'Macho', TRUE, 'Carlos Eduardo Mendes', 'Tórax (3 projeções)', ARRAY['Laterolateral Direita (LL-D)', 'Ventrodorsal (VD)'], 'Tosse seca há 5 dias e cansaço fácil.', 'Cardiopatia / Broncopatia alérgica', 'NORMAL', 'REPORTED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
  ('VET-2026-102', 'user-clinic-vetlife', 'Clínica Veterinária VetLife 24h', 'Dra. Mariana Souza - CRMV-SP 33.120', '(11) 98765-4321', 'RADIOGRAFIA', 'Bob', 'Canino', 'Bulldog Francês', '2 anos', '12.8 kg', 'Macho', FALSE, 'Juliana Paes Correia', 'Membro Torácico Direito', ARRAY['Mediolateral (ML)', 'Craniocaudal (CrCd)'], 'Queda do sofá há 1 hora. Claudicação intensa.', 'Fratura de rádio e ulna', 'URGENT', 'PENDING', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour'),
  ('VET-2026-103', 'user-clinic-petcare', 'Hospital Veterinário PetCare', 'Dr. Lucas Silveira - CRMV-RJ 28.940', '(21) 99888-7766', 'ULTRASSOM', 'Mel', 'Felino', 'Persa', '5 anos', '4.1 kg', 'Fêmea', TRUE, 'Fernanda Montenegro Lima', 'Ultrassonografia Abdominal Total', ARRAY['Fígado', 'Vesícula Biliar', 'Baço', 'Rins', 'Bexiga'], 'Poliúria, polidipsia e perda ponderal.', 'Doença Renal Crônica (DRC)', 'NORMAL', 'REPORTED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_images (id, exam_id, url, label, projection)
VALUES
  ('img-101-1', 'VET-2026-101', '/xrays/canine-thorax-lateral.svg', 'Tórax - Projeção Laterolateral Direita', 'LL-D'),
  ('img-101-2', 'VET-2026-101', '/xrays/canine-thorax-vd.svg', 'Tórax - Projeção Ventrodorsal', 'VD'),
  ('img-102-1', 'VET-2026-102', '/xrays/canine-limb-fracture.svg', 'Membro Torácico - Projeção Mediolateral', 'ML'),
  ('img-103-1', 'VET-2026-103', '/ultrasound/usg-abdominal-liver-kidney.svg', 'USG - Rim Direito e Parênquima Hepático', 'Rim D / Fígado')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, exam_id, radiologist_id, radiologist_name, radiologist_crmv, technique, findings, conclusion, recommendations, vhs_score, digital_signature_hash)
VALUES 
  ('rep-101', 'VET-2026-101', 'user-rad-camila', 'Dra. Camila Siqueira', 'CRMV-SP 38.412', 'Estudo radiográfico do tórax em projeções ortogonais LL-D e VD.', 'Campos pulmonares com radiopacidade preservada. Silhueta cardíaca dentro dos padrões anatômicos.', 'Estudo radiográfico do tórax dentro dos padrões de normalidade radiográfica.', 'Correlação com ausculta e pesquisa de vias aéreas superiores.', '9.6 v', 'VET-SHA256-a78b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b')
ON CONFLICT (id) DO NOTHING;
