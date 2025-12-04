// shared/ui/math-graph/equation-parser.ts
// Utility to detect and parse mathematical equations for graphing

import type { FunctionDefinition } from "./MathGraph";

/**
 * Result of equation detection
 */
export interface DetectedEquation {
  /** Whether a graphable equation was found */
  isGraphable: boolean;
  /** The original equation string */
  original: string;
  /** Type of equation */
  type: "function" | "parametric" | "inequality" | "linear" | "implicit" | "unknown";
  /** Parsed function (if applicable) */
  fn?: (x: number) => number;
  /** Display label */
  label?: string;
  /** Suggested x range */
  suggestedXRange?: [number, number];
  /** Suggested y range */
  suggestedYRange?: [number, number];
}

/**
 * Common mathematical functions patterns
 */
const FUNCTION_PATTERNS = {
  // y = f(x) explicit functions
  explicit: /y\s*=\s*(.+)/i,
  // f(x) = expression
  fOfX: /f\s*\(\s*x\s*\)\s*=\s*(.+)/i,
  // Polynomial: ax^n + bx^(n-1) + ...
  polynomial: /^[\d\.\s\+\-\*x\^]+$/i,
  // Trigonometric
  trig: /\b(sin|cos|tan|cot|sec|csc)\s*\(/i,
  // Exponential/logarithmic
  expLog: /\b(e\^|exp|ln|log)\s*\(/i,
  // Square root
  sqrt: /\\?sqrt|√/i,
  // Fractions
  fraction: /\\frac\{([^}]+)\}\{([^}]+)\}/,
};

/**
 * Detect if text contains a graphable equation
 */
export function detectGraphableEquation(text: string): DetectedEquation {
  const result: DetectedEquation = {
    isGraphable: false,
    original: text,
    type: "unknown",
  };

  // Clean the input - remove LaTeX delimiters
  const cleanText = text
    .replace(/\$\$/g, "")
    .replace(/\$/g, "")
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .trim();

  // Try to match y = f(x) pattern
  const explicitMatch = cleanText.match(FUNCTION_PATTERNS.explicit);
  if (explicitMatch) {
    const expression = explicitMatch[1].trim();
    const parsed = parseExpressionToFunction(expression);
    if (parsed) {
      result.isGraphable = true;
      result.type = "function";
      result.fn = parsed;
      result.label = `y = ${simplifyExpression(expression)}`;
      result.suggestedXRange = suggestXRange(expression);
      result.suggestedYRange = [-10, 10];
    }
  }

  // Try f(x) = expression pattern
  const fOfXMatch = cleanText.match(FUNCTION_PATTERNS.fOfX);
  if (!result.isGraphable && fOfXMatch) {
    const expression = fOfXMatch[1].trim();
    const parsed = parseExpressionToFunction(expression);
    if (parsed) {
      result.isGraphable = true;
      result.type = "function";
      result.fn = parsed;
      result.label = `f(x) = ${simplifyExpression(expression)}`;
      result.suggestedXRange = suggestXRange(expression);
      result.suggestedYRange = [-10, 10];
    }
  }

  return result;
}

/**
 * Parse a mathematical expression to a JavaScript function
 * Supports common math operations and functions
 */
