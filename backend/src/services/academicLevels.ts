// Academic Levels Definition - Định nghĩa các trình độ học thuật
export interface AcademicLevel {
  id: string;
  name: string;
  level: 'undergraduate' | 'graduate' | 'postgraduate' | 'doctoral' | 'postdoctoral' | 'professor' | 'researcher';
  requirements: string[];
  skills: string[];
  competencies: string[];
  outcomes: string[];
}

export const academicLevels: AcademicLevel[] = [
  {
    id: 'undergraduate',
    name: 'Undergraduate',
    level: 'undergraduate',
    requirements: [
      'High school diploma or equivalent',
      'Basic academic writing skills',
      'Fundamental knowledge in chosen field',
      'Critical thinking abilities',
      'Research basics'
    ],
    skills: [
      'Academic writing',
      'Critical thinking',
      'Research methodology basics',
      'Information literacy',
      'Communication skills',
      'Analytical reasoning',
      'Problem-solving',
      'Time management'
    ],
    competencies: [
      'Basic research skills',
      'Academic writing',
      'Critical analysis',
      'Information synthesis',
      'Presentation skills',
      'Collaboration',
      'Digital literacy'
    ],
    outcomes: [
      'Bachelor\'s degree',
      'Foundation knowledge',
      'Research experience',
      'Academic writing proficiency',
      'Critical thinking skills',
      'Information literacy'
    ]
  },
  {
    id: 'graduate',
    name: 'Graduate',
    level: 'graduate',
    requirements: [
      'Bachelor\'s degree in relevant field',
      'Research experience',
      'Academic writing experience',
      'Basic statistical knowledge',
      'Professional communication'
    ],
    skills: [
      'Advanced research',
      'Statistical analysis',
      'Academic writing',
      'Critical thinking',
      'Project management',
      'Data analysis',
      'Literature review',
      'Presentation skills'
    ],
    competencies: [
      'Independent research',
      'Advanced analysis',
      'Scholarly communication',
      'Grant writing',
      'Peer review',
      'Conference presentation',
      'Teaching assistance'
    ],
    outcomes: [
      'Master\'s degree',
      'Research expertise',
      'Specialized knowledge',
      'Publication record',
      'Teaching experience',
      'Professional network'
    ]
  },
  {
    id: 'postgraduate',
    name: 'Postgraduate',
    level: 'postgraduate',
    requirements: [
      'Master\'s degree',
      'Research experience',
      'Publications preferred',
      'Professional experience',
      'Advanced analytical skills'
    ],
    skills: [
      'Advanced research',
      'Statistical analysis',
      'Academic writing',
      'Project leadership',
      'Mentoring',
      'Curriculum development',
      'Grant writing',
      'Conference presentation'
    ],
    competencies: [
      'Independent research',
      'Teaching',
      'Mentoring',
      'Curriculum design',
      'Academic leadership',
      'Project management',
      'Peer review'
    ],
    outcomes: [
      'Specialist degree',
      'Research expertise',
      'Teaching experience',
      'Professional recognition',
      'Leadership skills'
    ]
  },
  {
    id: 'doctoral',
    name: 'Doctoral',
    level: 'doctoral',
    requirements: [
      'Master\'s degree with strong academic record',
      'Research experience with publications',
      'GRE scores (if applicable)',
      'Letters of recommendation',
      'Statement of purpose',
      'Research proposal'
    ],
    skills: [
      'Advanced research',
      'Statistical analysis',
      'Academic writing',
      'Teaching',
      'Mentoring',
      'Leadership',
      'Grant writing',
      'Peer review',
      'Conference presentation',
      'Journal publication'
    ],
    competencies: [
      'Original research contribution',
      'Scholarly communication',
      'Teaching excellence',
      'Mentoring',
      'Research leadership',
      'Grant acquisition',
      'Peer review expertise'
    ],
    outcomes: [
      'PhD degree',
      'Research expertise',
      'Teaching experience',
      'Publication record',
      'Academic network',
      'Professional recognition'
    ]
  },
  {
    id: 'postdoctoral',
    name: 'Postdoctoral',
    level: 'postdoctoral',
    requirements: [
      'PhD degree',
      'Strong publication record',
      'Research experience',
      'Letters of recommendation',
      'Research proposal',
      'Host institution acceptance'
    ],
    skills: [
      'Advanced research',
      'Grant writing',
      'Project management',
      'Collaboration',
      'Networking',
      'Conference presentation',
      'Journal publication',
      'Mentoring',
      'Career development'
    ],
    competencies: [
      'Independent research',
      'Grant acquisition',
      'Collaboration',
      'Project management',
      'Network building',
      'Career advancement'
    ],
    outcomes: [
      'Research expertise',
      'Professional network',
      'Enhanced publication record',
      'Career advancement',
      'Industry connections'
    ]
  },
  {
    id: 'professor',
    name: 'Professor',
    level: 'professor',
    requirements: [
      'PhD degree with strong academic record',
      'Significant publications',
      'Teaching experience',
      'Research leadership',
      'Professional recognition',
      'Administrative experience'
    ],
    skills: [
      'Research leadership',
      'Teaching excellence',
      'Mentoring',
      'Leadership',
      'Grant writing',
      'Project management',
      'Curriculum development',
      'Academic administration',
      'Strategic planning'
    ],
    competencies: [
      'Research leadership',
      'Teaching excellence',
      'Mentoring',
      'Administrative leadership',
      'Strategic planning',
      'Faculty development',
      'Curriculum design',
      'Quality assurance'
    ],
    outcomes: [
      'Tenure',
      'Research leadership',
      'Teaching excellence',
      'Administrative leadership',
      'Professional recognition',
      'Institutional impact'
    ]
  },
  {
    id: 'researcher',
    name: 'Researcher',
    level: 'researcher',
    requirements: [
      'Advanced degree (PhD preferred)',
      'Research experience',
      'Technical expertise',
      'Publication record',
      'Collaboration skills'
    ],
    skills: [
      'Research expertise',
      'Data analysis',
      'Writing skills',
      'Collaboration',
      'Project management',
      'Statistical analysis',
      'Technical writing',
      'Presentation skills'
    ],
    competencies: [
      'Research expertise',
      'Collaboration',
      'Project management',
      'Technical expertise',
      'Publication record'
    ],
    outcomes: [
      'Research expertise',
      'Publications',
      'Network',
      'Technical expertise',
      'Professional recognition'
    ]
  }
];

