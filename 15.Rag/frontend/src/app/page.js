"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

const API = "/api";

const EXAMPLES = [
  { icon: "🔧", label: "SDLC phases", query: "Explain the different phases of the Software Development Life Cycle" },
  { icon: "🌐", label: "OSI model layers", query: "Describe the 7 layers of the OSI model and their functions" },
  { icon: "📊", label: "Sorting algorithms", query: "Compare quicksort, mergesort and heapsort in terms of time complexity" },
  { icon: "🤖", label: "ML basics", query: "What is the difference between supervised and unsupervised learning?" },
  { icon: "💻", label: "OS scheduling", query: "Explain CPU scheduling algorithms like FCFS, SJF, and Round Robin" },
  { icon: "🐍", label: "Python decorators", query: "How do decorators work in Python? Give examples" },
];

export default function Home() {
  /* ─── State ──────────────────────────────── */
  const [theme, setTheme] = useState("dark");
  const [engine, setEngine] = useState("pure");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [ollamaOk, setOllamaOk] = useState(false);
  const [docCount, setDocCount] = useState(0);
  const [ingest, setIngest] = useState({ show: false, status: "", title: "", msg: "", progress: 0 });

  const chatRef = useRef(null);
  const inputRef = useRef(null);

  /* ─── Theme ──────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("rag-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("rag-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  /* ─── Status polling ─────────────────────── */
  const checkStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API}/status/${engine}`);
      const d = await r.json();
      setOllamaOk(d.ollama_connected);
      setDocCount(d.indexed_chunks || 0);
    } catch {
      setOllamaOk(false);
    }
  }, [engine]);

  useEffect(() => {
    checkStatus();
    const id = setInterval(checkStatus, 15000);
    return () => clearInterval(id);
  }, [checkStatus]);

  /* ─── Auto-scroll ─────────────────────────── */
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  /* ─── Ingest ─────────────────────────────── */
  const handleIngest = async () => {
    setIngest({ show: true, status: "running", title: "Ingesting Study Materials…", msg: "Processing all PDFs in the datasets folder.", progress: 10 });
    try {
      setIngest((s) => ({ ...s, progress: 30, msg: "Loading & chunking PDFs…" }));
      const r = await fetch(`${API}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engine, force: false }),
      });

      const text = await r.text();
      if (!r.ok) {
        throw new Error(`Server error (${r.status}): ${text.slice(0, 200)}`);
      }

      const d = JSON.parse(text);
      const result = d[engine] || d;
      const isAlready = result.status === "already_ingested";
      setIngest({
        show: true,
        status: "success",
        title: isAlready ? "Already Indexed ✓" : "Ingestion Complete ✓",
        msg: result.message || `${result.total_chunks} chunks indexed.`,
        progress: 100,
      });
      checkStatus();
      setTimeout(() => setIngest((s) => ({ ...s, show: false })), 5000);
    } catch (e) {
      setIngest({ show: true, status: "error", title: "Ingestion Failed", msg: e.message || String(e), progress: 0 });
      setTimeout(() => setIngest((s) => ({ ...s, show: false })), 8000);
    }
  };

  /* ─── Query (streaming) ──────────────────── */
  const sendQuery = async (q) => {
    const question = q || input.trim();
    if (!question || isStreaming) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: question }]);
    setIsStreaming(true);

    const aiIdx = Date.now();
    setMessages((m) => [...m, { role: "ai", id: aiIdx, content: "", sources: [], loading: true }]);

    try {
      const r = await fetch(`${API}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, engine, top_k: 5, stream: true }),
      });

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === "sources") {
              setMessages((m) =>
                m.map((msg) => (msg.id === aiIdx ? { ...msg, sources: data.sources } : msg))
              );
            } else if (data.type === "token") {
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === aiIdx ? { ...msg, content: msg.content + data.content, loading: false } : msg
                )
              );
            } else if (data.type === "done") {
              setMessages((m) =>
                m.map((msg) => (msg.id === aiIdx ? { ...msg, loading: false } : msg))
              );
            }
          } catch { }
        }
      }
    } catch (e) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === aiIdx ? { ...msg, content: `Error: ${e.message}`, loading: false } : msg
        )
      );
    }

    setIsStreaming(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  };

  /* ─── Render ─────────────────────────────── */
  return (
    <>
      {/* Background */}
      <div className="bg-effects">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />
      </div>

      <div className="app-container">
        {/* ─ Header ─ */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo-mark">📚</div>
            <div className="header-title">
              <h1>StudyDocs <span className="accent">RAG</span></h1>
              <p className="subtitle">AI Study Assistant</p>
            </div>
          </div>
          <div className="header-right">
            <div className="status-pills">
              <div className={`pill ${ollamaOk ? "connected" : ""}`}>
                <span className="pill-dot" />
                {ollamaOk ? "Ollama" : "Offline"}
              </div>
              <div className={`pill ${docCount > 0 ? "connected" : ""}`}>
                <span className="pill-dot" />
                {docCount} chunks
              </div>
            </div>
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* ─ Engine Selector ─ */}
        <div className="engine-selector">
          <div className="engine-tabs">
            <button
              className={`engine-tab ${engine === "pure" ? "active" : ""}`}
              onClick={() => { setEngine("pure"); setDocCount(0); }}
            >
              <span className="tab-icon">⚡</span>
              <span className="tab-content">
                <span className="tab-label">Pure Python</span>
                <span className="tab-desc">Zero frameworks</span>
              </span>
            </button>
            <button
              className={`engine-tab ${engine === "langchain" ? "active" : ""}`}
              onClick={() => { setEngine("langchain"); setDocCount(0); }}
            >
              <span className="tab-icon">🔗</span>
              <span className="tab-content">
                <span className="tab-label">LangChain</span>
                <span className="tab-desc">LCEL pipeline</span>
              </span>
            </button>
          </div>
          <button className="btn-ingest" onClick={handleIngest} disabled={ingest.status === "running"}>
            📥 Ingest PDFs
          </button>
        </div>

        {/* ─ Ingest Panel ─ */}
        {ingest.show && (
          <div className={`ingest-panel ${ingest.status}`}>
            <div className="ingest-content">
              {ingest.status === "running" && <div className="ingest-spinner" />}
              {ingest.status === "success" && <span style={{ fontSize: "1.5rem" }}>✅</span>}
              {ingest.status === "error" && <span style={{ fontSize: "1.5rem" }}>❌</span>}
              <div className="ingest-info">
                <h3>{ingest.title}</h3>
                <p>{ingest.msg}</p>
              </div>
            </div>
            {ingest.status === "running" && (
              <div className="ingest-progress">
                <div className="progress-bar" style={{ width: `${ingest.progress}%` }} />
              </div>
            )}
          </div>
        )}

        {/* ─ Chat Area ─ */}
        <div className="chat-area" ref={chatRef}>
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon" style={{ fontSize: "3.5rem" }}>📚</div>
              <h2>Ask anything about your Study Materials</h2>
              <p>
                Powered by <strong>Ollama qwen2.5:7b</strong> running locally.
                <br />
                Choose an engine above, ingest your PDFs, then start asking questions.
              </p>
              <div className="example-queries">
                {EXAMPLES.map((ex) => (
                  <button key={ex.label} className="example-query" onClick={() => sendQuery(ex.query)}>
                    {ex.icon} {ex.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === "user" ? "👤" : "🤖"}</div>
                  <div className="message-body">
                    <div className="message-bubble">
                      {msg.role === "ai" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                      {msg.loading && (
                        <span className="typing-indicator">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </span>
                      )}
                    </div>
                    {msg.sources && msg.sources.length > 0 && <SourcesPanel sources={msg.sources} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─ Input ─ */}
        <div className="input-bar">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about SE, DSA, OS, CN, ML, Python…"
              rows={1}
              maxLength={2000}
              disabled={isStreaming}
              aria-label="Ask a question"
            />
            <button className="btn-send" onClick={() => sendQuery()} disabled={!input.trim() || isStreaming}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="input-footer">
            <span className="engine-badge">{engine === "pure" ? "⚡ Pure Python" : "🔗 LangChain"}</span>
            <span className="char-count">{input.length}/2000</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Sources sub-component ─────────────────── */
function SourcesPanel({ sources }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="sources-panel">
      <div className={`sources-header ${expanded ? "expanded" : ""}`} onClick={() => setExpanded(!expanded)}>
        <span className="toggle-icon">▶</span>
        📎 {sources.length} source{sources.length !== 1 ? "s" : ""} retrieved
      </div>
      <div className={`sources-list ${expanded ? "expanded" : ""}`}>
        {sources.map((s, i) => (
          <div key={i} className="source-item">
            <span className="source-file">{truncate(s.filename, 35)}</span>
            {s.score > 0 && <span className="source-score">{(s.score * 100).toFixed(0)}%</span>}
            <span className="source-snippet">{s.snippet}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function truncate(str, n) {
  if (!str) return "unknown";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
