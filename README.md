# Guide Engine: AI-Powered Documentation Analyzer & Build Planner

Guide Engine is a sophisticated tool designed to transform raw system documentation into a high-fidelity technical blueprint. It leverages the advanced reasoning capabilities of Gemini 3.1 Pro to extract architectural patterns, user flows, and micro-interactions, automatically generating a structured build plan with granular tasks and dependency tracking.

## 🚀 Core Features

- **Deep Documentation Analysis**: Extracts entities, properties, relationships, and system rules from markdown or text files.
- **Hierarchical UI Mapping**: Identifies component structures and their relationships (Parent > Child) including technical attributes (ARIA, data-attributes).
- **User Flow Extraction**: Maps sequential user actions to system responses and state transitions.
- **Micro-Detail Identification**: Captures subtle behaviors like animations, validation rules, and immediate feedback loops.
- **Intelligent Build Planning**: Decomposes the extracted model into atomic, phased tasks with inferred dependencies.
- **High-Fidelity Visualization**: A clean, professional dashboard to inspect the extracted architecture and the resulting build plan.

## 🏗 Architecture

The application is built with a modern, performance-oriented stack:

- **Frontend**: React 18+ with Vite for a fast development experience.
- **Styling**: Tailwind CSS for a "crafted" utility-first design.
- **Animations**: Framer Motion (motion/react) for smooth transitions and layout animations.
- **Icons**: Lucide React for consistent, high-quality iconography.
- **AI Engine**: `@google/genai` utilizing **Gemini 3.1 Pro** with high-level reasoning (`ThinkingLevel.HIGH`) for complex architectural analysis.

## 📂 File Structure & Functions

### `src/types.ts`
Defines the core data schema for the application.
- `SystemModel`: The structured output of the documentation analysis.
- `BuildTask`: Represents an atomic step in the generated build plan.
- `ProjectState`: Manages the overall application state, including uploaded docs and the generated model.

### `src/services/geminiService.ts`
The intelligence layer of the application.
- `analyzeDocumentation`: Orchestrates the Gemini 3.1 Pro call to parse raw text into a structured `SystemModel`. It uses a sophisticated set of extraction patterns to identify flows, micro-details, and constraints.
- `decomposeTasks`: Transforms the `SystemModel` into a phased `BuildTask` array, generating detailed prompts and inferring dependencies between tasks.

### `src/App.tsx`
The main entry point and UI orchestration layer.
- Manages the multi-step workflow (Upload -> Analyze -> Model -> Tasks).
- Contains specialized visualization components like `UIComponentTree` for rendering hierarchical UI structures.
- Implements a professional, technical dashboard aesthetic.

### `src/index.css`
The global stylesheet.
- Configures Tailwind CSS.
- Defines custom themes and global typography (Inter for UI, Serif for headings).

## 🛠 Technical Implementation Details

### Extraction Patterns
The engine uses a robust set of keyword triggers and sequential patterns to identify:
- **Animations**: `fade in`, `slide up`, `staggered entrance`, etc.
- **UI States**: `disabled when`, `skeleton screen`, `focus state`, etc.
- **Validation**: `valid email`, `numeric only`, `real-time validation`, etc.
- **Feedback**: `toast notification`, `optimistic UI`, `haptic feedback`, etc.
- **Attributes**: `aria-label`, `role`, `data-testid`, `tabIndex`, etc.

### Dependency Inference
The build planner doesn't just list tasks; it understands the relationship between them. It ensures that:
- Data entities are created before the UI that consumes them.
- Authentication flows precede protected routes.
- Base components are built before their complex wrappers.

## 📝 Usage

1. **Upload**: Provide your system documentation (markdown or text).
2. **Analyze**: The engine processes the text using Gemini's reasoning engine.
3. **Inspect**: Review the extracted `SystemModel` in the dashboard.
4. **Build**: Use the generated `Build Plan` to guide your implementation, copying hyper-detailed prompts for each atomic task.

---
*Crafted with precision for senior engineers and product designers.*
