import { z } from 'zod';

export const ProvenanceSchema = z.object({
  file: z.string(),
  context: z.string().optional(),
});

export const EntityPropertySchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
});

export const EntitySchema = z.object({
  name: z.string(),
  properties: z.array(EntityPropertySchema).default([]),
  relationships: z.array(z.string()).default([]),
  provenance: ProvenanceSchema.optional(),
});

export const StateDefinitionSchema = z.object({
  name: z.string(),
  scope: z.enum(['global', 'component', 'server']),
  description: z.string(),
  provenance: ProvenanceSchema.optional(),
});

// Recursive schema for UIComponent
export const UIComponentSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(UIComponentSchema).optional(),
    attributes: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
    provenance: ProvenanceSchema.optional(),
  })
);

export const UIModuleSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  components: z.array(UIComponentSchema).default([]),
  provenance: ProvenanceSchema.optional(),
});

export const UserFlowStepSchema = z.object({
  action: z.string(),
  expectedResult: z.string(),
  stateTransition: z.string().optional(),
});

export const UserFlowErrorPathSchema = z.object({
  condition: z.string(),
  recovery: z.string(),
});

export const UserFlowSchema = z.object({
  name: z.string(),
  trigger: z.string(),
  steps: z.array(UserFlowStepSchema).default([]),
  errorPaths: z.array(UserFlowErrorPathSchema).default([]),
  outcome: z.string(),
  provenance: ProvenanceSchema.optional(),
});

export const MicroDetailSchema = z.object({
  category: z.enum(['ui', 'logic', 'validation', 'animation', 'accessibility']),
  description: z.string(),
  impact: z.string(),
  tags: z.array(z.string()).optional(),
  provenance: ProvenanceSchema.optional(),
});

export const ConstraintSchema = z.object({
  description: z.string(),
  scope: z.enum(['performance', 'security', 'design', 'accessibility', 'usability', 'technical', 'other']),
  impact: z.string(),
  impactedElements: z.array(z.string()).optional(),
});

export const GapSchema = z.object({
  id: z.string(),
  category: z.enum(['frontend', 'backend', 'database', 'devops', 'security', 'accessibility']),
  description: z.string(),
  proposedSolution: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  provenance: ProvenanceSchema.optional(),
});

export const ContradictionSchema = z.object({
  id: z.string(),
  description: z.string(),
  conflictingPoints: z.array(z.object({ text: z.string(), provenance: ProvenanceSchema })),
  resolutionSuggestion: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
});

export const DuplicateContentSchema = z.object({
  id: z.string(),
  elementName: z.string(),
  elementType: z.enum(['entity', 'flow', 'component', 'rule']),
  occurrences: z.array(z.object({ file: z.string(), context: z.string() })),
  impact: z.enum(['low', 'medium']),
  suggestion: z.string(),
});

export const SuggestionSchema = z.object({
  id: z.string(),
  type: z.enum(['best-practice', 'optimization', 'feature']),
  description: z.string(),
  reasoning: z.string(),
});

export const AutoFixActionSchema = z.object({
  id: z.string(),
  type: z.enum(['insert', 'update', 'delete', 'reorder']),
  target: z.string(),
  location: z.string(),
  newValue: z.any(),
  rationale: z.string(),
  riskLevel: z.enum(['safe', 'moderate', 'risky']),
});

export const SmartSuggestionSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  category: z.string(),
  description: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  rationale: z.string(),
  action: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  targetElement: z.string().optional(),
  autoFix: AutoFixActionSchema.optional(),
});

export const DetectedFrameworkSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  category: z.enum(['frontend', 'state', 'data-fetching', 'backend', 'database', 'auth', 'ui-lib', 'deployment', 'animation']),
  confidence: z.number(),
  evidence: z.array(z.string()),
});

export const CompatibilityIssueSchema = z.object({
  type: z.enum(['conflict', 'missing-requirement']),
  frameworks: z.array(z.string()),
  message: z.string(),
  severity: z.enum(['error', 'warning']),
});

export const SystemModelSchema = z.object({
  entities: z.array(EntitySchema).default([]),
  stateDefinitions: z.array(StateDefinitionSchema).default([]),
  uiModules: z.array(UIModuleSchema).default([]),
  flows: z.array(UserFlowSchema).default([]),
  microDetails: z.array(MicroDetailSchema).default([]),
  systemRules: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  constraints: z.array(ConstraintSchema).default([]),
  gaps: z.array(GapSchema).default([]),
  contradictions: z.array(ContradictionSchema).default([]),
  duplicates: z.array(DuplicateContentSchema).default([]),
  suggestions: z.array(SuggestionSchema).default([]),
  smartSuggestions: z.array(SmartSuggestionSchema).default([]),
  readinessScore: z.number().default(0),
  detectedFrameworks: z.array(DetectedFrameworkSchema).optional(),
  compatibilityIssues: z.array(CompatibilityIssueSchema).optional(),
  files: z.array(z.object({ name: z.string(), content: z.string() })).optional(),
});

export const BuildTaskSchema = z.object({
  id: z.string(),
  phase: z.string(),
  title: z.string(),
  description: z.string(),
  dependencies: z.array(z.string()),
  status: z.enum(['pending', 'in-progress', 'completed']),
  prompt: z.string(),
});
