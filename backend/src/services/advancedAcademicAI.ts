// Advanced Academic AI Service - Main Controller
import { prisma } from '@/index';
import { AcademicField, getAllFields } from './academicFields';
import { AcademicLevel, getAllAcademicLevels } from './academicLevels';
import { ResearchDatabase } from './researchDatabase';
import { ExpertiseDomains } from './expertiseDomains';
import { ContentGenerator } from './contentGenerator';
import { AcademicAnalyzer } from './academicAnalyzer';
import { QualityAssessor } from './qualityAssessor';
import { ContentCache } from './contentCache';

export interface AdvancedContent {
  id: string;
  type: 'research_paper' | 'thesis' | 'dissertation' | 'journal_article' | 'conference_paper' | 'book_chapter' | 'technical_report' | 'grant_proposal' | 'curriculum_vitae' | 'lecture_notes';
  academicLevel: AcademicLevel;
  field: AcademicField;
  specialization: string;
  title: string;
  abstract: string;
  content: string;
  structure: any;
  methodology: string;
  findings: string;
  implications: string;
  references: any[];
  citations: any[];
  peerReview: any;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationRequest {
  contentType: string;
  academicLevel: string;
  field: string;
  specialization: string;
  topic: string;
  difficulty?: number;
  duration?: number;
  requirements?: any;
}

export interface AnalysisResult {
  documentPath: string;
  field: string;
  specialization: string;
  analysisType: string;
  findings: any;
  recommendations: any;
  quality: any;
}

export class AdvancedAcademicAI {
  private researchDB: ResearchDatabase;
  private expertiseDomains: ExpertiseDomains;
  private contentGenerator: ContentGenerator;
  private academicAnalyzer: AcademicAnalyzer;
  private qualityAssessor: QualityAssessor;
  private contentCache: ContentCache;

  constructor() {
    this.researchDB = new ResearchDatabase();
    this.expertiseDomains = new ExpertiseDomains();
    this.contentGenerator = new ContentGenerator(this.researchDB, this.expertiseDomains);
    this.academicAnalyzer = new AcademicAnalyzer(this.researchDB, this.expertiseDomains);
    this.qualityAssessor = new QualityAssessor();
    this.contentCache = new ContentCache();
  }

  // Main content generation method
  async generateAdvancedContent(request: GenerationRequest): Promise<AdvancedContent> {
    try {
      console.log('Starting advanced content generation:', request);
      
      // Validate request
      const validation = this.validateGenerationRequest(request);
      if (!validation.valid) {
        throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
      }

      // Check cache first
      const cached = this.contentCache.get(request);
      if (cached) {
        console.log('Returning cached content');
        return cached;
      }

      // Generate content
      const content = await this.contentGenerator.generate(request);
      
      // Assess quality
      const quality = this.qualityAssessor.assess(content);
      content.metadata.quality = quality;

      // Cache the result
      this.contentCache.set(request, content);

      console.log('Content generation completed successfully');
      return content;
    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error(`Failed to generate advanced content: ${error}`);
    }
  }

  // Main analysis method
  async analyzeAcademicDocument(
    documentPath: string,
    field: string,
    specialization: string,
    analysisType: string
  ): Promise<AnalysisResult> {
    try {
      console.log('Starting academic document analysis:', { documentPath, field, specialization, analysisType });

      // Check cache
      const cached = this.contentCache.getAnalysis(documentPath, field, specialization, analysisType);
      if (cached) {
        console.log('Returning cached analysis');
        return cached;
      }

      // Perform analysis
      const analysis = await this.academicAnalyzer.analyze(documentPath, field, specialization, analysisType);

      // Cache the result
      this.contentCache.setAnalysis(documentPath, field, specialization, analysisType, analysis);

      console.log('Document analysis completed successfully');
      return analysis;
    } catch (error) {
      console.error('Document analysis failed:', error);
      throw new Error(`Failed to analyze academic document: ${error}`);
    }
  }

  // Get content recommendations
  async getContentRecommendations(contentId: string, count: number = 5): Promise<AdvancedContent[]> {
    try {
      const content = this.contentCache.getById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      return this.contentGenerator.getRecommendations(content, count);
    } catch (error) {
      throw new Error(`Failed to get content recommendations: ${error}`);
    }
  }

  // Search content
  async searchContent(query: string, filters?: any): Promise<AdvancedContent[]> {
    try {
      return this.contentCache.search(query, filters);
    } catch (error) {
      throw new Error(`Failed to search content: ${error}`);
    }
  }

  // Get statistics
  getStatistics(): any {
    return {
      content: this.contentCache.getStatistics(),
      research: this.researchDB.getPaperStatistics(),
      expertise: this.expertiseDomains.getStatistics ? this.expertiseDomains.getStatistics() : {}
    };
  }

  // Clear cache
  clearCache(): void {
    this.contentCache.clear();
  }

  // Export content
  async exportContent(contentId: string, format: 'json' | 'markdown' | 'pdf'): Promise<string> {
    try {
      const content = this.contentCache.getById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      return this.contentGenerator.export(content, format);
    } catch (error) {
      throw new Error(`Failed to export content: ${error}`);
    }
  }

