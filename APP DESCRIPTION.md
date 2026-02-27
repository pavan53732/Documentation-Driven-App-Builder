# Documentation-Driven App Builder
## Complete System Architecture & Engine Documentation

**Version:** 1.0.0  
**Architecture:** Full-Stack React + AI-Powered Documentation Analysis  
**License:** Apache 2.0  
**Created:** February 2026

---

## 🚀 Product Capabilities & User Experience

### What the App Can Do
The Documentation-Driven App Builder is a high-velocity architectural engine that provides the following value propositions:
- **Instant Architecture Extraction**: Automatically turns unstructured Markdown into a structured, typed `SystemModel`.
- **Architectural "Sanity Checks"**: Deterministically catches security holes, accessibility gaps, and logical contradictions.
- **AI-Human Collaboration Hub**: Surfaces smart suggestions that developers can review, accept, or challenge.
- **Phased Build Strategy**: Generates a Directed Acyclic Graph (DAG) of implementation tasks, complete with hyper-granular prompts for downstream AI coding agents.
- **Conversational Blueprinting**: A specialized chatbot that understands your project's specific context and rules.

### The "Golden Thread" User Journey
The system is designed for a frictionless, document-to-build workflow:

#### 1. Setup & Configuration
- **AI Onboarding**: Users click the ✨ **AI** button to configure their preferred provider (OpenRouter, Kilo.ai, or Local LLMs via LM Studio/Ollama).
- **Model Flexibility**: Supports any model name and custom base URL, enabling a "Bring Your Own Model" (BYOM) workflow.
- **Project Identity**: Directly editable project title in the header for rapid context switching.

#### 2. Knowledge Ingestion
- **Source Material**: Drag-and-drop ingestion of multiple `.md` files containing requirements, PRDs, or technical specs.
- **Pre-analysis Polish**: Users can manage (add/remove) the source documents before triggering the engine.

#### 3. Intelligence Triggering
- **Quick Scan**: A fast, low-cost pass to validate the general direction.
- **Deep Analysis**: A comprehensive architectural dive that extracts the 3-phase technical specification (Structural, Contract, Configuration).

#### 4. Model Refinement (The Human-in-the-Loop)
- **Insight Review**: Developers navigate the **Architectural Insights** dashboard (Amber/Red/Slate modules) to identify system flaws.
- **Smart Fixes**: Users interact with **Emerald Suggestions**. Clicking **Check (Accept)** automatically mutates the project model (Auto-Fix) and instantly recalculates the build plan.
- **Feedback Loop**: Rejecting a suggestion allows the user to provide a rationale, which the AI analyzes to refine its architectural understanding.

#### 5. Build Realization
- **Graph Visualization**: The **Dependency Graph** provides a high-level visual map of the construction sequence.
- **Prompt Harvesting**: Developers copy hyper-detailed, context-infused prompts for each task to be fed into an AI IDE or agent.
- **Progress Tracking**: Standardized task list for marking progress and maintaining a clear "definition of done."

---

## 🏗️ System Overview

The Documentation-Driven App Builder is a sophisticated AI-powered tool that transforms raw system documentation into a complete, production-ready technical blueprint. It combines advanced AI reasoning with deterministic rule-based analysis to extract architectural patterns, user flows, and micro-interactions, automatically generating a structured build plan with granular tasks and dependency tracking.

### Core Philosophy
- **Documentation-First Development**: Start with comprehensive documentation, end with executable code
- **AI-Augmented Architecture**: Leverages any OpenAI-compatible provider (OpenRouter, Google, Anthropic, or Local LLMs) for deep semantic analysis.
- **Deterministic Quality Assurance**: 45 built-in architectural heuristics and best practices
- **Atomic Task Decomposition**: Break complex systems into executable, dependency-aware tasks

---

## 🧠 AI Engine Architecture

### 1. Multi-Provider AI Service (`src/services/aiService.ts`)

#### Core Components

**Client Factory & Caching System**
```typescript
// Memoized client factory with intelligent caching
const _clientCache = new Map<string, OpenAI>();
function getClient(config: ProviderConfig): OpenAI {
  // Normalizes baseURL for OpenRouter/custom proxies
  // Caches clients by apiKey+baseURL combination
  // Supports OpenRouter, Kilo.ai, LM Studio, Ollama
}
```

**Analysis Pipeline**
- **Deep Analysis**: Comprehensive extraction using high-reasoning models (e.g., Gemini 2.5 Flash, GPT-4o, Claude 3.5 Sonnet) via OpenAI-compatible SDKs.
- **Quick Scan**: Fast analysis for rapid prototyping and validation
- **Task Decomposition**: Converts system models into atomic, phased build tasks
- **Chat Interface**: Interactive AI assistant for documentation queries

#### Documentation Analysis Pipeline
The engine follows a multi-stage pipeline: `Extraction -> Evaluation -> Conflict Resolution -> Task Decomposition`.

