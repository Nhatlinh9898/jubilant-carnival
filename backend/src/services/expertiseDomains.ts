// Expertise Domains - Quản lý domain chuyên môn và profile chuyên gia
import { AcademicField } from './academicFields';
import { AcademicLevel } from './academicLevels';
import { ResearchPaper } from './researchDatabase';

export interface ExpertiseDomain {
  id: string;
  field: string;
  specialization: string;
  level: 'expert' | 'master' | 'professor' | 'researcher' | 'academic';
  knowledgeBase: KnowledgeNode[];
  researchPapers: ResearchPaper[];
  methodologies: string[];
  frameworks: string[];
  skills: ExpertSkill[];
  competencies: ExpertCompetency[];
  experience: ExpertExperience[];
}

export interface KnowledgeNode {
  id: string;
  concept: string;
  definition: string;
  context: string;
  applications: string[];
  theories: string[];
  research: string[];
  examples: string[];
  references: string[];
  difficulty: number;
  importance: number;
  prerequisites: string[];
  relatedConcepts: string[];
}

export interface ExpertSkill {
  id: string;
  name: string;
  category: 'technical' | 'research' | 'teaching' | 'leadership' | 'communication';
  level: number;
  description: string;
  applications: string[];
  assessmentCriteria: string[];
  developmentResources: string[];
}

export interface ExpertCompetency {
  id: string;
  name: string;
  category: 'knowledge' | 'skill' | 'ability' | 'behavior';
  level: number;
  description: string;
  evidence: string[];
  assessment: CompetencyAssessment;
}

export interface CompetencyAssessment {
  criteria: string[];
  methods: string[];
  tools: string[];
  frequency: string;
}

export interface ExpertExperience {
  id: string;
  type: 'research' | 'teaching' | 'industry' | 'consulting' | 'leadership';
  title: string;
  organization: string;
  duration: string;
  description: string;
  achievements: string[];
  skills: string[];
  impact: string;
}

export interface ExpertProfile {
  userId: number;
  academicLevel: AcademicLevel;
  primaryField: AcademicField;
  secondaryFields: AcademicField[];
  specializations: string[];
  researchInterests: string[];
  publications: Publication[];
  citations: number;
  hIndex: number;
  impact: number;
  collaborations: Collaboration[];
  grants: Grant[];
  teachingExperience: TeachingExperience[];
  skills: ExpertSkill[];
  competencies: ExpertCompetency[];
  experience: ExpertExperience[];
  expertiseDomains: ExpertiseDomain[];
  careerGoals: CareerGoal[];
  achievements: Achievement[];
  network: ProfessionalNetwork[];
}

export interface Publication {
  id: string;
  title: string;
  type: 'journal' | 'conference' | 'book' | 'chapter' | 'patent' | 'thesis';
  authors: string[];
  journal: string;
  year: number;
  citations: number;
  impact: number;
  doi: string;
  keywords: string[];
  abstract: string;
}

export interface Collaboration {
  id: string;
  type: 'research' | 'teaching' | 'grant' | 'conference' | 'consulting';
  partners: string[];
  institution: string;
  duration: string;
  title: string;
  description: string;
  outcomes: string[];
  impact: string;
}

export interface Grant {
  id: string;
  title: string;
  agency: string;
  amount: number;
  duration: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  role: string;
  description: string;
  outcomes: string[];
}

export interface TeachingExperience {
  institution: string;
  courses: string[];
  level: string[];
  duration: string;
  evaluations: Evaluation[];
  achievements: string[];
}

export interface Evaluation {
  type: string;
  score: number;
  feedback: string[];
  date: Date;
}

export interface CareerGoal {
  id: string;
  type: 'academic' | 'research' | 'teaching' | 'leadership' | 'industry';
  title: string;
  description: string;
  timeframe: string;
  requirements: string[];
  progress: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date?: Date;
}

export interface Achievement {
  id: string;
  type: 'award' | 'recognition' | 'milestone' | 'certification';
  title: string;
  description: string;
  date: Date;
  issuer: string;
  significance: string;
}

export interface ProfessionalNetwork {
  contacts: NetworkContact[];
  collaborations: Collaboration[];
  memberships: Membership[];
  events: Event[];
}

export interface NetworkContact {
  id: string;
  name: string;
  institution: string;
  field: string;
  relationship: string;
  lastContact: Date;
  notes: string;
}

