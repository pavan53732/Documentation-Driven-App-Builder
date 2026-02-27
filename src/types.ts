export interface SystemModel {
  entities: Entity[];
  stateDefinitions: StateDefinition[];
  uiModules: UIModule[];
  flows: UserFlow[];
  microDetails: MicroDetail[];
  systemRules: string[];
  dependencies: string[];
  constraints: Constraint[];
  gaps: Gap[];
  contradictions: Contradiction[];
  duplicates: DuplicateContent[];
  suggestions: Suggestion[];
  smartSuggestions: SmartSuggestion[];
  readinessScore: number;
}

export interface Provenance {
  file: string;
  context?: string;
}

export interface SmartSuggestion {
  id: string;
  ruleId: string;
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  rationale: string;
  action: string;
  status: 'pending' | 'accepted' | 'rejected';
  targetElement?: string;
}

export interface Gap {
  id: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'security' | 'accessibility';
  description: string;
  proposedSolution: string;
  impact: 'high' | 'medium' | 'low';
  provenance?: Provenance;
}

export interface Contradiction {
  id: string;
  description: string;
  conflictingPoints: { text: string; provenance: Provenance }[];
  resolutionSuggestion: string;
  severity: 'high' | 'medium' | 'low';
}

export interface DuplicateContent {
  id: string;
  elementName: string;
  elementType: 'entity' | 'flow' | 'component' | 'rule';
  occurrences: { file: string; context: string }[];
  impact: 'low' | 'medium';
  suggestion: string;
}

export interface Suggestion {
  id: string;
  type: 'best-practice' | 'optimization' | 'feature';
  description: string;
  reasoning: string;
}

export interface Constraint {
  description: string;
  scope: 'performance' | 'security' | 'design' | 'accessibility' | 'usability' | 'technical' | 'other';
  impact: string;
  impactedElements?: string[];
}

export interface UserFlow {
  name: string;
  trigger: string;
  steps: { action: string; expectedResult: string; stateTransition?: string }[];
  errorPaths: { condition: string; recovery: string }[];
  outcome: string;
  provenance?: Provenance;
}

export interface MicroDetail {
  category: 'ui' | 'logic' | 'validation' | 'animation' | 'accessibility';
  description: string;
  impact: string;
  tags?: string[];
  provenance?: Provenance;
}

export interface Entity {
  name: string;
  properties: { name: string; type: string; description: string }[];
  relationships: string[];
  provenance?: Provenance;
}

export interface StateDefinition {
  name: string;
  scope: 'global' | 'component' | 'server';
  description: string;
  provenance?: Provenance;
}

export interface UIModule {
  name: string;
  purpose: string;
  components: UIComponent[];
  provenance?: Provenance;
}

export interface UIComponent {
  name: string;
  children?: UIComponent[];
  attributes?: { name: string; value: string }[];
  provenance?: Provenance;
}

export interface BuildTask {
  id: string;
  phase: string;
  title: string;
  description: string;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed';
  prompt: string;
}

export interface ProjectState {
  id: string;
  name: string;
  docs: { name: string; content: string }[];
  model: SystemModel | null;
  tasks: BuildTask[];
  currentTaskIndex: number;
  providerConfig: ProviderConfig;
}

export interface ProviderConfig {
  apiKey: string;
  baseURL: string;
  modelName: string;
}