#### The 9 Analysis Missions
The engine executes 9 distinct "Missions" during the analysis phase to ensure a 360-degree technical specification:
1. **Core Extraction**: Captures structural data (Entities, State, Flows, UI Modules, Constraints).
2. **Conflict Resolution**: Identifies contradictions and duplicate definitions across files.
3. **Readiness Audit**: Performs Gap Analysis and calculates an overall system readiness score.
4. **API Contract (Phase 1)**: Extracts HTTP methods, paths, request bodies, and auth requirements.
5. **Database Schema (Phase 1)**: Generates SQL-ready table definitions with types and indexes.
6. **Auth Architecture (Phase 1)**: Defines strategies (JWT/OAuth), roles, and permissions.
7. **Route Mapping (Phase 1)**: Catalogs all frontend routes, layouts, and data fetching strategies.
8. **EnvVar Profiling (Phase 2)**: Lists required environment variables with naming and scope.
9. **Error Handling (Phase 2)**: Maps operational points to user-facing messages and recovery actions.

#### AI Providers Supported
- **OpenRouter**: Multi-model API with 50+ providers
- **Kilo.ai**: Enterprise-grade AI services
- **LM Studio**: Local model hosting
- **Ollama**: Local LLM management
- **Custom Endpoints**: Any OpenAI-compatible API

#### EXTRACTION_PATTERNS (`src/services/aiService.ts`)
The engine uses a sophisticated set of semantic tokens and patterns to extract system models:
- **Flow Patterns**: 9 predefined sequence structures:
  - `When [user action], then [system response]`
  - `If [condition], [outcome]`
  - `User clicks [element], then [outcome]`
  - `After [event], the system [action]`
  - `Step [number]: [action]`
  - `Sequence: [action] -> [state change] -> [result]`
  - `Trigger: [event], Steps: [list of actions]`
  - `Upon [interaction], [immediate feedback] followed by [state update]`
  - `First [action], then [action], finally [outcome]`
- **Micro-Detail Categories**: 
  - **Animations (14 tokens)**: `fade in`, `slide up`, `slide down`, `transition`, `smoothly`, `bounce`, `glow`, `pulsate`, `staggered entrance`, `layout transition`, `expand/collapse`, `scale up on hover`, `rotate`, `shimmer effect`.
  - **UI States (13 tokens)**: `disabled when`, `hidden until`, `active state`, `hover effect`, `loading spinner`, `skeleton screen`, `placeholder text`, `focus state`, `error state`, `empty state`, `pressed state`, `focused-within`, `visited`.
  - **Validation (12 tokens)**: `must be`, `required`, `valid email`, `numeric only`, `minimum length`, `matches pattern`, `unique`, `password strength`, `real-time validation`, `alphanumeric`, `no special characters`, `range [min] to [max]`.
  - **Feedback (13 tokens)**: `toast notification`, `inline error`, `success message`, `confirmation dialog`, `immediate update`, `optimistic UI`, `loading spinner`, `progress bar`, `haptic feedback`, `tooltips`, `badge update`, `sound effect`, `shake animation on error`.
  - **Accessibility (18 tokens)**: `focus-ring`, `screen reader announcement`, `aria-live region`, `keyboard shortcut`, `skip link`, `color contrast`, `alt text`, `focus management`, `trap focus`, `semantic landmark`, `announcement on success`, `reduced motion support`, `high contrast mode`, `screen reader only text`, `aria-labeling`, `keyboard focus order`, `interactive element labeling`, `error announcement for screen readers`.
- **UI Attributes**: Full set of 17 attributes including `aria-label`, `aria-describedby`, `aria-expanded`, `data-testid`, `data-state`, `data-loading`, and `data-error`.
- **Constraints**: 9 pattern types for resource limits, response times, security methods, and device compatibility.

#### Core Intelligent Services
**analyzeRejection**
```typescript
export const analyzeRejection = async (suggestion, rationale, config): Promise<string>
```
Allows the AI to perform a "sanity check" when a user rejects an architectural suggestion. It analyzes the rationale for rejection and provides insights into why the rule might be misfiring or how the architecture should adapt.

#### Security Features
- **Client-Side Execution**: All AI calls happen in browser
- **Environment Variable Management**: Secure API key storage
- **Scoped Key Support**: Encourages use of limited-privilege keys
- **Base URL Validation**: Automatic normalization for proxy services

### 2. Rule Engine (`src/services/ruleEngine.ts`)

#### Architecture Overview
The rule engine implements a deterministic quality assurance system with 43 architectural heuristics organized into 13 categories:

**Actual Rule Distribution (43 total):**
- **UI/Icons**: 2 rules (Navigation/Action consistency)
- **UI/Feedback**: 5 rules (Confirmation, Toasts, Loading buttons, Empty states)
- **UI/Loading**: 1 rule (Skeleton screen implementation)
- **Accessibility**: 5 rules (ARIA, Alt text, Skip links, Hierarchy, Motion)
- **Logic/Logging**: 1 rule (Auth audit logging)
- **Logic/Monitoring**: 2 rules (Error reporting, Web Vitals)
- **Logic/Security**: 8 rules (Input validation, Rate limiting, CORS, Password hashing, SQLi, JWT, Secrets, Security headers)
- **DevOps**: 9 rules (Health checks, Env vars, Graceful shutdown, Docker, CI/CD, Migrations, Soft deletes, Indexing, Timestamps)
- **SEO**: 4 rules (Meta, OG, Sitemap, Canonical)
- **Testing**: 2 rules (Unit & E2E strategies)
- **Performance**: 1 rule (Lazy loading)
- **UX**: 2 rules (Inline validation, Icon tooltips)
- **Logic**: 1 rule (Idempotency)

