import { SystemModel, UIModule, UIComponent, UserFlow, SmartSuggestion, Contradiction, Provenance, DuplicateContent, Entity, StateDefinition } from "../types";

export interface Rule {
  id: string;
  category: string;
  description: string;
  trigger: {
    type: "component" | "flow" | "entity" | "global";
    selector?: string; // Regex or exact match for component name, flow name, etc.
  };
  condition: (model: SystemModel, target?: any) => boolean;
  suggestion: {
    action: string;
    description: string;
    impact: "high" | "medium" | "low";
    rationale: string;
  };
  fix?: (model: SystemModel, target?: any) => void;
}

const ICON_MAP: Record<string, string> = {
  save: "Save",
  delete: "Trash2",
  remove: "Trash2",
  edit: "Pencil",
  add: "Plus",
  search: "Search",
  filter: "Filter",
  refresh: "Refresh",
  home: "Home",
  profile: "User",
  settings: "Settings",
  close: "X",
  cancel: "X",
  plus: "Plus",
  minus: "Minus",
  check: "Check",
  info: "Info",
  help: "HelpCircle",
  alert: "AlertTriangle",
  error: "AlertCircle",
  success: "CheckCircle2",
  mail: "Mail",
  send: "Send",
  download: "Download",
  upload: "Upload",
  login: "LogIn",
  logout: "LogOut",
  user: "User",
  users: "Users",
  dashboard: "LayoutDashboard",
  list: "List",
  table: "Table",
  calendar: "Calendar",
  clock: "Clock",
  bell: "Bell",
  star: "Star",
  heart: "Heart",
  share: "Share2",
  copy: "Copy",
  external: "ExternalLink",
  link: "Link",
  eye: "Eye",
  eyeoff: "EyeOff",
  lock: "Lock",
  unlock: "Unlock",
  trash: "Trash2",
  trash2: "Trash2",
  pencil: "Pencil",
  pluscircle: "PlusCircle",
  minuscircle: "MinusCircle",
  checkcircle: "CheckCircle2",
  xcircle: "XCircle",
  arrowright: "ArrowRight",
  arrowleft: "ArrowLeft",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  chevronright: "ChevronRight",
  chevronleft: "ChevronLeft",
  chevrondown: "ChevronDown",
  chevronup: "ChevronUp",
};

const getSuggestedIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lowerName.includes(key)) return icon;
  }
  return "HelpCircle";
};

