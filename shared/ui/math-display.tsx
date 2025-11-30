"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useMemo } from "react";

interface MathDisplayProps {
  /** Content with LaTeX: inline $...$ or block $$...$$ */
  content: string | undefined | null;
  /** Force block display mode */
  block?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface ParsedPart {
  type: "text" | "inline-math" | "block-math";
  content: string;
}

/**
 * Parse content for both block ($$...$$) and inline ($...$) math expressions
 */
function parseMathContent(text: string | undefined | null): ParsedPart[] {
  // Handle undefined/null content
  if (!text) {
    return [];
  }

  const parts: ParsedPart[] = [];

  // First, handle block math ($$...$$)
  // Then handle inline math ($...$)
  const blockRegex = /\$\$([^$]+)\$\$/g;

  let blockMatch;

  // Process block math first
  const segments: { start: number; end: number; type: "block-math"; content: string }[] = [];

  while ((blockMatch = blockRegex.exec(text)) !== null) {
    segments.push({
      start: blockMatch.index,
      end: blockMatch.index + blockMatch[0].length,
      type: "block-math",
      content: blockMatch[1].trim(),
    });
  }

  // If there are block math segments, process around them
  if (segments.length > 0) {
    let lastEnd = 0;

    for (const segment of segments) {
      // Process text before this block math (may contain inline math)
      if (segment.start > lastEnd) {
        const textBefore = text.slice(lastEnd, segment.start);
        parts.push(...parseInlineMath(textBefore));
      }

      // Add block math
      parts.push({
        type: "block-math",
        content: segment.content,
      });

      lastEnd = segment.end;
    }

    // Process remaining text after last block math
    if (lastEnd < text.length) {
      parts.push(...parseInlineMath(text.slice(lastEnd)));
    }
  } else {
    // No block math, just parse inline math
    parts.push(...parseInlineMath(text));
  }

  return parts;
}

/**
 * Parse text for inline math ($...$)
 */
function parseInlineMath(text: string | undefined | null): ParsedPart[] {
  // Handle undefined/null content
  if (!text) {
    return [];
  }

  const parts: ParsedPart[] = [];
  const regex = /\$([^$]+)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the math
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      if (textContent) {
        parts.push({ type: "text", content: textContent });
      }
    }

    // Add inline math
    parts.push({
      type: "inline-math",
      content: match[1].trim(),
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      parts.push({ type: "text", content: remaining });
    }
  }

  // If no parts were added (no math found), add the whole text
  if (parts.length === 0 && text) {
    parts.push({ type: "text", content: text });
  }

  return parts;
}

/**
 * MathDisplay - Renders LaTeX math expressions with KaTeX
 *
 * Supports:
 * - Inline math: $x^2 + y^2 = z^2$
 * - Block math: $$\int_0^1 x^2 dx$$
 * - Mixed content: "Solve for x: $2x + 5 = 13$"
 *
 * @example
 * <MathDisplay content="Find $f'(x)$ where $f(x) = x^3$" />
 * <MathDisplay content="$$\frac{d}{dx}(x^n) = nx^{n-1}$$" block />
 */
export function MathDisplay({ content, block = false, className }: MathDisplayProps) {
  const parts = useMemo(() => parseMathContent(content), [content]);

  // Handle empty content
  if (!content) {
    return null;
  }

  // If forced block mode, treat entire content as block math
  if (block) {
    const mathContent = content.replace(/^\$\$|\$\$$/g, "").replace(/^\$|\$$/g, "").trim();
    return (
      <div className={className}>
        <BlockMath math={mathContent} errorColor="#ef4444" />
      </div>
    );
  }

  // Check if content is purely block math
  const hasBlockMath = parts.some(p => p.type === "block-math");

  if (hasBlockMath) {
    return (
      <div className={className}>
        {parts.map((part, index) => {
          if (part.type === "block-math") {
            return (
              <div key={index} className="my-4">
                <BlockMath math={part.content} errorColor="#ef4444" />
              </div>
            );
          }
          if (part.type === "inline-math") {
            return <InlineMath key={index} math={part.content} errorColor="#ef4444" />;
          }
          return <span key={index}>{part.content}</span>;
        })}
      </div>
    );
  }

  // Only inline math or text
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "inline-math") {
          return <InlineMath key={index} math={part.content} errorColor="#ef4444" />;
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}

/**
 * MathBlock - Convenience component for block math display
 */
export function MathBlock({ content, className }: { content: string; className?: string }) {
  const mathContent = content.replace(/^\$\$|\$\$$/g, "").replace(/^\$|\$$/g, "").trim();
  return (
    <div className={className}>
      <BlockMath math={mathContent} errorColor="#ef4444" />
    </div>
  );
}

/**
 * MathInline - Convenience component for inline math display
 */
export function MathInline({ content, className }: { content: string; className?: string }) {
  const mathContent = content.replace(/^\$|\$$/g, "").trim();
  return (
    <span className={className}>
      <InlineMath math={mathContent} errorColor="#ef4444" />
    </span>
  );
}