#### Rule Structure
```typescript
interface Rule {
  id: string;                    // Unique identifier
  category: string;              // Classification (ui/icons, logic/security, etc.)
  description: string;           // Human-readable rule description
  trigger: {                     // When to apply the rule
    type: "component" | "flow" | "entity" | "global";
    selector?: string;           // Regex or exact match for targeting
  };
  condition: (model: SystemModel, target?: any) => boolean;  // Rule logic
  suggestion: {                  // Recommended action
    action: string;
    description: string;
    impact: "high" | "medium" | "low";
    rationale: string;
  };
  fix?: (model: SystemModel, target?: any) => void;  // Auto-fix implementation
}
```

#### Smart Icon Assignment
The system uses a heuristic `getSuggestedIcon` function driven by an 82-keyword `ICON_MAP`:
- **Core Actions**: Mapping `save` → `Save`, `delete` → `Trash2`, `edit` → `Pencil`, `search` → `Search`.
- **Navigation**: Mapping `home` → `Home`, `dashboard` → `LayoutDashboard`, `profile` → `User`.
- **Feedback**: Mapping `error` → `AlertCircle`, `success` → `CheckCircle2`, `alert` → `AlertTriangle`.
- **Directional**: Comprehensive coverage for `chevron`, `arrow`, `plus`, and `minus` variants.
- **Fallback**: Defaults to `HelpCircle` if no semantic keyword is detected in the component name.

#### Contradiction Detection
The engine performs deterministic contradiction analysis across 6 distinct types:
- **Access Conflicts**: Conflicting access levels (visibility/permission) for components.
- **Flow Logic Conflicts**: Same trigger with different outcomes/logic paths.
- **Data Type Conflicts**: Property type mismatches for common properties (id, email, etc.) across entities.
- **Permission Conflicts**: Admin flows containing public/guest steps (permission leakage).
- **Semantic Conflicts**: Contradictory architectural constraints (e.g., real-time vs batch).
- **State Definition Conflicts**: Same state name defined with different scopes (global vs component).

#### Duplicate Detection
Deterministic analysis of overlapping definitions:
- **Duplicate Entities**: Same entity name defined multiple times across documentation.
- **Duplicate Flows**: Identical user flows with same triggers and steps.
- **Duplicate Components**: Components defined in multiple modules, suggesting a need for shared components.

---

## 📊 System Model Architecture (`src/types.ts`)

### Core Data Structures

#### SystemModel Interface
```typescript
interface SystemModel {
  // Phase 0: Core Extraction
  entities: Entity[];                    // Data models with properties and relationships
  stateDefinitions: StateDefinition[];   // Application state (global/component/server)
  uiModules: UIModule[];                 // Component hierarchies and structures
  flows: UserFlow[];                     // Sequential user interactions
  microDetails: MicroDetail[];           // Animations, validation, accessibility
  systemRules: string[];                 // Business rules and constraints
  dependencies: string[];                // Technology and architectural dependencies
  constraints: Constraint[];             // Performance, security, design constraints
  gaps: Gap[];                          // Missing pieces and proposed solutions
  contradictions: Contradiction[];       // Detected conflicts and resolutions
  duplicates: DuplicateContent[];        // Duplicate definitions and suggestions
  suggestions: Suggestion[];             // Manual architectural suggestions
  smartSuggestions: SmartSuggestion[];   // AI-generated rule-based suggestions
  readinessScore: number;               // 0-100 quality assessment

  // Phase 1: Technical Specification
  apiEndpoints?: ApiEndpoint[];          // HTTP API contracts
  databaseSchema?: DatabaseTable[];      // SQL-ready table definitions
  authStrategy?: AuthStrategy;           // Authentication and authorization
  routes?: AppRoute[];                   // Frontend routing configuration

  // Phase 2: Configuration & Error Handling
  envVars?: EnvVar[];                    // Environment variable requirements
  errorHandlingMap?: ErrorHandlingEntry[]; // Error handling strategies
}
```

#### Entity Structure
```typescript
interface Entity {
  name: string;                          // Entity name (e.g., "User", "Product")
  properties: {                          // Data fields with types
    name: string;
    type: string;                        // TypeScript/SQL compatible types
    description: string;
  }[];
  relationships: string[];               // Foreign key relationships
  provenance?: Provenance;               // Source documentation context
}
```

#### User Flow Structure
```typescript
interface UserFlow {
  name: string;                          // Flow identifier
  trigger: string;                       // What initiates the flow
  steps: {                               // Sequential actions
    action: string;                      // User or system action
    expectedResult: string;              // Expected outcome
    stateTransition?: string;            // State changes
  }[];
  errorPaths: {                          // Error handling
    condition: string;                   // When error occurs
    recovery: string;                    // Recovery strategy
  }[];
  outcome: string;                       // Final result
  provenance?: Provenance;
}
```

#### Micro Detail Categories
```typescript
interface MicroDetail {
  category: 'ui' | 'logic' | 'validation' | 'animation' | 'accessibility';
  description: string;                   // Specific behavior or requirement
  impact: string;                        // Business/technical impact
  tags?: string[];                       // Classification tags
  provenance?: Provenance;
}
```

### Phase 1: Technical Specification