export interface Membership {
  id: string;
  organization: string;
  role: string;
  since: Date;
  activities: string[];
}

export interface Event {
  id: string;
  type: 'conference' | 'workshop' | 'seminar' | 'meeting';
  title: string;
  date: Date;
  location: string;
  role: string;
  impact: string;
}

export class ExpertiseDomains {
  private domains: Map<string, ExpertiseDomain[]> = new Map();
  private profiles: Map<number, ExpertProfile> = new Map();
  private skillLibrary: Map<string, ExpertSkill[]> = new Map();
  private competencyLibrary: Map<string, ExpertCompetency[]> = new Map();

  constructor() {
    this.initializeExpertiseDomains();
    this.initializeSkillLibrary();
    this.initializeCompetencyLibrary();
  }

  // Khởi tạo expertise domains
  private initializeExpertiseDomains() {
    const domains: ExpertiseDomain[] = [
      {
        id: 'ai-expert',
        field: 'computer-science',
        specialization: 'artificial intelligence',
        level: 'expert',
        knowledgeBase: [
          {
            id: 'ml-basics',
            concept: 'Machine Learning Fundamentals',
            definition: 'Core concepts and algorithms in machine learning',
            context: 'Computer Science, Data Science',
            applications: ['Predictive analytics', 'Classification', 'Regression', 'Clustering'],
            theories: ['Statistical learning theory', 'Bayesian inference', 'Information theory'],
            research: ['Deep learning', 'Reinforcement learning', 'Transfer learning'],
            examples: ['Image recognition', 'Natural language processing', 'Recommendation systems'],
            references: ['Pattern Recognition and Machine Learning', 'Deep Learning'],
            difficulty: 7,
            importance: 9,
            prerequisites: ['Linear algebra', 'Probability', 'Statistics', 'Programming'],
            relatedConcepts: ['Neural networks', 'Optimization', 'Data preprocessing']
          },
          {
            id: 'deep-learning',
            concept: 'Deep Learning',
            definition: 'Neural networks with multiple layers for complex pattern recognition',
            context: 'Artificial Intelligence, Computer Vision',
            applications: ['Computer vision', 'NLP', 'Speech recognition', 'Autonomous vehicles'],
            theories: ['Backpropagation', 'Gradient descent', 'Regularization'],
            research: ['Transformer models', 'GANs', 'Self-supervised learning'],
            examples: ['GPT models', 'BERT', 'ResNet', 'StyleGAN'],
            references: ['Deep Learning', 'Neural Networks and Deep Learning'],
            difficulty: 8,
            importance: 9,
            prerequisites: ['Machine learning', 'Linear algebra', 'Calculus'],
            relatedConcepts: ['Neural networks', 'Optimization', 'Computer vision']
          }
        ],
        researchPapers: [],
        methodologies: ['experimental', 'computational', 'statistical'],
        frameworks: ['supervised', 'unsupervised', 'reinforcement'],
        skills: [
          {
            id: 'ml-programming',
            name: 'Machine Learning Programming',
            category: 'technical',
            level: 8,
            description: 'Ability to implement ML algorithms and models',
            applications: ['Model development', 'Data preprocessing', 'Evaluation'],
            assessmentCriteria: ['Code quality', 'Model accuracy', 'Performance optimization'],
            developmentResources: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Kaggle']
          }
        ],
        competencies: [
          {
            id: 'ml-analysis',
            name: 'Machine Learning Analysis',
            category: 'skill',
            level: 8,
            description: 'Ability to analyze and interpret ML results',
            evidence: ['Published papers', 'Competition results', 'Project outcomes'],
            assessment: {
              criteria: ['Analytical depth', 'Interpretation accuracy', 'Novel insights'],
              methods: ['Code review', 'Result analysis', 'Peer evaluation'],
              tools: ['Jupyter notebooks', 'Visualization tools', 'Statistical software'],
              frequency: 'Monthly'
            }
          }
        ],
        experience: []
      },
      {
        id: 'quantum-expert',
        field: 'physics',
        specialization: 'quantum mechanics',
        level: 'expert',
        knowledgeBase: [
          {
            id: 'quantum-basics',
            concept: 'Quantum Mechanics Fundamentals',
            definition: 'Fundamental principles governing quantum systems',
            context: 'Physics, Chemistry, Computer Science',
            applications: ['Quantum computing', 'Cryptography', 'Sensors', 'Metrology'],
            theories: ['Wave-particle duality', 'Uncertainty principle', 'Superposition'],
            research: ['Quantum entanglement', 'Quantum computing', 'Quantum cryptography'],
            examples: ['Quantum computers', 'Quantum cryptography', 'Quantum sensors'],
            references: ['Principles of Quantum Mechanics', 'Quantum Computation and Quantum Information'],
            difficulty: 9,
            importance: 9,
            prerequisites: ['Linear algebra', 'Classical mechanics', 'Probability'],
            relatedConcepts: ['Quantum entanglement', 'Quantum computing', 'Quantum cryptography']
          }
        ],
        researchPapers: [],
        methodologies: ['experimental', 'theoretical', 'computational'],
        frameworks: ['quantum-mechanics', 'quantum-information', 'quantum-computing'],
        skills: [
          {
            id: 'quantum-programming',
            name: 'Quantum Programming',
            category: 'technical',
            level: 7,
            description: 'Ability to program quantum computers and algorithms',
            applications: ['Quantum algorithm development', 'Quantum simulation', 'Quantum optimization'],
            assessmentCriteria: ['Algorithm correctness', 'Efficiency', 'Innovation'],
            developmentResources: ['Qiskit', 'Cirq', 'Quantum Development Kit', 'IBM Quantum']
          }
        ],
        competencies: [
          {
            id: 'quantum-theory',
            name: 'Quantum Theory Understanding',
            category: 'knowledge',
            level: 9,
            description: 'Deep understanding of quantum mechanical principles',
            evidence: ['Publications', 'Teaching', 'Research contributions'],
            assessment: {
              criteria: ['Theoretical depth', 'Mathematical rigor', 'Novel insights'],
              methods: ['Written exams', 'Research evaluation', 'Teaching assessment'],
              tools: ['Mathematical software', 'Simulation tools', 'Analytical methods'],
              frequency: 'Quarterly'
            }
          }
        ],
        experience: []
      }
    ];

    this.domains.set('all', domains);
  }

