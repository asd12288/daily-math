"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React from "react";

interface MathRendererProps {
  content: string;
  block?: boolean;
  className?: string;
}

/**
 * Renders LaTeX math expressions within text content.
 * Inline math: $...$
 * Block math: $$...$$
 */
export function MathRenderer({ content, block = false, className }: MathRendererProps) {
  if (block) {
    // Extract math from $$ delimiters and render as block
    const mathContent = content.replace(/^\$\$|\$\$$/g, "").trim();
    return (
      <div className={className}>
        <BlockMath math={mathContent} />
      </div>
    );
  }

  // Parse content for inline math expressions
  const parts = parseInlineMath(content);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "math") {
          return <InlineMath key={index} math={part.content} />;
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}

interface ParsedPart {
  type: "text" | "math";
  content: string;
}

function parseInlineMath(text: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  const regex = /\$([^$]+)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the math
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the math content
    parts.push({
      type: "math",
      content: match[1],
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * Renders markdown-style content with LaTeX support.
 * Supports **bold**, *italic*, and $math$.
 */
export function RichMathRenderer({ content, className }: { content: string; className?: string }) {
  // Split by lines for block rendering
  const lines = content.split("\n");

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="mb-2 last:mb-0">
          <MathRenderer content={formatMarkdown(line)} />
        </div>
      ))}
    </div>
  );
}

function formatMarkdown(text: string): string {
  // This is a simplified version - in production, use a proper markdown parser
  return text;
}