#### API Contract Layer
```typescript
interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;                          // Full path with parameters (/api/users/:id)
  description: string;                   // Purpose and behavior
  auth: 'none' | 'bearer' | 'session' | 'api-key';
  requestBody?: {                        // Request schema
    schema: string;                      // JSON schema or type definition
    contentType: string;                 // application/json, multipart/form-data
  };
  queryParams?: {                        // Query parameters
    name: string; type: string; required: boolean; description: string;
  }[];
  pathParams?: {                         // Path parameters
    name: string; type: string;
  }[];
  responses: {                           // Response definitions
    status: number; description: string; schema?: string;
  }[];
  middleware?: string[];                 // Validation, auth, rate limiting
  provenance?: Provenance;
}
```

#### Database Schema
```typescript
interface DatabaseTable {
  name: string;                          // Table identifier
  columns: DatabaseColumn[];             // Column definitions
  primaryKey: string;                    // Primary key column
  foreignKeys?: {                        // Foreign key relationships
    column: string; references: string; onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  }[];
  indexes?: {                            // Performance indexes
    columns: string[]; unique: boolean; type?: 'btree' | 'hash' | 'gin' | 'gist';
  }[];
  provenance?: Provenance;
}
```

#### Authentication Strategy
```typescript
interface AuthStrategy {
  type: 'JWT' | 'session' | 'OAuth' | 'magic-link' | 'API-key' | 'none';
  roles: AuthRole[];                     // Role-based permissions
  protectedRoutes: {                     // Route protection
    path: string; requiredRole: string;
  }[];
  tokenExpiry?: string;                  // Token lifetime
  refreshStrategy?: 'silent' | 'explicit' | 'none';
  provenance?: Provenance;
}
```

### Phase 2: Configuration & Error Handling

#### Environment Variables
```typescript
interface EnvVar {
  name: string;                          // SCREAMING_SNAKE_CASE
  type: 'string' | 'number' | 'boolean' | 'url';
  required: boolean;                     // Whether variable is mandatory
  serverOnly: boolean;                   // Whether exposed to client
  default?: string;                      // Default value if optional
  description: string;                   // Purpose and usage
  provenance?: Provenance;
}
```

#### Error Handling Map
```typescript
interface ErrorHandlingEntry {
  location: string;                      // Component or service name
  context: string;                       // Operation that triggers error
  errorType: string;                     // NetworkError, ValidationError, etc.
  userMessage: string;                   // User-facing error message
  recovery: 'retry' | 'redirect' | 'show-modal' | 'show-toast' | 'silent' | 'fallback-ui';
  shouldLog: boolean;                    // Whether to log to monitoring
  provenance?: Provenance;
}
```

---

## 🎨 Frontend Architecture (`src/App.tsx`)

### Component Hierarchy

#### Main Application Structure
```
App
├── Header (Project Management)
├── Tab Navigation (Docs/Model/Tasks/Standards)
├── Main Content Area
│   ├── Documentation Loader (Docs Tab)
│   ├── System Model Viewer (Model Tab)
│   ├── Build Plan Manager (Tasks Tab)
│   └── Rule Editor (Standards Tab)
└── ChatBot (Floating Assistant)
```

#### Key Components

**1. Documentation Loader**
- **File Upload**: Drag-and-drop markdown file upload
- **Document Management**: Add/remove documents with metadata
- **Analysis Triggers**: Quick scan vs deep analysis options
- **Error Handling**: Validation and user feedback

**2. System Model Viewer**
- **Architectural Insights**: Gap analysis, contradictions, duplicates
- **Smart Suggestions**: Rule-based improvement recommendations
- **Technical Specifications**: API contracts, database schema, auth strategy
- **Configuration Management**: Environment variables, error handling

**3. Build Plan Manager**
- **Dependency Graph**: Visual task relationship mapping using ReactFlow
- **Task List**: Phased, atomic task breakdown
- **Prompt Generation**: Hyper-detailed AI builder instructions
- **Progress Tracking**: Task completion status

### UI/UX & Design Architecture

#### Neobrutalist Design System
The application employs a **Neobrutalist** aesthetic, characterized by high contrast, bold shadows, and a raw, "honest" interface that prioritizes functional clarity over decorative fluff.

- **Visual Foundation**:
  - **Hard Shadows**: `shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]` and `shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]` used throughout to create depth without blur.
  - **High Contrast Borders**: Sharp `1px` or `2px` borders in `#141414` (Light) or `white/10` (Dark).
  - **Sharp Corners**: Consistent use of `rounded-sm` for a structured, industrial feel.

- **Typography Strategy**:
  - **Sans (Inter)**: The workhorse for UI elements and density, used for its high legibility in complex data states.
  - **Serif (Playfair Display)**: Used for high-level headings and "knowledge" sections to evoke the feel of a technical manual or blueprint.
  - **Mono (JetBrains Mono)**: Reserved for entity names, code snippets, and system logs to maintain a technical "builder" context.

- **Interactive Motion**:
  - **Layout Syncing**: `motion/react` is used with `layout` and `layoutId` props to handle seamless transitions between tabs and expanded states.
  - **Micro-interactions**: Subtle `scale: 1.05` on hover for cards and `scale: 0.95` on tap for buttons to provide tactile feedback in the brutalist environment.

