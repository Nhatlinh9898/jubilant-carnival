// Content Generation AI Agents - Tự động tạo nội dung giáo dục đầy đủ
import { prisma } from '@/index';

interface ContentTemplate {
  id: string;
  type: 'lesson' | 'lecture' | 'exercise' | 'exam' | 'quiz' | 'assignment';
  subject: string;
  topic: string;
  difficulty: number;
  structure: ContentStructure;
  metadata: any;
}

interface ContentStructure {
  sections: ContentSection[];
  objectives: string[];
  prerequisites: string[];
  outcomes: string[];
  duration?: number;
  materials: string[];
}

interface ContentSection {
  id: string;
  title: string;
  type: 'introduction' | 'theory' | 'example' | 'practice' | 'assessment' | 'conclusion';
  content: string;
  duration?: number;
  activities?: Activity[];
  questions?: Question[];
}

interface Activity {
  id: string;
  type: 'discussion' | 'group_work' | 'presentation' | 'experiment' | 'simulation';
  title: string;
  description: string;
  duration: number;
  materials: string[];
  instructions: string[];
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'problem_solving' | 'critical_thinking' | 'analysis' | 'synthesis' | 'evaluation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  points: number;
  skills: string[];
  rubric?: Rubric;
}

interface Rubric {
  criteria: RubricCriterion[];
  totalPoints: number;
  passingScore: number;
}

interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

interface RubricLevel {
  level: string;
  score: number;
  description: string;
}

interface GeneratedContent {
  id: string;
  type: string;
  subject: string;
  topic: string;
  title: string;
  description: string;
  structure: ContentStructure;
  content: string;
  questions: Question[];
  activities: Activity[];
  assessment: AssessmentPlan;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

interface AssessmentPlan {
  formative: FormativeAssessment[];
  summative: SummativeAssessment[];
  rubrics: Rubric[];
}

interface FormativeAssessment {
  type: 'quiz' | 'discussion' | 'presentation' | 'observation';
  frequency: string;
  description: string;
}

interface SummativeAssessment {
  type: 'exam' | 'project' | 'portfolio' | 'presentation';
  weight: number;
  description: string;
}

interface DevelopmentModel {
  userId: number;
  currentLevel: number;
  targetLevel: number;
  skills: Skill[];
  progress: Progress;
  recommendations: Recommendation[];
  nextSteps: NextStep[];
}

interface Skill {
  id: string;
  name: string;
  category: 'cognitive' | 'affective' | 'psychomotor';
  currentLevel: number;
  targetLevel: number;
  progress: number;
}

interface Progress {
  overall: number;
  bySkill: Record<string, number>;
  byDomain: Record<string, number>;
  timeline: ProgressPoint[];
}

interface ProgressPoint {
  date: Date;
  level: number;
  achievements: string[];
  challenges: string[];
}

interface Recommendation {
  type: 'content' | 'activity' | 'assessment' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  description: string;
  action: string;
  timeline: string;
}

interface NextStep {
  skill: string;
  activity: string;
  resource: string;
  timeline: string;
}

export class ContentGenerationAI {
  private contentTemplates: Map<string, ContentTemplate[]> = new Map();
  private generatedContent: Map<string, GeneratedContent[]> = new Map();
  private developmentModels: Map<number, DevelopmentModel> = new Map();
  private learningObjectives: Map<string, LearningObjective[]> = new Map();

  constructor() {
    this.initializeContentTemplates();
    this.initializeLearningObjectives();
  }