export const RULES: Rule[] = [
  // --- UI COMPONENTS & VISUALS ---
  {
    id: "rule-icon-nav-item",
    category: "ui/icons",
    description: "Every navigation item should have an associated icon.",
    trigger: { type: "component", selector: ".*(Nav|Menu|Sidebar).*" },
    condition: (model, component: UIComponent) => {
      const hasIcon = component.attributes?.some(attr =>
        attr.name.toLowerCase().includes("icon") ||
        attr.value.toLowerCase().includes("icon")
      );
      return !hasIcon;
    },
    suggestion: {
      action: "Add Lucide icon",
      description: "Assign a relevant icon from Lucide library to this navigation element.",
      impact: "medium",
      rationale: "Icons improve scannability and user experience in navigation menus."
    },
    fix: (model, component: UIComponent) => {
      if (!component.attributes) component.attributes = [];
      const icon = getSuggestedIcon(component.name);
      component.attributes.push({ name: "icon", value: icon });
    }
  },
  {
    id: "rule-icon-standard-actions",
    category: "ui/icons",
    description: "Buttons with common actions (save, delete, edit) should use standard icons.",
    trigger: { type: "component", selector: ".*(Save|Delete|Remove|Edit|Pencil|Trash|Plus|Add|Cancel|Close|Search|Filter|Refresh).*" },
    condition: (model, component: UIComponent) => {
      const hasIcon = component.attributes?.some(attr =>
        attr.name.toLowerCase().includes("icon") ||
        attr.value.toLowerCase().includes("icon")
      );
      return !hasIcon;
    },
    suggestion: {
      action: "Add Standard Icon",
      description: "Use a standard Lucide icon matching the action verb.",
      impact: "medium",
      rationale: "Users expect consistent iconography for common actions, reducing cognitive load."
    },
    fix: (model, component: UIComponent) => {
      if (!component.attributes) component.attributes = [];
      const icon = getSuggestedIcon(component.name);
      component.attributes.push({ name: "icon", value: icon });
    }
  },
  {
    id: "rule-tooltip-icon-only",
    category: "ui/ux",
    description: "Icon-only buttons must have a tooltip explaining the action.",
    trigger: { type: "component", selector: ".*(Button|Btn).*" },
    condition: (model, component: UIComponent) => {
      const hasIcon = component.attributes?.some(attr => attr.name.toLowerCase().includes("icon"));
      const hasText = component.attributes?.some(attr => attr.name.toLowerCase() === "text" || attr.name.toLowerCase() === "label");
      const hasTooltip = component.attributes?.some(attr => attr.name.toLowerCase().includes("tooltip") || attr.name.toLowerCase().includes("title"));
      return !!hasIcon && !hasText && !hasTooltip;
    },
    suggestion: {
      action: "Add Tooltip",
      description: "Add a tooltip or 'title' attribute to this icon-only button.",
      impact: "medium",
      rationale: "Icon-only buttons can be ambiguous; tooltips provide necessary context for users."
    },
    fix: (model, component: UIComponent) => {
      if (!component.attributes) component.attributes = [];
      component.attributes.push({ name: "tooltip", value: component.name });
    }
  },
  {
    id: "rule-favicon-check",
    category: "ui/global",
    description: "Every web app must have a favicon.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasFavicon = model.microDetails?.some(d => d.description.toLowerCase().includes("favicon"));
      return !hasFavicon;
    },
    suggestion: {
      action: "Add Favicon",
      description: "Ensure the project includes a favicon.ico or png in the public directory.",
      impact: "low",
      rationale: "Favicons are essential for brand identity and browser tab recognition."
    }
  },

  // --- INTERACTION & FEEDBACK ---
  {
    id: "rule-confirm-destructive",
    category: "ui/feedback",
    description: "Destructive actions must trigger a confirmation dialog.",
    trigger: { type: "flow", selector: ".*(Delete|Remove|Destroy|Reset|Clear|Irreversible).*" },
    condition: (model, flow: UserFlow) => {
      const hasConfirmation = flow.steps.some(step =>
        step.action.toLowerCase().includes("confirm") ||
        step.expectedResult.toLowerCase().includes("dialog") ||
        step.expectedResult.toLowerCase().includes("modal")
      );
      return !hasConfirmation;
    },
    suggestion: {
      action: "Add Confirmation Dialog",
      description: "Implement a confirmation modal before executing this destructive flow.",
      impact: "high",
      rationale: "Prevent accidental data loss by requiring explicit user confirmation for destructive actions."
    }
  },
  {
    id: "rule-feedback-toasts",
    category: "ui/feedback",
    description: "Form submissions should show success/error feedback.",
    trigger: { type: "flow", selector: ".*(Submit|Save|Create|Update|Post).*" },
    condition: (model, flow: UserFlow) => {
      const hasFeedback = flow.steps.some(step =>
        step.expectedResult.toLowerCase().includes("toast") ||
        step.expectedResult.toLowerCase().includes("notification") ||
        step.expectedResult.toLowerCase().includes("success") ||
        step.expectedResult.toLowerCase().includes("feedback")
      );
      return !hasFeedback;
    },
    suggestion: {
      action: "Add Feedback Toasts",
      description: "Implement success and error toast notifications for this submission flow.",
      impact: "medium",
      rationale: "Immediate feedback confirms to the user that their action was successful or failed."
    }
  },
  {
    id: "rule-loading-button",
    category: "ui/feedback",
    description: "Async buttons should show a loading state and be disabled.",
    trigger: { type: "component", selector: ".*(Button|Btn).*" },
    condition: (model, component: UIComponent) => {
      const isAsync = component.name.toLowerCase().includes("submit") || component.name.toLowerCase().includes("save") || component.name.toLowerCase().includes("delete");
      const hasLoadingAttr = component.attributes?.some(attr => attr.name.toLowerCase().includes("loading"));
      return isAsync && !hasLoadingAttr;
    },
    suggestion: {
      action: "Add Button Loading State",
      description: "Disable the button and show a spinner when an async action is in progress.",
      impact: "medium",
      rationale: "Prevents double-submissions and provides visual feedback during network requests."
    }
  },
  {
    id: "rule-undo-capability",
    category: "ui/ux",
    description: "Data-modifying actions should support undo where feasible.",
    trigger: { type: "flow", selector: ".*(Delete|Remove|Update|Move|Archive).*" },
    condition: (model, flow: UserFlow) => {
      const hasUndo = flow.steps.some(step => step.action.toLowerCase().includes("undo"));
      return !hasUndo;
    },
    suggestion: {
      action: "Add Undo Capability",
      description: "Consider adding an 'Undo' option for this action to allow users to revert mistakes easily.",
      impact: "low",
      rationale: "Providing an undo mechanism is a powerful way to reduce user anxiety and improve UX."
    }
  },

  // --- LOADING STATES ---
  {
    id: "rule-loading-state",
    category: "ui/loading",
    description: "Data-fetching components should have skeleton screens or spinners.",
    trigger: { type: "component", selector: ".*(List|Table|Grid|Feed|Dashboard|Chart).*" },
    condition: (model, component: UIComponent) => {
      const hasLoadingState = component.attributes?.some(attr =>
        attr.name.toLowerCase().includes("loading") ||
        attr.name.toLowerCase().includes("skeleton")
      );
      return !hasLoadingState;
    },
    suggestion: {
      action: "Add Skeleton Loader",
      description: "Implement a skeleton screen to improve perceived performance during data fetching.",
      impact: "medium",
      rationale: "Skeleton screens reduce user frustration by showing that content is being loaded."
    },
    fix: (model, component: UIComponent) => {
      if (!component.attributes) component.attributes = [];
      component.attributes.push({ name: "loading", value: "skeleton" });
    }
  },
  {
    id: "rule-empty-state",
    category: "ui/feedback",
    description: "Lists and grids should have an empty state illustration.",
    trigger: { type: "component", selector: ".*(List|Table|Grid|Feed).*" },
    condition: (model, component: UIComponent) => {
      const hasEmptyState = component.children?.some(child =>
        child.name.toLowerCase().includes("empty") ||
        child.name.toLowerCase().includes("placeholder")
      );
      return !hasEmptyState;
    },
    suggestion: {
      action: "Add Empty State",
      description: "Design an empty state with an illustration and a call-to-action for when no data is present.",
      impact: "low",
      rationale: "A well-designed empty state guides the user on how to get started when a list is empty."
    }
  },

  // --- LOGGING & MONITORING ---
  {
    id: "rule-logging-auth",
    category: "logic/logging",
    description: "User authentication attempts should be logged.",
    trigger: { type: "flow", selector: ".*(Login|Signup|Auth|SignOut|Password).*" },
    condition: (model, flow: UserFlow) => {
      const hasLogging = flow.steps.some(step =>
        step.action.toLowerCase().includes("log") ||
        step.stateTransition?.toLowerCase().includes("audit")
      );
      return !hasLogging;
    },
    suggestion: {
      action: "Add Audit Logging",
      description: "Log the success and failure of this authentication attempt for security auditing.",
      impact: "high",
      rationale: "Logging authentication events is critical for security monitoring and troubleshooting."
    }
  },
  {
    id: "rule-error-reporting",
    category: "logic/monitoring",
    description: "Critical API errors should be reported to a monitoring service.",
    trigger: { type: "flow", selector: ".*(API|Fetch|Submit|Post).*" },
    condition: (model, flow: UserFlow) => {
      const hasErrorReporting = flow.errorPaths?.some(path =>
        path.recovery.toLowerCase().includes("report") ||
        path.recovery.toLowerCase().includes("sentry") ||
        path.recovery.toLowerCase().includes("log")
      );
      return !hasErrorReporting;
    },
    suggestion: {
      action: "Add Error Reporting",
      description: "Integrate a service like Sentry to capture and report errors in this flow.",
      impact: "medium",
      rationale: "Automated error reporting helps identify and fix production issues before users report them."
    }
  },
  {
    id: "rule-performance-metrics",
    category: "logic/monitoring",
    description: "Core Web Vitals should be logged.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasVitals = model.microDetails?.some(d => d.description.toLowerCase().includes("vitals") || d.description.toLowerCase().includes("performance"));
      return !hasVitals;
    },
    suggestion: {
      action: "Add Performance Monitoring",
      description: "Log LCP, FID, and CLS for real user monitoring.",
      impact: "low",
      rationale: "Monitoring performance helps ensure a smooth user experience across different devices."
    }
  },

  // --- ACCESSIBILITY (A11Y) ---
  {
    id: "rule-a11y-labels",
    category: "a11y",
    description: "All form inputs must have associated labels or aria-labels.",
    trigger: { type: "component", selector: ".*(Input|Select|Textarea|Field|Checkbox|Radio).*" },
    condition: (model, component: UIComponent) => {
      const hasLabel = component.attributes?.some(attr =>
        attr.name.toLowerCase() === "label" ||
        attr.name.toLowerCase().includes("aria-label")
      );
      return !hasLabel;
    },
    suggestion: {
      action: "Add ARIA Label",
      description: "Ensure this input has a descriptive label for screen readers.",
      impact: "high",
      rationale: "Proper labeling is essential for users who rely on assistive technologies."
    },
    fix: (model, component: UIComponent) => {
      if (!component.attributes) component.attributes = [];
      component.attributes.push({ name: "aria-label", value: component.name });
    }
  },
  {
    id: "rule-a11y-alt-text",
    category: "a11y",
    description: "All images must have alt text.",
    trigger: { type: "component", selector: ".*(Image|Img|Avatar|Logo|Icon).*" },
    condition: (model, component: UIComponent) => {
      const hasAlt = component.attributes?.some(attr =>
        attr.name.toLowerCase() === "alt" ||
        attr.name.toLowerCase() === "aria-label"
      );
      return !hasAlt;
    },
    suggestion: {
      action: "Add Alt Text",
      description: "Provide a descriptive 'alt' attribute for this image.",
      impact: "high",
      rationale: "Alt text is the primary way screen reader users understand visual content."
    }
  },
  {
    id: "rule-a11y-skip-link",
    category: "a11y",
    description: "There should be a 'Skip to main content' link.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasSkipLink = model.microDetails?.some(d => d.description.toLowerCase().includes("skip to content") || d.description.toLowerCase().includes("skip link"));
      return !hasSkipLink;
    },
    suggestion: {
      action: "Add Skip Link",
      description: "Implement a 'Skip to main content' link for keyboard users.",
      impact: "medium",
      rationale: "Allows keyboard users to bypass repetitive navigation and reach the main content faster."
    }
  },
  {
    id: "rule-a11y-heading-hierarchy",
    category: "a11y",
    description: "Page headings must follow a logical order.",
    trigger: { type: "component", selector: ".*(Page|View|Screen).*" },
    condition: (model, component: UIComponent) => {
      // This is a simplified check
      const hasH1 = component.children?.some(c => c.name.toLowerCase() === "h1");
      return !hasH1;
    },
    suggestion: {
      action: "Validate Heading Hierarchy",
      description: "Ensure this page has a single H1 and follows a logical H1 -> H2 -> H3 order.",
      impact: "low",
      rationale: "Correct heading structure is vital for screen reader navigation and SEO."
    }
  },
  {
    id: "rule-a11y-reduced-motion",
    category: "a11y",
    description: "Respect prefers-reduced-motion media query.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasReducedMotion = model.microDetails?.some(d => d.description.toLowerCase().includes("reduced motion"));
      return !hasReducedMotion;
    },
    suggestion: {
      action: "Implement Reduced Motion Support",
      description: "Ensure animations are disabled or simplified when the user has enabled 'prefers-reduced-motion'.",
      impact: "low",
      rationale: "Essential for users with vestibular disorders who can experience motion sickness from animations."
    }
  },

  // --- SEO & META DATA ---
  {
    id: "rule-seo-meta",
    category: "seo",
    description: "Every public page should have a title and meta description.",
    trigger: { type: "component", selector: ".*(Page|View|Screen).*" },
    condition: (model, component: UIComponent) => {
      const hasMeta = component.attributes?.some(attr =>
        attr.name.toLowerCase().includes("title") ||
        attr.name.toLowerCase().includes("meta")
      );
      return !hasMeta;
    },
    suggestion: {
      action: "Add SEO Meta Tags",
      description: "Implement dynamic page titles and meta descriptions for better SEO and social sharing.",
      impact: "low",
      rationale: "Proper meta tags improve search engine visibility and how links appear when shared."
    }
  },
  {
    id: "rule-seo-og-tags",
    category: "seo",
    description: "Public pages should have Open Graph tags for social sharing.",
    trigger: { type: "component", selector: ".*(Page|View|Screen).*" },
    condition: (model, component: UIComponent) => {
      const hasOG = component.attributes?.some(attr =>
        attr.name.toLowerCase().includes("og:") ||
        attr.name.toLowerCase().includes("twitter:")
      );
      return !hasOG;
    },
    suggestion: {
      action: "Add Open Graph Tags",
      description: "Implement og:title, og:description, and og:image tags for rich social previews.",
      impact: "low",
      rationale: "OG tags ensure your content looks professional when shared on platforms like Twitter, LinkedIn, or Facebook."
    }
  },
  {
    id: "rule-seo-sitemap",
    category: "seo",
    description: "Generate and submit a sitemap.xml.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasSitemap = model.microDetails?.some(d => d.description.toLowerCase().includes("sitemap"));
      return !hasSitemap;
    },
    suggestion: {
      action: "Generate Sitemap",
      description: "Add a task to generate a sitemap.xml for search engine indexing.",
      impact: "low",
      rationale: "Sitemaps help search engines find and index all pages on your site."
    }
  },
  {
    id: "rule-seo-canonical",
    category: "seo",
    description: "Avoid duplicate content with canonical URLs.",
    trigger: { type: "component", selector: ".*(Page|View|Screen).*" },
    condition: (model, component: UIComponent) => {
      const hasCanonical = component.attributes?.some(attr => attr.name.toLowerCase().includes("canonical"));
      return !hasCanonical;
    },
    suggestion: {
      action: "Add Canonical Link",
      description: "Include a <link rel='canonical'> tag to specify the preferred version of the page.",
      impact: "low",
      rationale: "Prevents SEO issues caused by duplicate content across different URLs."
    }
  },

  // --- BACKEND & API ---
  {
    id: "rule-api-validation",
    category: "logic/security",
    description: "Input validation must be present on all API routes.",
    trigger: { type: "flow", selector: ".*(API|Post|Put|Patch).*" },
    condition: (model, flow: UserFlow) => {
      const hasValidation = flow.steps.some(step =>
        step.action.toLowerCase().includes("validate") ||
        step.action.toLowerCase().includes("check") ||
        step.action.toLowerCase().includes("verify") ||
        step.action.toLowerCase().includes("schema")
      );
      return !hasValidation;
    },
    suggestion: {
      action: "Add Input Validation",
      description: "Implement server-side schema validation (e.g., Zod, Joi) for this API flow.",
      impact: "high",
      rationale: "Server-side validation is the first line of defense against malicious or malformed data."
    }
  },
  {
    id: "rule-api-rate-limit",
    category: "logic/security",
    description: "API endpoints should have rate limiting.",
    trigger: { type: "flow", selector: ".*(API|Fetch|Submit|Post).*" },
    condition: (model, flow: UserFlow) => {
      const hasRateLimit = flow.steps.some(step =>
        step.action.toLowerCase().includes("rate limit") ||
        step.action.toLowerCase().includes("throttle")
      );
      return !hasRateLimit;
    },
    suggestion: {
      action: "Implement Rate Limiting",
      description: "Add rate limiting to this API interaction to prevent abuse and DOS attacks.",
      impact: "high",
      rationale: "Rate limiting is a fundamental security measure for public-facing APIs."
    }
  },
  {
    id: "rule-api-auth-check",
    category: "logic/security",
    description: "Check permissions on every request.",
    trigger: { type: "flow", selector: ".*(API|Fetch|Submit|Post|Put|Delete).*" },
    condition: (model, flow: UserFlow) => {
      const hasAuth = flow.steps.some(step =>
        step.action.toLowerCase().includes("auth") ||
        step.action.toLowerCase().includes("permission") ||
        step.action.toLowerCase().includes("authorize")
      );
      return !hasAuth;
    },
    suggestion: {
      action: "Add Authorization Check",
      description: "Verify user permissions (RBAC/ABAC) before processing this API request.",
      impact: "high",
      rationale: "Ensures that users can only access or modify data they are authorized to."
    }
  },
  {
    id: "rule-api-cors",
    category: "logic/security",
    description: "Configure CORS properly.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasCORS = model.microDetails?.some(d => d.description.toLowerCase().includes("cors"));
      return !hasCORS;
    },
    suggestion: {
      action: "Configure CORS",
      description: "Set up Cross-Origin Resource Sharing with a whitelist of trusted origins.",
      impact: "high",
      rationale: "Prevents unauthorized domains from making requests to your API."
    }
  },

  // --- DATABASE ---
  {
    id: "rule-db-soft-delete",
    category: "devops",
    description: "Soft deletes should be used instead of hard deletes.",
    trigger: { type: "entity", selector: ".*" },
    condition: (model, entity: any) => {
      const hasDeletedAt = entity.properties?.some((p: any) =>
        p.name?.toLowerCase().includes("deleted") ||
        p.name?.toLowerCase() === "is_active"
      );
      return !hasDeletedAt;
    },
    suggestion: {
      action: "Implement Soft Delete",
      description: "Add a 'deleted_at' timestamp to this entity instead of performing hard deletes.",
      impact: "medium",
      rationale: "Soft deletes allow for data recovery and maintain audit trails."
    }
  },
  {
    id: "rule-db-indexes",
    category: "devops",
    description: "Create indexes on frequently queried columns.",
    trigger: { type: "entity", selector: ".*" },
    condition: (model, entity: any) => {
      // Simplified check
      return true; // Always suggest checking for indexes
    },
    suggestion: {
      action: "Review Database Indexes",
      description: "Ensure indexes exist for columns used in WHERE, JOIN, and ORDER BY clauses.",
      impact: "medium",
      rationale: "Proper indexing is critical for database performance as the dataset grows."
    }
  },
  {
    id: "rule-db-timestamps",
    category: "devops",
    description: "Include created_at and updated_at for every table.",
    trigger: { type: "entity", selector: ".*" },
    condition: (model, entity: any) => {
      const hasTimestamps = entity.properties?.some((p: any) => p.name?.toLowerCase() === "created_at") &&
        entity.properties?.some((p: any) => p.name?.toLowerCase() === "updated_at");
      return !hasTimestamps;
    },
    suggestion: {
      action: "Add Timestamps",
      description: "Add created_at and updated_at columns to this entity.",
      impact: "low",
      rationale: "Timestamps are essential for auditing and tracking data changes over time."
    }
  },
  {
    id: "rule-db-migrations",
    category: "devops",
    description: "Use version-controlled migration scripts.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasMigrations = model.microDetails?.some(d => d.description?.toLowerCase().includes("migration"));
      return !hasMigrations;
    },
    suggestion: {
      action: "Set Up Database Migrations",
      description: "Use a tool like Prisma, Knex, or TypeORM migrations to manage schema changes.",
      impact: "high",
      rationale: "Ensures that database schema changes are reproducible and versioned alongside code."
    }
  },

  // --- DEVOPS & INFRASTRUCTURE ---
  {
    id: "rule-devops-health-check",
    category: "devops",
    description: "Services should have a health check endpoint.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasHealthCheck = model.flows.some(f => f.name?.toLowerCase().includes("health"));
      return !hasHealthCheck;
    },
    suggestion: {
      action: "Add Health Check",
      description: "Implement a /health endpoint that returns the service status.",
      impact: "medium",
      rationale: "Health checks are essential for container orchestration and monitoring."
    }
  },
  {
    id: "rule-devops-env-example",
    category: "devops",
    description: "Document all required env vars in a .env.example file.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasEnvExample = model.microDetails?.some(d => d.description?.toLowerCase().includes(".env.example"));
      return !hasEnvExample;
    },
    suggestion: {
      action: "Create .env.example",
      description: "Ensure a .env.example file exists with all required environment variables.",
      impact: "low",
      rationale: "Helps other developers set up the project quickly and safely."
    }
  },
  {
    id: "rule-devops-graceful-shutdown",
    category: "devops",
    description: "Handle SIGTERM for graceful shutdown.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasShutdown = model.microDetails?.some(d => d.description?.toLowerCase().includes("shutdown"));
      return !hasShutdown;
    },
    suggestion: {
      action: "Implement Graceful Shutdown",
      description: "Listen for SIGTERM and close database connections and servers cleanly.",
      impact: "medium",
      rationale: "Prevents data corruption and ensures that in-flight requests are completed before the process exits."
    }
  },

  // --- TESTING ---
  {
    id: "rule-testing-coverage",
    category: "testing",
    description: "Critical business logic should have unit tests.",
    trigger: { type: "flow", selector: ".*" },
    condition: (model, flow: UserFlow) => {
      return true; // Always suggest testing
    },
    suggestion: {
      action: "Add Unit Tests",
      description: "Implement unit tests for the core logic of this flow.",
      impact: "medium",
      rationale: "Tests ensure that changes don't break existing functionality and improve code quality."
    }
  },
  {
    id: "rule-testing-e2e",
    category: "testing",
    description: "Critical user flows should have E2E tests.",
    trigger: { type: "flow", selector: ".*(Login|Signup|Checkout|Payment|Auth).*" },
    condition: (model, flow: UserFlow) => {
      return true; // Always suggest E2E for critical flows
    },
    suggestion: {
      action: "Add E2E Tests",
      description: "Implement end-to-end tests using Playwright or Cypress for this critical flow.",
      impact: "high",
      rationale: "Verifies that the entire system works together from the user's perspective."
    }
  },
  {
    id: "rule-security-password-hashing",
    category: "logic/security",
    description: "Passwords must never be stored in plain text.",
    trigger: { type: "flow", selector: ".*(Signup|Login|Password|Auth).*" },
    condition: (model, flow: UserFlow) => {
      const hasHashing = flow.steps.some(step =>
        step.action?.toLowerCase().includes("hash") ||
        step.action?.toLowerCase().includes("bcrypt") ||
        step.action?.toLowerCase().includes("argon2")
      );
      return !hasHashing;
    },
    suggestion: {
      action: "Implement Password Hashing",
      description: "Use a strong hashing algorithm like bcrypt or argon2 before storing passwords.",
      impact: "high",
      rationale: "Storing plain-text passwords is a critical security vulnerability."
    }
  },
  {
    id: "rule-performance-lazy-loading",
    category: "ui/ux",
    description: "Heavy components and routes should be lazy-loaded.",
    trigger: { type: "component", selector: ".*(Page|View|Screen|Chart|Dashboard).*" },
    condition: (model, component: UIComponent) => {
      const hasLazy = component.attributes?.some(attr => attr.name?.toLowerCase().includes("lazy"));
      return !hasLazy;
    },
    suggestion: {
      action: "Implement Lazy Loading",
      description: "Use React.lazy and Suspense for this route or heavy component.",
      impact: "medium",
      rationale: "Improves initial load time by splitting the bundle into smaller chunks."
    }
  },
  {
    id: "rule-devops-dockerfile",
    category: "devops",
    description: "The project should include a Dockerfile for containerization.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasDocker = model.microDetails?.some(d => d.description?.toLowerCase().includes("docker"));
      return !hasDocker;
    },
    suggestion: {
      action: "Add Dockerfile",
      description: "Create a multi-stage Dockerfile for the application.",
      impact: "medium",
      rationale: "Containerization ensures consistent environments across development and production."
    }
  },
  {
    id: "rule-devops-ci-cd",
    category: "devops",
    description: "Set up a CI/CD pipeline for automated testing and deployment.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasCICD = model.microDetails?.some(d => d.description?.toLowerCase().includes("ci/cd") || d.description?.toLowerCase().includes("github actions"));
      return !hasCICD;
    },
    suggestion: {
      action: "Set Up CI/CD",
      description: "Configure GitHub Actions or GitLab CI for automated builds and tests.",
      impact: "medium",
      rationale: "Automated pipelines reduce manual errors and speed up the delivery cycle."
    }
  },
  {
    id: "rule-security-sql-injection",
    category: "logic/security",
    description: "Prevent SQL injection by using parameterized queries.",
    trigger: { type: "flow", selector: ".*(API|Post|Put|Patch|Delete|Query|Search).*" },
    condition: (model, flow: UserFlow) => {
      const hasParamQueries = flow.steps.some(step =>
        step.action?.toLowerCase().includes("parameterized") ||
        step.action?.toLowerCase().includes("prepared statement") ||
        step.action?.toLowerCase().includes("orm") ||
        step.action?.toLowerCase().includes("prisma") ||
        step.action?.toLowerCase().includes("knex")
      );
      return !hasParamQueries;
    },
    suggestion: {
      action: "Use Parameterized Queries",
      description: "Ensure all database queries use parameterized inputs or a secure ORM to prevent SQL injection.",
      impact: "high",
      rationale: "SQL injection is a severe vulnerability that can lead to data breaches."
    }
  },
  {
    id: "rule-security-jwt-secret",
    category: "logic/security",
    description: "JWT secrets must be stored securely and rotated.",
    trigger: { type: "flow", selector: ".*(Auth|Login|Token|JWT).*" },
    condition: (model, flow: UserFlow) => {
      const hasSecretManagement = model.microDetails?.some(d => d.description?.toLowerCase().includes("secret") || d.description?.toLowerCase().includes("vault"));
      return !hasSecretManagement;
    },
    suggestion: {
      action: "Secure Secret Management",
      description: "Use environment variables or a secret manager (like AWS Secrets Manager) for JWT secrets.",
      impact: "high",
      rationale: "Hardcoded or poorly managed secrets can compromise the entire authentication system."
    }
  },
  {
    id: "rule-ux-inline-validation",
    category: "ui/ux",
    description: "Forms should have real-time inline validation.",
    trigger: { type: "component", selector: ".*(Form|Input|Field).*" },
    condition: (model, component: UIComponent) => {
      const hasValidation = component.attributes?.some(attr => attr.name?.toLowerCase().includes("validate") || attr.name?.toLowerCase().includes("error"));
      return !hasValidation;
    },
    suggestion: {
      action: "Add Inline Validation",
      description: "Implement real-time validation feedback as the user types in form fields.",
      impact: "medium",
      rationale: "Immediate feedback helps users correct errors quickly, improving form completion rates."
    }
  },
  {
    id: "rule-security-rate-limiting",
    category: "logic/security",
    description: "API endpoints should have rate limiting.",
    trigger: { type: "global" },
    condition: (model) => {
      const hasRateLimit = model.microDetails?.some(d => d.description?.toLowerCase().includes("rate limit"));
      return !hasRateLimit;
    },
    suggestion: {
      action: "Implement Rate Limiting",
      description: "Add rate limiting to your API endpoints to prevent brute-force attacks and DoS.",
      impact: "high",
      rationale: "Protects the server from being overwhelmed by too many requests."
    }
  },
  {
    id: "rule-security-headers",
    category: "logic/security",
    description: "Use security headers (CSP, HSTS, etc.).",
    trigger: { type: "global" },
    condition: (model) => {
      const hasHeaders = model.microDetails?.some(d => d.description?.toLowerCase().includes("header") || d.description?.toLowerCase().includes("csp"));
      return !hasHeaders;
    },
    suggestion: {
      action: "Configure Security Headers",
      description: "Implement Content Security Policy (CSP), HSTS, and other security headers.",
      impact: "medium",
      rationale: "Reduces the risk of XSS and other common web vulnerabilities."
    }
  },
  {
    id: "rule-logic-idempotency",
    category: "logic",
    description: "Critical POST/PUT operations should be idempotent.",
    trigger: { type: "flow", selector: ".*(Payment|Order|Create|Post).*" },
    condition: (model, flow: UserFlow) => {
      const hasIdempotency = flow.steps.some(s => s.action?.toLowerCase().includes("idempotent") || s.action?.toLowerCase().includes("key"));
      return !hasIdempotency;
    },
    suggestion: {
      action: "Implement Idempotency",
      description: "Use idempotency keys for critical state-changing operations.",
      impact: "high",
      rationale: "Prevents duplicate processing of the same request (e.g., double charging a user)."
    }
  }
];