---

### Internal Engine & Logic Pipeline

#### Analysis Lifecycle
The engine processes documentation through a strictly defined linear pipeline to ensure architectural consistency:
1. **Model Extraction**: Structural analysis of Markdown using the `EXTRACTION_PATTERNS` semantic tokens.
2. **Deterministic Evaluation**: Running the 43 heuristics from the `ruleEngine.ts` against the extracted model.
3. **Conflict Resolution**: Synchronous detection of **Contradictions** and **Duplicates**.
4. **Task Decomposition**: Using the refined model to generate a phased dependency graph of implementation tasks.

#### The 3-Phase Extraction Strategy
AI analysis is partitioned into three logical scopes to minimize hallucination and maximize precision:
- **Phase 1 (Structural)**: Entities, User Flows, and UI Modules.
- **Phase 2 (Contract)**: API Endpoints, Database Schema, and Auth Strategy.
- **Phase 3 (Configuration)**: Environment Variables and Error Handling Maps.

#### Component Deep Dives

**1. DependencyGraph (ReactFlow Architecture)**
- **State Flow**: Converts the `BuildTask[]` array into a ReactFlow `Node[]` and `Edge[]` structure.
- **Dependency Logic**: Edges are generated by mapping the `dependencies` IDs to parent tasks, with `animated` strokes for 'in-progress' tasks.
- **Interactive Map**: Includes a `MiniMap` and `Controls` for navigating large-scale project builds.

**2. UIComponentTree (Recursive Logic)**
- **Hierarchical Rendering**: A recursive React component that renders the nested `UIComponent` structure.
- **Attribute Mapping**: Displays ARIA and custom data attributes extracted by the AI directly on the tree nodes.
- **State Management**: Local `isExpanded` state per node with `AnimatePresence` for smooth accordion-style navigation.

**3. State Persistence Model**
The application maintains a "Hot Reloadable" architecture via `localStorage`:
- **Theme**: Persistent `guide-theme` ('light' | 'dark').
- **Provider Settings**: `guide-api-key`, `guide-base-url`, and `guide-model-name`.
- **Chat Context**: Storage of `guide-chat-history` to preserve AI conversation across sessions.
- **Project State**: Auto-save of the current `ProjectModel` and `BuildTasks` (in future iterations).

---

### Advanced AI Extraction Patterns

#### Semantic Extractions (`src/services/aiService.ts`)
The `EXTRACTION_PATTERNS` object contains highly specific regex-like semantic tokens:
- **Flow Triggers**: Detects keywords like `When the user...`, `On click...`, `After [x] occurs`.
- **Validation Rules**: Patterns for `length`, `format`, `regex`, and `zod-equivalent` schemas.
- **Animation Heuristics**: Detects descriptors for `framer-motion` implementations (e.g., "staggered entrance," "shimmer effect").
- **Accessibility Constraints**: Automatically identifies missing `aria-` attributes or focus trap requirements based on component descriptions.

#### Intelligent Service Models
- **quickAnalyze**: A high-speed, cost-effective pass for initial validation and project naming.
- **decomposeTasks**: A logic-heavy prompt that understands project dependencies, ensuring that "Database Migration" tasks always precede "API Implementation" tasks.
- **analyzeRejection**: A meta-analysis service that treats user feedback as architectural constraints, allowing the engine to learn from rejected suggestions.

---

### High-Fidelity Engine Internals

#### 1. Dual Detection Systems
The engine employs a hybrid detection strategy to ensure architectural integrity:
- **AI-Driven Detection**: Patterns like `gaps` and `contradictions` are first identified by the LLM during the `analyzeDocumentation` phase, leveraging semantic understanding of the requirements.
- **Deterministic Detection (`ruleEngine.ts`)**: Post-extraction, the system runs strict TypeScript-based checks:
    - **`detectContradictions`**: Scans the model for logical paradoxes (e.g., a component marked both 'Public' and 'Admin-only').
    - **`detectDuplicates`**: Performs an N² comparison across entities, flows, and components to identify redundant definitions across multiple Markdown files.

#### 2. Deep Provenance Tracking
Every byte of data in the `SystemModel` is "fingerprinted" back to its source:
- **Traceability**: All entities, flows, and components carry a `provenance` object containing the `file` name and a `context` snippet.
- **Conflict Tracking**: When a contradiction is found, the engine identifies the exact line or context from different source files, allowing the user to see *where* the documentation is fighting with itself.
- **Audit Trail**: This provenance is preserved through the state transitions, ensuring that the generated `BuildTasks` can reference the exact documentation paragraph they are implementing.

#### 3. Smart Suggestion & Auto-Fix Mechanics
The `evaluateRules` function triggers a reactive loop:
- **Trigger-Action Model**: Rules are defined with a `trigger` (e.g., `type: "component"`, `selector: "button"`) and a `fix` function.
- **Atomic fixes**: When a user clicks **Accept**, the `applySuggestion` function performs a surgical mutation on the `SystemModel`. For example, it might automatically inject a missing `aria-label` attribute into a UI component or add a `loading` state to a user flow.
- **Closed-Loop Learning**: Rejections are fed into `analyzeRejection`, which uses AI to summarize *why* a specific architectural rule was deemed inapplicable by the human developer, refining future analysis.