  // Khởi tạo templates nội dung
  private initializeContentTemplates() {
    const subjects = ['math', 'physics', 'chemistry', 'biology', 'literature', 'history', 'computer-science'];
    
    subjects.forEach(subject => {
      this.contentTemplates.set(subject, [
        {
          id: `${subject}-lesson-basic`,
          type: 'lesson',
          subject,
          topic: 'Basic Concepts',
          difficulty: 1,
          structure: {
            sections: [
              {
                id: 'intro',
                title: 'Introduction',
                type: 'introduction',
                content: '',
                duration: 300
              },
              {
                id: 'theory',
                title: 'Core Concepts',
                type: 'theory',
                content: '',
                duration: 600
              },
              {
                id: 'example',
                title: 'Examples',
                type: 'example',
                content: '',
                duration: 300
              },
              {
                id: 'practice',
                title: 'Practice',
                type: 'practice',
                content: '',
                duration: 600
              }
            ],
            objectives: [
              `Understand basic ${subject} concepts`,
              `Apply fundamental principles`,
              `Solve basic problems`
            ],
            prerequisites: [],
            outcomes: [
              `Basic ${subject} proficiency`,
              `Problem-solving skills`,
              `Foundation knowledge`
            ],
            duration: 1800,
            materials: ['Textbook', 'Notebook', 'Calculator']
          },
          metadata: {
            gradeLevel: 'beginner',
            estimatedTime: '30 minutes',
            difficulty: 'basic'
          }
        }
      ]);
    });
  }

  // Khởi tạo learning objectives
  private initializeLearningObjectives() {
    const objectives = [
      {
        domain: 'cognitive',
        category: 'remembering',
        objectives: [
          'Recall facts and basic concepts',
          'Identify key terminology',
          'Recognize patterns and relationships'
        ]
      },
      {
        domain: 'cognitive',
        category: 'understanding',
        objectives: [
          'Explain concepts in own words',
          'Interpret information and data',
          'Classify items into categories'
        ]
      },
      {
        domain: 'cognitive',
        category: 'applying',
        objectives: [
          'Apply knowledge to new situations',
          'Implement theories and methods',
          'Use information in problem-solving'
        ]
      }
    ];

    this.learningObjectives.set('cognitive', objectives);
  }