// Get academic level by ID
export function getAcademicLevel(levelId: string): AcademicLevel | null {
  return academicLevels.find(level => level.id === levelId) || null;
}

// Get academic level by name
export function getAcademicLevelByName(levelName: string): AcademicLevel | null {
  return academicLevels.find(level => level.name === levelName) || null;
}

// Get levels by level type
export function getLevelsByLevelType(levelType: string): AcademicLevel[] {
  return academicLevels.filter(level => level.level === levelType);
}

// Get all academic levels
export function getAllAcademicLevels(): AcademicLevel[] {
  return [...academicLevels];
}

// Get levels by requirements
export function getLevelsByRequirement(requirement: string): AcademicLevel[] {
  return academicLevels.filter(level => 
    level.requirements.some(req => req.toLowerCase().includes(requirement.toLowerCase()))
  );
}

// Get levels by skill
export function getLevelsBySkill(skill: string): AcademicLevel[] {
  return academicLevels.filter(level => 
    level.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  );
}

// Get levels by competency
export function getLevelsByCompetency(competency: string): AcademicLevel[] {
  return academicLevels.filter(level => 
    level.competencies.some(c => c.toLowerCase().includes(competency.toLowerCase()))
  );
}

// Get levels by outcome
export function getLevelsByOutcome(outcome: string): AcademicLevel[] {
  return academicLevels.filter(level => 
    level.outcomes.some(o => o.toLowerCase().includes(outcome.toLowerCase()))
  );
}

// Get next level
export function getNextLevel(currentLevelId: string): AcademicLevel | null {
  const currentIndex = academicLevels.findIndex(level => level.id === currentLevelId);
  if (currentIndex < 0 || currentIndex >= academicLevels.length - 1) {
    return null;
  }
  return academicLevels[currentIndex + 1];
}

// Get previous level
export function getPreviousLevel(currentLevelId: string): AcademicLevel | null {
  const currentIndex = academicLevels.findIndex(level => level.id === currentLevelId);
  if (currentIndex <= 0 || currentIndex > academicLevels.length - 1) {
    return null;
  }
  return academicLevels[currentIndex - 1];
}

// Validate academic level progression
export function validateLevelProgression(currentLevelId: string, targetLevelId: string): boolean {
  const current = getAcademicLevel(currentLevelId);
  const target = getAcademicLevel(targetLevel);
  
  if (!current || !target) return false;
  
  const currentLevelIndex = academicLevels.findIndex(level => level.id === currentLevelId);
  const targetLevelIndex = academicLevels.findIndex(level => level.id === targetLevelId);
  
  return targetLevelIndex > currentLevelIndex;
}

// Get level requirements for progression
export function getLevelRequirements(currentLevelId: string): string[] {
  const level = getAcademicLevel(currentLevelId);
  return level ? level.requirements : [];
}

// Get level skills for progression
export function getLevelSkills(currentLevelId: string): string[] {
  const level = getAcademicLevel(currentLevelId);
  return level ? level.skills : [];
}

// Get level competencies for progression
export function getLevelCompetencies(currentLevelId: string): string[] {
  const level = getAcademicLevel(currentLevelId);
  return level ? level.competencies : [];
}

export { AcademicLevel };
