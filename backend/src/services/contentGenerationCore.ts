// Content Generation Core - Nền tảng tạo nội dung học thuật
import { AcademicField, AcademicLevel } from './academicFields';
import { ResearchPaper, Methodology, Framework } from './researchDatabase';
import { ExpertiseDomain } from './expertiseDomains';

interface ContentTemplate {
  id: string;
  type: string;
  academicLevel: AcademicLevel;
  field: AcademicField;
  structure: ContentStructure;
  metadata: any;
}

interface ContentStructure {
  sections: ContentSection[];
  chapters: Chapter[];
  appendices: Appendix[];
  bibliography: Bibliography;
}

interface ContentSection {
  id: string;
  title: string;
  type: 'introduction' | 'literature_review' | 'methodology' | 'results' | 'discussion' | 'conclusion';
  content: string;
  subsections: ContentSection[];
  figures: Figure[];
  tables: Table[];
  equations: Equation[];
}

interface Chapter {
  id: string;
  title: string;
  sections: ContentSection[];
  summary: string;
  keyPoints: string[];
}

interface Bibliography {
  sources: Citation[];
  format: string;
  style: string;
}

interface Citation {
  id: string;
  authors: string[];
  title: string;
  journal: string;
  year: number;
  volume: string;
  pages: string;
  doi: string;
  type: 'book' | 'journal' | 'conference' | 'thesis' | 'website';
}

interface Figure {
  id: string;
  title: string;
  caption: string;
  type: 'image' | 'chart' | 'table' | 'equation';
  data: any;
  source: string;
}

interface Table {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  source: string;
}

interface Equation {
  id: string;
  expression: string;
  description: string;
  variables: string[];
  source: string;
}

interface Appendix {
  id: string;
  title: string;
  content: string;
  type: 'data' | 'code' | 'references' | 'glossary';
  source: string;
}

export class ContentGenerationCore {
  private contentTemplates: Map<string, ContentTemplate[]> = new Map();
  private researchDatabase: Map<string, ResearchPaper[]> = new Map();
  private methodologyLibrary: Map<string, Methodology[]> = new Map();
  private frameworkLibrary: Map<string, Framework[]> = new Map();

  constructor() {
    this.initializeContentTemplates();
    this.initializeResearchDatabase();
    this.initializeMethodologyLibrary();
    this.initializeFrameworkLibrary();
  }

