-- =============================================================================
--   LPU PLACEMENT PORTAL — COMPLETE SEED DATA
-- =============================================================================
-- Just paste this into Supabase SQL Editor → Run. That's it.
-- =============================================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add missing columns to users table (safe to run even if they exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN
        ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
        ALTER TABLE users ADD COLUMN full_name TEXT;
    END IF;
END $$;


-- =============================================================================
-- USERS (email + password login — all passwords are bcrypt hashed)
-- =============================================================================
-- ┌───────────────────────┬────────────────┬──────────┐
-- │ Email                 │ Password       │ Role     │
-- ├───────────────────────┼────────────────┼──────────┤
-- │ japjot@lpu.in         │ japjot123      │ student  │
-- │ aarav@lpu.in          │ aarav123       │ student  │
-- │ priya@lpu.in          │ priya123       │ student  │
-- │ rohit@lpu.in          │ rohit123       │ student  │
-- │ sneha@lpu.in          │ sneha123       │ student  │
-- │ arjun@lpu.in          │ arjun123       │ student  │
-- │ kavya@lpu.in          │ kavya123       │ student  │
-- │ ananya@lpu.in         │ ananya123      │ student  │
-- │ admin@lpu.in          │ admin123       │ admin    │
-- │ tpc@lpu.in            │ tpc123         │ tpc      │
-- │ faculty@lpu.in        │ faculty123     │ faculty  │
-- │ sam@gmail.com         │ sam123         │ admin    │
-- └───────────────────────┴────────────────┴──────────┘

INSERT INTO users (id, email, password_hash, full_name, role) VALUES
('a0000001-0000-0000-0000-000000000001', 'japjot@lpu.in',   crypt('japjot123',  gen_salt('bf')), 'Japjot Singh Bhatia',     'student'),
('a0000001-0000-0000-0000-000000000002', 'aarav@lpu.in',    crypt('aarav123',   gen_salt('bf')), 'Aarav Sharma',             'student'),
('a0000001-0000-0000-0000-000000000003', 'priya@lpu.in',    crypt('priya123',   gen_salt('bf')), 'Priya Gupta',              'student'),
('a0000001-0000-0000-0000-000000000004', 'rohit@lpu.in',    crypt('rohit123',   gen_salt('bf')), 'Rohit Verma',              'student'),
('a0000001-0000-0000-0000-000000000005', 'sneha@lpu.in',    crypt('sneha123',   gen_salt('bf')), 'Sneha Reddy',              'student'),
('a0000001-0000-0000-0000-000000000006', 'arjun@lpu.in',    crypt('arjun123',   gen_salt('bf')), 'Arjun Patel',              'student'),
('a0000001-0000-0000-0000-000000000007', 'kavya@lpu.in',    crypt('kavya123',   gen_salt('bf')), 'Kavya Nair',               'student'),
('a0000001-0000-0000-0000-000000000008', 'ananya@lpu.in',   crypt('ananya123',  gen_salt('bf')), 'Ananya Iyer',              'student'),
('a0000001-0000-0000-0000-000000000009', 'admin@lpu.in',    crypt('admin123',   gen_salt('bf')), 'Dr. Ramesh Kumar',         'admin'),
('a0000001-0000-0000-0000-00000000000a', 'tpc@lpu.in',      crypt('tpc123',     gen_salt('bf')), 'Prof. Sunil Mehta',        'tpc'),
('a0000001-0000-0000-0000-00000000000b', 'faculty@lpu.in',  crypt('faculty123', gen_salt('bf')), 'Dr. Neha Singh',           'faculty'),
('a0000001-0000-0000-0000-00000000000c', 'sam@gmail.com',   crypt('sam123',     gen_salt('bf')), 'Sam (Super Admin)',        'admin');


-- =============================================================================
-- STUDENTS (linked to user accounts above)
-- =============================================================================

INSERT INTO students (student_id, user_id, reg_no, full_name, program, stream, batch_start_year, batch_end_year, cgpa, backlog_count, status) VALUES
(10001, 'a0000001-0000-0000-0000-000000000001', '12200001', 'Japjot Singh Bhatia', 'B.Tech', 'CSE', 2022, 2026, 8.75, 0, 'active'),
(10002, 'a0000001-0000-0000-0000-000000000002', '12200002', 'Aarav Sharma',         'B.Tech', 'CSE', 2022, 2026, 9.10, 0, 'active'),
(10003, 'a0000001-0000-0000-0000-000000000003', '12200003', 'Priya Gupta',          'B.Tech', 'ECE', 2022, 2026, 8.40, 1, 'active'),
(10004, 'a0000001-0000-0000-0000-000000000004', '12200004', 'Rohit Verma',          'B.Tech', 'ME',  2022, 2026, 7.85, 0, 'active'),
(10005, 'a0000001-0000-0000-0000-000000000005', '12200005', 'Sneha Reddy',          'B.Tech', 'IT',  2022, 2026, 9.25, 0, 'active'),
(10006, 'a0000001-0000-0000-0000-000000000006', '12200006', 'Arjun Patel',          'B.Tech', 'CSE', 2022, 2026, 8.90, 0, 'active'),
(10007, 'a0000001-0000-0000-0000-000000000007', '12200007', 'Kavya Nair',           'B.Tech', 'IT',  2022, 2026, 8.60, 0, 'active'),
(10008, 'a0000001-0000-0000-0000-000000000008', '12200008', 'Ananya Iyer',          'B.Tech', 'CSE', 2022, 2026, 9.40, 0, 'active');


-- =============================================================================
-- STUDENT CONTACTS
-- =============================================================================

INSERT INTO student_contacts (student_id, email, mobile, whatsapp, linkedin_url, microsoft_id) VALUES
(10001, 'japjot.bhatia@lpu.in',  '9876543210', '9876543210', 'https://linkedin.com/in/japjotbhatia',  'japjot.bhatia@lpu.in'),
(10002, 'aarav.sharma@lpu.in',   '9876543211', '9876543211', 'https://linkedin.com/in/aaravsharma',   'aarav.sharma@lpu.in'),
(10003, 'priya.gupta@lpu.in',    '9876543212', '9876543212', 'https://linkedin.com/in/priyagupta',    'priya.gupta@lpu.in'),
(10004, 'rohit.verma@lpu.in',    '9876543213', '9876543213', 'https://linkedin.com/in/rohitverma',    'rohit.verma@lpu.in'),
(10005, 'sneha.reddy@lpu.in',    '9876543214', '9876543214', 'https://linkedin.com/in/snehareddy',    'sneha.reddy@lpu.in'),
(10006, 'arjun.patel@lpu.in',    '9876543215', '9876543215', 'https://linkedin.com/in/arjunpatel',    'arjun.patel@lpu.in'),
(10007, 'kavya.nair@lpu.in',     '9876543216', '9876543216', 'https://linkedin.com/in/kavyanair',     'kavya.nair@lpu.in'),
(10008, 'ananya.iyer@lpu.in',    '9876543218', '9876543218', 'https://linkedin.com/in/ananyaiyer',    'ananya.iyer@lpu.in');


-- =============================================================================
-- STUDENT FAMILY
-- =============================================================================

INSERT INTO student_family (student_id, relation, name, age, designation, employer, contact_no, email) VALUES
(10001, 'Father', 'Harpreet Singh Bhatia', 52, 'Business Owner',  'Self-Employed',        '9800000001', 'harpreet.bhatia@gmail.com'),
(10001, 'Mother', 'Gurleen Kaur Bhatia',   48, 'Teacher',         'DAV School Jalandhar',  '9800000002', 'gurleen.bhatia@gmail.com'),
(10002, 'Father', 'Rajesh Sharma',         55, 'Bank Manager',    'SBI',                   '9800000003', 'rajesh.sharma@sbi.co.in'),
(10003, 'Father', 'Suresh Gupta',          50, 'Senior Engineer', 'BHEL Haridwar',         '9800000005', 'suresh.gupta@bhel.in'),
(10004, 'Father', 'Manoj Verma',           54, 'Professor',       'NIT Jalandhar',         '9800000006', 'manoj.verma@nitj.ac.in'),
(10005, 'Father', 'Venkat Reddy',          51, 'Director',        'Infosys Hyderabad',     '9800000007', 'venkat.reddy@infosys.com'),
(10006, 'Father', 'Dinesh Patel',          49, 'Chartered Acct',  'Self-Employed',         '9800000008', 'dinesh.patel@gmail.com');


-- =============================================================================
-- STUDENT SKILLS
-- =============================================================================

INSERT INTO student_skills (student_id, skill_name, skill_level, experience_years, certification, projects, status) VALUES
-- Japjot (hero user — AI/ML + Full Stack)
(10001, 'Python',           'Advanced',     3.0, 'Google Python Certificate',   'AI Agent, OCR Engine, Video Gen',    'approved'),
(10001, 'React / Next.js',  'Advanced',     2.5, NULL,                          'PMIS, LMS, Placement Portal',        'approved'),
(10001, 'FastAPI',          'Advanced',     2.0, NULL,                          'Placement Portal, HRMS Backend',     'approved'),
(10001, 'Machine Learning', 'Intermediate', 1.5, 'Coursera ML Specialization',  'Seat Allocation Model',              'approved'),
(10001, 'PostgreSQL',       'Intermediate', 2.0, NULL,                          'Full-stack projects',                'approved'),
(10001, 'Supabase',         'Intermediate', 1.5, NULL,                          'Auth, Storage, RLS',                 'approved'),
(10001, 'Docker',           'Intermediate', 1.0, NULL,                          'Containerized deploys',              'pending'),
-- Aarav
(10002, 'Java',             'Advanced',     3.0, 'Oracle Certified',            'Spring Boot APIs',                   'approved'),
(10002, 'Spring Boot',      'Advanced',     2.5, NULL,                          'E-commerce backend',                 'approved'),
(10002, 'AWS',              'Intermediate', 1.5, 'AWS SA Associate',            'Cloud deployments',                  'approved'),
-- Priya
(10003, 'C/C++',            'Advanced',     3.0, NULL,                          'Embedded systems, RTOS',             'approved'),
(10003, 'MATLAB',           'Intermediate', 2.0, NULL,                          'Signal processing',                  'approved'),
-- Rohit
(10004, 'AutoCAD',          'Advanced',     3.0, 'Autodesk Certified',          'Machine designs',                    'approved'),
(10004, 'SolidWorks',       'Advanced',     2.5, 'CSWA Certified',              '3D modelling',                      'approved'),
-- Sneha
(10005, 'JavaScript',       'Advanced',     3.0, NULL,                          'Full-stack web apps',                'approved'),
(10005, 'Node.js',          'Advanced',     2.5, NULL,                          'REST + GraphQL APIs',                'approved'),
(10005, 'React.js',         'Advanced',     2.5, NULL,                          'Dashboards, E-commerce',             'approved'),
-- Arjun
(10006, 'Python',           'Advanced',     3.0, 'IBM Data Science',            'ML pipelines',                       'approved'),
(10006, 'TensorFlow',       'Intermediate', 1.5, 'TF Developer Cert',           'Image classification',              'approved'),
-- Ananya
(10008, 'C++',              'Advanced',     4.0, NULL,                          'ICPC, CodeForces 1800+',             'approved'),
(10008, 'Python',           'Advanced',     2.5, NULL,                          'Backend, scripting',                 'approved'),
(10008, 'Go',               'Intermediate', 1.0, NULL,                          'Microservices',                      'pending');


-- =============================================================================
-- STUDENT PREFERENCES
-- =============================================================================

INSERT INTO student_preferences (student_id, job_locations, employment_types, job_profiles) VALUES
(10001, ARRAY['Bangalore','Hyderabad','Remote'],   ARRAY['Full-Time','Internship'],  ARRAY['AI/ML Engineer','Full Stack Developer','Backend Developer']),
(10002, ARRAY['Bangalore','Pune','Chennai'],        ARRAY['Full-Time'],               ARRAY['Java Developer','Cloud Engineer']),
(10003, ARRAY['Bangalore','Delhi','Chandigarh'],    ARRAY['Full-Time','Internship'],  ARRAY['Embedded Engineer','VLSI Designer']),
(10004, ARRAY['Pune','Mumbai','Delhi'],             ARRAY['Full-Time'],               ARRAY['Design Engineer','CAD Specialist']),
(10005, ARRAY['Bangalore','Hyderabad','Remote'],    ARRAY['Full-Time','Internship'],  ARRAY['Full Stack Developer','DevOps Engineer']),
(10006, ARRAY['Bangalore','Hyderabad','Mumbai'],    ARRAY['Full-Time'],               ARRAY['Data Scientist','ML Engineer']),
(10008, ARRAY['Bangalore','Remote'],                ARRAY['Full-Time'],               ARRAY['SDE','Backend Developer']);


-- =============================================================================
-- PLACEMENT PROFILES
-- =============================================================================

INSERT INTO placement_profiles (student_id, policy_accepted, registration_date, opportunity_start, placement_status, pep_fee_paid, pep_fee_status) VALUES
(10001, TRUE,  '2025-08-15 10:00:00+05:30', '2025-09-01', 'active', 5000, 'paid'),
(10002, TRUE,  '2025-08-15 10:30:00+05:30', '2025-09-01', 'active', 5000, 'paid'),
(10003, TRUE,  '2025-08-16 11:00:00+05:30', '2025-09-01', 'active', 5000, 'paid'),
(10004, TRUE,  '2025-08-16 12:00:00+05:30', '2025-09-01', 'active', 5000, 'paid'),
(10005, TRUE,  '2025-08-17 09:00:00+05:30', '2025-09-01', 'active', 5000, 'paid'),
(10006, TRUE,  '2025-08-17 09:30:00+05:30', '2025-09-01', 'active', 5000, 'paid'),
(10007, TRUE,  '2025-08-18 10:00:00+05:30', '2025-09-01', 'active', 5000, 'paid'),
(10008, TRUE,  '2025-08-18 11:00:00+05:30', '2025-09-01', 'active', 5000, 'paid');


-- =============================================================================
-- PLACEMENT DRIVES
-- =============================================================================

INSERT INTO placement_drives (drive_code, company_name, drive_type, drive_date, venue, streams_eligible, registration_deadline, status) VALUES
('TCS-2026-01',  'Tata Consultancy Services',  'On-campus',  '2026-01-15', 'LPU Uni Hall — Block 34',           'CSE, IT, ECE',       '2026-01-10 23:59:00+05:30', 'closed'),
('INF-2026-01',  'Infosys',                    'On-campus',  '2026-01-22', 'LPU Uni Hall — Block 34',           'CSE, IT, ECE, ME',   '2026-01-18 23:59:00+05:30', 'closed'),
('WPR-2026-01',  'Wipro',                      'On-campus',  '2026-02-05', 'LPU Uni Hall — Block 36',           'CSE, IT, ECE',       '2026-02-01 23:59:00+05:30', 'closed'),
('ACC-2026-01',  'Accenture',                  'On-campus',  '2026-02-12', 'LPU C-Block Seminar Hall',          'CSE, IT, ECE, ME',   '2026-02-08 23:59:00+05:30', 'closed'),
('AMZ-2026-01',  'Amazon',                     'On-campus',  '2026-02-20', 'LPU Shanti Devi Mittal Auditorium', 'CSE, IT',            '2026-02-15 23:59:00+05:30', 'open'),
('GOO-2026-01',  'Google',                     'Virtual',    '2026-03-05', 'Online (Google Meet)',               'CSE',                '2026-02-28 23:59:00+05:30', 'open'),
('MIC-2026-01',  'Microsoft',                  'On-campus',  '2026-03-10', 'LPU Shanti Devi Mittal Auditorium', 'CSE, IT',            '2026-03-05 23:59:00+05:30', 'open'),
('DEL-2026-01',  'Deloitte',                   'On-campus',  '2026-03-18', 'LPU Uni Hall — Block 34',           'CSE, IT, ECE, ME',   '2026-03-14 23:59:00+05:30', 'open'),
('FLI-2026-01',  'Flipkart',                   'On-campus',  '2026-03-22', 'LPU Shanti Devi Mittal Auditorium', 'CSE, IT',            '2026-03-18 23:59:00+05:30', 'open'),
('COG-2026-01',  'Cognizant',                  'On-campus',  '2026-02-25', 'LPU Uni Hall — Block 36',           'CSE, IT',            '2026-02-20 23:59:00+05:30', 'open'),
('LNT-2026-01', 'Larsen & Toubro',             'On-campus',  '2026-02-28', 'LPU Uni Hall — Block 34',           'ME, CE, ECE',        '2026-02-24 23:59:00+05:30', 'open'),
('ZOM-2026-01',  'Zomato',                     'Virtual',    '2026-03-28', 'Online (Zoom)',                      'CSE, IT',            '2026-03-25 23:59:00+05:30', 'open'),
('HAL-2026-01', 'Hindustan Aeronautics',        'Pool',       '2026-04-05', 'PEC Chandigarh',                    'ME, ECE',            '2026-04-01 23:59:00+05:30', 'open'),
('BYJ-2026-01', 'BYJU''S',                     'Virtual',    '2026-04-10', 'Online (MS Teams)',                  'CSE, IT, ECE, ME',   '2026-04-06 23:59:00+05:30', 'open');


-- =============================================================================
-- DRIVE ROUNDS
-- =============================================================================

INSERT INTO drive_rounds (drive_id, round_name, round_order) VALUES
((SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), 'Online Aptitude Test',     1),
((SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), 'Technical Interview',      2),
((SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), 'HR Interview',             3),
((SELECT drive_id FROM placement_drives WHERE drive_code='INF-2026-01'), 'InfyTQ Online Test',       1),
((SELECT drive_id FROM placement_drives WHERE drive_code='INF-2026-01'), 'Coding Challenge',         2),
((SELECT drive_id FROM placement_drives WHERE drive_code='INF-2026-01'), 'Technical + HR',           3),
((SELECT drive_id FROM placement_drives WHERE drive_code='WPR-2026-01'), 'Wipro NLTH Assessment',    1),
((SELECT drive_id FROM placement_drives WHERE drive_code='WPR-2026-01'), 'Business Discussion',      2),
((SELECT drive_id FROM placement_drives WHERE drive_code='ACC-2026-01'), 'Cognitive + Technical',    1),
((SELECT drive_id FROM placement_drives WHERE drive_code='ACC-2026-01'), 'Coding Assessment',        2),
((SELECT drive_id FROM placement_drives WHERE drive_code='ACC-2026-01'), 'Communication Round',      3),
((SELECT drive_id FROM placement_drives WHERE drive_code='AMZ-2026-01'), 'Online Assessment',        1),
((SELECT drive_id FROM placement_drives WHERE drive_code='AMZ-2026-01'), 'DSA Round 1',              2),
((SELECT drive_id FROM placement_drives WHERE drive_code='AMZ-2026-01'), 'DSA Round 2',              3),
((SELECT drive_id FROM placement_drives WHERE drive_code='AMZ-2026-01'), 'Bar Raiser',               4),
((SELECT drive_id FROM placement_drives WHERE drive_code='GOO-2026-01'), 'Online Coding',            1),
((SELECT drive_id FROM placement_drives WHERE drive_code='GOO-2026-01'), 'Phone Screen',             2),
((SELECT drive_id FROM placement_drives WHERE drive_code='GOO-2026-01'), 'Virtual Onsite',           3),
((SELECT drive_id FROM placement_drives WHERE drive_code='MIC-2026-01'), 'Online Assessment',        1),
((SELECT drive_id FROM placement_drives WHERE drive_code='MIC-2026-01'), 'Group Fly Round',          2),
((SELECT drive_id FROM placement_drives WHERE drive_code='MIC-2026-01'), 'Technical Interview 1',    3),
((SELECT drive_id FROM placement_drives WHERE drive_code='MIC-2026-01'), 'Technical Interview 2',    4),
((SELECT drive_id FROM placement_drives WHERE drive_code='MIC-2026-01'), 'HR Interview',             5);


-- =============================================================================
-- STUDENT ↔ DRIVE REGISTRATIONS (Japjot = hero with most activity)
-- =============================================================================

-- TCS (closed) — Japjot selected + accepted
INSERT INTO student_drive_map (student_id, drive_id, is_eligible, registered, participated, selected, offer_status, drive_status) VALUES
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), TRUE, TRUE, TRUE, TRUE,  'accepted', 'Offer Accepted'),
(10002, (SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), TRUE, TRUE, TRUE, TRUE,  'rejected', 'Offer Declined'),
(10005, (SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), TRUE, TRUE, TRUE, FALSE, 'pending',  'Eliminated Round 2'),
(10008, (SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), TRUE, TRUE, TRUE, TRUE,  'accepted', 'Offer Accepted');

