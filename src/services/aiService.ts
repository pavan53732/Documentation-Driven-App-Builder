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
          content: `You are a World-Class Full-Stack Architect and Lead Product Designer. 
          Analyze the following system documentation with extreme precision and act as a proactive co-architect.`
        },
        {
          role: "user",
          content: `Documentation:
          ${combinedDocs}
          
          Your mission is to transform these specs into a production-ready blueprint. Do not just extract; validate, question, and complete.

          ### 1. Extraction & Analysis Guidance:
          - **Provenance**: For EVERY entity, flow, UI module, component, state definition, and micro-detail, you MUST provide the 'provenance' field indicating which file it came from and a short context snippet.
          - **User Flows**: Identify sequential interactions. Capture Trigger, Steps (Action, Result, State Transition), and Error Paths.
          - **Micro-Details**: Capture Animations, UI States, Validation Rules, Immediate Feedback, and Accessibility.
          - **UI Modules**: Extract component hierarchies and technical attributes.
          - **Constraints**: Infer scope and direct impact.

          ### 2. Deep Contradiction & Duplicate Detection:
          - You MUST perform a rigorous cross-file consistency and redundancy check.
          - **Contradictions**: Look for:
            * Access conflicts (e.g., "Public" vs "Requires Login").
            * Type mismatches (e.g., "ID is string" vs "ID is integer").
            * Logic conflicts (e.g., "Instant update" vs "Nightly batch").
            * Permission conflicts (e.g., "Admin only" vs "Any user").
            * Flow conflicts (e.g., same trigger leads to different outcomes).
          - **Duplicate Content**: Identify elements (Entities, Flows, Components) that are defined multiple times across different files with identical or highly overlapping content.
          - For each contradiction or duplicate, provide the conflicting/overlapping points with their respective provenance (file and context).

          ### 3. Proactive "Co-Architect" Tasks:
          - **Deep Gap Analysis**: Identify missing pieces (Loading states, error boundaries, edge cases, data validation, rate limiting, security headers, etc.).
          - **Architectural Suggestions**: Propose industry-standard solutions.
          - **Readiness Score**: Calculate a score (0-100).

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
            "gaps": [{"id": "string", "category": "frontend|backend|database|devops|security|accessibility", "description": "string", "proposedSolution": "string", "impact": "high|medium|low", "provenance": {"file": "string", "context": "string"}}],
            "contradictions": [{
              "id": "string", 
              "description": "string", 
              "conflictingPoints": [{"text": "string", "provenance": {"file": "string", "context": "string"}}], 
              "resolutionSuggestion": "string",
              "severity": "high|medium|low"
            }],
            "duplicates": [{
              "id": "string",
              "elementName": "string",
              "elementType": "entity|flow|component|rule",
              "occurrences": [{"file": "string", "context": "string"}],
              "impact": "low|medium",
              "suggestion": "string"
            }],
            "suggestions": [{"id": "string", "type": "best-practice|optimization|feature", "description": "string", "reasoning": "string"}],
            "readinessScore": 0
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