  // Khởi tạo content templates
  private initializeContentTemplates() {
    const templates: ContentTemplate[] = [
      {
        id: 'research-paper-template',
        type: 'research_paper',
        academicLevel: this.getAcademicLevel('doctoral'),
        field: this.getAcademicField('computer-science'),
        structure: {
          sections: [
            {
              id: 'abstract',
              title: 'Abstract',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              id: 'introduction',
              title: 'Introduction',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              id: 'literature-review',
              title: 'Literature Review',
              type: 'literature_review',
              content: '',
              subsections: []
            },
            {
              id: 'methodology',
              title: 'Methodology',
              type: 'methodology',
              content: '',
              subsections: []
            },
            {
              id: 'results',
              title: 'Results',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              id: 'discussion',
              title: 'discussion',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              id: 'conclusion',
              title: 'Conclusion',
              type: 'content',
              content: '',
              subsections: []
            }
          ],
          chapters: [],
          appendices: [],
          bibliography: {
            sources: [],
            format: 'APA',
            style: 'academic'
          }
        },
        metadata: {
          templateType: 'research_paper',
          estimatedPages: 25,
          estimatedWords: 6000,
          estimatedTime: 120,
          difficulty: 9
        }
      },
      {
        id: 'thesis-template',
        type: 'thesis',
        academicLevel: this.getAcademicLevel('doctoral'),
        field: this.getAcademicField('mathematics'),
        structure: {
          sections: [
            {
              id: 'abstract',
              title: 'Abstract',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              id: 'introduction',
              title: 'Introduction',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              id: 'literature-review',
              title: 'Literature Review',
              type: 'literature_review',
              content: '',
              subsections: []
            },
            {
              id: 'methodology',
              title: 'Methodology',
              type: 'methodology',
              content: '',
              subsections: []
            },
            {
              id: 'results',
              title: 'Results',
              type: 'results',
              content: '',
              subsections: []
            },
            {
              id: 'discussion',
              title: 'Discussion',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              id: 'conclusion',
              title: 'Conclusion',
              type: 'content',
              content: '',
              subsections: []
            }
          ],
          chapters: [
            {
              id: 'chapter-1',
              title: 'Introduction',
              sections: [],
              summary: 'Introduction and background',
              keyPoints: ['Background', 'Problem statement', 'Research questions']
            },
            {
              id: 'chapter-2',
              title: 'Literature Review',
              sections: [],
              summary: 'Review of existing literature',
              keyPoints: ['Existing research', 'Research gaps', 'Theoretical framework']
            },
            {
              id: 'chapter-3',
              title: 'Methodology',
              sections: [],
              summary: 'Research methodology',
              keyPoints: ['Research design', 'Data collection', 'Analysis methods']
            },
            {
              id: 'chapter-4',
              title: 'Results',
              sections: [],
              summary: 'Research findings',
              keyPoints: ['Data analysis', 'Findings', 'Interpretation']
            },
            {
              id: 'chapter-5',
              title: 'Conclusion',
              sections: [],
              summary: 'Conclusion and recommendations',
              keyPoints: ['Summary', 'Implications', 'Future research']
            }
          ],
          appendices: [],
          bibliography: {
            sources: [],
            format: 'APA',
            style: 'academic'
          }
        },
        metadata: {
          templateType: 'thesis',
          estimatedPages: 40,
          estimatedWords: 10000,
          estimatedTime: 200,
          difficulty: 9
        }
      },
      {
        id: 'journal-article-template',
        type: 'journal_article',
        academicLevel: this.getAcademicLevel('researcher'),
        field: this.getAcademicField('physics'),
        structure: {
          sections: [
            {
              id: 'abstract',
              title: 'Abstract',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              id: 'introduction',
              title: 'Introduction',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              'methodology',
              title: 'Methodology',
              type: 'methodology',
              content: '',
              subsections: []
            },
            {
              id: 'results',
              title: 'Results',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              id: 'discussion',
              title: 'Discussion',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              id: 'conclusion',
              title: 'Conclusion',
              type: 'content',
              content: '',
              subsections: []
            }
          ],
          chapters: [],
          appendices: [],
          bibliography: {
            sources: [],
            format: 'APA',
            style: 'academic'
          }
        },
        metadata: {
          templateType: 'journal_article',
          estimatedPages: 15,
          estimatedWords: 4000,
          estimatedTime: 80,
          difficulty: 8
        }
      },
      {
        id: 'lecture-notes-template',
        type: 'lecture_notes',
        academicLevel: this.getAcademicLevel('graduate'),
        field: this.getAcademicField('chemistry'),
        structure: {
          sections: [
            {
              id: 'overview',
              title: 'Overview',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              id: 'topic-1',
              title: 'Topic 1',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              id: 'examples',
              title: 'Examples',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              id: 'practice',
              title: 'Practice Problems',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              id: 'summary',
              title: 'Summary',
              type: 'content',
              content: '',
              subsections: []
            }
          ],
          chapters: [],
          appendices: [],
          bibliography: {
            sources: [],
            format: 'APA',
            style: 'academic'
          }
        },
        metadata: {
          templateType: 'lecture_notes',
          estimatedPages: 20,
          estimatedWords: 3000,
          estimatedTime: 60,
          difficulty: 6
        }
      },
      {
        id: 'grant-proposal-template',
        type: 'grant_proposal',
        academicLevel: this.getAcademicLevel('professor'),
        field: this.getAcademicField('business'),
        structure: {
          sections: [
            {
              id: 'summary',
              title: 'Executive Summary',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              'introduction',
              title: 'Introduction',
              type: 'introduction',
              content: '',
              subsections: []
            },
            {
              'problem-statement',
              title: 'Problem Statement',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              'objectives',
              title: 'Research Objectives',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              'methodology',
              title: 'Methodology',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              'timeline',
              title: 'Timeline',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              'budget',
              title: 'Budget',
              type: 'content',
              content: '',
              subsections: []
            },
            {
              'impact',
              title: 'Expected Impact',
              type: 'content',
              content: '',
              subsections: []
            }
          ],
          chapters: [],
          appendices: [],
          bibliography: {
            sources: [],
            format: 'APA',
            style: 'academic'
          }
        },
        metadata: {
          templateType: 'grant_proposal',
          estimatedPages: 25,
          estimatedWords: 5000,
          estimatedTime: 100,
          difficulty: 9
        }
      }
    ];

    // Group templates by type
    templates.forEach(template => {
      const type = template.type;
      if (!this.contentTemplates.has(type)) {
        this.contentTemplates.set(type, []);
      }
      this.contentTemplates.get(type).push(template);
    });
  }

