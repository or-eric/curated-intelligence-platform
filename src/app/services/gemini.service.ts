import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { ContentItem } from '../models/content-item.model';

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


@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  public error = signal<string | null>(null);

  constructor() {
    try {
      if (typeof process === 'undefined' || !process.env['API_KEY']) {
        const errorMessage = 'API key not found. Please set the API_KEY environment variable.';
        console.error(errorMessage);
        this.error.set(errorMessage);
        return;
      }
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
      console.error('Error initializing Gemini Service:', e);
      this.error.set('Failed to initialize the AI service. Please check your API key and configuration.');
    }
  }

  async generateExecutiveSummary(item: ContentItem): Promise<ExecutiveSummary> {
    if (!this.ai) throw new Error(this.error() || 'AI Service is not available.');
    if (this.error()) throw new Error(this.error() as string);

    const prompt = `You are a strategic intelligence analyst providing C-suite executives with concise, actionable summaries of complex topics. Your analysis must be clear, structured, and focused on business impact.

    Based on the provided content details, generate a JSON object for an "Executive Summary".

    Content Details:
    - Title: "${item.title}"
    - Summary: "${item.summary}"
    - Associated Personas/Roles: ${item.tags.join(', ')}
    - Relevant Stakeholder Groups: ${item.stakeholders.join(', ')}

    Your task is to populate the following JSON structure. Do not add any commentary before or after the JSON object.
    
    - accountableEntity: Identify the primary group, organization, or role that is most directly responsible for or impacted by the events in the article.
    - stakeholders: From the provided stakeholder groups list, select the most relevant ones.
    - eventSummary: Provide a concise, neutral summary of the key facts or events described in the content. This should be a slightly more detailed version of the input summary.
    - whyWeHighlightThis: Explain the strategic importance of this information. Why does it matter to a senior leader? What is the critical takeaway?
    - eventAnalysis: Offer a deeper analysis of the situation. What are the underlying drivers, potential consequences, and broader implications? Go beyond the surface-level facts.`;

    try {
      this.error.set(null);
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              accountableEntity: { type: Type.STRING, description: 'The primary responsible group or role.' },
              stakeholders: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of relevant stakeholder groups.' },
              eventSummary: { type: Type.STRING, description: 'A concise summary of key facts.' },
              whyWeHighlightThis: { type: Type.STRING, description: 'The strategic importance for senior leaders.' },
              eventAnalysis: { type: Type.STRING, description: 'A deep analysis of drivers, consequences, and implications.' },
            },
            required: ['accountableEntity', 'stakeholders', 'eventSummary', 'whyWeHighlightThis', 'eventAnalysis'],
          },
        },
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as ExecutiveSummary;
    } catch (error) {
       console.error('Error generating executive summary:', error);
      const errorMessage = 'Could not generate Executive Summary. The AI service may be unavailable.';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async generateLessonsForCSuite(item: ContentItem, executiveSummary: ExecutiveSummary): Promise<LessonsForCSuite> {
    if (!this.ai) throw new Error(this.error() || 'AI Service is not available.');
    if (this.error()) throw new Error(this.error() as string);

    const prompt = `You are a C-suite advisor specializing in translating complex events into strategic guidance for corporate governance. Your audience consists of board members and senior executives (CISO, CIO, CRO, etc.).

    Based on the initial content and its executive summary, generate a JSON object for "Lessons for the C-Suites".

    Initial Content:
    - Title: "${item.title}"
    - Executive Summary Analysis: "${executiveSummary.eventAnalysis}"

    Your task is to create actionable insights for leadership by populating the following JSON structure. Do not add any commentary before or after the JSON object.

    - title: Create a compelling title that frames the issue for a leadership audience, starting with "How...".
    - primaryOwners: From the list [CAIO, CISO, CRO, CIO, CLO, CTO], identify the 2-3 primary executive owners responsible for this issue.
    - supportingOwners: From the same list, identify 2-3 supporting owners. Do not repeat primary owners.
    - lifecycleStages: From the list [Evolve, Incident, Monitor, Restore, Strategy, Design], identify the 2-4 most relevant stages of the AI Trust Lifecycle.
    - accountableEntityImpact: Describe the specific operational and reputational fallout for the accountable entity if they fail to address this issue.
    - stakeholderRequirements: What are the key demands or expectations (e.g., assurance, transparency, reliability) that stakeholders will have regarding this issue?
    - risksWithoutAssurance: What are the high-level systemic, financial, or legal risks if the organization proceeds without providing evidence or assurance to stakeholders?
    - bestPractices: Provide exactly three distinct, actionable best practices. Each best practice should have a 'title' (e.g., "Verified Assurance Best Practice #1: [Name of Practice]") and a 'description' providing a clear recommendation.`;

     try {
      this.error.set(null);
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              primaryOwners: { type: Type.ARRAY, items: { type: Type.STRING } },
              supportingOwners: { type: Type.ARRAY, items: { type: Type.STRING } },
              lifecycleStages: { type: Type.ARRAY, items: { type: Type.STRING } },
              accountableEntityImpact: { type: Type.STRING },
              stakeholderRequirements: { type: Type.STRING },
              risksWithoutAssurance: { type: Type.STRING },
              bestPractices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ['title', 'description'],
                },
              },
            },
            required: ['title', 'primaryOwners', 'supportingOwners', 'lifecycleStages', 'accountableEntityImpact', 'stakeholderRequirements', 'risksWithoutAssurance', 'bestPractices'],
          },
        },
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as LessonsForCSuite;
    } catch (error) {
      console.error('Error generating lessons for C-Suite:', error);
      const errorMessage = 'Could not generate Lessons for C-Suite. The AI service may be unavailable.';
      this.error.set(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