export const evaluateRules = (model: SystemModel): SmartSuggestion[] => {
  const suggestions: SmartSuggestion[] = [];

  // Helper to check selector
  const matchesSelector = (name: string, selector?: string) => {
    if (!selector) return true;
    try {
      const regex = new RegExp(selector, "i");
      return regex.test(name);
    } catch {
      return name.toLowerCase().includes(selector.toLowerCase());
    }
  };

  RULES.forEach(rule => {
    if (rule.trigger.type === "global") {
      if (rule.condition(model)) {
        suggestions.push(createSuggestion(rule));
      }
    } else if (rule.trigger.type === "component") {
      model.uiModules.forEach(module => {
        const checkComponents = (components: UIComponent[]) => {
          components.forEach(comp => {
            if (matchesSelector(comp.name, rule.trigger.selector)) {
              if (rule.condition(model, comp)) {
                suggestions.push(createSuggestion(rule, comp.name));
              }
            }
            if (comp.children) checkComponents(comp.children);
          });
        };
        checkComponents(module.components);
      });
    } else if (rule.trigger.type === "flow") {
      model.flows.forEach(flow => {
        if (matchesSelector(flow.name, rule.trigger.selector)) {
          if (rule.condition(model, flow)) {
            suggestions.push(createSuggestion(rule, flow.name));
          }
        }
      });
    } else if (rule.trigger.type === "entity") {
      model.entities.forEach(entity => {
        if (matchesSelector(entity.name, rule.trigger.selector)) {
          if (rule.condition(model, entity)) {
            suggestions.push(createSuggestion(rule, entity.name));
          }
        }
      });
    }
  });

  return suggestions;
};