export function parseExpressionToFunction(expr: string): ((x: number) => number) | null {
  try {
    // Clean and normalize the expression
    const jsExpr = expr
      // Remove spaces around operators but keep them between terms
      .replace(/\s+/g, " ")
      // Handle LaTeX fractions: \frac{a}{b} -> (a)/(b)
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "(($1)/($2))")
      // Handle superscripts: x^2 or x^{2} -> Math.pow(x, 2)
      .replace(/\^{([^}]+)}/g, "^($1)")
      .replace(/(\w)\^(\d+)/g, "Math.pow($1, $2)")
      .replace(/(\w)\^\(([^)]+)\)/g, "Math.pow($1, $2)")
      .replace(/\(([^)]+)\)\^(\d+)/g, "Math.pow(($1), $2)")
      .replace(/\(([^)]+)\)\^\(([^)]+)\)/g, "Math.pow(($1), ($2))")
      // Handle sqrt
      .replace(/\\sqrt\{([^}]+)\}/g, "Math.sqrt($1)")
      .replace(/\\sqrt\s*(\w)/g, "Math.sqrt($1)")
      .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)")
      .replace(/√(\w)/g, "Math.sqrt($1)")
      // Handle trig functions (LaTeX)
      .replace(/\\sin\s*\(([^)]+)\)/g, "Math.sin($1)")
      .replace(/\\cos\s*\(([^)]+)\)/g, "Math.cos($1)")
      .replace(/\\tan\s*\(([^)]+)\)/g, "Math.tan($1)")
      .replace(/\\cot\s*\(([^)]+)\)/g, "(1/Math.tan($1))")
      .replace(/\\sec\s*\(([^)]+)\)/g, "(1/Math.cos($1))")
      .replace(/\\csc\s*\(([^)]+)\)/g, "(1/Math.sin($1))")
      // Handle trig functions (plain text)
      .replace(/\bsin\s*\(([^)]+)\)/g, "Math.sin($1)")
      .replace(/\bcos\s*\(([^)]+)\)/g, "Math.cos($1)")
      .replace(/\btan\s*\(([^)]+)\)/g, "Math.tan($1)")
      // Handle exp and log
      .replace(/\\ln\s*\(([^)]+)\)/g, "Math.log($1)")
      .replace(/\\log\s*\(([^)]+)\)/g, "Math.log10($1)")
      .replace(/\bln\s*\(([^)]+)\)/g, "Math.log($1)")
      .replace(/\blog\s*\(([^)]+)\)/g, "Math.log10($1)")
      .replace(/\\exp\s*\(([^)]+)\)/g, "Math.exp($1)")
      .replace(/\bexp\s*\(([^)]+)\)/g, "Math.exp($1)")
      .replace(/e\^\{([^}]+)\}/g, "Math.exp($1)")
      .replace(/e\^(\w)/g, "Math.exp($1)")
      // Handle pi and e constants
      .replace(/\\pi/g, "Math.PI")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/(?<!Math\.)e(?!\w)/g, "Math.E")
      // Handle absolute value
      .replace(/\|([^|]+)\|/g, "Math.abs($1)")
      .replace(/\\left\|([^|]+)\\right\|/g, "Math.abs($1)")
      // Handle implicit multiplication: 2x -> 2*x, x(x+1) -> x*(x+1)
      .replace(/(\d)([x])/g, "$1*$2")
      .replace(/([x])(\()/g, "$1*$2")
      .replace(/(\))(\()/g, "$1*$2")
      .replace(/(\))([x])/g, "$1*$2")
      // Clean up remaining LaTeX
      .replace(/\\cdot/g, "*")
      .replace(/\\times/g, "*")
      .replace(/\\div/g, "/");

    // Validate - only allow safe characters
    const safePattern = /^[\d\s\+\-\*\/\(\)\.xMathpowsqrtsincostandlogabsEPI,]+$/;
    if (!safePattern.test(jsExpr)) {
      console.warn("Expression contains unsafe characters:", jsExpr);
      return null;
    }

    // Create and test the function
    const fn = new Function("x", `return ${jsExpr}`) as (x: number) => number;

    // Test the function with a sample value
    const testResult = fn(1);
    if (typeof testResult !== "number" || isNaN(testResult)) {
      // Try with x = 0
      const testResult2 = fn(0);
      if (typeof testResult2 !== "number") {
        return null;
      }
    }

    return fn;
  } catch (error) {
    console.warn("Failed to parse expression:", expr, error);
    return null;
  }
}

/**
 * Convert a parsed function back to a FunctionDefinition for MathGraph
 */
export function parseEquationToFunction(
  equation: string,
  color?: string
): FunctionDefinition | null {
  const detected = detectGraphableEquation(equation);

  if (!detected.isGraphable || !detected.fn) {
    return null;
  }

  return {
    fn: detected.fn,
    label: detected.label,
    color,
  };
}

/**
 * Simplify expression for display
 */
function simplifyExpression(expr: string): string {
  return expr
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\\ln/g, "ln")
    .replace(/\\log/g, "log")
    .replace(/\\pi/g, "π")
    .replace(/\^{([^}]+)}/g, "^$1")
    .replace(/\\cdot/g, "·")
    .trim();
}

/**
 * Suggest appropriate x range based on expression type
 */
function suggestXRange(expr: string): [number, number] {
  // Trig functions: show 2 periods
  if (FUNCTION_PATTERNS.trig.test(expr)) {
    return [-2 * Math.PI, 2 * Math.PI];
  }

  // Log/ln functions: start from small positive
  if (/\b(ln|log)\b/i.test(expr) || /\\(ln|log)/i.test(expr)) {
    return [0.1, 10];
  }

  // Square root: start from 0
  if (FUNCTION_PATTERNS.sqrt.test(expr)) {
    return [0, 10];
  }

  // Default range
  return [-5, 5];
}

/**
 * Extract all equations from a text block (e.g., solution steps)
 */
export function extractEquationsFromText(text: string): DetectedEquation[] {
  const equations: DetectedEquation[] = [];

  // Match LaTeX block equations $$...$$
  const blockMatches = text.matchAll(/\$\$([^$]+)\$\$/g);
  for (const match of blockMatches) {
    const detected = detectGraphableEquation(match[1]);
    if (detected.isGraphable) {
      equations.push(detected);
    }
  }

  // Match inline equations $...$
  const inlineMatches = text.matchAll(/\$([^$]+)\$/g);
  for (const match of inlineMatches) {
    const detected = detectGraphableEquation(match[1]);
    if (detected.isGraphable) {
      equations.push(detected);
    }
  }

  // Match plain text equations (y = ... or f(x) = ...)
  const plainMatches = text.matchAll(/(?:y|f\s*\(\s*x\s*\))\s*=\s*[^\n,;]+/gi);
  for (const match of plainMatches) {
    const detected = detectGraphableEquation(match[0]);
    if (detected.isGraphable) {
      // Avoid duplicates
      const isDuplicate = equations.some(eq => eq.label === detected.label);
      if (!isDuplicate) {
        equations.push(detected);
      }
    }
  }

  return equations;
}
