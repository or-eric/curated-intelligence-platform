export interface ExecutiveSummary {
  accountableEntity: string;
  stakeholders: string[];
  eventSummary: string;
  whyWeHighlightThis: string;
  eventAnalysis: string;
}

export interface LessonsForCSuite {
  title: string;
  primaryOwners: string[];
  supportingOwners: string[];
  lifecycleStages: string[];
  accountableEntityImpact: string;
  stakeholderRequirements: string;
  risksWithoutAssurance: string;
  bestPractices: {
    title: string;
    description: string;
  }[];
}

export interface ContentItem {
  id: string;
  title: string;
  source: string;
  category: 'Security' | 'Technology' | 'Humans';
  format: 'Article' | 'Video' | 'Podcast' | 'Discussion';
  publishedDate: string; // ISO 8601 format
  url: string;
  summary: string; // The short summary for the card
  imageUrl: string;
  tags: string[]; // e.g., 'CAIO', 'CISO', 'CRO'
  advisoryJudgement: 'Critical - Act' | 'Important - Monitor' | 'Relevant - Track';
  stakeholders: string[]; // For the detail view pills
  executiveSummary?: ExecutiveSummary;
  lessonsForCSuite?: LessonsForCSuite;
}