-- Infosys (closed)
INSERT INTO student_drive_map (student_id, drive_id, is_eligible, registered, participated, selected, offer_status, drive_status) VALUES
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='INF-2026-01'), TRUE, TRUE, TRUE,  FALSE, 'pending',  'Eliminated Round 2'),
(10002, (SELECT drive_id FROM placement_drives WHERE drive_code='INF-2026-01'), TRUE, TRUE, TRUE,  TRUE,  'accepted', 'Offer Accepted'),
(10005, (SELECT drive_id FROM placement_drives WHERE drive_code='INF-2026-01'), TRUE, TRUE, TRUE,  TRUE,  'pending',  'Offer Pending'),
(10007, (SELECT drive_id FROM placement_drives WHERE drive_code='INF-2026-01'), TRUE, TRUE, TRUE,  TRUE,  'accepted', 'Offer Accepted');

-- Wipro (closed) — Japjot selected, offer pending
INSERT INTO student_drive_map (student_id, drive_id, is_eligible, registered, participated, selected, offer_status, drive_status) VALUES
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='WPR-2026-01'), TRUE, TRUE, TRUE, TRUE,  'pending', 'Offer Pending'),
(10003, (SELECT drive_id FROM placement_drives WHERE drive_code='WPR-2026-01'), TRUE, TRUE, TRUE, FALSE, 'pending', 'Eliminated Round 1'),
(10005, (SELECT drive_id FROM placement_drives WHERE drive_code='WPR-2026-01'), TRUE, TRUE, TRUE, FALSE, 'pending', 'Eliminated Round 2');