#### 5. Rule Definition Schema
Every architectural heuristic in the `ruleEngine.ts` follows a strictly typed `Rule` interface:
- **Trigger**: A dynamic selector (RegEx or String) that targets components, flows, entities, or the global model.
- **Condition**: A deterministic predicate function `(model, target) => boolean`.
- **Suggestion**: An object defining the `action`, `rationale`, and `impact` (`high`, `medium`, `low`).
- **Fix (Optional)**: A function `(model, target) => void` that performs the state-level Auto-Fix.

---

### UI/UX: The Architectural Insights Dashboard
The "Model" tab serves as the command center for architectural integrity, surfacing engine findings through distinct, color-coded visual modules:

#### 1. Gap Analysis (Amber Module)
- **UI Element**: `amber-900/10` background with `Search` icon.
- **Logic**: Surfaced from the LLM-analyzed `gaps` array.
- **Micro-Detail**: Each gap shows its `category` (Security, A11y, etc.) and a "Proposed Solution" in italicized text.

#### 2. Contradiction Tracker (Red Module)
- **UI Element**: `red-900/10` background with `AlertTriangle` icon.
- **Logic**: Visualizes structural paradoxes found via `detectContradictions`.
- **Multi-Point Provenance**: Shows the conflicting points as a bulleted list, each with a file-path link and context snippet, allowing users to jump directly to the documentation conflict.

#### 3. Duplicate Detector (Slate Module)
- **UI Element**: `slate-900/10` background with `Copy` icon.
- **Logic**: Flags elements (Entities, Flows, Components) defined multiple times across disparate documents.
- **Occurrence Map**: Lists every file where the duplication occurs, promoting consolidation.

#### 4. Rule-Based Smart Suggestions (Emerald Hub)
- **UI Element**: Featured section with hard shadows (`shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]`) and `Sparkles` icon.
- **Interactive States**:
  - **Pending**: Full color with `Check` (Accept) and `X` (Reject) buttons.
  - **Accepted**: `emerald-500/5` background with an "Accepted" badge.
  - **Rejected**: Desaturated and grayscaled to maintain history without distracting.
- **Auto-Fix Interface**: Each suggestion includes a "Recommended Action" card showing the exact code-level change (via the `action` field) that will be applied to the model.

#### 5. The Rule Editor (`src/components/RuleEditor.tsx`)
A technical "Workbench" for managing the 43+ heuristics:
- **Granular Browser**: Search through names or descriptions of all rules.
- **Impact Matrix**: Filter rules by `high`, `medium`, or `low` architectural impact.
- **Logic Inspector**: View the rationale for every rule, allowing developers to understand *why* the engine is enforcing certain patterns.

#### 6. Task Decomposition Logic
The `decomposeTasks` service acts as the "Architectural Compiler" of the engine:
- **DAG Generation**: It doesn't just list tasks; it builds a **Directed Acyclic Graph (DAG)**. By analyzing the relationships between Entities, UI Modules, and User Flows, it ensures that foundational infrastructure (like Database Migrations) is always sequenced before dependent feature implementations.
- **Contextual Prompt Injection**: Each task's `prompt` field is a dynamically generated technical specification. The engine injects only the relevant filtered slice of the `SystemModel` (specific entities or flow steps) into the prompt, ensuring the individual AI units have 100% precision with zero noise.

**5. ChatBot** (`src/components/ChatBot.tsx`)
A floating AI assistant for real-time documentation interaction:
- **Contextual Awareness**: Injects the current ProjectModel into every chat session.
- **Message Persistence**: Automatically saves and restores chat history from localStorage.
- **Interactive Assistance**: Powered by `chatWithAI` service for architectural advice.

**6. Dependency Visualization**
- **DependencyGraph**: A ReactFlow-based visualization of the phased build tasks.
- **UIComponentTree**: A hierarchical, collapsible visualization of the extracted component structure.

### Smart Suggestion Workflow
The system features a closed-loop architectural refinement flow:
1. **Analyze**: AI/Rule engine detects violations.
2. **Review**: User sees "Smart Suggestions" in the Model tab.
3. **Act**: User can **Accept** (triggering model update and task re-generation) or **Reject**.
4. **Learning**: Rejection triggers `analyzeRejection` to refine architectural understanding.

- **Hover States**: Subtle opacity and scale effects
- **Loading States**: Skeleton screens and spinners
- **Focus Management**: Keyboard navigation support

#### Accessibility Features
- **Semantic HTML**: Proper heading hierarchy (H1 → H2 → H3)
- **ARIA Labels**: Screen reader support for all interactive elements
- **Keyboard Navigation**: Tab navigation through all controls
- **Color Contrast**: WCAG AA compliant color combinations
- **Screen Reader Announcements**: Status updates and notifications

---

## 🔧 Build System & Configuration

### Development Environment
```json
{
  "name": "documentation-driven-app-builder",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "openai": "^6.25.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "reactflow": "^11.11.4",
    "motion": "^12.23.24",
    "lucide-react": "^0.546.0",
    "@google/genai": "^1.29.0",
    "better-sqlite3": "^12.4.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "autoprefixer": "^10.4.21"
  },
    "devDependencies": {
    "@types/node": "^20.14.14",
    "@types/express": "^4.17.21",
    "@vitejs/plugin-react": "^5.0.4",
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "tailwindcss": "^4.1.14"
  }
}
```