export const applySuggestion = (model: SystemModel, suggestion: SmartSuggestion): SystemModel => {
  const newModel = { ...model };
  const rule = RULES.find(r => r.id === suggestion.ruleId);
  if (!rule || !rule.fix) return newModel;

  if (rule.trigger.type === "component" && suggestion.targetElement) {
    newModel.uiModules.forEach(module => {
      const fixComponents = (components: UIComponent[]) => {
        components.forEach(comp => {
          if (comp.name === suggestion.targetElement) {
            rule.fix!(newModel, comp);
          }
          if (comp.children) fixComponents(comp.children);
        });
      };
      fixComponents(module.components);
    });
  } else if (rule.trigger.type === "flow" && suggestion.targetElement) {
    const flow = newModel.flows.find(f => f.name === suggestion.targetElement);
    if (flow) rule.fix!(newModel, flow);
  } else if (rule.trigger.type === "entity" && suggestion.targetElement) {
    const entity = newModel.entities.find(e => e.name === suggestion.targetElement);
    if (entity) rule.fix!(newModel, entity);
  } else if (rule.trigger.type === "global") {
    rule.fix!(newModel);
  }

  return newModel;
};

/**
 * Detects structural contradictions in the SystemModel.
 * This complements the AI-driven detection by performing deterministic checks.
 */
