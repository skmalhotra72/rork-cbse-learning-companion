-- =====================================================
-- SEED DATA: CBSE Subjects for Grades 9-12
-- =====================================================
-- Run this after creating the main schema
-- This includes major CBSE subjects for secondary education
-- =====================================================

-- Grade 9 Subjects
INSERT INTO public.subjects (name, code, grade, description, color, is_active) VALUES
('Mathematics', 'MATH-9', 9, 'Number Systems, Algebra, Coordinate Geometry, Euclid Geometry, Mensuration, Statistics', '#3B82F6', true),
('Science', 'SCI-9', 9, 'Matter, Atoms & Molecules, Motion, Force, Work & Energy, Sound, Living World', '#10B981', true),
('Social Science', 'SST-9', 9, 'History, Geography, Political Science, Economics', '#F59E0B', true),
('English', 'ENG-9', 9, 'Literature, Grammar, Writing Skills, Comprehension', '#8B5CF6', true),
('Hindi', 'HIN-9', 9, 'Literature, Grammar, Writing Skills', '#EC4899', true);

-- Grade 10 Subjects
INSERT INTO public.subjects (name, code, grade, description, color, is_active) VALUES
('Mathematics', 'MATH-10', 10, 'Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry, Circles, Areas, Surface Areas, Volumes, Statistics, Probability', '#3B82F6', true),
('Science', 'SCI-10', 10, 'Chemical Reactions, Acids Bases Salts, Metals & Non-metals, Carbon Compounds, Periodic Classification, Life Processes, Control & Coordination, Reproduction, Heredity, Light, Electricity, Magnetic Effects, Energy Sources, Environment', '#10B981', true),
('Social Science', 'SST-10', 10, 'Events & Processes, Livelihoods Economies & Societies, Everyday Life Culture & Politics, India & Contemporary World', '#F59E0B', true),
('English', 'ENG-10', 10, 'First Flight, Footprints without Feet, Literature Reader, Grammar, Writing', '#8B5CF6', true),
('Hindi', 'HIN-10', 10, 'Kshitij, Kritika, Vyakaran, Lekhan', '#EC4899', true);

-- Grade 11 Science Stream
INSERT INTO public.subjects (name, code, grade, description, color, is_active) VALUES
('Physics', 'PHY-11', 11, 'Physical World, Units & Measurements, Motion, Laws of Motion, Work Energy Power, System of Particles, Gravitation, Mechanical Properties, Thermal Properties, Thermodynamics, Kinetic Theory, Oscillations, Waves', '#3B82F6', true),
('Chemistry', 'CHEM-11', 11, 'Some Basic Concepts, Structure of Atom, Classification of Elements, Chemical Bonding, States of Matter, Thermodynamics, Equilibrium, Redox Reactions, Hydrogen, s-Block Elements, p-Block Elements, Organic Chemistry, Hydrocarbons, Environmental Chemistry', '#10B981', true),
('Mathematics', 'MATH-11', 11, 'Sets, Relations & Functions, Trigonometric Functions, Principle of Mathematical Induction, Complex Numbers, Linear Inequalities, Permutations & Combinations, Binomial Theorem, Sequences & Series, Straight Lines, Conic Sections, 3D Geometry, Limits & Derivatives, Mathematical Reasoning, Statistics, Probability', '#F59E0B', true),
('Biology', 'BIO-11', 11, 'Living World, Biological Classification, Plant Kingdom, Animal Kingdom, Morphology of Flowering Plants, Anatomy of Flowering Plants, Structural Organisation in Animals, Cell, Biomolecules, Cell Cycle, Transport in Plants, Mineral Nutrition, Photosynthesis, Respiration, Plant Growth, Digestion & Absorption, Breathing & Exchange of Gases, Body Fluids, Excretory Products, Locomotion & Movement, Neural Control, Chemical Coordination', '#EC4899', true),
('English', 'ENG-11', 11, 'Hornbill, Snapshots, Writing Skills, Grammar', '#8B5CF6', true);