  // Tạo nội dung bài học
  async generateLesson(
    subject: string,
    topic: string,
    difficulty: number,
    duration: number,
    objectives: string[]
  ): Promise<GeneratedContent> {
    try {
      const template = this.findBestTemplate(subject, 'lesson', difficulty);
      const content = await this.generateContentFromTemplate(template, topic, duration, objectives);
      
      return {
        id: this.generateId(),
        type: 'lesson',
        subject,
        topic,
        title: `${topic} - Lesson`,
        description: `Comprehensive lesson on ${topic} for ${subject}`,
        structure: content.structure,
        content: this.generateFullContent(content.structure),
        questions: content.questions,
        activities: content.activities,
        assessment: content.assessment,
        metadata: {
          difficulty,
          duration,
          objectives,
          createdAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to generate lesson: ${error}`);
    }
  }

  // Tạo bài giảng
  async generateLecture(
    subject: string,
    topic: string,
    difficulty: number,
    duration: number,
    audience: string,
    objectives: string[]
  ): Promise<GeneratedContent> {
    try {
      const template = this.findBestTemplate(subject, 'lecture', difficulty);
      const content = await this.generateContentFromTemplate(template, topic, duration, objectives);
      
      return {
        id: this.generateId(),
        type: 'lecture',
        subject,
        topic,
        title: `${topic} - Lecture`,
        description: `Advanced lecture on ${topic} for ${subject}`,
        structure: content.structure,
        content: this.generateFullContent(content.structure),
        questions: content.questions,
        activities: content.activities,
        assessment: content.assessment,
        metadata: {
          difficulty,
          duration,
          audience,
          objectives,
          createdAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to generate lecture: ${error}`);
    }
  }

  // Tạo bài tập
  async generateExercise(
    subject: string,
    topic: string,
    difficulty: number,
    exerciseType: string,
    questionCount: number
  ): Promise<GeneratedContent> {
    try {
      const questions = await this.generateQuestions(subject, topic, difficulty, exerciseType, questionCount);
      
      return {
        id: this.generateId(),
        type: 'exercise',
        subject,
        topic,
        title: `${topic} - ${exerciseType} Exercise`,
        description: `${questionCount} ${exerciseType} exercises on ${topic}`,
        structure: {
          sections: [
            {
              id: 'instructions',
              title: 'Instructions',
              type: 'introduction',
              content: `Complete the following ${questionCount} ${exerciseType} exercises on ${topic}.`,
              duration: 300
            },
            {
              id: 'exercises',
              title: 'Exercises',
              type: 'practice',
              content: '',
              duration: questionCount * 300
            }
          ],
          objectives: [
            `Practice ${topic} concepts`,
            `Apply knowledge to problems`,
            `Develop problem-solving skills`
          ],
          prerequisites: [
            `Basic ${subject} knowledge`,
            `${topic} fundamentals`
          ],
          outcomes: [
            `Improved understanding`,
            `Enhanced skills`,
            `Confidence building`
          ],
          duration: questionCount * 900,
          materials: ['Exercise sheet', 'Answer key']
        },
        content: this.generateExerciseContent(questions),
        questions,
        activities: [],
        assessment: {
          formative: [
            {
              type: 'quiz',
              frequency: 'daily',
              description: 'Daily practice quiz'
            }
          ],
          summative: [
            {
              type: 'exam',
              weight: 100,
              description: 'Final exercise assessment'
            }
          ],
          rubrics: []
        },
        metadata: {
          difficulty,
          exerciseType,
          questionCount,
          createdAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to generate exercise: ${error}`);
    }
  }

  // Tạo bài thi
  async generateExam(
    subject: string,
    topic: string,
    difficulty: number,
    examType: string,
    duration: number,
    questionTypes: string[],
    totalPoints: number
  ): Promise<GeneratedContent> {
    try {
      const questions = await this.generateExamQuestions(subject, topic, difficulty, questionTypes, totalPoints);
      
      return {
        id: this.generateId(),
        type: 'exam',
        subject,
        topic,
        title: `${topic} - ${examType} Exam`,
        description: `${examType} examination on ${topic}`,
        structure: {
          sections: [
            {
              id: 'instructions',
              title: 'Instructions',
              type: 'introduction',
              content: `Read all instructions carefully. This ${examType} exam covers ${topic} and is worth ${totalPoints} points.`,
              duration: 300
            },
            {
              id: 'questions',
              title: 'Questions',
              type: 'assessment',
              content: '',
              duration: duration - 600
            }
          ],
          objectives: [
            `Assess comprehensive knowledge`,
            `Evaluate understanding`,
            `Test application skills`
          ],
          prerequisites: [
            `Complete ${subject} course`,
            `${topic} mastery`
          ],
          outcomes: [
            `Performance measurement`,
            `Skill assessment`,
            `Knowledge evaluation`
          ],
          duration,
          materials: ['Exam paper', 'Answer sheet', 'Calculator']
        },
        content: this.generateExamContent(questions),
        questions,
        activities: [],
        assessment: {
          formative: [],
          summative: [
            {
              type: 'exam',
              weight: 100,
              description: `${examType} examination`
            }
          ],
          rubrics: this.generateExamRubrics(questionTypes)
        },
        metadata: {
          difficulty,
          examType,
          duration,
          questionTypes,
          totalPoints,
          createdAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to generate exam: ${error}`);
    }
  }

  // Tạo câu hỏi
  async generateQuestions(
    subject: string,
    topic: string,
    difficulty: number,
    questionType: string,
    count: number
  ): Promise<Question[]> {
    const questions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      questions.push(await this.generateSingleQuestion(subject, topic, difficulty, questionType, i + 1));
    }
    
    return questions;
  }

  // Tạo câu hỏi đơn
  private async generateSingleQuestion(
    subject: string,
    topic: string,
    difficulty: number,
    questionType: string,
    index: number
  ): Promise<Question> {
    const questionTemplates = this.getQuestionTemplates(subject, questionType);
    const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    
    return {
      id: this.generateId(),
      type: questionType as any,
      question: this.fillTemplate(template.question, { subject, topic, difficulty, index }),
      options: template.options ? template.options.map(opt => this.fillTemplate(opt, { subject, topic, difficulty, index })) : undefined,
      correctAnswer: this.fillTemplate(template.correctAnswer, { subject, topic, difficulty, index }),
      explanation: this.fillTemplate(template.explanation, { subject, topic, difficulty, index }),
      difficulty,
      points: this.calculatePoints(questionType, difficulty),
      skills: this.getSkillsForQuestion(questionType, subject),
      rubric: this.generateQuestionRubric(questionType)
    };
  }

  // Tạo câu hỏi thi
  private async generateExamQuestions(
    subject: string,
    topic: string,
    difficulty: number,
    questionTypes: string[],
    totalPoints: number
  ): Promise<Question[]> {
    const questions: Question[] = [];
    let pointsUsed = 0;
    
    for (const questionType of questionTypes) {
      const questionCount = Math.floor((totalPoints * 0.25) / this.calculatePoints(questionType, difficulty));
      
      for (let i = 0; i < questionCount && pointsUsed < totalPoints; i++) {
        const question = await this.generateSingleQuestion(subject, topic, difficulty, questionType, i + 1);
        questions.push(question);
        pointsUsed += question.points;
      }
    }
    
    return questions;
  }

  // Tạo nội dung từ template
  private async generateContentFromTemplate(
    template: ContentTemplate,
    topic: string,
    duration: number,
    objectives: string[]
  ): Promise<any> {
    const sections = template.structure.sections.map(section => ({
      ...section,
      content: this.generateSectionContent(section, topic, template.subject),
      activities: section.type === 'practice' ? this.generateActivities(section, template.subject) : [],
      questions: section.type === 'assessment' ? await this.generateQuestions(template.subject, topic, template.difficulty, 'mixed', 3) : []
    }));

    return {
      structure: {
        ...template.structure,
        sections,
        duration,
        objectives
      },
      questions: sections.flatMap(s => s.questions || []),
      activities: sections.flatMap(s => s.activities || []),
      assessment: template.metadata
    };
  }

  // Tạo nội dung section
  private generateSectionContent(section: ContentSection, topic: string, subject: string): string {
    const contentGenerators = {
      introduction: () => this.generateIntroduction(topic, subject),
      theory: () => this.generateTheoryContent(topic, subject),
      example: () => this.generateExampleContent(topic, subject),
      practice: () => this.generatePracticeContent(topic, subject),
      assessment: () => this.generateAssessmentContent(topic, subject),
      conclusion: () => this.generateConclusionContent(topic, subject)
    };

    return contentGenerators[section.type]();
  }

  // Tạo nội dung introduction
  private generateIntroduction(topic: string, subject: string): string {
    return `Welcome to this lesson on ${topic} in ${subject}. In this section, we will explore the fundamental concepts and set the foundation for our learning journey.`;
  }

  // Tạo nội dung theory
  private generateTheoryContent(topic: string, subject: string): string {
    return `## Core Concepts of ${topic}

In ${subject}, ${topic} refers to the theoretical framework and principles that govern this area of study.`;
  }

  // Tạo nội dung ví dụ
  private generateExampleContent(topic: string, subject: string): string {
    return `## Examples and Applications

Let's explore ${topic} through practical examples that demonstrate how these concepts work in real-world scenarios.`;
  }

  // Tạo nội dung practice
  private generatePracticeContent(topic: string, subject: string): string {
    return `## Practice Exercises

Now it's your turn to apply what you've learned about ${topic}. These practice exercises will help reinforce your understanding.`;
  }

  // Tạo nội dung assessment
  private generateAssessmentContent(topic: string, subject: string): string {
    return `## Assessment

Let's assess your understanding of ${topic} through these evaluation activities.`;
  }

  // Tạo nội dung kết luận
  private generateConclusionContent(topic: string, subject: string): string {
    return `## Conclusion and Next Steps

Congratulations! You have completed this lesson on ${topic} in ${subject}. Let's summarize what we've learned and look ahead.`;
  }

  // Tạo activities
  private generateActivities(section: ContentSection, subject: string): Activity[] {
    return [
      {
        id: this.generateId(),
        type: 'discussion',
        title: 'Group Discussion',
        description: `Discuss ${section.title} concepts with your peers`,
        duration: 300,
        materials: ['Whiteboard', 'Markers', 'Notes'],
        instructions: [
          'Form groups of 3-4 students',
          'Discuss the key concepts',
          'Share your understanding'
        ]
      }
    ];
  }

  // Tạo rubric cho câu hỏi
  private generateQuestionRubric(questionType: string): Rubric {
    const rubrics: Record<string, Rubric> = {
      'multiple_choice': {
        criteria: [
          {
            name: 'Correct Answer',
            description: 'Selected the correct option',
            maxPoints: 1,
            levels: [
              { level: 'Excellent', score: 1, description: 'Correct answer selected' },
              { level: 'Poor', score: 0, description: 'Incorrect answer selected' }
            ]
          }
        ],
        totalPoints: 1,
        passingScore: 0.5
      },
      'essay': {
        criteria: [
          {
            name: 'Content',
            description: 'Quality and accuracy of content',
            maxPoints: 5,
            levels: [
              { level: 'Excellent', score: 5, description: 'Comprehensive and accurate content' },
              { level: 'Poor', score: 1, description: 'Inadequate content' }
            ]
          }
        ],
        totalPoints: 10,
        passingScore: 6
      }
    };

    return rubrics[questionType] || rubrics['multiple_choice'];
  }

  // Tạo rubric cho bài thi
  private generateExamRubrics(questionTypes: string[]): Rubric[] {
    return questionTypes.map(type => this.generateQuestionRubric(type));
  }

  // Tạo nội dung đầy đủ
  private generateFullContent(sections: ContentSection[]): string {
    return sections.map(section => {
      let content = `## ${section.title}\n\n`;
      content += section.content;
      
      if (section.activities && section.activities.length > 0) {
        content += '\n\n### Activities:\n';
        section.activities.forEach(activity => {
          content += `#### ${activity.title}\n`;
          content += `${activity.description}\n`;
          content += `Duration: ${activity.duration} seconds\n`;
        });
      }
      
      if (section.questions && section.questions.length > 0) {
        content += '\n\n### Questions:\n';
        section.questions.forEach((question, index) => {
          content += `${index + 1}. ${question.question}\n`;
          if (question.options) {
            question.options.forEach((option, optIndex) => {
              content += `   ${String.fromCharCode(65 + optIndex)}. ${option}\n`;
            });
          }
          content += '\n';
        });
      }
      
      return content;
    }).join('\n\n');
  }

  // Tạo nội dung bài tập
  private generateExerciseContent(questions: Question[]): string {
    let content = '## Exercises\n\n';
    
    questions.forEach((question, index) => {
      content += `### Exercise ${index + 1}\n\n`;
      content += `${question.question}\n\n`;
      content += `**Answer:** ${question.correctAnswer}\n\n`;
      content += `**Explanation:** ${question.explanation}\n\n`;
      content += `**Points:** ${question.points}\n\n`;
      content += '---\n\n';
    });
    
    return content;
  }

  // Tạo nội dung bài thi
  private generateExamContent(questions: Question[]): string {
    let content = '## Exam Questions\n\n';
    
    questions.forEach((question, index) => {
      content += `### Question ${index + 1} (${question.points} points)\n\n`;
      content += `${question.question}\n\n`;
      content += `**Type:** ${question.type}\n`;
      content += `**Difficulty:** ${question.difficulty}/10\n`;
      content += '---\n\n';
    });
    
    return content;
  }

  // Tạo mô hình phát triển cho người dùng
  async createDevelopmentModel(userId: number): Promise<DevelopmentModel> {
    try {
      const user = await prisma.student.findUnique({
        where: { id: userId },
        include: {
          grades: {
            include: { subject: true },
            orderBy: { createdAt: 'desc' },
            take: 50
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const skills = await this.analyzeUserSkills(user.grades);
      const currentLevel = this.calculateCurrentLevel(skills);
      const targetLevel = this.calculateTargetLevel(skills);
      const progress = this.calculateProgress(skills);
      const recommendations = this.generateRecommendations(skills, progress);
      const nextSteps = this.generateNextSteps(skills, recommendations);

      const model: DevelopmentModel = {
        userId,
        currentLevel,
        targetLevel,
        skills,
        progress,
        recommendations,
        nextSteps
      };

      this.developmentModels.set(userId, model);
      return model;
    } catch (error) {
      throw new Error(`Failed to create development model: ${error}`);
    }
  }

  // Phân tích kỹ năng người dùng
  private async analyzeUserSkills(grades: any[]): Promise<Skill[]> {
    const subjectPerformance: Record<string, number[]> = {};
    
    grades.forEach(grade => {
      const subject = grade.subject.name;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = [];
      }
      subjectPerformance[subject].push(grade.score);
    });

    const skills: Skill[] = [];
    
    Object.entries(subjectPerformance).forEach(([subject, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const currentLevel = this.mapScoreToLevel(avgScore);
      const targetLevel = Math.min(currentLevel + 2, 10);
      
      skills.push({
        id: `${subject}-skill`,
        name: `${subject} Proficiency`,
        category: 'cognitive',
        currentLevel,
        targetLevel,
        progress: (currentLevel / targetLevel) * 100
      });
    });

    return skills;
  }

  // Tính level hiện tại
  private calculateCurrentLevel(skills: Skill[]): number {
    if (skills.length === 0) return 1;
    return skills.reduce((sum, skill) => sum + skill.currentLevel, 0) / skills.length;
  }

  // Tính level mục tiêu
  private calculateTargetLevel(skills: Skill[]): number {
    if (skills.length === 0) return 5;
    return skills.reduce((sum, skill) => sum + skill.targetLevel, 0) / skills.length;
  }

  // Tính tiến độ
  private calculateProgress(skills: Skill[]): Progress {
    const overall = skills.reduce((sum, skill) => sum + skill.progress, 0) / skills.length;
    
    const bySkill: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    
    skills.forEach(skill => {
      bySkill[skill.name] = skill.progress;
      byDomain[skill.category] = (byDomain[skill.category] || 0) + skill.progress;
    });

    return {
      overall,
      bySkill,
      byDomain,
      timeline: []
    };
  }

  // Tạo gợi ý
  private generateRecommendations(skills: Skill[], progress: Progress): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    skills.forEach(skill => {
      if (skill.progress < 70) {
        recommendations.push({
          type: 'content',
          priority: 'high',
          description: `Focus on improving ${skill.name} - currently at ${skill.currentLevel}/10`,
          action: `Complete additional practice exercises`,
          timeline: '2 weeks'
        });
      }
    });

    return recommendations;
  }

  // Tạo bước tiếp theo
  private generateNextSteps(skills: Skill[], recommendations: Recommendation[]): NextStep[] {
    const nextSteps: NextStep[] = [];
    
    skills.forEach(skill => {
      if (skill.currentLevel < skill.targetLevel) {
        nextSteps.push({
          skill: skill.name,
          activity: 'Practice exercises',
          resource: `${skill.name} practice materials`,
          timeline: '1 week'
        });
      }
    });

    return nextSteps;
  }

  // Helper methods
  private findBestTemplate(subject: string, type: string, difficulty: number): ContentTemplate {
    const templates = this.contentTemplates.get(subject) || [];
    return templates.find(t => 
      t.type === type && Math.abs(t.difficulty - difficulty) <= 2
    ) || templates[0];
  }

  private getQuestionTemplates(subject: string, questionType: string): any[] {
    const templates: Record<string, any[]> = {
      'multiple_choice': [
        {
          question: 'What is the correct answer for {topic}?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A'
        }
      ],
      'essay': [
        {
          question: 'Explain the importance of {topic} in {subject}.',
          correctAnswer: 'Student response'
        }
      ]
    };

    return templates[questionType] || templates['multiple_choice'];
  }

  private fillTemplate(template: string, variables: any): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    return result;
  }

  private calculatePoints(questionType: string, difficulty: number): number {
    const basePoints: Record<string, number> = {
      'multiple_choice': 1,
      'true_false': 1,
      'short_answer': 2,
      'essay': 5,
      'problem_solving': 3,
      'critical_thinking': 4,
      'analysis': 3,
      'synthesis': 4,
      'evaluation': 4
    };

    return basePoints[questionType] || 1;
  }

  private getSkillsForQuestion(questionType: string, subject: string): string[] {
    const skills: Record<string, string[]> = {
      'multiple_choice': ['knowledge', 'comprehension'],
      'essay': ['writing', 'analysis', 'synthesis'],
      'critical_thinking': ['analysis', 'evaluation', 'reasoning'],
      'problem_solving': ['application', 'analysis', 'synthesis']
    };

    return skills[questionType] || ['knowledge'];
  }

  private mapScoreToLevel(score: number): number {
    if (score >= 9) return 10;
    if (score >= 8) return 9;
    if (score >= 7) return 8;
    if (score >= 6) return 7;
    if (score >= 5) return 6;
    if (score >= 4) return 5;
    if (score >= 3) return 4;
    if (score >= 2) return 3;
    if (score >= 1) return 2;
    return 1;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export { ContentGenerationAI };
