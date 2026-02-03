// Content Cache - Quản lý cache nội dung học thuật
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

export class ContentCache {
  private contentCache: Map<string, any[]> = new Map();
  private analysisCache: Map<string, any[]> = new Map();

  set(request: GenerationRequest, content: any): void {
    const cacheKey = this.generateContentKey(request);
    if (!this.contentCache.has(cacheKey)) {
      this.contentCache.set(cacheKey, []);
    }
    this.contentCache.get(cacheKey)!.push(content);
  }

  get(request: GenerationRequest): any | null {
    const cacheKey = this.generateContentKey(request);
    const cached = this.contentCache.get(cacheKey);
    return cached && cached.length > 0 ? cached[0] : null;
  }

  getById(id: string): any | null {
    for (const contents of this.contentCache.values()) {
      const found = contents.find(content => content.id === id);
      if (found) return found;
    }
    return null;
  }

  update(content: any): void {
    const existing = this.getById(content.id);
    if (existing) {
      Object.assign(existing, content);
    }
  }

  setAnalysis(documentPath: string, field: string, specialization: string, analysisType: string, analysis: any): void {
    const cacheKey = `${documentPath}_${field}_${specialization}_${analysisType}`;
    if (!this.analysisCache.has(cacheKey)) {
      this.analysisCache.set(cacheKey, []);
    }
    this.analysisCache.get(cacheKey)!.push(analysis);
  }

  getAnalysis(documentPath: string, field: string, specialization: string, analysisType: string): any | null {
    const cacheKey = `${documentPath}_${field}_${specialization}_${analysisType}`;
    const cached = this.analysisCache.get(cacheKey);
    return cached && cached.length > 0 ? cached[0] : null;
  }

  search(query: string, filters?: any): any[] {
    const allContent = Array.from(this.contentCache.values()).flat();
    const queryLower = query.toLowerCase();

    return allContent.filter(content => {
      const matchesQuery = 
        content.title?.toLowerCase().includes(queryLower) ||
        content.abstract?.toLowerCase().includes(queryLower) ||
        content.content?.toLowerCase().includes(queryLower) ||
        content.specialization?.toLowerCase().includes(queryLower);

      if (!matchesQuery) return false;
      if (filters?.type && content.type !== filters.type) return false;
      if (filters?.field && content.field?.id !== filters.field) return false;
      if (filters?.level && content.academicLevel?.id !== filters.level) return false;
      if (filters?.specialization && !content.specialization?.toLowerCase().includes(filters.specialization.toLowerCase())) return false;

      return true;
    });
  }

  getStatistics(): any {
    const allContent = Array.from(this.contentCache.values()).flat();
    
    const byType: Record<string, number> = {};
    const byField: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    allContent.forEach(content => {
      byType[content.type] = (byType[content.type] || 0) + 1;
      byField[content.field?.name || 'unknown'] = (byField[content.field?.name || 'unknown'] || 0) + 1;
      byLevel[content.academicLevel?.name || 'unknown'] = (byLevel[content.academicLevel?.name || 'unknown'] || 0) + 1;
    });

    return {
      totalContent: allContent.length,
      byType,
      byField,
      byLevel
    };
  }

  clear(): void {
    this.contentCache.clear();
    this.analysisCache.clear();
  }

  private generateContentKey(request: GenerationRequest): string {
    return `${request.contentType}_${request.field}_${request.specialization}_${request.topic}`;
  }
}

export { ContentCache, GenerationRequest };