  // Khởi tạo database nghiên cứu
  private initializeResearchDatabase() {
    const papers: ResearchPaper[] = [
      {
        id: 'paper-1',
        title: 'Deep Learning for Natural Language Processing',
        authors: ['Dr. John Smith', 'Dr. Jane Doe'],
        abstract: 'This paper explores the application of deep learning techniques to natural language processing tasks.',
        methodology: 'Neural networks, transformer models, attention mechanisms',
        findings: 'Significant improvements in NLP tasks',
        implications: 'Advancements in AI language understanding',
        references: [],
        citations: 150,
        impact: 8.5,
        year: 2023
      },
      {
        id: 'paper-2',
        title: 'Quantum Computing Applications in Cryptography',
        authors: ['Dr. Alice Johnson', 'Dr. Bob Wilson'],
        abstract: 'This paper explores quantum computing applications in cryptography and information security.',
        methodology: 'Quantum algorithms, quantum cryptography, quantum algorithms',
        findings: 'Quantum algorithms can break classical cryptography',
        implications: 'Need for post-quantum cryptography',
        references: [],
        citations: 89,
        impact: 9.2,
        year: 2023
      },
      {
        id: 'paper-3',
        title: 'Machine Learning for Educational Data Analysis',
        authors: ['Dr. Carol Davis', 'Dr. Evans'],
        abstract: 'This paper demonstrates machine learning techniques for analyzing educational data.',
        methodology: 'Neural networks, decision trees, ensemble methods',
        findings: 'Improved prediction accuracy in student performance',
        implications: 'Personalized learning recommendations',
        references: [],
        citations: 112,
        impact: 7.8,
        year: 2023
      }
    ];

    this.researchDatabase.set('all', papers);
  }

  // Khởi tạo thư viện phương pháp luận
  private initializeMethodologyLibrary() {
    const methodologies: Methodology[] = [
      {
        id: 'experimental',
        name: 'Experimental Method',
        description: 'Systematic observation and measurement',
        steps: ['Hypothesis', 'Experiment', 'Data collection', 'Analysis', 'Conclusion'],
        tools: ['Laboratory equipment', 'Software', 'Statistical tools'],
        applications: ['Physics', 'Chemistry', 'Biology', 'Psychology'],
        limitations: ['Control variables', 'Sample size', 'External validity'],
        alternatives: ['Observational studies', 'Simulations', 'Theoretical analysis']
      },
      {
        id: 'qualitative',
        name: 'Qualitative Research',
        description: 'Non-numerical data collection and analysis',
        steps: ['Research question', 'Data collection', 'Analysis', 'Interpretation'],
        tools: ['Interviews', 'Observations', 'Document analysis'],
        applications: ['Sociology', 'Anthropology', 'Education', 'Psychology'],
        limitations: ['Subjectivity', 'Generalizability', 'Reliability'],
        alternatives: ['Mixed methods', 'Quantitative approaches']
      },
      {
        id: 'mixed-methods',
        name: 'Mixed Methods Research',
        description: 'Combination of quantitative and qualitative approaches',
        steps: ['Research design', 'Data collection', 'Analysis', 'Integration'],
        tools: ['Statistical software', 'Interview protocols', 'Observation tools'],
        applications: ['Education', 'Social Sciences', 'Health Sciences'],
        limitations: ['Complexity', 'Resource intensive'],
        alternatives: ['Single method approaches']
      }
    ];

    this.methodologyLibrary.set('all', methodologies);
  }