  // Khởi tạo skill library
  private initializeSkillLibrary() {
    const skills: ExpertSkill[] = [
      // Technical Skills
      {
        id: 'programming',
        name: 'Programming',
        category: 'technical',
        level: 8,
        description: 'Proficiency in programming languages and software development',
        applications: ['Software development', 'Data analysis', 'Research implementation'],
        assessmentCriteria: ['Code quality', 'Efficiency', 'Problem-solving'],
        developmentResources: ['Online courses', 'Programming platforms', 'Code repositories']
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis',
        category: 'technical',
        level: 7,
        description: 'Ability to analyze and interpret complex datasets',
        applications: ['Research', 'Business intelligence', 'Scientific discovery'],
        assessmentCriteria: ['Analytical accuracy', 'Insight generation', 'Visualization'],
        developmentResources: ['Statistical software', 'Data visualization tools', 'Analytics platforms']
      },
      // Research Skills
      {
        id: 'research-design',
        name: 'Research Design',
        category: 'research',
        level: 8,
        description: 'Ability to design and plan research studies',
        applications: ['Academic research', 'Industrial R&D', 'Policy research'],
        assessmentCriteria: ['Methodological rigor', 'Feasibility', 'Innovation'],
        developmentResources: ['Research methodology courses', 'Grant writing workshops', 'Mentorship']
      },
      {
        id: 'academic-writing',
        name: 'Academic Writing',
        category: 'research',
        level: 7,
        description: 'Ability to write clear, concise academic papers and reports',
        applications: ['Publications', 'Grant proposals', 'Technical reports'],
        assessmentCriteria: ['Clarity', 'Structure', 'Scholarly rigor'],
        developmentResources: ['Writing workshops', 'Peer review', 'Writing groups']
      },
      // Teaching Skills
      {
        id: 'curriculum-design',
        name: 'Curriculum Design',
        category: 'teaching',
        level: 7,
        description: 'Ability to design effective educational curricula',
        applications: ['Course development', 'Training programs', 'Educational materials'],
        assessmentCriteria: ['Learning outcomes', 'Engagement', 'Assessment alignment'],
        developmentResources: ['Educational theory', 'Pedagogy courses', 'Teaching experience']
      },
      {
        id: 'student-mentoring',
        name: 'Student Mentoring',
        category: 'teaching',
        level: 8,
        description: 'Ability to guide and support student development',
        applications: ['Academic advising', 'Research supervision', 'Career guidance'],
        assessmentCriteria: ['Student success', 'Mentorship quality', 'Professional development'],
        developmentResources: ['Mentoring training', 'Experience', 'Feedback systems']
      },
      // Leadership Skills
      {
        id: 'project-management',
        name: 'Project Management',
        category: 'leadership',
        level: 7,
        description: 'Ability to manage complex research and development projects',
        applications: ['Research projects', 'Team leadership', 'Resource management'],
        assessmentCriteria: ['Project success', 'Team performance', 'Resource efficiency'],
        developmentResources: ['Management training', 'Project management tools', 'Leadership experience']
      },
      {
        id: 'strategic-planning',
        name: 'Strategic Planning',
        category: 'leadership',
        level: 8,
        description: 'Ability to develop and implement strategic plans',
        applications: ['Department leadership', 'Research strategy', 'Institutional development'],
        assessmentCriteria: ['Plan effectiveness', 'Stakeholder alignment', 'Outcome achievement'],
        developmentResources: ['Strategic planning courses', 'Leadership development', 'Consulting experience']
      },
      // Communication Skills
      {
        id: 'presentation',
        name: 'Presentation',
        category: 'communication',
        level: 7,
        description: 'Ability to effectively present complex information to diverse audiences',
        applications: ['Conference presentations', 'Teaching', 'Stakeholder communication'],
        assessmentCriteria: ['Clarity', 'Engagement', 'Audience adaptation'],
        developmentResources: ['Public speaking training', 'Presentation workshops', 'Practice opportunities']
      },
      {
        id: 'scientific-communication',
        name: 'Scientific Communication',
        category: 'communication',
        level: 8,
        description: 'Ability to communicate scientific concepts to various audiences',
        applications: ['Public outreach', 'Science journalism', 'Policy communication'],
        assessmentCriteria: ['Accuracy', 'Accessibility', 'Impact'],
        developmentResources: ['Science communication training', 'Media experience', 'Outreach programs']
      }
    ];

    // Group skills by category
    const skillsByCategory = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, ExpertSkill[]>);

    Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
      this.skillLibrary.set(category, categorySkills);
    });
    this.skillLibrary.set('all', skills);
  }

  // Khởi tạo competency library
  private initializeCompetencyLibrary() {
    const competencies: ExpertCompetency[] = [
      // Knowledge Competencies
      {
        id: 'domain-knowledge',
        name: 'Domain Knowledge',
        category: 'knowledge',
        level: 8,
        description: 'Deep understanding of specific academic domain',
        evidence: ['Publications', 'Teaching', 'Expert consultation'],
        assessment: {
          criteria: ['Depth', 'Breadth', 'Current awareness'],
          methods: ['Knowledge tests', 'Peer evaluation', 'Publication review'],
          tools: ['Assessment platforms', 'Expert panels', 'Publication metrics'],
          frequency: 'Annual'
        }
      },
      {
        id: 'interdisciplinary-knowledge',
        name: 'Interdisciplinary Knowledge',
        category: 'knowledge',
        level: 7,
        description: 'Understanding of multiple related disciplines',
        evidence: ['Collaborative work', 'Cross-disciplinary publications'],
        assessment: {
          criteria: ['Integration ability', 'Breadth', 'Innovation'],
          methods: ['Project evaluation', 'Collaboration assessment', 'Publication analysis'],
          tools: ['Project reviews', 'Collaboration metrics', 'Innovation indicators'],
          frequency: 'Biannual'
        }
      },
      // Skill Competencies
      {
        id: 'critical-thinking',
        name: 'Critical Thinking',
        category: 'skill',
        level: 8,
        description: 'Ability to analyze, evaluate, and synthesize information',
        evidence: ['Research quality', 'Problem-solving', 'Decision-making'],
        assessment: {
          criteria: ['Analytical depth', 'Evaluation accuracy', 'Synthesis quality'],
          methods: ['Case studies', 'Problem analysis', 'Decision scenarios'],
          tools: ['Analytical frameworks', 'Evaluation rubrics', 'Decision matrices'],
          frequency: 'Quarterly'
        }
      },
      {
        id: 'problem-solving',
        name: 'Problem Solving',
        category: 'skill',
        level: 8,
        description: 'Ability to identify, analyze, and solve complex problems',
        evidence: ['Research solutions', 'Innovation', 'Impact'],
        assessment: {
          criteria: ['Problem identification', 'Solution quality', 'Innovation'],
          methods: ['Problem analysis', 'Solution evaluation', 'Impact assessment'],
          tools: ['Problem frameworks', 'Solution metrics', 'Impact indicators'],
          frequency: 'Monthly'
        }
      },
      // Ability Competencies
      {
        id: 'innovation',
        name: 'Innovation',
        category: 'ability',
        level: 7,
        description: 'Ability to create novel solutions and approaches',
        evidence: ['Patents', 'Novel research', 'Creative solutions'],
        assessment: {
          criteria: ['Novelty', 'Impact', 'Feasibility'],
          methods: ['Innovation metrics', 'Expert evaluation', 'Impact analysis'],
          tools: ['Innovation frameworks', 'Impact metrics', 'Expert panels'],
          frequency: 'Annual'
        }
      },
      {
        id: 'adaptability',
        name: 'Adaptability',
        category: 'ability',
        level: 8,
        description: 'Ability to adapt to changing circumstances and requirements',
        evidence: ['Career transitions', 'Skill development', 'Flexibility'],
        assessment: {
          criteria: ['Flexibility', 'Learning speed', 'Resilience'],
          methods: ['Performance review', 'Skill assessment', 'Challenge response'],
          tools: ['Performance metrics', 'Skill assessments', 'Adaptability tests'],
          frequency: 'Quarterly'
        }
      },
      // Behavior Competencies
      {
        id: 'collaboration',
        name: 'Collaboration',
        category: 'behavior',
        level: 8,
        description: 'Ability to work effectively with others in teams',
        evidence: ['Team projects', 'Collaborative publications', 'Partnerships'],
        assessment: {
          criteria: ['Teamwork quality', 'Communication', 'Conflict resolution'],
          methods: ['Team evaluation', 'Peer review', 'Collaboration metrics'],
          tools: ['Team assessment tools', '360-degree feedback', 'Collaboration platforms'],
          frequency: 'Monthly'
        }
      },
      {
        id: 'leadership',
        name: 'Leadership',
        category: 'behavior',
        level: 7,
        description: 'Ability to lead and inspire others',
        evidence: ['Leadership roles', 'Team success', 'Mentorship'],
        assessment: {
          criteria: ['Vision', 'Influence', 'Team development'],
          methods: ['Leadership assessment', 'Team feedback', 'Success metrics'],
          tools: ['Leadership frameworks', '360-degree feedback', 'Performance metrics'],
          frequency: 'Quarterly'
        }
      }
    ];

    // Group competencies by category
    const competenciesByCategory = competencies.reduce((acc, competency) => {
      if (!acc[competency.category]) {
        acc[competency.category] = [];
      }
      acc[competency.category].push(competency);
      return acc;
    }, {} as Record<string, ExpertCompetency[]>);

    Object.entries(competenciesByCategory).forEach(([category, categoryCompetencies]) => {
      this.competencyLibrary.set(category, categoryCompetencies);
    });
    this.competencyLibrary.set('all', competencies);
  }

  // Get expertise domains by field
  getDomainsByField(field: string): ExpertiseDomain[] {
    const allDomains = this.domains.get('all') || [];
    return allDomains.filter(domain => domain.field === field);
  }

  // Get expertise domains by specialization
  getDomainsBySpecialization(specialization: string): ExpertiseDomain[] {
    const allDomains = this.domains.get('all') || [];
    return allDomains.filter(domain => 
      domain.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  }

  // Get all expertise domains
  getAllDomains(): ExpertiseDomain[] {
    return this.domains.get('all') || [];
  }

  // Create expert profile
  createExpertProfile(userId: number, academicLevel: AcademicLevel, primaryField: AcademicField): ExpertProfile {
    const profile: ExpertProfile = {
      userId,
      academicLevel,
      primaryField,
      secondaryFields: [],
      specializations: [],
      researchInterests: [],
      publications: [],
      citations: 0,
      hIndex: 0,
      impact: 0,
      collaborations: [],
      grants: [],
      teachingExperience: [],
      skills: [],
      competencies: [],
      experience: [],
      expertiseDomains: [],
      careerGoals: [],
      achievements: [],
      network: {
        contacts: [],
        collaborations: [],
        memberships: [],
        events: []
      }
    };

    this.profiles.set(userId, profile);
    return profile;
  }

  // Get expert profile
  getExpertProfile(userId: number): ExpertProfile | null {
    return this.profiles.get(userId) || null;
  }

  // Update expert profile
  updateExpertProfile(userId: number, updates: Partial<ExpertProfile>): ExpertProfile | null {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    const updatedProfile = { ...profile, ...updates };
    this.profiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  // Get skills by category
  getSkillsByCategory(category: string): ExpertSkill[] {
    return this.skillLibrary.get(category) || [];
  }

  // Get all skills
  getAllSkills(): ExpertSkill[] {
    return this.skillLibrary.get('all') || [];
  }

  // Get competencies by category
  getCompetenciesByCategory(category: string): ExpertCompetency[] {
    return this.competencyLibrary.get(category) || [];
  }

  // Get all competencies
  getAllCompetencies(): ExpertCompetency[] {
    return this.competencyLibrary.get('all') || [];
  }

  // Calculate expertise score
  calculateExpertiseScore(profile: ExpertProfile): {
    overall: number;
    byCategory: Record<string, number>;
    recommendations: string[];
  } {
    const scores = {
      technical: 0,
      research: 0,
      teaching: 0,
      leadership: 0,
      communication: 0
    };

    // Calculate skill scores
    profile.skills.forEach(skill => {
      scores[skill.category] += skill.level;
    });

    // Calculate competency scores
    profile.competencies.forEach(competency => {
      scores[competency.category] += competency.level;
    });

    // Normalize scores
    const maxScore = 20; // Maximum possible score per category
    Object.keys(scores).forEach(category => {
      scores[category] = Math.min(10, scores[category] / maxScore * 10);
    });

    // Calculate overall score
    const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    // Generate recommendations
    const recommendations: string[] = [];
    Object.entries(scores).forEach(([category, score]) => {
      if (score < 7) {
        recommendations.push(`Focus on improving ${category} skills`);
      }
    });

    return {
      overall,
      byCategory: scores,
      recommendations
    };
  }

  // Get career progression recommendations
  getCareerProgressionRecommendations(profile: ExpertProfile): {
    nextLevel: AcademicLevel | null;
    requirements: string[];
    timeline: string;
    actionPlan: string[];
  } {
    const currentLevel = profile.academicLevel;
    const expertiseScore = this.calculateExpertiseScore(profile);

    // Determine next level
    let nextLevel: AcademicLevel | null = null;
    const levels: AcademicLevel[] = [
      { id: 'undergraduate', level: 'undergraduate' } as AcademicLevel,
      { id: 'graduate', level: 'graduate' } as AcademicLevel,
      { id: 'postgraduate', level: 'postgraduate' } as AcademicLevel,
      { id: 'doctoral', level: 'doctoral' } as AcademicLevel,
      { id: 'postdoctoral', level: 'postdoctoral' } as AcademicLevel,
      { id: 'professor', level: 'professor' } as AcademicLevel,
      { id: 'researcher', level: 'researcher' } as AcademicLevel
    ];

    const currentIndex = levels.findIndex(level => level.id === currentLevel.id);
    if (currentIndex < levels.length - 1) {
      nextLevel = levels[currentIndex + 1];
    }

    // Generate requirements and action plan
    const requirements: string[] = [];
    const actionPlan: string[] = [];
    let timeline = '';

    if (nextLevel) {
      switch (nextLevel.level) {
        case 'graduate':
          requirements.push('Bachelor\'s degree', 'Research experience', 'Academic writing');
          actionPlan.push('Complete undergraduate degree', 'Gain research experience', 'Improve academic writing');
          timeline = '1-2 years';
          break;
        case 'doctoral':
          requirements.push('Master\'s degree', 'Publications', 'Teaching experience');
          actionPlan.push('Complete master\'s degree', 'Publish research papers', 'Gain teaching experience');
          timeline = '3-5 years';
          break;
        case 'professor':
          requirements.push('PhD', 'Significant publications', 'Teaching excellence');
          actionPlan.push('Complete PhD', 'Publish high-impact papers', 'Develop teaching portfolio');
          timeline = '5-10 years';
          break;
      }
    }

    return {
      nextLevel,
      requirements,
      timeline,
      actionPlan
    };
  }
}

export { ExpertiseDomains, ExpertiseDomain, ExpertProfile, ExpertSkill, ExpertCompetency, KnowledgeNode, ExpertExperience, Publication, Collaboration, Grant, TeachingExperience, CareerGoal, Achievement, ProfessionalNetwork };