export const detectContradictions = (model: SystemModel): Contradiction[] => {
  const contradictions: Contradiction[] = [];

  // 1. Access Conflicts: Check if components have conflicting access attributes
  model.uiModules.forEach(module => {
    module.components.forEach(comp => {
      const accessAttrs = comp.attributes?.filter(a => a.name.toLowerCase() === 'access' || a.name.toLowerCase() === 'visibility');
      if (accessAttrs && accessAttrs.length > 1) {
        const values = new Set(accessAttrs.map(a => a.value.toLowerCase()));
        if (values.size > 1) {
          contradictions.push({
            id: `contra-access-${comp.name}`,
            description: `Conflicting access levels for component: ${comp.name}`,
            conflictingPoints: accessAttrs.map(a => ({
              text: `Access set to '${a.value}'`,
              provenance: module.provenance || { file: 'unknown', context: comp.name }
            })),
            resolutionSuggestion: "Standardize the access level to either 'public' or 'private/protected' based on security requirements.",
            severity: 'high'
          });
        }
      }
    });
  });

  // 2. Flow Logic Conflicts: Same trigger, different outcomes
  const triggerMap = new Map<string, UserFlow[]>();
  model.flows.forEach(flow => {
    const trigger = flow.trigger.toLowerCase().trim();
    if (!triggerMap.has(trigger)) triggerMap.set(trigger, []);
    triggerMap.get(trigger)!.push(flow);
  });

  triggerMap.forEach((flows, trigger) => {
    if (flows.length > 1) {
      const outcomes = new Set(flows.map(f => f.outcome.toLowerCase().trim()));
      if (outcomes.size > 1) {
        contradictions.push({
          id: `contra-flow-${trigger.replace(/\s+/g, '-')}`,
          description: `Inconsistent outcomes for trigger: "${trigger}"`,
          conflictingPoints: flows.map(f => ({
            text: `Flow "${f.name}" leads to: ${f.outcome}`,
            provenance: f.provenance || { file: 'unknown', context: f.name }
          })),
          resolutionSuggestion: "Consolidate these flows into a single consistent behavior or clearly define the conditional logic that leads to different outcomes.",
          severity: 'medium'
        });
      }
    }
  });

  // 3. Data Type Conflicts: Same property name in different entities with different types
  const propertyMap = new Map<string, { entity: string; type: string; provenance?: any }[]>();
  model.entities.forEach(entity => {
    entity.properties.forEach(prop => {
      const name = prop.name.toLowerCase().trim();
      if (!propertyMap.has(name)) propertyMap.set(name, []);
      propertyMap.get(name)!.push({ entity: entity.name, type: prop.type, provenance: entity.provenance });
    });
  });

  propertyMap.forEach((occurrences, propName) => {
    const types = new Set(occurrences.map(o => o.type.toLowerCase().trim()));
    if (types.size > 1 && occurrences.length > 1) {
      const criticalProps = ['id', 'email', 'userid', 'createdat', 'updatedat', 'status'];
      if (criticalProps.includes(propName)) {
        contradictions.push({
          id: `contra-type-${propName}`,
          description: `Type mismatch for common property: "${propName}"`,
          conflictingPoints: occurrences.map(o => ({
            text: `Entity "${o.entity}" defines it as ${o.type}`,
            provenance: o.provenance || { file: 'unknown', context: o.entity }
          })),
          resolutionSuggestion: `Ensure "${propName}" has a consistent data type across all entities to prevent integration issues.`,
          severity: 'medium'
        });
      }
    }
  });

  // 4. Permission Conflicts: Admin flow vs public steps
  model.flows.forEach(flow => {
    const isAdminFlow = flow.name.toLowerCase().includes('admin') || flow.trigger.toLowerCase().includes('admin');
    const hasPublicStep = flow.steps.some(s => s.action?.toLowerCase().includes('public') || s.action?.toLowerCase().includes('guest'));

    if (isAdminFlow && hasPublicStep) {
      contradictions.push({
        id: `contra-perm-${flow.name}`,
        description: `Potential permission leakage in Admin flow: ${flow.name}`,
        conflictingPoints: [
          { text: "Flow is identified as Admin-only", provenance: flow.provenance || { file: 'unknown' } },
          { text: "Flow contains steps accessible to public/guests", provenance: flow.provenance || { file: 'unknown' } }
        ],
        resolutionSuggestion: "Review the flow steps to ensure that sensitive admin actions are not exposed to unauthorized users.",
        severity: 'high'
      });
    }
  });

  // 5. Semantic Meaning Conflicts: Contradictory constraints
  model.constraints.forEach((c1, i) => {
    model.constraints.forEach((c2, j) => {
      if (i >= j) return;

      const d1 = c1.description.toLowerCase();
      const d2 = c2.description.toLowerCase();

      const isContradictory =
        (d1.includes('real-time') && d2.includes('batch')) ||
        (d1.includes('synchronous') && d2.includes('asynchronous')) ||
        (d1.includes('mobile-only') && d2.includes('desktop-only'));

      if (isContradictory) {
        contradictions.push({
          id: `contra-semantic-${i}-${j}`,
          description: "Contradictory system constraints detected",
          conflictingPoints: [
            { text: c1.description, provenance: { file: 'System Constraints' } },
            { text: c2.description, provenance: { file: 'System Constraints' } }
          ],
          resolutionSuggestion: "Clarify the system architecture: choose between the conflicting constraints (e.g., real-time vs batch).",
          severity: 'medium'
        });
      }
    });
  });

  // 6. State Definition Conflicts: Same state name, different scopes
  const stateMap = new Map<string, StateDefinition[]>();
  model.stateDefinitions.forEach(state => {
    const name = state.name.toLowerCase().trim();
    if (!stateMap.has(name)) stateMap.set(name, []);
    stateMap.get(name)!.push(state);
  });

  stateMap.forEach((states, name) => {
    if (states.length > 1) {
      const scopes = new Set(states.map(s => s.scope));
      if (scopes.size > 1) {
        contradictions.push({
          id: `contra-state-${name}`,
          description: `Conflicting scopes for state: ${name}`,
          conflictingPoints: states.map(s => ({
            text: `State "${s.name}" set to ${s.scope} scope`,
            provenance: { file: 'System Model', context: s.description }
          })),
          resolutionSuggestion: "Ensure the state has a consistent scope (global, component, or server) across all definitions.",
          severity: 'medium'
        });
      }
    }
  });

  return contradictions;
};