  // Khởi tạo thư viện framework
  private initializeFrameworkLibrary() {
    const frameworks: Framework[] = [
      {
        id: 'bloom-taxonomy',
        name: 'Bloom\'s Taxonomy',
        description: 'Framework for classifying educational learning objectives',
        components: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
        relationships: ['Hierarchical structure', 'Progressive complexity'],
        applications: ['Curriculum design', 'Assessment', 'Learning objectives'],
        criticisms: ['Cultural bias', 'Limited cognitive domains'],
        extensions: ['Digital Bloom', 'Revised taxonomy']
      },
      {
        'id: 'constructivist',
        name: 'Constructivist Learning Theory',
        description: 'Learning theory based on active knowledge construction',
        components: ['Active learning', 'Social interaction', 'Authentic tasks'],
        relationships: ['Knowledge construction', 'Social context', 'Real-world application'],
        applications: ['Project-based learning', 'Collaborative learning'],
        criticisms: ['Time intensive', 'Resource intensive'],
        extensions: ['Digital constructivism', 'Online constructivism']
      },
      {
        id: 'connectivism',
        name: 'Connectivism',
        name: 'Connectivism Learning Theory',
        description: 'Learning theory based on connectionist networks',
        components: ['Network learning', 'Social learning', 'Collaborative learning'],
        relationships: ['Knowledge networks', 'Social connections'],
        applications: ['Online learning', 'Collaborative platforms', 'Social learning'],
        criticisms: ['Overemphasis on social', 'Technical requirements'],
        extensions: ['Neural networks', 'AI-powered connectivism']
      }
    ];

    this.frameworkLibrary.set('all', frameworks);
  }

  // Get template by type and level
  getContentTemplate(type: string, level: string): ContentTemplate | null {
    const templates = this.contentTemplates.get(type);
    return templates?.find(template => template.academicLevel.level === level) || null;
  }

  // Get all templates by type
  getContentTemplatesByType(type: string): ContentTemplate[] {
    return this.contentTemplates.get(type) || [];
  }

  // Get all templates by academic level
  getContentTemplatesByLevel(level: string): ContentTemplate[] {
    const allTemplates = Array.from(this.contentTemplates.values()).flat();
    return allTemplates.filter(template => template.academicLevel.id === level);
  }

  // Generate content structure based on template
  generateContentStructure(template: ContentTemplate): ContentStructure {
    return {
      sections: template.structure.sections.map(section => ({
        ...section,
        content: this.generateSectionContent(section),
        subsections: section.subsections.map(subsection => ({
          ...subsection,
          content: this.generateSectionContent(subsection)
        }))
      })),
      chapters: template.structure.chapters.map(chapter => ({
        ...chapter,
        sections: chapter.sections.map(section => ({
          ...section,
          content: this.generateSectionContent(section),
          subsections: section.subsections.map(subsection => ({
            ...subsection,
            content: this.generateSectionContent(subsection)
          }))
        }))
      })),
      appendices: template.structure.appendices.map(appendix => ({
        ...appendix,
        content: this.generateAppendixContent(appendix)
      })),
      bibliography: template.structure.bibliography
    };
  }

  // Generate section content
  private generateSectionContent(section: ContentSection): string {
    const contentGenerators = {
      'introduction': () => this.generateIntroductionContent(section.title),
      'literature_review': () => this.generateLiteratureReviewContent(section.title),
      'methodology': () => this.generateMethodologyContent(section.title),
      'results': () => this.generateResultsContent(section.title),
      'discussion': () => this.generateDiscussionContent(section.title),
      'conclusion': () => this.generateConclusionContent(section.title),
      'default': () => this.generateDefaultContent(section.title)
    };

    return contentGenerators[section.type]();
  }

  // Generate introduction content
  private generateIntroductionContent(title: string): string {
    return `## ${title}\n\nThis section introduces the topic and provides background information. It establishes the context and importance of the research. The introduction should clearly state the research problem and objectives.\n\n### Key Points:\n- Background and context\n- Problem statement\n- Research questions\n- Objectives and scope\n- Significance of the study`;
  }

  // Generate literature review content
  private generateLiteratureReviewContent(title: string): string {
    return `## ${title}\n\nThis section reviews existing literature related to the topic. It should identify research gaps, theoretical frameworks, and establish the foundation for the current research.\n\n### Key Areas Covered:\n- Previous research findings\n- Theoretical frameworks\n- Research gaps\n- Methodological approaches\n- Controversies and debates`;
  }

  // Generate methodology content
  private generateMethodologyContent(title: string): string {
    return `## ${title}\n\nThis section describes the research methodology used in the study. It should provide enough detail for replication and validation.\n\n### Research Design:\n- Research approach\n- Data collection methods\n- Analysis techniques\n- Validation strategies\n- Ethical considerations\n\n### Data Collection:\n- Data sources\n- Collection methods\n- Sampling strategy\n- Data validation\n\n### Analysis Methods:\n- Statistical techniques\n- Qualitative methods\n- Mixed methods approaches\n- Software tools\n\n### Limitations:\n- Sample size limitations\n- Access constraints\n- Methodological constraints`;
  }

