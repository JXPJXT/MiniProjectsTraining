/* ══════════════════════════════════════════════════════
   StudyDocs RAG — Frontend Logic
   ══════════════════════════════════════════════════════ */

const API_BASE = window.location.origin;

// ─── State ──────────────────────────────────────────────
const state = {
    engine: "pure",
    isStreaming: false,
    messages: [],
    theme: localStorage.getItem("rag-theme") || "dark",
};

// ─── DOM Elements ───────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
    queryInput: $("#query-input"),
    btnSend: $("#btn-send"),
    btnIngest: $("#btn-ingest"),
    chatMessages: $("#chat-messages"),
    chatArea: $("#chat-area"),
    welcomeScreen: $("#welcome-screen"),
    ingestPanel: $("#ingest-panel"),
    ingestTitle: $("#ingest-title"),
    ingestMessage: $("#ingest-message"),
    progressBar: $("#progress-bar"),
    engineBadge: $("#engine-badge"),
    charCount: $("#char-count"),
    themeToggle: $("#theme-toggle"),
    ollamaPill: $("#ollama-pill"),
    docCount: $("#doc-count"),
    tabPure: $("#tab-pure"),
    tabLangchain: $("#tab-langchain"),
};

// ─── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    applyTheme(state.theme);
    setupEventListeners();
    checkStatus();
    autoResizeTextarea();
});

// ─── Theme ──────────────────────────────────────────────
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    state.theme = theme;
    localStorage.setItem("rag-theme", theme);
}

// ─── Event Listeners ────────────────────────────────────
function setupEventListeners() {
    // Theme toggle
    els.themeToggle.addEventListener("click", () => {
        applyTheme(state.theme === "dark" ? "light" : "dark");
    });

    // Engine tabs
    $$(".engine-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            const engine = tab.dataset.engine;
            state.engine = engine;
            $$(".engine-tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            updateEngineBadge();
        });
    });

    // Send
    els.btnSend.addEventListener("click", handleSend);
    els.queryInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Char count
    els.queryInput.addEventListener("input", () => {
        const len = els.queryInput.value.length;
        els.charCount.textContent = `${len} / 2000`;
        autoResizeTextarea();
    });

    // Ingest
    els.btnIngest.addEventListener("click", handleIngest);

    // Example queries
    $$(".example-query").forEach((btn) => {
        btn.addEventListener("click", () => {
            els.queryInput.value = btn.dataset.query;
            els.charCount.textContent = `${btn.dataset.query.length} / 2000`;
            autoResizeTextarea();
            handleSend();
        });
    });
}

function autoResizeTextarea() {
    const t = els.queryInput;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 120) + "px";
}

function updateEngineBadge() {
    const labels = {
        pure: "⚡ Pure Python",
        langchain: "🔗 LangChain",
    };
    els.engineBadge.textContent = labels[state.engine] || state.engine;
}

// ─── Status Check ───────────────────────────────────────
async function checkStatus() {
    try {
        const res = await fetch(`${API_BASE}/api/status`);
        const data = await res.json();

        // Ollama status
        const connected =
            data.pure?.ollama_connected || data.langchain?.ollama_connected;
        if (connected) {
            els.ollamaPill.classList.add("connected");
        } else {
            els.ollamaPill.classList.remove("connected");
        }

        // Doc count
        const pdfCount = data.pure?.pdf_count || data.langchain?.pdf_count || 0;
        const chunkCount =
            data.pure?.indexed_chunks || data.langchain?.indexed_chunks || 0;
        els.docCount.textContent = `${pdfCount} docs · ${chunkCount} chunks`;
    } catch (e) {
        console.warn("Status check failed:", e);
    }
}