/**
 * Detects duplicate content across the SystemModel.
 */
export const detectDuplicates = (model: SystemModel): DuplicateContent[] => {
  const duplicates: DuplicateContent[] = [];

  // 1. Duplicate Entities
  const entityMap = new Map<string, Entity[]>();
  model.entities.forEach(entity => {
    const name = entity.name.toLowerCase().trim();
    if (!entityMap.has(name)) entityMap.set(name, []);
    entityMap.get(name)!.push(entity);
  });

  entityMap.forEach((entities, name) => {
    if (entities.length > 1) {
      duplicates.push({
        id: `dup-entity-${name}`,
        elementName: entities[0].name,
        elementType: 'entity',
        occurrences: entities.map(e => ({
          file: e.provenance?.file || 'unknown',
          context: `Entity definition: ${e.name}`
        })),
        impact: 'medium',
        suggestion: `Merge these ${entities.length} definitions of "${entities[0].name}" into a single source of truth.`
      });
    }
  });

  // 2. Duplicate Flows
  const flowMap = new Map<string, UserFlow[]>();
  model.flows.forEach(flow => {
    const name = flow.name.toLowerCase().trim();
    if (!flowMap.has(name)) flowMap.set(name, []);
    flowMap.get(name)!.push(flow);
  });

  flowMap.forEach((flows, name) => {
    if (flows.length > 1) {
      duplicates.push({
        id: `dup-flow-${name.replace(/\s+/g, '-')}`,
        elementName: flows[0].name,
        elementType: 'flow',
        occurrences: flows.map(f => ({
          file: f.provenance?.file || 'unknown',
          context: `Flow definition: ${f.name}`
        })),
        impact: 'low',
        suggestion: `Review if these ${flows.length} flows are identical or if they should be renamed to reflect distinct scenarios.`
      });
    }
  });

  // 3. Duplicate Components (within UI Modules)
  const componentMap = new Map<string, { module: string; file: string }[]>();
  model.uiModules.forEach(module => {
    const traverse = (components: UIComponent[]) => {
      components.forEach(comp => {
        const name = comp.name.toLowerCase().trim();
        if (!componentMap.has(name)) componentMap.set(name, []);
        componentMap.get(name)!.push({ module: module.name, file: module.provenance?.file || 'unknown' });
        if (comp.children) traverse(comp.children);
      });
    };
    traverse(module.components);
  });

  componentMap.forEach((occurrences, name) => {
    if (occurrences.length > 1) {
      // Only flag if in different modules or files
      const uniqueModules = new Set(occurrences.map(o => o.module));
      if (uniqueModules.size > 1) {
        duplicates.push({
          id: `dup-comp-${name}`,
          elementName: name,
          elementType: 'component',
          occurrences: occurrences.map(o => ({
            file: o.file,
            context: `Found in module: ${o.module}`
          })),
          impact: 'low',
          suggestion: `Component "${name}" is defined in multiple modules. Consider making it a shared/global component.`
        });
      }
    }
  });

  return duplicates;
};

const createSuggestion = (rule: Rule, targetName?: string): SmartSuggestion => ({
  id: `${rule.id}-${targetName || "global"}-${Math.random().toString(36).substr(2, 9)}`,
  ruleId: rule.id,
  category: rule.category,
  description: targetName ? `${rule.description} (Target: ${targetName})` : rule.description,
  impact: rule.suggestion.impact,
  rationale: rule.suggestion.rationale,
  action: rule.suggestion.action,
  status: "pending",
  targetElement: targetName
});
