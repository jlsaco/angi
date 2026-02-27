"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useAngi } from "../hooks/useAngi";

/**
 * AngiChatBubble — floating AI chat widget.
 *
 * Drop this anywhere in your app. It connects automatically to the Angi
 * runtime via useAngi() and sends prompts to /api/angi.
 *
 * Usage:
 *   import { AngiChatBubble } from "@/angi"
 *   <AngiChatBubble />
 */
export function AngiChatBubble() {
  const { sendPrompt, isLoading, streamText } = useAngi();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const prevStreamRef = useRef("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Accumulate stream text into the last assistant message
  useEffect(() => {
    if (!streamText) return;
    const newChars = streamText.slice(prevStreamRef.current.length);
    if (!newChars) return;
    prevStreamRef.current = streamText;

    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return [...prev.slice(0, -1), { role: "assistant", text: streamText }];
      }
      return [...prev, { role: "assistant", text: streamText }];
    });
  }, [streamText]);

  useEffect(() => {
    if (!isLoading && prevStreamRef.current) {
      prevStreamRef.current = "";
    }
  }, [isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    setHistory((prev) => [...prev, { role: "user", text: trimmed }]);
    await sendPrompt(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Markdown styles for assistant messages */}
      <style>{`
        .angi-md h1, .angi-md h2, .angi-md h3 {
          font-weight: 700;
          color: #e2e8f0;
          margin-top: 0.6em;
          margin-bottom: 0.3em;
          line-height: 1.3;
        }
        .angi-md h1 { font-size: 0.85rem; }
        .angi-md h2 { font-size: 0.8rem; }
        .angi-md h3 { font-size: 0.75rem; }
        .angi-md p {
          margin: 0.35em 0;
        }
        .angi-md strong {
          color: #c4b5fd;
          font-weight: 600;
        }
        .angi-md em {
          color: #a5b4fc;
          font-style: italic;
        }
        .angi-md ul, .angi-md ol {
          margin: 0.3em 0;
          padding-left: 1.2em;
        }
        .angi-md ul { list-style-type: disc; }
        .angi-md ol { list-style-type: decimal; }
        .angi-md li {
          margin: 0.15em 0;
        }
        .angi-md li::marker {
          color: #8b5cf6;
        }
        .angi-md code {
          background: rgba(139, 92, 246, 0.15);
          color: #c4b5fd;
          padding: 0.1em 0.35em;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'Fira Code', 'Cascadia Code', monospace;
        }
        .angi-md pre {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.5em 0.7em;
          margin: 0.4em 0;
          overflow-x: auto;
        }
        .angi-md pre code {
          background: transparent;
          padding: 0;
        }
        .angi-md hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin: 0.6em 0;
        }
        .angi-md a {
          color: #a78bfa;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .angi-md blockquote {
          border-left: 2px solid #8b5cf6;
          padding-left: 0.6em;
          margin: 0.4em 0;
          color: #94a3b8;
          font-style: italic;
        }
        .angi-md > *:first-child {
          margin-top: 0;
        }
        .angi-md > *:last-child {
          margin-bottom: 0;
        }
      `}</style>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open Angi AI assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl glass-card shadow-2xl flex flex-col overflow-hidden border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-white">Angi AI</span>
            <span className="ml-auto text-xs text-gray-500">Powered by Claude</span>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto max-h-64 p-3 space-y-3 text-sm">
            {history.length === 0 && (
              <p className="text-gray-500 text-center pt-6 text-xs">
                Try: <em>&quot;Fill the name as José and set email to jose@angi.com&quot;</em>
              </p>
            )}
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/80 text-white"
                    : "bg-white/8 text-gray-200 border border-white/10"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="angi-md">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                  {msg.role === "assistant" && isLoading && i === history.length - 1 && (
                    <span className="ml-1 inline-block w-1.5 h-3 bg-gray-400 animate-pulse rounded-sm" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell Angi what to do..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send prompt"
              className="w-8 h-8 flex-shrink-0 rounded-full bg-primary flex items-center justify-center transition-all hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? (
                <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
