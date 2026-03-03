import { detectFrameworks, validateCompatibility } from '../services/frameworkDetection';
import { evaluateRules, detectContradictions, detectDuplicates } from '../services/ruleEngine';
import { SystemModel } from '../types';

self.onmessage = (e: MessageEvent) => {
  const { type, model, combinedDocs, customRules } = e.data;

  if (type === 'PROCESS_MODEL') {
    try {
      const startTime = performance.now();
      
      // 1. Framework Detection
      const detectedFrameworks = detectFrameworks(combinedDocs);
      const compatibilityIssues = validateCompatibility(detectedFrameworks);

      // 2. Rule Evaluation
      const smartSuggestions = evaluateRules(model, customRules);

      // 3. Structural Checks
      const contradictions = detectContradictions(model);
      const duplicates = detectDuplicates(model);

      const endTime = performance.now();
      console.log(`[AnalysisWorker] Processed model in ${(endTime - startTime).toFixed(2)}ms`);

      self.postMessage({
        type: 'MODEL_PROCESSED',
        payload: {
          detectedFrameworks,
          compatibilityIssues,
          smartSuggestions,
          contradictions,
          duplicates
        }
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error in worker'
      });
    }
  }
};
