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
  // Phase 1 — Technical Specification
  apiEndpoints?: ApiEndpoint[];
  databaseSchema?: DatabaseTable[];
  authStrategy?: AuthStrategy;
  routes?: AppRoute[];
  // Phase 2 — Configuration & Error Handling
  envVars?: EnvVar[];
  errorHandlingMap?: ErrorHandlingEntry[];
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

// ─── Phase 1: API Contract Layer ─────────────────────────────────────────────
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth: 'none' | 'bearer' | 'session' | 'api-key';
  requestBody?: { schema: string; contentType: string };
  queryParams?: { name: string; type: string; required: boolean; description: string }[];
  pathParams?: { name: string; type: string }[];
  responses: { status: number; description: string; schema?: string }[];
  middleware?: string[];
  provenance?: Provenance;
}

// ─── Phase 1: Database Schema ─────────────────────────────────────────────────
export interface DatabaseColumn {
  name: string;
  type: string; // e.g. uuid, varchar(255), int, boolean, timestamp, jsonb
  nullable: boolean;
  unique?: boolean;
  default?: string;
  primaryKey?: boolean;
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  primaryKey: string;
  foreignKeys?: { column: string; references: string; onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' }[];
  indexes?: { columns: string[]; unique: boolean; type?: 'btree' | 'hash' | 'gin' | 'gist' }[];
  provenance?: Provenance;
}

// ─── Phase 1: Auth Architecture ───────────────────────────────────────────────
export interface AuthRole {
  name: string;
  permissions: string[];
}

export interface AuthStrategy {
  type: 'JWT' | 'session' | 'OAuth' | 'magic-link' | 'API-key' | 'none';
  roles: AuthRole[];
  protectedRoutes: { path: string; requiredRole: string }[];
  tokenExpiry?: string;
  refreshStrategy?: 'silent' | 'explicit' | 'none';
  provenance?: Provenance;
}

// ─── Phase 1: Route Definitions ───────────────────────────────────────────────
export interface AppRoute {
  path: string;
  component: string;
  layout?: string;
  auth: 'required' | 'optional' | 'public';
  dataFetching?: 'SSR' | 'SSG' | 'CSR' | 'ISR';
  metadata?: { title: string; description?: string };
  provenance?: Provenance;
}

// ─── Phase 2: Environment Variables ──────────────────────────────────────────
export interface EnvVar {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'url';
  required: boolean;
  serverOnly: boolean;
  default?: string;
  description: string;
  provenance?: Provenance;
}

// ─── Phase 2: Error Handling Map ─────────────────────────────────────────────
export interface ErrorHandlingEntry {
  location: string; // component or service name
  context: string;  // what operation triggers this error
  errorType: string; // e.g. NetworkError, ValidationError, AuthError
  userMessage: string;
  recovery: 'retry' | 'redirect' | 'show-modal' | 'show-toast' | 'silent' | 'fallback-ui';
  shouldLog: boolean;
  provenance?: Provenance;
}