  // Generate results content
  private generateResultsContent(title: string): string {
    return `## ${title}\n\nThis section presents the research findings in a clear and organized manner. Results should be presented objectively with appropriate tables, figures, and visualizations.\n\n### Key Findings:\n- Main discoveries\n- Statistical results\n- Unexpected outcomes\n- Pattern recognition\n- Correlation analysis\n\n### Data Presentation:\n- Tables and figures\n- Statistical summaries\n- Visual representations\n- Data visualizations`;
  }

  // Generate discussion content
  private generateDiscussionContent(title: string): string {
    return `## ${title}\n\nThis section discusses the implications of the findings and their significance. Connect results to literature and theory.\n\n### Interpretation:\n- Meaning of findings\n- Connection to theory\n- Practical applications\n- Theoretical implications\n\n### Limitations:\n- Study limitations\n- Scope constraints\n- External factors\n- Future research needs\n\n### Implications:\n- Practical applications\n- Theoretical contributions\n- Policy implications\n- Future research directions`;
  }

  // Generate conclusion content
  private generateConclusionContent(title: string): string {
    return `## ${title}\n\nThis section concludes the research and provides recommendations for future work.\n\n### Summary:\n- Main findings\n- Key contributions\n- Research limitations\n\n### Recommendations:\n- Future research directions\n- Practical applications\n- Theoretical contributions\n\n### Significance:\n- Academic contributions\n- Practical value\n- Theoretical importance`;
  }

  // Generate default content
  private generateDefaultContent(title: string): string {
    return `## ${title}\n\nThis section provides additional information and context for the topic.`;
  }

  // Generate appendix content
  private generateAppendixContent(appendix: Appendix): string {
    return `## ${appendix.title}\n\n${appendix.content}`;
  }

  // Generate content based on template and topic
  generateContentFromTemplate(
    template: ContentTemplate,
    topic: string,
    specialization: string,
    difficulty: number,
    requirements: any
  ): AdvancedContent {
    try {
      const content: {
        id: this.generateId(),
        type: template.type,
        academicLevel: template.academicLevel,
        field: template.field,
        specialization,
        title: `${topic} - ${template.type}`,
        abstract: this.generateAbstract(topic, specialization, template.academicLevel),
        content: this.generateAdvancedContentBody(topic, specialization, template.academicLevel, template.type),
        structure: this.generateContentStructure(template),
        methodology: this.generateMethodology(template.type, specialization),
        findings: this.generateFindings(topic, specialization),
        implications: this.generateImplications(topic, specialization),
        references: this.generateReferences(topic, specialization),
        citations: this.generateCitations(topic, specialization),
        peerReview: this.generatePeerReview(),
        metadata: this.generateAcademicMetadata(topic, specialization, template.academicLevel)
      };

      return content;
    } catch (error) {
      throw new Error(`Failed to generate content from template: ${error}`);
    }
  }

  // Generate abstract
  private generateAbstract(topic: string, specialization: string, level: AcademicLevel): string {
    return `This ${level.name} level work explores ${topic} within the field of ${specialization}. The research investigates key aspects of ${topic} and provides insights into its implications for the academic community and practical applications.`;
  }

  // Generate findings
  private generateFindings(topic: string, specialization: string): string {
    return `The research findings reveal significant insights into ${topic} within ${specialization}. Key discoveries include innovative approaches and theoretical advances that contribute to the understanding of ${specialization}.`;
  }

  // Generate implications
  private generateImplications(topic: string, specialization: string): string {
    return `The implications of this research on ${topic} extend to both theoretical understanding and practical applications in ${specialization}.`;
  }

  // Generate references
  private generateReferences(topic: string, specialization: string): Citation[] {
    return [
      {
        id: 'ref-1',
        authors: ['Author 1', 'Author 2'],
        title: `Previous Research on ${topic}`,
        journal: `${specialization} Journal`,
        year: 2022,
        volume: '15',
        pages: '123-145',
        doi: '10.1000/sample.doi',
        type: 'journal'
      }
    ];
  }

  // Generate citations
  private generateCitations(topic: string, specialization: string): Citation[] {
    return this.generateReferences(topic, specialization);
  }

  // Generate peer review
  private generatePeerReview(): PeerReview {
    return {
      reviewers: ['Reviewer 1', 'Reviewer 2', 'Reviewer 3'],
      status: 'accepted',
      feedback: [],
      score: 8.5,
      recommendations: ['Accept with minor revisions']
    };
  }

