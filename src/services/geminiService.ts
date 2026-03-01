import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { SystemModel, BuildTask, SmartSuggestion } from "../types";
import { SystemModelSchema } from "../schema";
import { evaluateRules } from "./ruleEngine";
import { detectFrameworks, validateCompatibility } from "./frameworkDetection";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

export const analyzeDocumentation = async (
  docs: { name: string; content: string }[],
  onChunk?: (text: string) => void,
  customRules: any[] = []
): Promise<SystemModel> => {
  const combinedDocs = docs.map(d => `File: ${d.name}\n\n${d.content}`).join("\n\n---\n\n");

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        role: "user",
        parts: [{
          text: `You are a World-Class Full-Stack Architect and Lead Product Designer. 
          Analyze the following system documentation with extreme precision and act as a proactive co-architect.
          
          Documentation:
          ${combinedDocs}
          
          Your mission is to transform these specs into a production-ready blueprint. Do not just extract; validate, question, and complete.

          ### 1. Extraction & Analysis Guidance:
          - **Provenance**: For EVERY entity, flow, UI module, component, state definition, and micro-detail, you MUST provide the 'provenance' field indicating which file it came from and a short context snippet.
          - **Framework-Specific Paradigms**: Pay special attention to Windows Native frameworks (WinUI 3, WPF, .NET MAUI) and Web frameworks (React, Next.js). Extract specifics like XAML bindings, MVVM ViewModels, Dispatcher usage, or React hooks.
          - **User Flows**: Identify sequential interactions. Capture Trigger, Steps (Action, Result, State Transition), and Error Paths.
          - **Micro-Details**: Extract subtle micro-details like accessibility attributes (aria-*, tabIndex, AutomationProperties), keyboard navigation logic, and specific animation types (e.g., 'fade in', 'slide up', 'ConnectedAnimation').
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
          - **Contradiction Specificity**: For each contradiction, provide granular detail including specific code snippets or configuration values that conflict in the 'text' field.
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
            "readinessScore": number
          }`
        }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  let accumulatedText = "";
  for await (const chunk of responseStream) {
    accumulatedText += chunk.text;
    if (onChunk) onChunk(accumulatedText);
  }

  let parsedJson = {};
  try {
    parsedJson = JSON.parse(accumulatedText || "{}");
  } catch (e) {
    console.error("Failed to parse JSON:", e);
  }

  const model: SystemModel = SystemModelSchema.parse(parsedJson);
  model.files = docs;
  
  // Run local framework detection
  const detectedFrameworks = detectFrameworks(combinedDocs);
  model.detectedFrameworks = detectedFrameworks;
  model.compatibilityIssues = validateCompatibility(detectedFrameworks);
  
  model.smartSuggestions = evaluateRules(model, customRules);
  return model;
};

export const quickAnalyze = async (
  docs: { name: string; content: string }[],
  onChunk?: (text: string) => void,
  customRules: any[] = []
): Promise<SystemModel> => {
  const combinedDocs = docs.map(d => `File: ${d.name}\n\n${d.content}`).join("\n\n---\n\n");

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash-lite",
    contents: [
      {
        role: "user",
        parts: [{
          text: `Quickly analyze the following documentation and extract a high-level system model.
          
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
        }]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  let accumulatedText = "";
  for await (const chunk of responseStream) {
    accumulatedText += chunk.text;
    if (onChunk) onChunk(accumulatedText);
  }

  let parsedJson = {};
  try {
    parsedJson = JSON.parse(accumulatedText || "{}");
  } catch (e) {
    console.error("Failed to parse JSON:", e);
  }

  const model: SystemModel = SystemModelSchema.parse(parsedJson);
  model.files = docs;
  
  // Run local framework detection
  const detectedFrameworks = detectFrameworks(combinedDocs);
  model.detectedFrameworks = detectedFrameworks;
  model.compatibilityIssues = validateCompatibility(detectedFrameworks);
  
  model.smartSuggestions = evaluateRules(model, customRules);
  return model;
};

export const analyzeRejection = async (suggestion: SmartSuggestion, rationale: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        role: "user",
        parts: [{
          text: `A user rejected a smart suggestion from our rule engine.
          
          Suggestion: ${suggestion.description}
          Action: ${suggestion.action}
          Rationale for Suggestion: ${suggestion.rationale}
          
          User's Reason for Rejection: ${rationale}
          
          Analyze this rejection and explain why the rule might be misfiring or how it should be adjusted. 
          Provide a concise architectural insight.`
        }]
      }
    ],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text || "No insights available.";
};

export const decomposeTasks = async (model: SystemModel): Promise<BuildTask[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        role: "user",
        parts: [{
          text: `Based on this highly detailed system model, create a hyper-granular, phased build plan.
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
          4. ## Error Handling & Feedback: Describe how errors are caught, specific user-facing error messages to display, and recovery strategies. Include code snippets for try/catch blocks and error state updates (e.g., "show a retry button", "revert to previous state").
          5. ## Micro-interactions: Reference specific micro-details from the model (animations, transitions, subtle UI cues like focus states or placeholders). Provide implementation hints or CSS snippets where applicable.
          6. ## Logic & Flows: Reference specific steps and state transitions from the User Flows in the model. Provide pseudocode or code snippets for implementing the core logic of the flow, including API call patterns if relevant.

          Dependency Inference:
          - Analyze the relationships between entities, UI modules, and flows.
          - Identify implicit dependencies where one task's output is clearly an input for another (e.g., a 'create user' task must precede a 'fetch user list' task).
          - If a UI module depends on an entity, the task creating that entity must be a dependency.
          - If a flow spans multiple modules, ensure the tasks for those modules are sequenced correctly.
          - Reflect these in the 'dependencies' array using the descriptive IDs generated.

          System Model:
          ${JSON.stringify(model, null, 2)}
          
          ### IMPORTANT: Smart Suggestions, Contradictions & Duplicates
          The model may contain 'smartSuggestions', 'contradictions', and 'duplicates'. 
          1. **Smart Suggestions**: You MUST pay special attention to those with status 'accepted'. Integrate these into the build plan as specific, actionable tasks or by augmenting existing tasks. Explain how it addresses the rule's rationale.
          2. **Contradictions**: You MUST ensure the build plan resolves any identified contradictions. If a contradiction exists, the first task in the relevant phase should be to resolve it (e.g., "Standardize Access Levels for [Component]").
          3. **Duplicates**: You MUST ensure the build plan addresses duplicate content by consolidating them into a single implementation (e.g., "Create Shared [Entity] Service").
          
          Return an array of tasks in JSON format matching this schema:
          [{
            "id": "string",
            "phase": "string",
            "title": "string",
            "description": "string",
            "dependencies": ["string"],
            "prompt": "The hyper-detailed prompt for the AI builder. Use Markdown for structure within the string. Be explicit about code patterns and architectural constraints."
          }]`
        }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  const tasks = JSON.parse(response.text || "[]");
  return tasks.map((t: any) => ({ ...t, status: 'pending' }));
};

export const chatWithGemini = async (message: string, history: { role: "user" | "model"; parts: { text: string }[] }[], context?: any): Promise<string> => {
  const contextString = context ? `\n\nCURRENT PROJECT CONTEXT:\n${JSON.stringify(context, null, 2)}` : "";
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [...history, { role: "user", parts: [{ text: message + contextString }] }],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are an expert AI Assistant and co-architect for the Guide Engine. You help users understand their documentation, architecture, and build plans. Be precise, professional, and proactive. Use the provided context to answer specific questions about the project. You have access to Google Search to provide up-to-date information if needed."
    }
  });
  return response.text || "I'm sorry, I couldn't generate a response.";
};
