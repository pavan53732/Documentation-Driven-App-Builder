import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { SystemModel, BuildTask, SmartSuggestion, AuditReport } from "../types";
import { SystemModelSchema, AuditReportSchema } from "../schema";
import { evaluateRules } from "./ruleEngine";
import { detectFrameworks, validateCompatibility } from "./frameworkDetection";
import { KNOWLEDGE_BASE } from "../constants/knowledgeBase";

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
  // If there are multiple large files, we can process them in parallel to speed up extraction
  // However, for synthesis, we still need a final pass.
  // For now, we'll implement a parallel extraction if docs > 3
  
  if (docs.length > 3) {
    console.log(`[GeminiService] Parallel analysis triggered for ${docs.length} documents`);
    const chunks = [];
    for (let i = 0; i < docs.length; i += 3) {
      chunks.push(docs.slice(i, i + 3));
    }

    const partialModels = await Promise.all(chunks.map(chunk => analyzeDocumentation(chunk, undefined, customRules)));
    
    // Synthesize partial models
    const synthesisResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `Synthesize these partial system models into one cohesive, production-ready blueprint. 
          Resolve any overlaps and ensure consistent relationships.
          
          Partial Models:
          ${partialModels.map(m => JSON.stringify(m, null, 2)).join("\n\n---\n\n")}
          
          Return the final synthesized model in the same JSON format.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    const finalModel = SystemModelSchema.parse(JSON.parse(synthesisResponse.text || "{}"));
    finalModel.files = docs;
    return finalModel;
  }

  const combinedDocs = docs.map(d => `File: ${d.name}\n\n${d.content}`).join("\n\n---\n\n");
  // ... existing implementation for single pass ...

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        role: "user",
        parts: [{
          text: `You are a World-Class Full-Stack Architect, Security Auditor, and Lead Product Designer. 
          Analyze the following system documentation with extreme precision and act as a proactive co-architect.
          
          ### YOUR CORE INTELLIGENCE (The 6 Lenses):
          1. **The Hacker Lens (Security & Trust)**: Audit for OWASP Top 10, Zero Trust, Data Encryption (AES-256), and Identity Management (OAuth2/OIDC). Flag missing security headers, insecure storage, or weak auth flows.
          2. **The SRE Lens (Operational Excellence)**: Audit for Scalability (Horizontal/Vertical), Observability (Logging, Metrics, Tracing), and Disaster Recovery (RTO/RPO). Audit for Microservices orchestration (K8s), Service Mesh (Istio), Serverless (FaaS) cold starts, and Infrastructure as Code (Terraform) drift. Flag missing load balancing, rate limiting, health checks, or poor observability.
          3. **The Senior Architect Lens (Design Patterns)**: Enforce Clean Architecture, SOLID, Microservices vs. Monolith trade-offs, and CAP Theorem. Detect architectural contradictions and anti-patterns.
          4. **The DBA Lens (Data Integrity)**: Enforce ACID vs. BASE, Relational (SQL) vs. Non-Relational (NoSQL) use cases, and Migration strategies. Audit for Distributed Transactions (Saga pattern), Query performance (Indexing/Sharding), Data Engineering (ETL) lineage, and Medallion architecture. Catch missing relationships, normalization issues, or data type mismatches.
          5. **The Frontend Lead Lens (UX & Performance)**: Enforce Core Web Vitals, Accessibility (WCAG 2.1), State Management (Zustand/Redux), and Atomic Design. Flag complex flows, missing feedback loops, or poor a11y.
          6. **The Windows Native Lens (Platform Specifics)**: Audit for Win32 APIs, WPF/WinUI paradigms, Registry interactions, and UAC levels. Audit for Shell integration (JumpLists, Context Menus), DirectX/Media Foundation performance, Driver/Kernel interop, and Enterprise Policy (GPO/MDM) compliance. Flag missing manifests, blocking UI threads, incorrect interop, or poor platform integration.

          ### SYSTEM KNOWLEDGE BASE:
          ${KNOWLEDGE_BASE.map(k => `- ${k.title}: ${k.description}`).join('\n')}
          
          Documentation:
          ${combinedDocs}
          
          Your mission is to transform these specs into a production-ready blueprint. Do not just extract; validate, question, and complete.

          ### 1. Extraction & Analysis Guidance:
          - **Provenance**: For EVERY entity, flow, UI module, component, state definition, and micro-detail, you MUST provide the 'provenance' field indicating which file it came from and a short context snippet.
          - **Framework-Specific Paradigms**: Pay special attention to Windows Native (WinUI 3, WPF), Modern Web (Next.js, Astro, SvelteKit), and High-Performance Backends (Rust, FastAPI).
            * **XAML Bindings**: Extract specifics like XAML bindings ({Binding ...} or {x:Bind ...}). Check for validation attributes like ValidatesOnDataErrors or ValidatesOnExceptions.
            * **MVVM**: Identify ViewModels and their links to Views (DataContext, d:DataContext). Note if they inherit from ObservableObject or implement INotifyPropertyChanged/IDataErrorInfo.
            * **UI Thread Safety**: Identify long-running operations in flows (API calls, heavy processing) and check if they are offloaded (Task.Run) and if UI updates are dispatched (Dispatcher/DispatcherQueue).
            * **Modern Web**: Extract Server Components (RSC), Server Actions, Streaming patterns, and Islands architecture (Astro). Identify state management (Zustand/Redux) and data fetching (TanStack Query).
            * **Backend & Systems**: Identify async/await concurrency (FastAPI/Rust), memory safety patterns (Rust), and type-safe database access (Prisma/Drizzle).
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

          ### 4. ANTI-HALLUCINATION PROTOCOL (CRITICAL):
          - **Strict Grounding**: You are strictly forbidden from inventing information. Every entity, flow, component, and detail MUST be grounded in the provided documentation.
          - **Explicit Gaps**: If a required technical detail (e.g., a specific data type, a precise API endpoint, or a UI layout) is missing from the documentation, do NOT guess. Instead, list it as a "Gap" in the Gap Analysis section.
          - **Provenance Enforcement**: For every extracted item, you MUST provide a 'provenance' field. If you cannot find a clear source for an item, do not include it.
          - **No "Ghost" Logic**: Do not assume complex business logic or state transitions that are not explicitly described.
          - **Contradiction Reporting**: If you find conflicting information across different files, do not attempt to resolve it yourself. Report it as a "Contradiction" with the exact conflicting snippets and their sources.

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
  
  // Perform Auditor Pass (Self-Correction Loop)
  console.log(`[GeminiService] Auditor Pass Triggered`);
  const auditReport = await auditModel(model, docs);
  model.auditReport = auditReport;
  
  return model;
};

