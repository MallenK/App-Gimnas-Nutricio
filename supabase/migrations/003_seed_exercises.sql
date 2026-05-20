-- =============================================
-- GymNutricio - Built-in Exercise Library
-- user_id = NULL means shared / built-in
-- =============================================

INSERT INTO exercises (name, muscle_group, category, equipment, is_custom) VALUES

-- PECHO
('Press de banca plano', 'chest', 'strength', 'barbell', false),
('Press de banca inclinado', 'chest', 'strength', 'barbell', false),
('Press de banca declinado', 'chest', 'strength', 'barbell', false),
('Press de mancuernas plano', 'chest', 'strength', 'dumbbell', false),
('Press de mancuernas inclinado', 'chest', 'strength', 'dumbbell', false),
('Aperturas con mancuernas', 'chest', 'strength', 'dumbbell', false),
('Cruces en polea', 'chest', 'strength', 'cable', false),
('Fondos en paralelas', 'chest', 'bodyweight', 'bodyweight', false),
('Flexiones', 'chest', 'bodyweight', 'bodyweight', false),
('Press en máquina pecho', 'chest', 'strength', 'machine', false),

-- ESPALDA
('Peso muerto', 'back', 'strength', 'barbell', false),
('Dominadas', 'back', 'bodyweight', 'bodyweight', false),
('Remo con barra', 'back', 'strength', 'barbell', false),
('Remo con mancuerna', 'back', 'strength', 'dumbbell', false),
('Jalón al pecho', 'back', 'strength', 'cable', false),
('Jalón al pecho agarre estrecho', 'back', 'strength', 'cable', false),
('Remo en polea', 'back', 'strength', 'cable', false),
('Remo en máquina', 'back', 'strength', 'machine', false),
('Buenos días', 'back', 'strength', 'barbell', false),
('Hiperextensiones', 'back', 'bodyweight', 'bodyweight', false),

-- HOMBROS
('Press militar con barra', 'shoulders', 'strength', 'barbell', false),
('Press de hombros con mancuernas', 'shoulders', 'strength', 'dumbbell', false),
('Elevaciones laterales', 'shoulders', 'strength', 'dumbbell', false),
('Elevaciones frontales', 'shoulders', 'strength', 'dumbbell', false),
('Pájaro / Elevaciones posteriores', 'shoulders', 'strength', 'dumbbell', false),
('Press Arnold', 'shoulders', 'strength', 'dumbbell', false),
('Face pull', 'shoulders', 'strength', 'cable', false),
('Encogimientos de hombros', 'shoulders', 'strength', 'barbell', false),

-- BICEPS
('Curl de bíceps con barra', 'biceps', 'strength', 'barbell', false),
('Curl de bíceps con mancuernas', 'biceps', 'strength', 'dumbbell', false),
('Curl martillo', 'biceps', 'strength', 'dumbbell', false),
('Curl en polea baja', 'biceps', 'strength', 'cable', false),
('Curl concentrado', 'biceps', 'strength', 'dumbbell', false),
('Curl en banco Scott', 'biceps', 'strength', 'barbell', false),

-- TRICEPS
('Press francés', 'triceps', 'strength', 'barbell', false),
('Fondos en banco', 'triceps', 'bodyweight', 'bodyweight', false),
('Extensión de tríceps en polea', 'triceps', 'strength', 'cable', false),
('Patada de tríceps', 'triceps', 'strength', 'dumbbell', false),
('Press cerrado', 'triceps', 'strength', 'barbell', false),
('Extensión de tríceps con mancuerna', 'triceps', 'strength', 'dumbbell', false),

-- PIERNAS
('Sentadilla con barra', 'legs', 'strength', 'barbell', false),
('Sentadilla frontal', 'legs', 'strength', 'barbell', false),
('Prensa de piernas', 'legs', 'strength', 'machine', false),
('Extensión de cuádriceps', 'legs', 'strength', 'machine', false),
('Curl femoral tumbado', 'legs', 'strength', 'machine', false),
('Curl femoral sentado', 'legs', 'strength', 'machine', false),
('Zancadas / Lunges', 'legs', 'strength', 'dumbbell', false),
('Sentadilla búlgara', 'legs', 'strength', 'dumbbell', false),
('Peso muerto rumano', 'legs', 'strength', 'barbell', false),
('Peso muerto sumo', 'legs', 'strength', 'barbell', false),

-- GLUTEOS
('Hip thrust', 'glutes', 'strength', 'barbell', false),
('Puente de glúteos', 'glutes', 'bodyweight', 'bodyweight', false),
('Patadas de glúteo en polea', 'glutes', 'strength', 'cable', false),
('Abducción de cadera en máquina', 'glutes', 'strength', 'machine', false),
('Step up', 'glutes', 'strength', 'dumbbell', false),

-- GEMELOS
('Elevación de talones de pie', 'calves', 'strength', 'machine', false),
('Elevación de talones sentado', 'calves', 'strength', 'machine', false),
('Elevación de talones con barra', 'calves', 'strength', 'barbell', false),

-- CORE
('Plancha', 'core', 'bodyweight', 'bodyweight', false),
('Crunch abdominal', 'core', 'bodyweight', 'bodyweight', false),
('Crunch en polea', 'core', 'strength', 'cable', false),
('Elevación de piernas', 'core', 'bodyweight', 'bodyweight', false),
('Russian twist', 'core', 'bodyweight', 'bodyweight', false),
('Rueda abdominal', 'core', 'bodyweight', 'other', false),
('Plancha lateral', 'core', 'bodyweight', 'bodyweight', false),
('Mountain climbers', 'core', 'bodyweight', 'bodyweight', false),
('Dead bug', 'core', 'bodyweight', 'bodyweight', false),

-- CARDIO
('Correr en cinta', 'cardio', 'cardio', 'machine', false),
('Bicicleta estática', 'cardio', 'cardio', 'machine', false),
('Elíptica', 'cardio', 'cardio', 'machine', false),
('Remo ergómetro', 'cardio', 'cardio', 'machine', false),
('Saltar a la comba', 'cardio', 'cardio', 'other', false),
('Burpees', 'full_body', 'bodyweight', 'bodyweight', false),

-- CUERPO COMPLETO
('Clean y press', 'full_body', 'strength', 'barbell', false),
('Snatch', 'full_body', 'strength', 'barbell', false),
('Thruster', 'full_body', 'strength', 'barbell', false),
('Kettlebell swing', 'full_body', 'strength', 'kettlebell', false),
('Turkish get-up', 'full_body', 'strength', 'kettlebell', false);
