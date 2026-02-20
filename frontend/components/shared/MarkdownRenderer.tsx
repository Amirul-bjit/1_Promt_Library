"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Normalize LLM math delimiters so remark-math can parse them.
 * LLMs commonly output \[...\] and \(...\) but remark-math expects $$...$$ and $...$.
 */
function normalizeMathDelimiters(text: string): string {
  return text
    // Display math: \[...\] → $$...$$
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_match, eq) => `$$\n${eq.trim()}\n$$`)
    // Inline math: \(...\) → $...$
    .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_match, eq) => `$${eq.trim()}$`)
    // Bare display math lines: lines containing a LaTeX command like \frac{, \sum_, \int, etc.
    // Must contain \command{ or \command_ or \command^ to be considered LaTeX.
    // Skips lines already wrapped in $ or inside code fences.
    .replace(
      /^((?!\$)(?!```).*\\(?:frac|sum|int|prod|sqrt|text|mathrm|mathbf|left|right|begin|end|over|partial|infty|lim|log|sin|cos|tan|exp|cdot|times|div|pm|leq|geq|neq|approx|equiv|in|subset|cup|cap|forall|exists|nabla|Delta|Sigma|Pi|alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|tau|omega)[^\n]*)$/gm,
      (_match, eq) => `$$\n${eq.trim()}\n$$`
    );
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const normalized = normalizeMathDelimiters(content);

  return (
    <div className={`max-w-none text-gray-900 ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeHighlight,
          [rehypeKatex, { throwOnError: false, strict: false, errorColor: "#c0392b" }],
        ]}

        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="mt-6 mb-3 text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2 text-xl font-semibold text-gray-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-lg font-semibold text-gray-800">{children}</h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="my-2 text-sm leading-relaxed text-gray-800">{children}</p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="my-2 ml-5 list-disc space-y-1 text-sm text-gray-800">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-5 list-decimal space-y-1 text-sm text-gray-800">{children}</ol>
          ),
          li: ({ children }) => <li className="text-sm text-gray-800">{children}</li>,
          // Code blocks  
          code: ({ className: cls, children, ...props }) => {
            const isBlock = cls?.startsWith("language-");
            if (isBlock) {
              return (
                <code
                  className={`${cls} block overflow-x-auto rounded-md text-xs`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-rose-600" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs">
              {children}
            </pre>
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-indigo-300 pl-4 italic text-gray-600 text-sm">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-800 border-b border-gray-100">{children}</td>
          ),
          // Horizontal rule
          hr: () => <hr className="my-4 border-gray-200" />,
          // Strong / em
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              {children}
            </a>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