### Build Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // Added import for tailwindcss

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  server: {
    port: 3000,
    host: true,
    hmr: process.env.DISABLE_HMR !== 'true' // Dynamic HMR for AI Studio compatibility
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['openai'],
          ui: ['lucide-react', 'motion']
        }
      }
    }
  }
})
```

### Styling Configuration (Tailwind CSS v4)
The project uses Tailwind CSS v4 via the @tailwindcss/vite plugin. Configuration is handled through CSS-first approach in src/index.css:

```css
@theme {
  --font-body: Inter, system-ui;
  --font-heading: Georgia, serif;
  --color-primary: #141414;
  --color-secondary: #E4E3E0;
}

@layer base {
  html {
    font-family: var(--font-body);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
}
```

---

## 🔄 Data Flow Architecture

### Analysis Pipeline

#### 1. Documentation Ingestion
```
User Uploads Markdown Files
    ↓
File Reader (FileReader API)
    ↓
Document Storage (State Management)
    ↓
Validation & Preprocessing
```

#### 2. AI Analysis
```
Combined Documentation
    ↓
AI Service (OpenAI SDK)
    ↓
System Model Generation
    ↓
Rule Engine Evaluation
    ↓
Contradiction & Duplicate Detection
```

#### 3. Task Decomposition
```
System Model
    ↓
Task Generation (AI)
    ↓
Dependency Inference
    ↓
Build Plan Creation
    ↓
Visual Graph Generation
```

#### 4. Interactive Features
```
User Actions (Accept/Reject Suggestions)
    ↓
Model Updates (State Management)
    ↓
Task Regeneration (AI)
    ↓
UI Updates (React Re-rendering)
```

### State Management Strategy

#### Global State Structure
```typescript
interface ProjectState {
  id: string;                           // Unique project identifier
  name: string;                         // Project name (editable)
  docs: {                               // Loaded documentation
    name: string;
    content: string;
  }[];
  model: SystemModel | null;            // Generated system model
  tasks: BuildTask[];                   // Decomposed build tasks
  currentTaskIndex: number;             // Active task in UI
  providerConfig: ProviderConfig;       // AI provider settings
}
```

#### State Update Patterns
- **Immutable Updates**: All state changes create new objects
- **Batched Updates**: Related changes grouped for performance
- **State Persistence**: Local storage for project continuity
- **Persistence**: Local storage for project continuity

---

## 🛡️ Security Architecture

### Client-Side Security
- **No Server Dependencies**: All processing happens in browser
- **API Key Isolation**: Keys stored in localStorage, not transmitted
- **Input Validation**: Markdown content validation and sanitization
- **CSP Compliance**: Content Security Policy friendly

### AI Provider Security
- **Scoped API Keys**: Encourages use of limited-privilege keys
- **Base URL Validation**: Prevents malicious endpoint injection
- **Request Monitoring**: Tracks API usage and errors
- **Error Handling**: Graceful degradation on API failures

### Data Privacy
- **Local Processing**: Documentation never leaves user's browser
- **No Analytics**: No telemetry or usage tracking
- **Secure Storage**: LocalStorage for sensitive data
- **Session Management**: Automatic cleanup on browser close

---

## 📈 Performance Architecture

### Optimization Strategies

#### Bundle Optimization
- **Code Splitting**: Dynamic imports for heavy components
- **Tree Shaking**: Unused code elimination
- **Vendor Chunking**: Separate vendor and application bundles
- **Compression**: Gzip/Brotli compression for production

#### Runtime Performance
- **Scroll Optimization**: Efficient scrolling for long task lists
- **Memoization**: Expensive calculations cached with useMemo
- **Debouncing**: Input debouncing for search and analysis
- **Lazy Loading**: Component lazy loading for non-critical features

#### AI Performance
- **Request Caching**: Intelligent caching of AI responses
- **Concurrent Requests**: Parallel processing where safe
- **Timeout Handling**: Graceful handling of slow AI responses
- **Progressive Enhancement**: Fallbacks for failed AI calls

### Memory Management
- **File Size Limits**: Maximum 10MB per document
- **Document Count Limits**: Maximum 50 documents per project
- **State Cleanup**: Automatic cleanup of unused state
- **Garbage Collection**: Manual cleanup triggers for large operations

---

## 🧪 Testing Architecture

### Unit Testing Strategy
```typescript
// Example test structure
describe('AI Service', () => {
  describe('analyzeDocumentation', () => {
    it('should extract entities from markdown', async () => {
      // Test AI extraction accuracy
    });
    
    it('should handle API errors gracefully', async () => {
      // Test error handling
    });
  });
  
  describe('ruleEngine', () => {
    it('should detect icon missing violations', () => {
      // Test rule detection
    });
    
    it('should resolve contradictions', () => {
      // Test contradiction resolution
    });
  });
});
```

### Integration Testing
- **End-to-End Flows**: Complete documentation-to-tasks workflow
- **AI Provider Integration**: Multiple provider compatibility
- **State Management**: Complex state update scenarios
- **UI Interactions**: Component interaction testing

### Performance Testing
- **Large Document Handling**: Performance with 1000+ line documents
- **Memory Usage**: Memory consumption monitoring
- **AI Response Times**: API response time tracking
- **Bundle Size**: Bundle size optimization validation

---

## 🚀 Deployment Architecture

### Development Deployment
```bash
# Local development
npm run dev
# Serves on http://localhost:3000
# Hot module replacement enabled
# Source maps available
```

### Production Deployment
```bash
# Build for production
npm run build
# Generates optimized static files in /dist
# Source maps included for debugging

# Preview build
npm run preview
# Serves built files locally
# Tests production configuration
```

### Hosting Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN Distribution**: Global content delivery
- **Custom Domain**: SSL/TLS certificate support
- **Performance Monitoring**: Built-in performance metrics

### Environment Configuration
```typescript
// Environment variables for deployment
VITE_APP_NAME="Documentation-Driven App Builder"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="production"
VITE_APP_ANALYTICS_ID="" // Optional
```

---

## 🔧 Maintenance & Extensibility

### Rule Engine Extensibility
```typescript
// Adding new rules
const newRule: Rule = {
  id: "rule-custom-validation",
  category: "logic/validation",
  description: "All forms must have client-side validation",
  trigger: { type: "component", selector: ".*(Form|Input).*" },
  condition: (model, component) => {
    // Custom validation logic
    return !hasValidation(component);
  },
  suggestion: {
    action: "Add Client Validation",
    description: "Implement client-side validation for this form",
    impact: "medium",
    rationale: "Improves user experience and reduces server load"
  },
  fix: (model, component) => {
    // Auto-fix implementation
    addValidation(component);
  }
};
```

### AI Provider Extensibility
```typescript
// Adding new AI providers
const customProvider: ProviderConfig = {
  apiKey: process.env.CUSTOM_API_KEY,
  baseURL: "https://custom-ai-provider.com/v1",
  modelName: "custom-model"
};
```

### Component Extensibility
- **Plugin Architecture**: Modular component system
- **Theme System**: Customizable design tokens
- **Localization**: Internationalization support
- **Accessibility**: WCAG compliance extensions

---

## 📚 API Reference

### Core Services

#### AI Service API
```typescript
// Analyze documentation
const model: SystemModel = await analyzeDocumentation(docs, config);

// Quick scan
const model: SystemModel = await quickAnalyze(docs, config);

// Decompose tasks
const tasks: BuildTask[] = await decomposeTasks(model, config);

// Chat interface
const response: string = await chatWithAI(message, history, context, config);
```

#### Rule Engine API
```typescript
// Evaluate rules
const suggestions: SmartSuggestion[] = evaluateRules(model);

// Apply suggestion
const updatedModel: SystemModel = applySuggestion(model, suggestion);

// Detect contradictions
const contradictions: Contradiction[] = detectContradictions(model);

// Detect duplicates
const duplicates: DuplicateContent[] = detectDuplicates(model);
```

#### State Management API
```typescript
// Project state updates
setState(prev => ({ ...prev, name: "New Project Name" }));

// Task status updates
toggleTaskStatus(taskIndex);

// Smart suggestion handling
handleAcceptSmartSuggestion(suggestionId);
handleRejectSmartSuggestion(suggestionId);
```

---

## 🎯 Future Roadmap

### Phase 3: Advanced Features
- **Code Generation**: Direct code generation from build plans
- **Version Control**: Git integration for project history
- **Collaboration**: Multi-user project sharing
- **Templates**: Pre-built project templates

### Phase 4: Enterprise Features
- **SSO Integration**: Enterprise authentication
- **Audit Logging**: Comprehensive activity tracking
- **Custom Rules**: User-defined rule creation
- **API Access**: REST API for external integrations

### Phase 5: AI Enhancements
- **Multi-Model Support**: Concurrent AI model usage
- **Fine-Tuning**: Custom model fine-tuning
- **Context Awareness**: Long-term context retention
- **Predictive Analysis**: Proactive architectural suggestions

---

## 📞 Support & Contributing

### Getting Help
- **Documentation**: Comprehensive API and usage documentation
- **Issue Tracking**: GitHub issues for bug reports and feature requests
- **Community**: Developer community and discussion forums
- **Support**: Priority support for enterprise users

### Contributing Guidelines
- **Code Style**: ESLint and Prettier configuration
- **Type Checking**: All contributions must pass TypeScript compilation
- **Documentation**: API changes require documentation updates
- **Review Process**: All changes require code review

### Development Setup
```bash
# Clone repository
git clone https://github.com/your-org/documentation-driven-app-builder.git

# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run lint

# Build for production
npm run build
```

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### License Summary
- **Commercial Use**: ✅ Allowed
- **Modification**: ✅ Allowed
- **Distribution**: ✅ Allowed
- **Private Use**: ✅ Allowed
- **Liability**: ❌ Not provided
- **Warranty**: ❌ Not provided

---

## 🙏 Acknowledgments

This project leverages several excellent open-source technologies:
- **React 18**: Modern UI framework
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **ReactFlow**: Interactive graph visualization
- **OpenAI SDK**: AI integration
- **Lucide React**: High-quality icons

Special thanks to the contributors and maintainers of these projects.

---

*This documentation represents the complete architectural blueprint of the Documentation-Driven App Builder as of February 2026. For the most up-to-date information, please refer to the project repository.*