// ─── Ingest ─────────────────────────────────────────────
async function handleIngest() {
    els.btnIngest.disabled = true;
    els.ingestPanel.style.display = "block";
    els.ingestPanel.className = "ingest-panel";
    els.ingestTitle.textContent = "Ingesting Study Materials...";
    els.ingestMessage.textContent =
        `Processing PDFs for ${state.engine === "pure" ? "Pure Python" : "LangChain"} engine`;
    els.progressBar.style.width = "10%";

    // Animate progress
    let progress = 10;
    const interval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 5, 85);
        els.progressBar.style.width = `${progress}%`;
    }, 800);

    try {
        const res = await fetch(`${API_BASE}/api/ingest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                engine: state.engine,
                force: false,
            }),
        });

        clearInterval(interval);
        const data = await res.json();

        const result = data[state.engine] || data;
        els.progressBar.style.width = "100%";
        els.ingestPanel.classList.add("success");
        els.ingestTitle.textContent = "✓ Ingestion Complete";
        els.ingestMessage.textContent = result.message || "Study materials indexed successfully.";

        // Auto-hide after 5s
        setTimeout(() => {
            els.ingestPanel.style.display = "none";
        }, 5000);

        checkStatus();
    } catch (e) {
        clearInterval(interval);
        els.ingestPanel.classList.add("error");
        els.ingestTitle.textContent = "✗ Ingestion Failed";
        els.ingestMessage.textContent = `Error: ${e.message}`;
    }

    els.btnIngest.disabled = false;
}

// ─── Send Query ─────────────────────────────────────────
async function handleSend() {
    const question = els.queryInput.value.trim();
    if (!question || state.isStreaming) return;

    state.isStreaming = true;
    els.btnSend.disabled = true;
    els.queryInput.value = "";
    els.charCount.textContent = "0 / 2000";
    autoResizeTextarea();

    // Hide welcome
    if (els.welcomeScreen) {
        els.welcomeScreen.style.display = "none";
    }

    // Add user message
    addUserMessage(question);

    // Add AI placeholder
    const aiMsg = addAIMessage();
    const bubble = aiMsg.querySelector(".ai-text");
    const sourcesContainer = aiMsg.querySelector(".sources-container");
    const metaContainer = aiMsg.querySelector(".message-meta");

    // Typing indicator
    bubble.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

    try {
        const startTime = performance.now();

        const res = await fetch(`${API_BASE}/api/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question,
                engine: state.engine,
                top_k: 5,
                stream: true,
            }),
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let sources = [];
        let firstToken = true;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n").filter((l) => l.trim());

            for (const line of lines) {
                try {
                    const data = JSON.parse(line);

                    if (data.type === "sources") {
                        sources = data.sources || [];
                        renderSources(sourcesContainer, sources);
                    } else if (data.type === "token") {
                        if (firstToken) {
                            bubble.textContent = "";
                            firstToken = false;
                        }
                        fullText += data.content;
                        bubble.textContent = fullText;
                        scrollToBottom();
                    } else if (data.type === "done") {
                        // Finished
                    }
                } catch (parseErr) {
                    // Skip malformed JSON
                }
            }
        }

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        metaContainer.innerHTML = `
            <span>⏱ ${elapsed}s</span>
            <span>📎 ${sources.length} sources</span>
            <span>🔧 ${state.engine === "pure" ? "Pure Python" : "LangChain"}</span>
        `;

        if (!fullText) {
            bubble.textContent = "No response received. Is Ollama running?";
            bubble.classList.add("error-text");
        }
    } catch (e) {
        bubble.textContent = `Error: ${e.message}. Make sure the server and Ollama are running.`;
        bubble.classList.add("error-text");
    }

    state.isStreaming = false;
    els.btnSend.disabled = false;
    els.queryInput.focus();
}

// ─── Message Rendering ─────────────────────────────────
function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message user";
    msg.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-body">
            <div class="message-bubble">${escapeHtml(text)}</div>
        </div>
    `;
    els.chatMessages.appendChild(msg);
    scrollToBottom();
    return msg;
}

function addAIMessage() {
    const msg = document.createElement("div");
    msg.className = "message ai";
    msg.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-body">
            <div class="message-bubble">
                <span class="ai-text"></span>
            </div>
            <div class="sources-container"></div>
            <div class="message-meta"></div>
        </div>
    `;
    els.chatMessages.appendChild(msg);
    scrollToBottom();
    return msg;
}

function renderSources(container, sources) {
    if (!sources || sources.length === 0) {
        container.innerHTML = "";
        return;
    }

    const id = "src-" + Date.now();
    container.innerHTML = `
        <div class="sources-panel">
            <div class="sources-header" id="${id}-header">
                <span class="toggle-icon">▶</span>
                <span>📎 ${sources.length} Sources Retrieved</span>
            </div>
            <div class="sources-list" id="${id}-list">
                ${sources
            .map(
                (s) => `
                    <div class="source-item">
                        <span class="source-file">📄 ${escapeHtml(truncate(s.filename, 40))}</span>
                        ${s.score ? `<span class="source-score">${(s.score * 100).toFixed(1)}%</span>` : ""}
                        <span class="source-snippet">${escapeHtml(truncate(s.snippet, 120))}</span>
                    </div>
                `
            )
            .join("")}
            </div>
        </div>
    `;

    // Toggle
    const header = container.querySelector(`#${id}-header`);
    const list = container.querySelector(`#${id}-list`);
    header.addEventListener("click", () => {
        header.classList.toggle("expanded");
        list.classList.toggle("expanded");
    });
}

// ─── Utilities ──────────────────────────────────────────
function scrollToBottom() {
    els.chatArea.scrollTop = els.chatArea.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "…" : str;
}

// Periodically check status
setInterval(checkStatus, 30000);
