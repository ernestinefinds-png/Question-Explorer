
export type TrendStatus = 'Rising' | 'Stable' | 'Declining';
export type SourceType = 'Google' | 'Reddit' | 'Quora' | 'Mixed';
export type PlatformType = 'Quora' | 'Reddit' | 'Blog/SEO';
export type ContentAngle = 'Educational' | 'Beginner' | 'Comparison' | 'Myth-busting' | 'Case Study' | 'Advanced';
export type PostFormat = 'Answer' | 'Discussion' | 'Guide' | 'Listicle' | 'Story';

export interface ScoredQuestion {
  id: string;
  question: string;
  source: SourceType;
  popularity: number; // 0-100
  trend: TrendStatus;
  bestPlatform: PlatformType;
  cluster: string;
}

export interface ContentIdea {
  id: string;
  angle: ContentAngle;
  platform: PlatformType;
  format: PostFormat;
  title: string;
  description: string;
  targetQuestionId: string;
}

export interface ResearchResult {
  niche: string;
  questions: ScoredQuestion[];
  contentIdeas: ContentIdea[];
  summary: {
    totalVolume: string;
    topRisingCluster: string;
    recommendation: string;
  };
}
