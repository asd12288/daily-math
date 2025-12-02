// shared/ui/theory-renderer.tsx
// Renders markdown-like theory content with LaTeX math support

"use client";

import React, { useMemo } from "react";
import { MathDisplay } from "./math-display";

interface TheoryRendererProps {
  content: string;
  className?: string;
}

interface ParsedLine {
  type: "h2" | "h3" | "h4" | "bullet" | "numbered" | "paragraph" | "empty";
  content: string;
  indent?: number;
}

/**
 * Parse a single line to determine its type
 */
function parseLine(line: string): ParsedLine {
  const trimmed = line.trim();

  if (!trimmed) {
    return { type: "empty", content: "" };
  }

  // Headers
  if (trimmed.startsWith("#### ")) {
    return { type: "h4", content: trimmed.slice(5) };
  }
  if (trimmed.startsWith("### ")) {
    return { type: "h3", content: trimmed.slice(4) };
  }
  if (trimmed.startsWith("## ")) {
    return { type: "h2", content: trimmed.slice(3) };
  }

  // Bullet points (-, *, •)
  if (/^[-*•]\s/.test(trimmed)) {
    const indent = line.search(/\S/);
    return { type: "bullet", content: trimmed.slice(2), indent };
  }

  // Numbered lists
  if (/^\d+\.\s/.test(trimmed)) {
    const match = trimmed.match(/^(\d+)\.\s(.*)$/);
    if (match) {
      return { type: "numbered", content: match[2], indent: parseInt(match[1]) };
    }
  }

  return { type: "paragraph", content: trimmed };
}

/**
 * Process inline markdown (bold, italic) and return React elements
 */
function processInlineMarkdown(text: string): React.ReactNode {
  // Handle **bold** text
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      parts.push(<MathDisplay key={keyIndex++} content={before} />);
    }

    // Add bold text with math support
    parts.push(
      <strong key={keyIndex++} className="font-semibold">
        <MathDisplay content={match[1]} />
      </strong>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<MathDisplay key={keyIndex++} content={text.slice(lastIndex)} />);
  }

  // If no bold found, just render with MathDisplay
  if (parts.length === 0) {
    return <MathDisplay content={text} />;
  }

  return <>{parts}</>;
}

/**
 * TheoryRenderer - Renders markdown-like theory content with LaTeX support
 *
 * Supports:
 * - Headers: ## H2, ### H3, #### H4
 * - Bullet lists: - item, * item
 * - Numbered lists: 1. item
 * - Bold: **text**
 * - Inline math: $x^2$
 * - Block math: $$\int f(x) dx$$
 */
export function TheoryRenderer({ content, className }: TheoryRendererProps) {
  const elements = useMemo(() => {
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    let bulletGroup: ParsedLine[] = [];
    let numberedGroup: ParsedLine[] = [];

    const flushBullets = () => {
      if (bulletGroup.length > 0) {
        result.push(
          <ul key={result.length} className="list-disc list-inside space-y-2 my-3 ms-4">
            {bulletGroup.map((item, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">
                {processInlineMarkdown(item.content)}
              </li>
            ))}
          </ul>
        );
        bulletGroup = [];
      }
    };

    const flushNumbered = () => {
      if (numberedGroup.length > 0) {
        result.push(
          <ol key={result.length} className="list-decimal list-inside space-y-2 my-3 ms-4">
            {numberedGroup.map((item, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">
                {processInlineMarkdown(item.content)}
              </li>
            ))}
          </ol>
        );
        numberedGroup = [];
      }
    };

    for (const line of lines) {
      const parsed = parseLine(line);

      // Handle list grouping
      if (parsed.type === "bullet") {
        flushNumbered();
        bulletGroup.push(parsed);
        continue;
      } else if (parsed.type === "numbered") {
        flushBullets();
        numberedGroup.push(parsed);
        continue;
      } else {
        flushBullets();
        flushNumbered();
      }

      switch (parsed.type) {
        case "h2":
          result.push(
            <h2 key={result.length} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3 first:mt-0">
              {processInlineMarkdown(parsed.content)}
            </h2>
          );
          break;

        case "h3":
          result.push(
            <h3 key={result.length} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-5 mb-2">
              {processInlineMarkdown(parsed.content)}
            </h3>
          );
          break;

        case "h4":
          result.push(
            <h4 key={result.length} className="text-base font-medium text-gray-700 dark:text-gray-200 mt-4 mb-2">
              {processInlineMarkdown(parsed.content)}
            </h4>
          );
          break;

        case "paragraph":
          result.push(
            <p key={result.length} className="text-gray-700 dark:text-gray-300 my-2 leading-relaxed">
              {processInlineMarkdown(parsed.content)}
            </p>
          );
          break;

        case "empty":
          // Skip empty lines (spacing handled by margins)
          break;
      }
    }

    // Flush any remaining lists
    flushBullets();
    flushNumbered();

    return result;
  }, [content]);

  return <div className={className}>{elements}</div>;
}