-- Accenture (closed) — Japjot + Priya + Arjun selected
INSERT INTO student_drive_map (student_id, drive_id, is_eligible, registered, participated, selected, offer_status, drive_status) VALUES
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='ACC-2026-01'), TRUE, TRUE, TRUE, TRUE,  'accepted', 'Offer Accepted'),
(10003, (SELECT drive_id FROM placement_drives WHERE drive_code='ACC-2026-01'), TRUE, TRUE, TRUE, TRUE,  'accepted', 'Offer Accepted'),
(10004, (SELECT drive_id FROM placement_drives WHERE drive_code='ACC-2026-01'), TRUE, TRUE, TRUE, FALSE, 'pending',  'Eliminated Round 1'),
(10006, (SELECT drive_id FROM placement_drives WHERE drive_code='ACC-2026-01'), TRUE, TRUE, TRUE, TRUE,  'accepted', 'Offer Accepted');

-- Amazon (open) — Japjot registered, upcoming
INSERT INTO student_drive_map (student_id, drive_id, is_eligible, registered, participated, selected, offer_status, drive_status) VALUES
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='AMZ-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered'),
(10002, (SELECT drive_id FROM placement_drives WHERE drive_code='AMZ-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered'),
(10005, (SELECT drive_id FROM placement_drives WHERE drive_code='AMZ-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered'),
(10008, (SELECT drive_id FROM placement_drives WHERE drive_code='AMZ-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered');

-- Google (open) — Japjot registered
INSERT INTO student_drive_map (student_id, drive_id, is_eligible, registered, participated, selected, offer_status, drive_status) VALUES
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='GOO-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered'),
(10008, (SELECT drive_id FROM placement_drives WHERE drive_code='GOO-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered'),
(10006, (SELECT drive_id FROM placement_drives WHERE drive_code='GOO-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered');

-- Microsoft (open) — Japjot registered
INSERT INTO student_drive_map (student_id, drive_id, is_eligible, registered, participated, selected, offer_status, drive_status) VALUES
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='MIC-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered'),
(10002, (SELECT drive_id FROM placement_drives WHERE drive_code='MIC-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered'),
(10008, (SELECT drive_id FROM placement_drives WHERE drive_code='MIC-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered');

-- L&T (open) — ME students
INSERT INTO student_drive_map (student_id, drive_id, is_eligible, registered, participated, selected, offer_status, drive_status) VALUES
(10004, (SELECT drive_id FROM placement_drives WHERE drive_code='LNT-2026-01'), TRUE, TRUE, FALSE, FALSE, 'pending', 'Registered');


-- =============================================================================
-- DUTY LEAVE REQUESTS
-- =============================================================================

INSERT INTO duty_leave_requests (student_id, drive_id, date, start_time, end_time, remarks, status, reviewed_by) VALUES
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), '2026-01-15', '09:00', '17:00', 'TCS campus drive — full day',       'approved', 'a0000001-0000-0000-0000-00000000000b'),
(10002, (SELECT drive_id FROM placement_drives WHERE drive_code='TCS-2026-01'), '2026-01-15', '09:00', '17:00', 'TCS campus drive — full day',       'approved', 'a0000001-0000-0000-0000-00000000000b'),
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='INF-2026-01'), '2026-01-22', '09:00', '16:00', 'Infosys drive',                      'approved', 'a0000001-0000-0000-0000-00000000000b'),
(10001, (SELECT drive_id FROM placement_drives WHERE drive_code='ACC-2026-01'), '2026-02-12', '09:00', '17:00', 'Accenture campus drive',             'approved', 'a0000001-0000-0000-0000-00000000000b'),
(10004, (SELECT drive_id FROM placement_drives WHERE drive_code='LNT-2026-01'), '2026-02-28', '09:00', '17:00', 'L&T recruitment drive',             'pending',  NULL);


-- =============================================================================
-- INDEPENDENT OFFERS
-- =============================================================================

INSERT INTO independent_offers (student_id, company_name, stipend, ctc, duration, status, reviewed_by) VALUES
(10001, 'Startup XYZ (AI Internship)',   25000, NULL,  '6 months', 'approved', 'a0000001-0000-0000-0000-00000000000a'),
(10002, 'Atlassian (Off-campus SDE-2)',  NULL,  18.50, NULL,       'approved', 'a0000001-0000-0000-0000-00000000000a'),
(10005, 'Razorpay (Off-campus)',         NULL,  12.00, NULL,       'pending',  NULL),
(10008, 'Tower Research (Quant Intern)', 50000, NULL,  '3 months', 'approved', 'a0000001-0000-0000-0000-00000000000a');


-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

INSERT INTO notifications (user_id, type, payload, read) VALUES
('a0000001-0000-0000-0000-000000000001', 'drive_registration',    '{"message": "You are registered for TCS campus drive", "drive_code": "TCS-2026-01"}'::jsonb,         TRUE),
('a0000001-0000-0000-0000-000000000001', 'selection_result',      '{"message": "Congratulations! Selected in TCS. Accept/reject your offer.", "drive_code": "TCS-2026-01"}'::jsonb, TRUE),
('a0000001-0000-0000-0000-000000000001', 'drive_registration',    '{"message": "Registered for Amazon campus drive", "drive_code": "AMZ-2026-01"}'::jsonb,              FALSE),
('a0000001-0000-0000-0000-000000000001', 'drive_registration',    '{"message": "Registered for Google virtual drive", "drive_code": "GOO-2026-01"}'::jsonb,              FALSE),
('a0000001-0000-0000-0000-000000000001', 'drive_registration',    '{"message": "Registered for Microsoft campus drive", "drive_code": "MIC-2026-01"}'::jsonb,            FALSE),
('a0000001-0000-0000-0000-000000000001', 'document_verification', '{"message": "Your Resume has been approved", "document_type": "resume"}'::jsonb,                      FALSE),
('a0000001-0000-0000-0000-000000000002', 'selection_result',      '{"message": "Congratulations! Selected in Infosys.", "drive_code": "INF-2026-01"}'::jsonb,            FALSE),
('a0000001-0000-0000-0000-000000000003', 'selection_result',      '{"message": "Congratulations! Selected in Accenture.", "drive_code": "ACC-2026-01"}'::jsonb,          FALSE),
('a0000001-0000-0000-0000-000000000009', 'broadcast',             '{"message": "Placement season 2025-26 launched at LPU. 14 companies confirmed."}'::jsonb,             TRUE),
('a0000001-0000-0000-0000-00000000000a', 'broadcast',             '{"message": "14 companies confirmed for LPU 2025-26 placement season."}'::jsonb,                     FALSE);


-- =============================================================================
-- MESSAGES (conversations between users)
-- =============================================================================

INSERT INTO messages (sender_id, receiver_id, content, read_at) VALUES
('a0000001-0000-0000-0000-00000000000a', 'a0000001-0000-0000-0000-000000000001', 'Hi Japjot, please upload your latest resume before the Amazon drive deadline.', NULL),
('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-00000000000a', 'Sure sir, uploading by today evening.', NULL),
('a0000001-0000-0000-0000-00000000000a', 'a0000001-0000-0000-0000-000000000001', 'Great. Your TCS offer is confirmed, make sure Amazon prep is solid too.', NULL),
('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-00000000000a', 'Thank you sir, preparing well.', NOW()),
('a0000001-0000-0000-0000-00000000000a', 'a0000001-0000-0000-0000-000000000002', 'Aarav, congrats on Infosys! Please accept the offer in the portal.', NULL),
('a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-00000000000a', 'Accepted, thank you sir!', NOW()),
('a0000001-0000-0000-0000-00000000000b', 'a0000001-0000-0000-0000-000000000003', 'Priya, your duty leave for Wipro is approved. All the best!', NULL),
('a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-00000000000b', 'Thank you ma''am!', NOW()),
('a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-00000000000a', 'Placement report for Jan-Feb looks promising. 62% conversion.', NULL),
('a0000001-0000-0000-0000-00000000000a', 'a0000001-0000-0000-0000-000000000009', 'Google + Microsoft next month. Should cross 80%.', NOW());


-- =============================================================================
-- AUDIT LOGS
-- =============================================================================

INSERT INTO audit_logs (actor_id, action, entity, entity_id, old_data, new_data) VALUES
('a0000001-0000-0000-0000-000000000009', 'create_drive',      'placement_drives',  'TCS-2026-01', NULL, '{"company": "TCS", "type": "On-campus"}'::jsonb),
('a0000001-0000-0000-0000-000000000009', 'create_drive',      'placement_drives',  'INF-2026-01', NULL, '{"company": "Infosys", "type": "On-campus"}'::jsonb),
('a0000001-0000-0000-0000-000000000009', 'create_drive',      'placement_drives',  'AMZ-2026-01', NULL, '{"company": "Amazon", "type": "On-campus"}'::jsonb),
('a0000001-0000-0000-0000-000000000009', 'create_drive',      'placement_drives',  'GOO-2026-01', NULL, '{"company": "Google", "type": "Virtual"}'::jsonb),
('a0000001-0000-0000-0000-000000000009', 'create_drive',      'placement_drives',  'MIC-2026-01', NULL, '{"company": "Microsoft", "type": "On-campus"}'::jsonb),
('a0000001-0000-0000-0000-00000000000a', 'select_student',    'student_drive_map', '10001-TCS',   '{"selected": false}'::jsonb, '{"selected": true}'::jsonb),
('a0000001-0000-0000-0000-00000000000a', 'select_student',    'student_drive_map', '10002-INF',   '{"selected": false}'::jsonb, '{"selected": true}'::jsonb),
('a0000001-0000-0000-0000-00000000000a', 'approve_offer',     'independent_offers','10001-xyz',   '{"status": "pending"}'::jsonb, '{"status": "approved"}'::jsonb),
('a0000001-0000-0000-0000-00000000000b', 'approve_duty_leave','duty_leave',        'DL-001',      '{"status": "pending"}'::jsonb, '{"status": "approved"}'::jsonb);


-- =============================================================================
-- ✅ DONE! Login credentials:
-- =============================================================================
--
--  HERO USER (demo as student):
--    Email: japjot@lpu.in    Password: japjot123
--
--  ADMIN:
--    Email: admin@lpu.in     Password: admin123
--    Email: sam@gmail.com    Password: sam123
--
--  TPC:
--    Email: tpc@lpu.in       Password: tpc123
--
--  FACULTY:
--    Email: faculty@lpu.in   Password: faculty123
--
--  OTHER STUDENTS:
--    aarav@lpu.in / aarav123
--    priya@lpu.in / priya123
--    rohit@lpu.in / rohit123
--    sneha@lpu.in / sneha123
--    arjun@lpu.in / arjun123
--    kavya@lpu.in / kavya123
--    ananya@lpu.in / ananya123
-- =============================================================================
