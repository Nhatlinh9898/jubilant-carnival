// Academic Fields Definition - Định nghĩa các lĩnh vực học thuật đa ngành
export interface AcademicField {
  id: string;
  name: string;
  category: 'stem' | 'humanities' | 'social_sciences' | 'arts' | 'business' | 'health' | 'education' | 'engineering';
  subfields: string[];
  specializations: string[];
  researchAreas: string[];
  careerPaths: string[];
}

// STEM Fields
export const stemFields: AcademicField[] = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    category: 'stem',
    subfields: ['AI/ML', 'Software Engineering', 'Data Science', 'Cybersecurity', 'Theory', 'Graphics', 'Computer Networks', 'Database Systems'],
    specializations: [
      'Machine Learning', 'Artificial Intelligence', 'Software Architecture', 
      'Database Systems', 'Network Security', 'Web Development', 
      'Mobile Development', 'Cloud Computing', 'DevOps', 'Game Development',
      'Computer Vision', 'Natural Language Processing', 'Robotics', 'IoT'
    ],
    researchAreas: [
      'Deep Learning', 'Neural Networks', 'Computer Vision', 'Quantum Computing', 
      'Blockchain', 'Cryptography', 'Distributed Systems', 'Parallel Computing',
      'Human-Computer Interaction', 'Information Retrieval', 'Algorithm Design',
      'Big Data Analytics', 'Machine Learning Theory', 'Artificial General Intelligence'
    ],
    careerPaths: [
      'Software Engineer', 'Data Scientist', 'AI Researcher', 'Cybersecurity Analyst', 
      'Professor', 'Technical Lead', 'CTO', 'Systems Architect', 'Game Developer',
      'Research Scientist', 'Product Manager', 'IT Consultant'
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    category: 'stem',
    subfields: ['Pure Mathematics', 'Applied Mathematics', 'Statistics', 'Algebra', 'Geometry', 'Analysis', 'Topology', 'Number Theory', 'Combinatorics'],
    specializations: [
      'Number Theory', 'Topology', 'Differential Equations', 'Probability Theory', 'Optimization',
      'Linear Algebra', 'Abstract Algebra', 'Real Analysis', 'Complex Analysis',
      'Functional Analysis', 'Numerical Analysis', 'Mathematical Physics', 'Financial Mathematics'
    ],
    researchAreas: [
      'Algebraic Geometry', 'Mathematical Physics', 'Computational Mathematics', 
      'Financial Mathematics', 'Applied Mathematics', 'Discrete Mathematics',
      'Mathematical Logic', 'Category Theory', 'Graph Theory', 'K-Theory'
    ],
    careerPaths: [
      'Mathematician', 'Data Analyst', 'Quantitative Analyst', 'Professor', 
      'Research Scientist', 'Actuary', 'Statistician', 'Operations Research Analyst',
      'Financial Analyst', 'Teacher', 'Consultant'
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    category: 'stem',
    subfields: ['Theoretical Physics', 'Experimental Physics', 'Applied Physics', 'Astrophysics', 'Quantum Physics', 'Particle Physics', 'Condensed Matter', 'Optics'],
    specializations: [
      'Quantum Mechanics', 'Relativity', 'Thermodynamics', 'Electromagnetism', 'Condensed Matter',
      'Nuclear Physics', 'Particle Physics', 'Astrophysics', 'Biophysics', 'Geophysics',
      'Medical Physics', 'Acoustics', 'Optics', 'Laser Physics', 'Plasma Physics'
    ],
    researchAreas: [
      'Quantum Computing', 'Nanotechnology', 'Renewable Energy', 'Space Exploration', 
      'Particle Accelerators', 'Dark Matter', 'Dark Energy', 'String Theory',
      'Cosmology', 'Quantum Information', 'Quantum Entanglement'
    ],
    careerPaths: [
      'Physicist', 'Research Scientist', 'Professor', 'Engineer', 'Data Scientist',
      'Astronomer', 'Medical Physicist', 'Materials Scientist', 'Patent Attorney'
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'stem',
    subfields: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry', 'Polymer Chemistry', 'Environmental Chemistry', 'Medicinal Chemistry'],
    specializations: [
      'Synthetic Chemistry', 'Materials Chemistry', 'Environmental Chemistry', 'Medicinal Chemistry',
      'Pharmaceutical Chemistry', 'Food Chemistry', 'Industrial Chemistry', 'Nanochemistry',
      'Computational Chemistry', 'Theoretical Chemistry', 'Analytical Chemistry', 'Green Chemistry'
    ],
    researchAreas: [
      'Drug Discovery', 'Materials Science', 'Green Chemistry', 'Catalysis', 'Spectroscopy',
      'Chemical Biology', 'Molecular Biology', 'Nanotechnology', 'Sustainable Chemistry',
      'Chemical Engineering', 'Polymer Science', 'Environmental Chemistry'
    ],
    careerPaths: [
      'Chemist', 'Research Scientist', 'Professor', 'Pharmaceutical Researcher', 
      'Materials Engineer', 'Environmental Scientist', 'Quality Control Analyst',
      'Patent Attorney', 'Chemical Engineer'
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    category: 'stem',
    subfields: ['Molecular Biology', 'Genetics', 'Ecology', 'Evolution', 'Physiology', 'Neuroscience', 'Microbiology', 'Cell Biology'],
    specializations: [
      'Genetic Engineering', 'Synthetic Biology', 'Computational Biology', 'Marine Biology',
      'Molecular Biology', 'Cell Biology', 'Developmental Biology', 'Evolutionary Biology',
      'Systems Biology', 'Bioinformatics', 'Biotechnology', 'Neuroscience',
      'Immunology', 'Pharmacology', 'Environmental Biology', 'Conservation Biology'
    ],
    researchAreas: [
      'CRISPR', 'Gene Therapy', 'Climate Change Biology', 'Neural Networks', 'Synthetic Life',
      'Genomics', 'Proteomics', 'Metabolomics', 'Bioinformatics', 'Systems Biology',
      'Evolutionary Developmental Biology', 'Conservation Biology', 'Marine Biology'
    ],
    careerPaths: [
      'Biologist', 'Medical Researcher', 'Professor', 'Biotech Engineer', 'Genetic Counselor',
      'Pharmacist', 'Environmental Scientist', 'Conservationist', 'Bioinformatician'
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    category: 'stem',
    subfields: ['Mechanical', 'Electrical', 'Civil', 'Chemical', 'Biomedical', 'Aerospace', 'Environmental', 'Industrial', 'Materials', 'Computer'],
    specializations: [
      'Robotics', 'Renewable Energy', 'Biomedical Devices', 'Smart Materials', 'AI Engineering',
      'Nanotechnology', 'Sustainable Engineering', 'Advanced Manufacturing', 'Space Technology',
      'Structural Engineering', 'Transportation Engineering', 'Environmental Engineering',
      'Chemical Engineering', 'Materials Science', 'Biomedical Engineering'
    ],
    researchAreas: [
      'Advanced Manufacturing', 'Smart Cities', 'Medical Devices', 'Space Technology', 
      'Sustainable Engineering', 'Nanotechnology', 'Robotics', 'Artificial Intelligence',
      'IoT Systems', 'Quantum Engineering', 'Biomedical Engineering'
    ],
    careerPaths: [
      'Engineer', 'Researcher', 'Professor', 'Technical Lead', 'CTO',
      'Project Manager', 'Systems Architect', 'Quality Engineer', 'Consultant'
    ]
  }
];

// Humanities Fields
export const humanitiesFields: AcademicField[] = [
  {
    id: 'philosophy',
    name: 'Philosophy',
    category: 'humanities',
    subfields: ['Metaphysics', 'Epistemology', 'Ethics', 'Logic', 'Aesthetics', 'Political Philosophy', 'Philosophy of Mind', 'Philosophy of Language', 'Philosophy of Science'],
    specializations: [
      'Ethics of AI', 'Philosophy of Mind', 'Political Theory', 'Existentialism', 'Analytic Philosophy',
      'Continental Philosophy', 'Eastern Philosophy', 'Philosophy of Technology', 'Philosophy of Education',
      'Philosophy of Religion', 'Social Philosophy', 'Legal Philosophy', 'Business Ethics'
    ],
    researchAreas: [
      'AI Ethics', 'Consciousness Studies', 'Moral Philosophy', 'Political Theory', 'Philosophy of Science',
      'Ethics of Technology', 'Philosophy of Mind', 'Epistemology', 'Metaphysics'
    ],
    careerPaths: [
      'Philosopher', 'Ethicist', 'Professor', 'Policy Advisor', 'Consultant',
      'Writer', 'Researcher', 'Teacher', 'Legal Advisor'
    ]
  },
  {
    id: 'literature',
    name: 'Literature',
    category: 'humanities',
    subfields: ['Literary Theory', 'Comparative Literature', 'Creative Writing', 'Digital Humanities', 'World Literature', 'American Literature', 'British Literature', 'Postcolonial Literature'],
    specializations: [
      'Digital Literature', 'Postcolonial Studies', 'Literary Analysis', 'Creative Writing',
      'Comparative Literature', 'Literary Theory', 'Cultural Studies', 'Digital Humanities',
      'Modern Literature', 'Classical Literature', 'Genre Studies', 'Literary Criticism'
    ],
    researchAreas: [
      'Digital Humanities', 'AI and Literature', 'Cultural Studies', 'Literary Theory',
      'Comparative Literature', 'Literary Analysis', 'Digital Archives', 'Text Mining'
    ],
    careerPaths: [
      'Professor', 'Writer', 'Editor', 'Researcher', 'Cultural Analyst',
      'Literary Critic', 'Publisher', 'Librarian', 'Content Strategist'
    ]
  },
  {
    id: 'history',
    name: 'History',
    category: 'humanities',
    subfields: ['Ancient History', 'Medieval History', 'Modern History', 'Digital History', 'Economic History', 'Social History', 'Cultural History', 'Political History'],
    specializations: [
      'Military History', 'Cultural History', 'Political History', 'Social History',
      'Economic History', 'Environmental History', 'Digital History', 'Public History',
      'Intellectual History', 'History of Science', 'History of Technology', 'Global History'
    ],
    researchAreas: [
      'Digital Archives', 'Historical Analysis', 'Cultural Heritage', 'Historical Methods',
      'Digital Humanities', 'Oral History', 'Public History', 'Historiography'
    ],
    careerPaths: [
      'Historian', 'Professor', 'Archivist', 'Museum Curator', 'Policy Analyst',
      'Teacher', 'Journalist', 'Documentary Filmmaker', 'Heritage Manager'
    ]
  },
  {
    id: 'linguistics',
    name: 'Linguistics',
    category: 'humanities',
    subfields: ['Phonetics', 'Morphology', 'Syntax', 'Semantics', 'Pragmatics', 'Sociolinguistics', 'Computational Linguistics', 'Historical Linguistics'],
    specializations: [
      'Natural Language Processing', 'Computational Linguistics', 'Sociolinguistics',
      'Phonetics', 'Morphology', 'Syntax', 'Semantics', 'Pragmatics',
      'Historical Linguistics', 'Applied Linguistics', 'Psycholinguistics', 'Neurolinguistics'
    ],
    researchAreas: [
      'Natural Language Processing', 'Machine Translation', 'Speech Recognition', 'Text Mining',
      'Computational Linguistics', 'Corpus Linguistics', 'Discourse Analysis',
      'Language Acquisition', 'Language Evolution', 'Sociolinguistics'
    ],
    careerPaths: [
      'Linguist', 'Professor', 'Research Scientist', 'NLP Engineer', 'Translator',
      'Speech Therapist', 'Language Teacher', 'Technical Writer', 'Localization Specialist'
    ]
  },
  {
    id: 'arts',
    name: 'Fine Arts',
    category: 'arts',
    subfields: ['Painting', 'Sculpture', 'Photography', 'Digital Arts', 'Performance Arts', 'Music', 'Theater', 'Dance', 'Film', 'Architecture'],
    specializations: [
      'Digital Art', 'Contemporary Art', 'Classical Art', 'Modern Art', 'Installation Art',
      'Conceptual Art', 'Performance Art', 'Visual Arts', 'Applied Arts', 'Digital Media'
    ],
    researchAreas: [
      'Digital Art', 'Artificial Intelligence in Art', 'Interactive Art', 'Virtual Reality Art',
      'Contemporary Art Theory', 'Art History', 'Art Criticism', 'Art Education'
    ],
    careerPaths: [
      'Artist', 'Professor', 'Curator', 'Gallery Director', 'Art Critic',
      'Art Teacher', 'Designer', 'Photographer', 'Filmmaker'
    ]
  }
];

// Social Sciences Fields
export const socialSciencesFields: AcademicField[] = [
  {
    id: 'economics',
    name: 'Economics',
    category: 'social_sciences',
    subfields: ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Behavioral Economics', 'Development Economics', 'International Economics', 'Environmental Economics', 'Health Economics'],
    specializations: [
      'Financial Economics', 'Environmental Economics', 'Health Economics', 'International Economics',
      'Development Economics', 'Labor Economics', 'Monetary Economics', 'Industrial Organization',
      'Game Theory', 'Behavioral Economics', 'Climate Economics', 'Digital Economics'
    ],
    researchAreas: [
      'Game Theory', 'Behavioral Economics', 'Climate Economics', 'Digital Economics',
      'Financial Economics', 'Development Economics', 'International Trade', 'Monetary Policy'
    ],
    careerPaths: [
      'Economist', 'Financial Analyst', 'Policy Advisor', 'Professor', 'Consultant',
      'Data Scientist', 'Market Analyst', 'Investment Banker', 'Government Advisor'
    ]
  },
  {
    id: 'psychology',
    name: 'Psychology',
    category: 'social_sciences',
    subfields: ['Cognitive Psychology', 'Clinical Psychology', 'Social Psychology', 'Developmental Psychology', 'Educational Psychology', 'Industrial Psychology', 'Health Psychology', 'Neuropsychology'],
    specializations: [
      'Neuropsychology', 'Educational Psychology', 'Industrial Psychology', 'Health Psychology',
      'Clinical Psychology', 'Cognitive Neuroscience', 'Social Psychology', 'Developmental Psychology',
      'Experimental Psychology', 'Applied Psychology', 'Cognitive Psychology'
    ],
    researchAreas: [
      'Cognitive Neuroscience', 'Mental Health', 'Learning Science', 'Behavioral Economics',
      'Neuropsychology', 'Social Psychology', 'Developmental Psychology', 'Clinical Psychology'
    ],
    careerPaths: [
      'Psychologist', 'Researcher', 'Professor', 'Therapist', 'Consultant',
      'Counselor', 'Clinical Psychologist', 'Educational Psychologist', 'Industrial Psychologist'
    ]
  },
  {
    id: 'sociology',
    name: 'Sociology',
    category: 'social_sciences',
    subfields: ['Social Theory', 'Criminology', 'Demography', 'Urban Sociology', 'Digital Sociology', 'Rural Sociology', 'Political Sociology', 'Economic Sociology', 'Cultural Sociology'],
    specializations: [
      'Social Networks', 'Cultural Sociology', 'Political Sociology', 'Economic Sociology',
      'Urban Sociology', 'Digital Sociology', 'Environmental Sociology', 'Family Sociology',
      'Medical Sociology', 'Religion Sociology', 'Gender Studies', 'Race and Ethnicity'
    ],
    researchAreas: [
      'Digital Society', 'Social Media Analysis', 'Urban Studies', 'Social Inequality',
      'Social Networks', 'Cultural Studies', 'Social Theory', 'Social Research Methods'
    ],
    careerPaths: [
      'Sociologist', 'Professor', 'Researcher', 'Policy Analyst', 'Consultant',
      'Social Worker', 'Community Organizer', 'Market Researcher', 'Data Analyst'
    ]
  },
  {
    id: 'political-science',
    name: 'Political Science',
    category: 'social_sciences',
    subfields: ['Political Theory', 'Comparative Politics', 'International Relations', 'Public Administration', 'Political Economy', 'Political Methodology'],
    specializations: [
      'International Relations', 'Political Theory', 'Comparative Politics', 'Public Policy',
      'Political Economy', 'Political Methodology', 'American Politics', 'European Politics',
      'Asian Politics', 'African Politics', 'Latin American Politics'
    ],
    researchAreas: [
      'International Relations Theory', 'Comparative Politics', 'Political Behavior',
      'Public Policy Analysis', 'Political Economy', 'Governance Studies'
    ],
    careerPaths: [
      'Political Scientist', 'Professor', 'Policy Advisor', 'Diplomat', 'Government Official',
      'Political Analyst', 'Campaign Manager', 'Legislative Aide', 'Consultant'
    ]
  },
  {
    id: 'anthropology',
    name: 'Anthropology',
    category: 'social_sociences',
    subfields: ['Cultural Anthropology', 'Social Anthropology', 'Biological Anthropology', 'Archaeology', 'Linguistic Anthropology', 'Medical Anthropology', 'Digital Anthropology'],
    specializations: [
      'Cultural Anthropology', 'Social Anthropology', 'Biological Anthropology', 'Archaeology',
      'Linguistic Anthropology', 'Medical Anthropology', 'Digital Anthropology', 'Visual Anthropology',
      'Applied Anthropology', 'Business Anthropology', 'Environmental Anthropology'
    ],
    researchAreas: [
      'Cultural Studies', 'Ethnography', 'Participant Observation', 'Qualitative Research',
      'Digital Anthropology', 'Medical Anthropology', 'Archaeological Methods'
    ],
    careerPaths: [
      'Anthropologist', 'Professor', 'Museum Curator', 'Cultural Resource Manager',
      'Ethnographer', 'Archaeologist', 'Researcher', 'Consultant'
    ]
  }
];

// Business Fields
export const businessFields: AcademicField[] = [
  {
    id: 'business-administration',
    name: 'Business Administration',
    category: 'business',
    subfields: ['Management', 'Finance', 'Marketing', 'Operations', 'Strategy', 'Entrepreneurship', 'International Business', 'Human Resources', 'Information Systems'],
    specializations: [
      'Digital Business', 'Sustainable Business', 'International Business', 'Technology Management',
      'Supply Chain Management', 'Financial Management', 'Marketing Management', 'Operations Management',
      'Strategic Management', 'Human Resource Management', 'Innovation Management', 'Risk Management'
    ],
    researchAreas: [
      'Digital Transformation', 'Business Analytics', 'Innovation Management', 'Supply Chain',
      'Organizational Behavior', 'Strategic Management', 'Business Ethics', 'Entrepreneurship'
    ],
    careerPaths: [
      'CEO', 'Manager', 'Consultant', 'Professor', 'Entrepreneur',
      'Business Analyst', 'Project Manager', 'Product Manager', 'Marketing Manager'
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    category: 'business',
    subfields: ['Corporate Finance', 'Investment Banking', 'Financial Markets', 'Financial Analysis', 'International Finance', 'Risk Management', 'Portfolio Management'],
    specializations: [
      'Corporate Finance', 'Investment Banking', 'Financial Markets', 'Financial Analysis',
      'International Finance', 'Risk Management', 'Portfolio Management', 'Financial Technology',
      'Sustainable Finance', 'Behavioral Finance', 'Computational Finance', 'Quantitative Finance'
    ],
    researchAreas: [
      'Financial Technology', 'Sustainable Finance', 'Behavioral Finance', 'Quantitative Finance',
      'Financial Markets', 'Risk Management', 'Portfolio Theory', 'Corporate Finance'
    ],
    careerPaths: [
      'Financial Analyst', 'Investment Banker', 'Portfolio Manager', 'Risk Manager',
      'CFO', 'Financial Advisor', 'Quantitative Analyst', 'Finance Professor'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    category: 'business',
    subfields: ['Digital Marketing', 'Brand Management', 'Market Research', 'Consumer Behavior', 'International Marketing', 'Social Media Marketing', 'Content Marketing'],
    specializations: [
      'Digital Marketing', 'Brand Management', 'Market Research', 'Consumer Behavior',
      'International Marketing', 'Social Media Marketing', 'Content Marketing', 'E-commerce',
      'Product Marketing', 'Service Marketing', 'B2B Marketing', 'B2C Marketing'
    ],
    researchAreas: [
      'Digital Marketing Analytics', 'Consumer Behavior Analysis', 'Brand Management',
      'Social Media Analytics', 'Content Marketing Effectiveness', 'Marketing ROI'
    ],
    careerPaths: [
      'Marketing Manager', 'Brand Manager', 'Market Research Analyst', 'Digital Marketer',
      'Social Media Manager', 'Content Strategist', 'Product Manager', 'CMO'
    ]
  }
];

// Health Fields
export const healthFields: AcademicField[] = [
  {
    id: 'medicine',
    name: 'Medicine',
    category: 'health',
    subfields: ['Internal Medicine', 'Surgery', 'Pediatrics', 'Psychiatry', 'Public Health', 'Family Medicine', 'Emergency Medicine', 'Radiology'],
    specializations: [
      'Digital Health', 'Telemedicine', 'Precision Medicine', 'Medical AI',
      'Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Gynecology',
      'Dermatology', 'Ophthalmology', 'ENT', 'Anesthesiology', 'Pathology'
    ],
    researchAreas: [
      'Medical AI', 'Genomic Medicine', 'Digital Therapeutics', 'Healthcare Analytics',
      'Personalized Medicine', 'Telemedicine', 'Medical Imaging', 'Drug Discovery',
      'Clinical Trials', 'Epidemiology', 'Public Health', 'Healthcare Policy'
    ],
    careerPaths: [
      'Doctor', 'Medical Researcher', 'Professor', 'Healthcare Administrator', 'Medical Consultant',
      'Surgeon', 'Specialist', 'Nurse Practitioner', 'Healthcare Manager'
    ]
  },
  {
    'id: 'public-health',
    name: 'Public Health',
    category: 'health',
    subfields: ['Epidemiology', 'Biostatistics', 'Health Policy', 'Environmental Health', 'Global Health', 'Health Economics', 'Health Communication', 'Health Education'],
    specializations: [
      'Epidemiology', 'Biostatistics', 'Health Policy', 'Environmental Health', 'Global Health',
      'Health Economics', 'Health Communication', 'Health Education', 'Health Informatics',
      'Health Services Research', 'Maternal and Child Health', 'Infectious Disease'
    ],
    researchAreas: [
      'Epidemiology', 'Biostatistics', 'Health Policy', 'Environmental Health',
      'Global Health', 'Health Economics', 'Health Communication', 'Health Education'
    ],
    careerPaths: [
      'Public Health Official', 'Epidemiologist', 'Biostatistician', 'Health Policy Advisor',
      'Health Educator', 'Health Researcher', 'Public Health Consultant'
    ]
  },
  {
    id: 'nursing',
    name: 'Nursing',
    category: 'health',
    subfields: ['Registered Nursing', 'Nurse Practitioner', 'Nurse Anesthetist', 'Clinical Nursing', 'Nurse Midwife', 'Nurse Educator', 'Nurse Researcher'],
    specializations: [
      'Critical Care Nursing', 'Pediatric Nursing', 'Geriatric Nursing', 'Mental Health Nursing',
      'Oncology Nursing', 'Surgical Nursing', 'Community Health Nursing', 'Nurse Leadership',
      'Nurse Informatics', 'Nurse Research', 'Nurse Education', 'Advanced Practice Nursing'
    ],
    researchAreas: [
      'Nursing Informatics', 'Evidence-Based Nursing', 'Patient Outcomes Research',
      'Nursing Education', 'Clinical Nursing', 'Nursing Leadership'
    ],
    careerPaths: [
      'Registered Nurse', 'Nurse Practitioner', 'Nurse Anesthetist', 'Clinical Nurse Specialist',
      'Nurse Manager', 'Nurse Educator', 'Nurse Researcher', 'Nurse Administrator'
    ]
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    category: 'health',
    subfields: ['Pharmaceutical Chemistry', 'Pharmacology', 'Clinical Pharmacy', 'Hospital Pharmacy', 'Community Pharmacy', 'Industrial Pharmacy', 'Nuclear Pharmacy'],
    specializations: [
      'Pharmaceutical Chemistry', 'Medicinal Chemistry', 'Pharmacology',
      'Clinical Pharmacy', 'Hospital Pharmacy', 'Community Pharmacy', 'Industrial Pharmacy',
      'Nuclear Pharmacy', 'Pharmacogenomics', 'Pharmacoepidemiology', 'Drug Development'
    ],
    researchAreas: [
      'Drug Discovery', 'Pharmaceutical Chemistry', 'Pharmacology',
      'Clinical Pharmacy', 'Pharmacoepidemiology', 'Pharmacogenomics'
    ],
    careerPaths: [
      'Pharmacist', 'Pharmaceutical Researcher', 'Clinical Pharmacist', 'Hospital Pharmacist',
      'Community Pharmacist', 'Industrial Pharmacist', 'Regulatory Affairs Specialist'
    ]
  }
];

// Education Fields
export const educationFields: AcademicField[] = [
  {
    id: 'education',
    name: 'Education',
    category: 'education',
    subfields: ['Educational Psychology', 'Curriculum Development', 'Educational Technology', 'Special Education', 'Educational Leadership', 'Adult Education', 'Early Childhood Education'],
    specializations: [
      'Digital Education', 'AI in Education', 'Learning Analytics', 'Educational Leadership',
      'Curriculum Development', 'Educational Technology', 'Special Education',
      'Educational Psychology', 'Adult Education', 'Early Childhood Education'
    ],
    researchAreas: [
      'Learning Analytics', 'Educational AI', 'Personalized Learning', 'EdTech',
      'Digital Learning', 'Educational Technology', 'Curriculum Design'
    ],
    careerPaths: [
      'Professor', 'Teacher', 'Administrator', 'Educational Consultant', 'EdTech Developer',
      'Curriculum Developer', 'Educational Researcher', 'Learning Designer'
    ]
  },
  {
    id: 'educational-psychology',
    name: 'Educational Psychology',
    category: 'education',
    subfields: ['Learning Theory', 'Cognitive Development', 'Social Development', 'Motivation', 'Assessment', 'Instructional Design'],
    specializations: [
      'Learning Theory', 'Cognitive Development', 'Social Development', 'Motivation Theory',
      'Assessment Design', 'Instructional Design', 'Educational Measurement', 'Learning Analytics'
    ],
    researchAreas: [
      'Learning Analytics', 'Educational AI', 'Personalized Learning', 'EdTech',
      'Learning Theory', 'Cognitive Development', 'Social Development'
    ],
    careerPaths: [
      'Educational Psychologist', 'School Psychologist', 'Professor', 'Learning Specialist',
      'Instructional Designer', 'Assessment Specialist', 'Learning Analytics Expert'
    ]
  }
];

// Get all fields by category
export function getFieldsByCategory(category: string): AcademicField[] {
  switch (category) {
    case 'stem':
      return [...stemFields];
    case 'humanities':
      return [...humanitiesFields];
    case 'social_sciences':
      return [...socialSciencesFields];
    case 'arts':
      return [...artsFields];
    case 'business':
      return [...businessFields];
    case 'health':
      return [...healthFields];
    case 'education':
      return [...educationFields];
    default:
      return [...stemFields, ...humanitiesFields, ...socialSciencesFields, ...artsFields, ...businessFields, ...healthFields, ...educationFields];
  }
}

// Get field by ID
export function getFieldById(fieldId: string): AcademicField | null {
  const allFields = [...stemFields, ...humanitiesFields, ...socialSciences, ...artsFields, ...businessFields, ...healthFields, ...educationFields];
  return allFields.find(field => field.id === fieldId) || null;
}

// Get all fields
export function getAllFields(): AcademicField[] {
  return [...stemFields, ...humanitiesFields, {
    id: 'computer-science',
    name: 'Computer Science',
    category: 'stem',
    subfields: ['AI/ML', 'Software Engineering', 'Data Science'],
    specializations: ['Machine Learning', 'Artificial Intelligence'],
    researchAreas: ['Deep Learning', 'Computer Vision'],
    careerPaths: ['Software Engineer', 'Data Scientist']
  }];
}

// Search fields by name
export function searchFields(query: string): AcademicField[] {
  const allFields = getAllFields();
  const queryLower = query.toLowerCase();
  
  return allFields.filter(field => 
    field.name.toLowerCase().includes(queryLower) ||
    field.subfields.some(subfield => subfield.toLowerCase().includes(queryLower)) ||
    field.specializations.some(spec => spec.toLowerCase().includes(queryLower))
  );
}

// Get fields by category and subfield
export function getFieldsBySubfield(category: string, subfield: string): AcademicField[] {
  const fields = getFieldsByCategory(category);
  return fields.filter(field => 
    field.subfields.includes(subfield)
  );
}

// Get fields by specialization
export function getFieldsBySpecialization(specialization: string): AcademicField[] {
  const allFields = getAllFields();
  return allFields.filter(field => 
    field.specializations.includes(specialization)
  );
}

export { AcademicField };