  // Generate academic metadata
  private generateAcademicMetadata(topic: string, specialization: string, level: AcademicLevel): AcademicMetadata {
    return {
      keywords: [topic, specialization, 'research', 'academic'],
      subjectAreas: [specialization],
      classification: ['research', 'academic'],
      audience: [level.name],
      language: 'English',
      pages: 25,
      wordCount: 6000,
      readingTime: 30,
      difficulty: level.level === 'doctoral' ? 9 : 7,
      prerequisites: [],
      learningOutcomes: []
    };
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get academic level by ID
  private getAcademicLevel(levelId: string): AcademicLevel | null {
    const levels = Array.from(this.academicLevels.get('all') || []);
    return levels.find(level => level.id === levelId) || null;
  }

  // Get academic field by ID
  private getAcademicField(fieldId: string): AcademicField | null {
    const allFields = Object.values(this.academicFields).flat();
    return allFields.find(field => field.id === fieldId) || null;
  }

  // Get expertise domain
  private getExpertiseDomain(field: string, specialization: string): ExpertiseDomain | null {
    const domains = this.expertiseDomains.get('all') || [];
    return domains.find(domain => domain.field === field && domain.specialization === specialization) || domains[0];
  }

  // Get research papers by field
  getResearchPapers(field: string, specialization?: string): ResearchPaper[] {
  const papers = Array.from(this.researchDatabase.get('all') || []);
  
  if (specialization) {
    return papers.filter(paper => 
      paper.title.toLowerCase().includes(specialization.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(specialization.toLowerCase())
    );
  }
  
  if (field) {
    return papers.filter(paper => paper.field.id === field);
  }
  
  return papers;
  }

  // Get methodology by type
  getMethodologyByType(type: string): Methodology[] {
    const methodologies = Array.from(this.methodologyLibrary.get('all') || []);
    return methodologies.filter(method => method.name.toLowerCase().includes(type.toLowerCase()));
  }

  // Get framework by name
  getFrameworkByName(name: string): Framework | null {
    const frameworks = Array.from(this.frameworkLibrary.get('all') || []);
    return frameworks.find(framework => framework.name.toLowerCase().includes(name.toLowerCase())) || null;
  }

  // Get research papers by citation count
  getHighImpactPapers(minCitations: number = 50): ResearchPaper[] {
  const papers = Array.from(this.researchDatabase.get('all') || []);
  return papers
    .filter(paper => paper.citations >= minCitations)
    .sort((a, b) => b.citations - a.citations)
    .slice(0, minCitations);
}

  // Get recent papers by year
  getRecentPapers(year: number, count: number = 10): ResearchPaper[] {
  const papers = Array.from(this.researchDatabase.get('all') || []);
  return papers
    .filter(paper => paper.year >= year)
    .sort((a, b) => b.year - a.year)
    .slice(0, count);
}

  // Search research papers
  searchResearchPapers(query: string, field?: string, specialization?: string): ResearchPaper[] {
  const papers = Array.from(this.researchDatabase.get('all') || []);
  const queryLower = query.toLowerCase();
  
  return papers.filter(paper => 
    paper.title.toLowerCase().includes(queryLower) ||
    paper.abstract.toLowerCase().includes(queryLower) ||
    paper.authors.some(author => author.toLowerCase().includes(queryLower)) ||
    (field && paper.field.id === field) ||
    (specialization && paper.specializations.some(spec => spec.toLowerCase().includes(specialization.toLowerCase()))
  );
}

  // Get methodology by application
  getMethodologyByApplication(application: string): Methodology[] {
  const methodologies = Array.from(this.methodologyLibrary.get('all') || []);
  return methodologies.filter(method => 
    method.applications.some(app => app.toLowerCase().includes(app.toLowerCase()))
  );
}

  // Get framework by application
  getFrameworkByApplication(application: string): Framework[] {
  const frameworks = Array.from(this.frameworkLibrary.get('all') || []);
  return frameworks.filter(framework => 
    framework.applications.some(app => app.toLowerCase().includes(app.toLowerCase()))
  );
  }
}

export { ContentGenerationCore, AcademicField, AcademicLevel, ContentStructure, ContentSection, Chapter, Bibliography, Citation, Figure, Table, Equation, Appendix, ContentTemplate };
