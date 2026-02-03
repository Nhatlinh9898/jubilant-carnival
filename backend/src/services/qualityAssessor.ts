// Quality Assessor - Đánh giá chất lượng nội dung học thuật
export class QualityAssessor {
  assess(content: any): any {
    const clarity = this.assessClarity(content);
    const rigor = this.assessRigor(content);
    const originality = this.assessOriginality(content);
    const significance = this.assessSignificance(content);
    
    const overall = (clarity + rigor + originality + significance) / 4;
    
    const recommendations: string[] = [];
    if (clarity < 7) recommendations.push('Improve clarity and structure');
    if (rigor < 7) recommendations.push('Strengthen methodological rigor');
    if (originality < 7) recommendations.push('Enhance originality and innovation');
    if (significance < 7) recommendations.push('Increase significance and impact');

    return {
      overall,
      clarity,
      rigor,
      originality,
      significance,
      recommendations
    };
  }

  private assessClarity(content: any): number {
    let score = 7;
    if (content.structure?.sections?.length >= 6) score += 1;
    if (content.abstract?.length > 100) score += 0.5;
    if (content.content?.length > 1000) score += 0.5;
    return Math.min(10, score);
  }

  private assessRigor(content: any): number {
    let score = 7;
    if (content.methodology?.length > 200) score += 1;
    if (content.references?.length >= 5) score += 1;
    if (content.citations?.length >= 3) score += 0.5;
    return Math.min(10, score);
  }

  private assessOriginality(content: any): number {
    let score = 7;
    if (content.title?.includes('Novel') || content.title?.includes('Innovative')) score += 1;
    if (content.abstract?.includes('innovative') || content.abstract?.includes('novel')) score += 0.5;
    if (content.findings?.includes('new') || content.findings?.includes('discovery')) score += 0.5;
    return Math.min(10, score);
  }

  private assessSignificance(content: any): number {
    let score = 7;
    if (content.implications?.length > 200) score += 1;
    if (content.metadata?.keywords?.length >= 5) score += 0.5;
    if (content.field?.category === 'stem' || content.field?.category === 'health') score += 0.5;
    return Math.min(10, score);
  }
}

export { QualityAssessor };