  // Enhance content
  async enhanceContent(contentId: string, enhancements: any): Promise<AdvancedContent> {
    try {
      const content = this.contentCache.getById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      const enhanced = await this.contentGenerator.enhance(content, enhancements);
      
      // Update cache
      this.contentCache.update(enhanced);

      return enhanced;
    } catch (error) {
      throw new Error(`Failed to enhance content: ${error}`);
    }
  }

  // Get expert profile
  async getExpertProfile(userId: number): Promise<any> {
    try {
      return this.expertiseDomains.getExpertProfile(userId);
    } catch (error) {
      throw new Error(`Failed to get expert profile: ${error}`);
    }
  }

  // Update expert profile
  async updateExpertProfile(userId: number, updates: any): Promise<any> {
    try {
      return this.expertiseDomains.updateExpertProfile(userId, updates);
    } catch (error) {
      throw new Error(`Failed to update expert profile: ${error}`);
    }
  }

  // Get research papers
  getResearchPapers(field?: string, specialization?: string): any[] {
    try {
      if (field) {
        return this.researchDB.getPapersByField(field);
      }
      return this.researchDB.getAllPapers();
    } catch (error) {
      throw new Error(`Failed to get research papers: ${error}`);
    }
  }

  // Search research papers
  searchResearchPapers(query: string, field?: string, specialization?: string): any[] {
    try {
      return this.researchDB.searchPapers(query, field, specialization);
    } catch (error) {
      throw new Error(`Failed to search research papers: ${error}`);
    }
  }

  // Get methodologies
  getMethodologies(complexity?: string): any[] {
    try {
      if (complexity) {
        return this.researchDB.getMethodologyByComplexity(complexity as any);
      }
      return this.researchDB.getMethodologies();
    } catch (error) {
      throw new Error(`Failed to get methodologies: ${error}`);
    }
  }

  // Get frameworks
  getFrameworks(application?: string): any[] {
    try {
      if (application) {
        return this.researchDB.getFrameworksByApplication(application);
      }
      return this.researchDB.getFrameworks();
    } catch (error) {
      throw new Error(`Failed to get frameworks: ${error}`);
    }
  }

  // Get expertise domains
  getExpertiseDomains(field?: string, specialization?: string): any[] {
    try {
      if (field) {
        return this.expertiseDomains.getDomainsByField(field);
      }
      if (specialization) {
        return this.expertiseDomains.getDomainsBySpecialization(specialization);
      }
      return this.expertiseDomains.getAllDomains();
    } catch (error) {
      throw new Error(`Failed to get expertise domains: ${error}`);
    }
  }

  // Get skills
  getSkills(category?: string): any[] {
    try {
      if (category) {
        return this.expertiseDomains.getSkillsByCategory(category);
      }
      return this.expertiseDomains.getAllSkills();
    } catch (error) {
      throw new Error(`Failed to get skills: ${error}`);
    }
  }

  // Get competencies
  getCompetencies(category?: string): any[] {
    try {
      if (category) {
        return this.expertiseDomains.getCompetenciesByCategory(category);
      }
      return this.expertiseDomains.getAllCompetencies();
    } catch (error) {
      throw new Error(`Failed to get competencies: ${error}`);
    }
  }

  // Calculate expertise score
  calculateExpertiseScore(profile: any): any {
    try {
      return this.expertiseDomains.calculateExpertiseScore(profile);
    } catch (error) {
      throw new Error(`Failed to calculate expertise score: ${error}`);
    }
  }

  // Get career progression recommendations
  getCareerProgressionRecommendations(profile: any): any {
    try {
      return this.expertiseDomains.getCareerProgressionRecommendations(profile);
    } catch (error) {
      throw new Error(`Failed to get career progression recommendations: ${error}`);
    }
  }

  // Private helper methods
  private validateGenerationRequest(request: GenerationRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.contentType) {
      errors.push('Content type is required');
    }

    if (!request.academicLevel) {
      errors.push('Academic level is required');
    }

    if (!request.field) {
      errors.push('Field is required');
    }

    if (!request.specialization) {
      errors.push('Specialization is required');
    }

    if (!request.topic) {
      errors.push('Topic is required');
    }

    // Validate content type
    const validTypes = [
      'research_paper', 'thesis', 'dissertation', 'journal_article', 
      'conference_paper', 'book_chapter', 'technical_report', 
      'grant_proposal', 'curriculum_vitae', 'lecture_notes'
    ];

    if (request.contentType && !validTypes.includes(request.contentType)) {
      errors.push(`Invalid content type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate academic level
    const validLevels = getAllAcademicLevels().map(level => level.id);
    if (request.academicLevel && !validLevels.includes(request.academicLevel)) {
      errors.push(`Invalid academic level. Must be one of: ${validLevels.join(', ')}`);
    }

    // Validate field
    const validFields = getAllFields().map(field => field.id);
    if (request.field && !validFields.includes(request.field)) {
      errors.push(`Invalid field. Must be one of: ${validFields.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate unique ID
  private generateId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { AdvancedAcademicAI, AdvancedContent, GenerationRequest, AnalysisResult };