-- Grade 11 Commerce Stream
INSERT INTO public.subjects (name, code, grade, description, color, is_active) VALUES
('Accountancy', 'ACC-11', 11, 'Introduction to Accounting, Theory Base of Accounting, Recording of Transactions, Trial Balance, Depreciation, Bills of Exchange, Financial Statements', '#06B6D4', true),
('Business Studies', 'BST-11', 11, 'Nature & Purpose of Business, Forms of Business Organisation, Private Public & Global Enterprises, Business Services, Emerging Modes of Business, Social Responsibility, Formation of Company, Sources of Business Finance, Small Business, Internal Trade', '#8B5CF6', true),
('Economics', 'ECO-11', 11, 'Introduction, Collection Organisation & Presentation of Data, Statistical Tools & Interpretation, Correlation, Index Numbers, Introduction to Microeconomics, Consumer Equilibrium, Production & Costs, Forms of Market', '#F59E0B', true);

-- Grade 12 Science Stream
INSERT INTO public.subjects (name, code, grade, description, color, is_active) VALUES
('Physics', 'PHY-12', 12, 'Electric Charges & Fields, Electrostatic Potential, Current Electricity, Moving Charges & Magnetism, Magnetism & Matter, Electromagnetic Induction, Alternating Current, Electromagnetic Waves, Ray Optics, Wave Optics, Dual Nature of Radiation, Atoms, Nuclei, Semiconductor Electronics, Communication Systems', '#3B82F6', true),
('Chemistry', 'CHEM-12', 12, 'Solid State, Solutions, Electrochemistry, Chemical Kinetics, Surface Chemistry, General Principles of Isolation of Elements, p-Block Elements, d & f Block Elements, Coordination Compounds, Haloalkanes & Haloarenes, Alcohols Phenols & Ethers, Aldehydes Ketones, Carboxylic Acids, Amines, Biomolecules, Polymers, Chemistry in Everyday Life', '#10B981', true),
('Mathematics', 'MATH-12', 12, 'Relations & Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity & Differentiability, Applications of Derivatives, Integrals, Applications of Integrals, Differential Equations, Vector Algebra, Three Dimensional Geometry, Linear Programming, Probability', '#F59E0B', true),
('Biology', 'BIO-12', 12, 'Reproduction in Organisms, Sexual Reproduction in Flowering Plants, Human Reproduction, Reproductive Health, Principles of Inheritance, Molecular Basis of Inheritance, Evolution, Human Health & Disease, Strategies for Food Production, Microbes in Human Welfare, Biotechnology Principles, Biotechnology Applications, Organisms & Populations, Ecosystem, Biodiversity & Conservation, Environmental Issues', '#EC4899', true),
('English', 'ENG-12', 12, 'Flamingo, Vistas, Writing Skills, Advanced Grammar', '#8B5CF6', true);

-- Grade 12 Commerce Stream
INSERT INTO public.subjects (name, code, grade, description, color, is_active) VALUES
('Accountancy', 'ACC-12', 12, 'Accounting for Partnership Firms, Accounting for Companies, Analysis of Financial Statements, Cash Flow Statement', '#06B6D4', true),
('Business Studies', 'BST-12', 12, 'Nature & Significance of Management, Principles of Management, Business Environment, Planning, Organising, Staffing, Directing, Controlling, Financial Management, Financial Markets, Marketing Management, Consumer Protection', '#8B5CF6', true),
('Economics', 'ECO-12', 12, 'Introduction to Macroeconomics, National Income Accounting, Money & Banking, Determination of Income & Employment, Government Budget & Economy, Open Economy Macroeconomics', '#F59E0B', true);

-- Print confirmation
DO $$
BEGIN
  RAISE NOTICE 'Successfully seeded % subjects', (SELECT COUNT(*) FROM public.subjects);
END $$;
