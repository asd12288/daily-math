// shared/ui/math-graph/index.ts
export { MathGraph, InteractiveFunctionGraph } from "./MathGraph";
export { SolutionGraph } from "./SolutionGraph";
export type {
  MathGraphProps,
  GraphType,
  FunctionDefinition,
  ParametricDefinition,
  InequalityDefinition,
  VectorDefinition,
  PointDefinition,
} from "./MathGraph";
export {
  parseEquationToFunction,
  detectGraphableEquation,
  extractEquationsFromText,
  type DetectedEquation,
} from "./equation-parser";
