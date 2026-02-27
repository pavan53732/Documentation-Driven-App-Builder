import OpenAI from "openai";
import { SystemModel, BuildTask, SmartSuggestion, ProviderConfig } from "../types";
import { evaluateRules } from "./ruleEngine";

// ─── Memoized Client Factory (Fix: new client created per call; now cached) ──
// Clients are cached by apiKey+baseURL so repeated calls reuse the same instance.
// dangerouslyAllowBrowser is required for client-side deployments.
// Users should use scoped API keys - see the security notice in the config modal.
const _clientCache = new Map<string, OpenAI>();
function getClient(config: ProviderConfig): OpenAI {
  const cacheKey = `${config.apiKey}::${config.baseURL}`;
  if (_clientCache.has(cacheKey)) return _clientCache.get(cacheKey)!;
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true
  });
  _clientCache.set(cacheKey, client);
  return client;
}

// ─── Safe JSON parse helper ───────────────────────────────────────────────────
function safeParseJSON<T>(raw: string | null | undefined, fallback: T): T {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ─── Safe response content extractor (Fix: No optional chaining) ─────────────
function getContent(response: OpenAI.Chat.Completions.ChatCompletion): string {
  return response.choices?.[0]?.message?.content ?? "";
}

const EXTRACTION_PATTERNS = {
  flows: [
    "When [user action], then [system response]",
    "If [condition], [outcome]",
    "User clicks [element], then [outcome]",
    "After [event], the system [action]",
    "Step [number]: [action]",
    "Sequence: [action] -> [state change] -> [result]",
    "Trigger: [event], Steps: [list of actions]",
    "Upon [interaction], [immediate feedback] followed by [state update]",
    "First [action], then [action], finally [outcome]"
  ],
  microDetails: {
    animations: ["fade in", "slide up", "slide down", "transition", "smoothly", "bounce", "glow", "pulsate", "staggered entrance", "layout transition", "expand/collapse", "scale up on hover", "rotate", "shimmer effect"],
    uiStates: ["disabled when", "hidden until", "active state", "hover effect", "loading spinner", "skeleton screen", "placeholder text", "focus state", "error state", "empty state", "pressed state", "focused-within", "visited"],
    validation: ["must be", "required", "valid email", "numeric only", "minimum length", "matches pattern", "unique", "password strength", "real-time validation", "alphanumeric", "no special characters", "range [min] to [max]"],
    feedback: ["toast notification", "inline error", "success message", "confirmation dialog", "immediate update", "optimistic UI", "loading spinner", "progress bar", "haptic feedback", "tooltips", "badge update", "sound effect", "shake animation on error"],
    accessibility: [
      "focus-ring", "screen reader announcement", "aria-live region", "keyboard shortcut", "skip link",
      "color contrast", "alt text", "focus management", "trap focus", "semantic landmark",
      "announcement on success", "reduced motion support", "high contrast mode", "screen reader only text",
      "aria-labeling", "keyboard focus order", "interactive element labeling", "error announcement for screen readers"
    ]
  },
  uiAttributes: ["aria-label", "aria-describedby", "aria-labelledby", "aria-haspopup", "aria-expanded", "aria-hidden", "aria-live", "role", "tabIndex", "data-testid", "data-cy", "data-automation-id", "data-state", "data-value", "data-theme", "data-loading", "data-error"],
  constraints: [
    "Must support [number] users",
    "Response time under [time]",
    "Secure with [method]",
    "Adhere to [standard]",
    "Compatible with [browser/device]",
    "Limit [resource] to [value]",
    "Maximum [size]",
    "Required [technology]",
    "Accessibility [standard]"
  ]
};

// ─── analyzeDocumentation ─────────────────────────────────────────────────────
export const analyzeDocumentation = async (docs: { name: string; content: string }[], config: ProviderConfig): Promise<SystemModel> => {
  const combinedDocs = docs.map(d => `File: ${d.name}\n\n${d.content}`).join("\n\n---\n\n");
  const ai = getClient(config);

  try {
    const response = await ai.chat.completions.create({
      model: config.modelName,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a World-Class Full-Stack Architect, API Designer, and Database Engineer.
          Analyze system documentation with surgical precision. Your goal is not summarization — it is
          COMPLETE TECHNICAL SPECIFICATION EXTRACTION. Every field you return will be used by an AI 
          code builder to write actual production code. Be exhaustive, specific, and technically accurate.
          When information is ambiguous in the docs, make the most reasonable engineering decision and note it.
          If a category has NO relevant data in the docs, return an empty array — never hallucinate.`
        },
        {
          role: "user",
          content: `Documentation:
          ${combinedDocs}
          
          Your mission is to transform these specs into a complete, production-ready technical blueprint.
          An AI coding agent will use EVERY field you return to write real code — be exhaustive and precise.

          ### 1. Core Extraction (Existing Categories)
          - **Provenance**: For EVERY item, provide which file it came from and a context snippet.
          - **Entities**: Data models with typed properties and relationships.
          - **State Definitions**: All application state (global, component, server).
          - **User Flows**: Sequential interactions with triggers, steps, error paths.
          - **Micro-Details**: Animations, UI states, validation rules, a11y, feedback patterns.
          - **UI Modules**: Full component hierarchies with attributes.
          - **Constraints**: All performance, security, and design requirements.

          ### 2. Contradiction & Duplicate Detection
          - **Contradictions**: Access conflicts, type mismatches, permission conflicts, logic conflicts.
          - **Duplicates**: Elements defined multiple times across files.
          - For each, provide all conflicting points with provenance.

          ### 3. Gap Analysis & Readiness Score
          - Identify ALL missing pieces: error boundaries, loading states, rate limiting, CORS, etc.
          - Propose concrete solutions for each gap.
          - Calculate readinessScore (0-100) based on completeness and quality.

          ### 4. NEW: API Contract Layer (Phase 1)
          Extract ALL HTTP API endpoints mentioned in the docs:
          - HTTP method (GET/POST/PUT/PATCH/DELETE)
          - Full path with path parameters (e.g. /api/users/:id)
          - Complete request body schema (field names, types)
          - All query parameters with types and required flags
          - All response codes with their data shapes
          - Authentication requirement (none/bearer/session/api-key)
          - Middleware chain (validation, rate limiting, auth guards)
          If specific endpoints aren't documented, INFER them from the entities and flows.

          ### 5. NEW: Database Schema (Phase 1)
          For each entity, generate a full SQL-ready table definition:
          - All columns with precise SQL types (uuid, varchar(255), int, boolean, timestamp, jsonb, text)
          - Primary key designation
          - NOT NULL / nullable flags
          - UNIQUE constraints
          - DEFAULT values
          - Foreign key relationships with ON DELETE strategies
          - Recommended indexes (for frequently queried/joined columns)

          ### 6. NEW: Auth Architecture (Phase 1)
          Extract a complete auth specification:
          - Auth mechanism type (JWT/session/OAuth/magic-link/API-key)
          - All user roles with their specific permissions
          - Which routes/features are protected and by which role
          - Token expiry if mentioned
          - Refresh token strategy
          If auth is mentioned but strategy is vague, default to JWT with short-lived tokens.

          ### 7. NEW: Route Definitions (Phase 1)
          List all frontend pages/routes:
          - URL path (e.g. /dashboard, /users/:id)
          - Component/page name that renders it
          - Layout wrapper if applicable
          - Auth requirement (public/required/optional)
          - Data fetching strategy (CSR/SSR/SSG/ISR) if determinable
          - SEO metadata (title, description)

          ### 8. NEW: Environment Variables (Phase 2)
          List ALL environment variables that will be needed:
          - Variable name in SCREAMING_SNAKE_CASE
          - Type (string/number/boolean/url)
          - Whether it's required or optional
          - Whether it's server-only or client-exposed (NEXT_PUBLIC_ prefix, VITE_ prefix, etc.)
          - Default value if applicable
          - Clear description of what it controls
          Infer from API endpoints (base URLs, timeouts), auth (secrets, expiry), DB (connection strings), etc.

          ### 9. NEW: Error Handling Map (Phase 2)
          For each significant user flow and API endpoint, define the error handling:
          - Where the error occurs (component name or service name)
          - What operation triggers it
          - Error type (NetworkError, ValidationError, AuthError, NotFoundError, RateLimitError, etc.)
          - Exact user-facing message to display
          - Recovery action (retry/redirect/show-modal/show-toast/silent/fallback-ui)
          - Whether this error should be logged to a monitoring service

          Return ONLY valid JSON matching this EXACT schema:
          {
            "entities": [{"name": "string", "properties": [{"name": "string", "type": "string", "description": "string"}], "relationships": ["string"], "provenance": {"file": "string", "context": "string"}}],
            "stateDefinitions": [{"name": "string", "scope": "global|component|server", "description": "string", "provenance": {"file": "string", "context": "string"}}],
            "uiModules": [{"name": "string", "purpose": "string", "components": [{"name": "string", "children": [], "attributes": [{"name": "string", "value": "string"}], "provenance": {"file": "string", "context": "string"}}], "provenance": {"file": "string", "context": "string"}}],
            "flows": [{"name": "string", "trigger": "string", "steps": [{"action": "string", "expectedResult": "string", "stateTransition": "string"}], "errorPaths": [{"condition": "string", "recovery": "string"}], "outcome": "string", "provenance": {"file": "string", "context": "string"}}],
            "microDetails": [{"category": "ui|logic|validation|animation|accessibility", "description": "string", "impact": "string", "tags": ["string"], "provenance": {"file": "string", "context": "string"}}],
            "systemRules": ["string"],
            "dependencies": ["string"],
            "constraints": [{"description": "string", "scope": "performance|security|design|accessibility|usability|technical|other", "impact": "string", "impactedElements": ["string"]}],
            "gaps": [{"id": "string", "category": "frontend|backend|database|devops|security|accessibility", "description": "string", "proposedSolution": "string", "impact": "high|medium|low", "provenance": {"file": "string", "context": "string"}}],
            "contradictions": [{"id": "string", "description": "string", "conflictingPoints": [{"text": "string", "provenance": {"file": "string", "context": "string"}}], "resolutionSuggestion": "string", "severity": "high|medium|low"}],
            "duplicates": [{"id": "string", "elementName": "string", "elementType": "entity|flow|component|rule", "occurrences": [{"file": "string", "context": "string"}], "impact": "low|medium", "suggestion": "string"}],
            "suggestions": [{"id": "string", "type": "best-practice|optimization|feature", "description": "string", "reasoning": "string"}],
            "readinessScore": 0,
            "apiEndpoints": [{
              "method": "GET|POST|PUT|PATCH|DELETE",
              "path": "string",
              "description": "string",
              "auth": "none|bearer|session|api-key",
              "requestBody": {"schema": "string", "contentType": "application/json"},
              "queryParams": [{"name": "string", "type": "string", "required": true, "description": "string"}],
              "pathParams": [{"name": "string", "type": "string"}],
              "responses": [{"status": 200, "description": "string", "schema": "string"}],
              "middleware": ["string"],
              "provenance": {"file": "string", "context": "string"}
            }],
            "databaseSchema": [{
              "name": "string",
              "columns": [{"name": "string", "type": "string", "nullable": false, "unique": false, "default": "string", "primaryKey": false}],
              "primaryKey": "string",
              "foreignKeys": [{"column": "string", "references": "string", "onDelete": "CASCADE|SET NULL|RESTRICT|NO ACTION"}],
              "indexes": [{"columns": ["string"], "unique": false, "type": "btree|hash|gin|gist"}],
              "provenance": {"file": "string", "context": "string"}
            }],
            "authStrategy": {
              "type": "JWT|session|OAuth|magic-link|API-key|none",
              "roles": [{"name": "string", "permissions": ["string"]}],
              "protectedRoutes": [{"path": "string", "requiredRole": "string"}],
              "tokenExpiry": "string",
              "refreshStrategy": "silent|explicit|none",
              "provenance": {"file": "string", "context": "string"}
            },
            "routes": [{
              "path": "string",
              "component": "string",
              "layout": "string",
              "auth": "required|optional|public",
              "dataFetching": "SSR|SSG|CSR|ISR",
              "metadata": {"title": "string", "description": "string"},
              "provenance": {"file": "string", "context": "string"}
            }],
            "envVars": [{
              "name": "string",
              "type": "string|number|boolean|url",
              "required": true,
              "serverOnly": true,
              "default": "string",
              "description": "string",
              "provenance": {"file": "string", "context": "string"}
            }],
            "errorHandlingMap": [{
              "location": "string",
              "context": "string",
              "errorType": "string",
              "userMessage": "string",
              "recovery": "retry|redirect|show-modal|show-toast|silent|fallback-ui",
              "shouldLog": true,
              "provenance": {"file": "string", "context": "string"}
            }]
          }`
        }
      ]
    });

    const model: SystemModel = safeParseJSON<SystemModel>(getContent(response), {} as SystemModel);
    model.smartSuggestions = evaluateRules(model);
    return model;
  } catch (err: any) {
    console.error("[analyzeDocumentation] AI call failed:", err);
    throw new Error(`Analysis failed: ${err?.message ?? "Unknown error. Check your API key and Base URL."}`);
  }
};

// ─── quickAnalyze ─────────────────────────────────────────────────────────────
export const quickAnalyze = async (docs: { name: string; content: string }[], config: ProviderConfig): Promise<SystemModel> => {
  const combinedDocs = docs.map(d => `File: ${d.name}\n\n${d.content}`).join("\n\n---\n\n");
  const ai = getClient(config);

  try {
    const response = await ai.chat.completions.create({
      model: config.modelName,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: `Quickly analyze the following documentation and extract a high-level system model.
          
          Documentation:
          ${combinedDocs}
          
          Return the result in JSON format matching this schema:
          {
            "entities": [{"name": "string", "properties": [{"name": "string", "type": "string", "description": "string"}], "relationships": ["string"], "provenance": {"file": "string", "context": "string"}}],
            "stateDefinitions": [{"name": "string", "scope": "global|component|server", "description": "string", "provenance": {"file": "string", "context": "string"}}],
            "uiModules": [{"name": "string", "purpose": "string", "components": [{"name": "string", "children": ["recursive UIComponent"], "attributes": [{"name": "string", "value": "string"}], "provenance": {"file": "string", "context": "string"}}], "provenance": {"file": "string", "context": "string"}}],
            "flows": [{
              "name": "string", 
              "trigger": "string", 
              "steps": [{"action": "string", "expectedResult": "string", "stateTransition": "string"}],
              "errorPaths": [{"condition": "string", "recovery": "string"}],
              "outcome": "string",
              "provenance": {"file": "string", "context": "string"}
            }],
            "microDetails": [{"category": "ui|logic|validation|animation|accessibility", "description": "string", "impact": "string", "tags": ["string"], "provenance": {"file": "string", "context": "string"}}],
            "systemRules": ["string"],
            "dependencies": ["string"],
            "constraints": [{"description": "string", "scope": "performance|security|design|accessibility|usability|technical|other", "impact": "string", "impactedElements": ["string"]}],
            "gaps": [],
            "contradictions": [],
            "duplicates": [],
            "suggestions": [],
            "readinessScore": 50
          }`
        }
      ]
    });

    const model: SystemModel = safeParseJSON<SystemModel>(getContent(response), {} as SystemModel);
    model.smartSuggestions = evaluateRules(model);
    return model;
  } catch (err: any) {
    console.error("[quickAnalyze] AI call failed:", err);
    throw new Error(`Quick scan failed: ${err?.message ?? "Unknown error. Check your API key and Base URL."}`);
  }
};

// ─── analyzeRejection ─────────────────────────────────────────────────────────
export const analyzeRejection = async (suggestion: SmartSuggestion, rationale: string, config: ProviderConfig): Promise<string> => {
  const ai = getClient(config);

  try {
    const response = await ai.chat.completions.create({
      model: config.modelName,
      messages: [
        {
          role: "user",
          content: `A user rejected a smart suggestion from our rule engine.
          
          Suggestion: ${suggestion.description}
          Action: ${suggestion.action}
          Rationale for Suggestion: ${suggestion.rationale}
          
          User's Reason for Rejection: ${rationale}
          
          Analyze this rejection and explain why the rule might be misfiring or how it should be adjusted. 
          Provide a concise architectural insight.`
        }
      ]
    });

    return getContent(response) || "No insights available.";
  } catch (err: any) {
    console.error("[analyzeRejection] AI call failed:", err);
    return "Could not analyze rejection at this time.";
  }
};

// ─── decomposeTasks ───────────────────────────────────────────────────────────
export const decomposeTasks = async (model: SystemModel, config: ProviderConfig): Promise<BuildTask[]> => {
  const ai = getClient(config);

  try {
    const response = await ai.chat.completions.create({
      model: config.modelName,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an expert technical project manager and architect who writes highly detailed instructions for AI coding agents."
        },
        {
          role: "user",
          content: `Based on this highly detailed system model, create a hyper-granular, phased build plan.
          Each task must be an atomic, incremental step. 
          
          Task ID Generation:
          - Generate unique and descriptive IDs for each task based on its phase and title (e.g., "PHASE_TITLE_SLUG").
          
          Prompt Formatting:
          - Use consistent Markdown formatting for clarity.
          - Use headings for different sections (e.g., '## Component Structure', '## State Management', '## Event Handling', '## Error Handling & Feedback', '## Micro-interactions', '## Logic & Flows').
          - Use bullet points for lists.

          The 'prompt' field for each task MUST be extremely detailed. For each task, you MUST include:
          1. ## Component Structure: Define the hierarchy of components, props, and their roles.
          2. ## State Management: Specify which state variables are needed, their initial values, and how they are updated. Include state updates for each micro-detail (e.g., "set isLoading to true while fetching"). Provide pseudocode for complex state transitions.
          3. ## Event Handling: Detail the specific events (onClick, onChange, etc.) and the logic they trigger.
          4. ## Error Handling & Feedback: Describe how errors are caught, specific user-facing error messages to display, and recovery strategies.
          5. ## Micro-interactions: Reference specific micro-details from the model (animations, transitions, subtle UI cues like focus states or placeholders).
          6. ## Logic & Flows: Reference specific steps and state transitions from the User Flows in the model.

          Dependency Inference:
          - Analyze the relationships between entities, UI modules, and flows.
          - Identify implicit dependencies where one task's output is clearly an input for another.
          - If a UI module depends on an entity, the task creating that entity must be a dependency.
          - Reflect these in the 'dependencies' array using the descriptive IDs generated.

          System Model:
          ${JSON.stringify(model, null, 2)}
          
          ### IMPORTANT: Smart Suggestions, Contradictions & Duplicates
          The model may contain 'smartSuggestions', 'contradictions', and 'duplicates'. 
          1. **Smart Suggestions**: Pay special attention to those with status 'accepted'.
          2. **Contradictions**: Ensure the build plan resolves all identified contradictions.
          3. **Duplicates**: Ensure the build plan consolidates duplicates into single implementations.
          
          Return a JSON object with a "tasks" array matching this schema:
          {"tasks": [{
            "id": "string",
            "phase": "string",
            "title": "string",
            "description": "string",
            "dependencies": ["string"],
            "prompt": "The hyper-detailed prompt for the AI builder."
          }]}`
        }
      ]
    });

    const parsed = safeParseJSON<{ tasks?: any[] } | any[]>(getContent(response), { tasks: [] });
    const taskArray = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
    return taskArray.map((t: any) => ({ ...t, status: 'pending' }));
  } catch (err: any) {
    console.error("[decomposeTasks] AI call failed:", err);
    throw new Error(`Task decomposition failed: ${err?.message ?? "Unknown error."}`);
  }
};

// ─── chatWithAI ───────────────────────────────────────────────────────────────
// Renamed from chatWithGemini since this now uses the OpenAI-compatible SDK
// and works with any provider (OpenRouter, Ollama, LM Studio, etc.)
export const chatWithAI = async (message: string, history: any[], context?: any, config?: ProviderConfig): Promise<string> => {
  if (!config || !config.apiKey) return "Please configure AI settings first by clicking the ✨ AI button.";

  const ai = getClient(config);
  const contextString = context ? `\n\nCURRENT PROJECT CONTEXT:\n${JSON.stringify(context, null, 2)}` : "";

  // Fix: cast history role to strict OpenAI type
  const formattedHistory: { role: 'user' | 'assistant'; content: string }[] = history.map(h => ({
    role: (h.role === "model" ? "assistant" : "user") as 'user' | 'assistant',
    content: h.parts.map((p: any) => p.text).join(" ")
  }));

  try {
    const response = await ai.chat.completions.create({
      model: config.modelName,
      messages: [
        {
          role: "system",
          content: "You are an expert AI Assistant and co-architect for the Guide Engine. You help users understand their documentation, architecture, and build plans. Be precise, professional, and proactive."
        },
        ...formattedHistory,
        { role: "user", content: message + contextString }
      ]
    });

    return getContent(response) || "I'm sorry, I couldn't generate a response.";
  } catch (err: any) {
    console.error("[chatWithAI] AI call failed:", err);
    return `Error: ${err?.message ?? "Could not connect to AI. Check your API key and Base URL."}`;
  }
};