export const auditModel = async (model: SystemModel, docs: { name: string; content: string }[]): Promise<AuditReport> => {
  const combinedDocs = docs.map(d => `File: ${d.name}\n\n${d.content}`).join("\n\n---\n\n");
  // Remove files from model for audit to reduce token count
  const { files, ...modelWithoutFiles } = model;
  const modelJson = JSON.stringify(modelWithoutFiles, null, 2);

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{
      role: "user",
      parts: [{
        text: `You are a Senior Architectural Auditor. Your task is to perform a "Self-Correction" pass on a generated System Model.
        
        Compare the generated System Model against the original documentation. 
        Identify:
        1. **Hallucinations**: Elements in the model that are NOT in the documentation.
        2. **Omissions**: Critical elements in the documentation that are MISSING from the model.
        3. **Inconsistencies**: Elements that are present but have incorrect attributes or relationships.

        ### ORIGINAL DOCUMENTATION:
        ${combinedDocs}

        ### GENERATED SYSTEM MODEL:
        ${modelJson}

        ### AUDIT GUIDELINES:
        - Be extremely critical. 
        - If a field is "inferred" but not explicitly stated, mark it as a potential hallucination if it's too specific.
        - Calculate an overall confidence score (0-100).
        
        Return the audit report in JSON format matching this schema:
        {
          "overallConfidence": number,
          "issues": [{
            "type": "hallucination|omission|inconsistency",
            "element": "string (name of the entity/flow/component)",
            "description": "string",
            "severity": "high|medium|low",
            "suggestedFix": "string"
          }],
          "summary": "string"
        }`
      }]
    }],
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  try {
    const auditReport = JSON.parse(response.text || "{}");
    return AuditReportSchema.parse(auditReport);
  } catch (e) {
    console.error("Failed to parse Audit Report:", e);
    return { overallConfidence: 0, issues: [], summary: "Audit failed to generate." };
  }
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
  // Parallelize task generation by splitting the model into logical chunks
  // 1. Entities & Data Layer
  // 2. UI Modules & Components
  // 3. User Flows & Logic
  
  console.log(`[GeminiService] Parallel task generation triggered`);
  
  const chunks = [
    { name: "Data Layer", data: { entities: model.entities, stateDefinitions: model.stateDefinitions, dependencies: model.dependencies } },
    { name: "UI Layer", data: { uiModules: model.uiModules, microDetails: model.microDetails, constraints: model.constraints } },
    { name: "Logic Layer", data: { flows: model.flows, systemRules: model.systemRules, gaps: model.gaps } }
  ];

  const taskPromises = chunks.map(chunk => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{
      role: "user",
      parts: [{
        text: `Generate a phased build plan for the ${chunk.name} of this system.
        
        ### YOUR CORE INTELLIGENCE (The 6 Lenses):
        1. **The Hacker Lens (Security & Trust)**: Audit for OWASP Top 10, Zero Trust, Data Encryption (AES-256), and Identity Management (OAuth2/OIDC). Flag missing security headers, insecure storage, or weak auth flows.
        2. **The SRE Lens (Operational Excellence)**: Audit for Scalability (Horizontal/Vertical), Observability (Logging, Metrics, Tracing), and Disaster Recovery (RTO/RPO). Flag missing load balancing, rate limiting, or health checks.
        3. **The Senior Architect Lens (Design Patterns)**: Enforce Clean Architecture, SOLID, Microservices vs. Monolith trade-offs, and CAP Theorem. Detect architectural contradictions and anti-patterns.
        4. **The DBA Lens (Data Integrity)**: Enforce ACID vs. BASE, Relational (SQL) vs. Non-Relational (NoSQL) use cases, and Migration strategies. Catch missing relationships, normalization issues, or data type mismatches.
        5. **The Frontend Lead Lens (UX & Performance)**: Enforce Core Web Vitals, Accessibility (WCAG 2.1), State Management (Zustand/Redux), and Atomic Design. Flag complex flows, missing feedback loops, or poor a11y.
        6. **The Windows Native Lens (Platform Specifics)**: Audit for Win32 APIs, WPF/WinUI paradigms, Registry interactions, and UAC levels. Audit for Shell integration (JumpLists, Context Menus), DirectX/Media Foundation performance, Driver/Kernel interop, and Enterprise Policy (GPO/MDM) compliance. Flag missing manifests, blocking UI threads, incorrect interop, or poor platform integration.

        ### SYSTEM KNOWLEDGE BASE (Your Core Intelligence):
        ${KNOWLEDGE_BASE.map(k => `- ${k.title}: ${k.description}`).join('\n')}
        
        System Model Fragment:
        ${JSON.stringify(chunk.data, null, 2)}
        
        ### ANTI-HALLUCINATION TASK PROTOCOL (CRITICAL):
        1. **Task Grounding**: Every task generated MUST be directly derived from the extracted system model. Do NOT add features or logic that were not identified during the extraction phase.
        2. **Technical Precision**: Use only the frameworks, libraries, and patterns identified in the model (e.g., if the model says 'Zustand', do not generate tasks for 'Redux').
        3. **Dependency Integrity**: Only link tasks to dependencies that actually exist in the model or are created within this build plan.
        4. **No "Magic" Solutions**: Do not generate tasks that rely on non-existent APIs or third-party services not mentioned in the documentation.

        ### WINDOWS NATIVE SPECIFIC GUIDANCE (MANDATORY):
        If the system is identified as a Windows Native application (WinUI 3, WPF, UWP, MAUI):
        1. **MVVM Implementation**: Generate specific tasks for creating ViewModels that inherit from 'ObservableObject' (CommunityToolkit.Mvvm). Ensure commands (RelayCommand) and property notifications ([ObservableProperty]) are used.
        2. **Accessibility (a11y)**: Generate tasks to add 'AutomationProperties.Name' and 'AutomationProperties.HelpText' to all interactive UI components.
        3. **UI Thread Safety**: For any data-fetching or heavy processing tasks, explicitly include instructions to use 'Task.Run()' for offloading and 'DispatcherQueue.TryEnqueue()' or 'Dispatcher.Invoke()' for UI updates.
        4. **Fluent Design**: Generate tasks to apply 'Mica' or 'Acrylic' backdrop materials to the main Window and ensure the app follows Windows 11 design language.
        5. **XAML Validation**: Generate tasks to add 'ValidatesOnDataErrors=True' or 'ValidatesOnExceptions=True' to XAML bindings for input validation.

        Return an array of tasks in JSON format matching this schema:
        [{
          "id": "string",
          "phase": "string",
          "title": "string",
          "description": "string",
          "dependencies": ["string"],
          "prompt": "The hyper-detailed prompt for the AI builder. Use Markdown for structure within the string."
        }]`
      }]
    }],
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  }));

  const responses = await Promise.all(taskPromises);
  const allTasks = responses.flatMap(r => JSON.parse(r.text || "[]"));
  
  // Final pass to resolve cross-chunk dependencies and ensure coherence
  const synthesisResponse = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{
      role: "user",
      parts: [{
        text: `Synthesize these tasks into a single, cohesive, phased build plan. 
        Ensure all dependencies are correctly linked between phases.
        
        ### CRITICAL: PRESERVE WINDOWS NATIVE SPECIFICS:
        Do NOT merge or simplify tasks that are specifically for:
        - MVVM (CommunityToolkit.Mvvm)
        - Accessibility (AutomationProperties)
        - UI Thread Safety (Task.Run/DispatcherQueue)
        - Fluent Design (Mica/Acrylic)
        - XAML Data Validation
        
        Raw Tasks:
        ${JSON.stringify(allTasks, null, 2)}
        
        Return the final array of tasks in JSON format.`
      }]
    }],
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  const finalTasks = JSON.parse(synthesisResponse.text || "[]");
  return finalTasks.map((t: any) => ({ ...t, status: 'pending' }));
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
