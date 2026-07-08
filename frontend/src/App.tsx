import React, { useState, useEffect, type FormEvent } from "react";
import "./index.css";

import openaiLogo from "../assets/openai.png";
import geminiLogo from "../assets/gemini.jpg";
import claudeLogo from "../assets/claude.png";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || (window.location.protocol === "file:" ? "http://localhost:7000" : "");

interface ModelResponse {
  model: "openai" | "gemini" | "claude";
  text: string;
  time_taken?: number;
}

interface ConsensusResponse {
  source: string;
  text: string;
  reasoning?: string;
  time_taken?: number;
}

function ModelLogo({
  src,
  alt,
  fallbackType,
}: {
  src: string;
  alt: string;
  fallbackType: "openai" | "gemini" | "claude";
}) {
  const [error, setError] = useState(false);

  if (error) {
    if (fallbackType === "openai") {
      return (
        <svg className="w-3.5 h-3.5 shrink-0 align-middle inline-block text-[#888888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    }
    if (fallbackType === "gemini") {
      return (
        <svg className="w-3.5 h-3.5 shrink-0 align-middle inline-block text-[#888888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 shrink-0 align-middle inline-block text-[#888888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-3.5 h-3.5 object-contain inline-block align-middle rounded-[2px] shrink-0 grayscale-[20%]"
      onError={() => setError(true)}
    />
  );
}

export function App() {
  const [health, setHealth] = useState<"checking" | "online" | "offline">("checking");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkBackendHealth() {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        const data = await res.json();
        if (isMounted && data && data.status === "ok") {
          setHealth("online");
        } else if (isMounted) {
          setHealth("offline");
        }
      } catch (err) {
        if (isMounted) setHealth("offline");
      }
    }
    checkBackendHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResponses([]);
    setConsensus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok) {
        let errorMessage = `Server returned HTTP status ${res.status}`;
        try {
          const errData = await res.json();
          if (errData.error) errorMessage = errData.error;
        } catch (_) {}
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.responses) setResponses(data.responses);
      if (data.consensus) setConsensus(data.consensus);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with the consensus backend.");
    } finally {
      setLoading(false);
    }
  };

  const getResponseForModel = (modelName: "openai" | "gemini" | "claude") => {
    return responses.find((r) => r.model === modelName);
  };

  return (
    <div className="h-screen max-h-screen w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col overflow-hidden bg-[#121212] text-[#f0f0f0]">
      {/* Compact Header & Health Indicator */}
      <header className="flex justify-between items-center pb-3 mb-4 border-b border-[#2d2d2d] shrink-0">
        <div className="flex items-baseline gap-3">
          <h1 className="font-['Outfit',sans-serif] text-xl md:text-2xl font-bold tracking-tight text-[#f0f0f0]">
            Multi-Model Consensus Pipeline
          </h1>
          <span className="text-xs text-[#888888] hidden sm:inline font-sans">
            Parallel LLM Evaluation & Judicial Synthesis
          </span>
        </div>

        {/* Health Indicator Badge (Monochrome / Neutral) */}
        <div
          className="inline-flex items-center gap-2 bg-[#181818] border border-[#2d2d2d] px-3 py-1 rounded-full font-['JetBrains_Mono',monospace] text-xs text-[#888888] shrink-0"
          title={`Ping status of ${API_BASE_URL}/health`}
        >
          {health === "checking" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-pulse" />
              <span>Backend: Checking</span>
            </>
          )}
          {health === "online" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f0f0f0]" />
              <span className="text-[#f0f0f0]">Backend: Online</span>
            </>
          )}
          {health === "offline" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#555555]" />
              <span className="text-[#888888]">Backend: Offline</span>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area (Two Columns, Fill Height without Page Scroll) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* Left Column (7 Columns): Textbox & Stuff at top, 3 Witness Boxes below */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0 h-full">
          
          {/* Top: Textbox & Stuff */}
          <section className="bg-[#181818] border border-[#2d2d2d] rounded-xl p-4 shrink-0 flex flex-col gap-3">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
                placeholder="Ask a question to the expert panel... (e.g., Explain quantum entanglement in simple terms, or Compare Rust vs Go for high-concurrency network services)"
                rows={5}
                required
                className="w-full bg-[#1f1f1f] border border-[#2d2d2d] focus:border-[#555555] rounded-lg p-3 text-[#f0f0f0] placeholder-[#555555] font-sans text-sm resize-none outline-none transition-colors duration-200 disabled:opacity-60"
              />
              <div className="flex justify-between items-center">
                <span className="font-['JetBrains_Mono',monospace] text-xs text-[#888888]">
                  Parallel queries to OpenAI, Gemini & Claude
                </span>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="bg-[#f0f0f0] hover:bg-white disabled:bg-[#2d2d2d] text-[#121212] disabled:text-[#888888] font-['Outfit',sans-serif] font-semibold text-xs md:text-sm px-5 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin" />
                      <span>Consulting Panel...</span>
                    </>
                  ) : (
                    <span>Ask the panel</span>
                  )}
                </button>
              </div>
            </form>

            {/* Pipeline Status Bar */}
            <div className="bg-[#141414] border border-[#2d2d2d] px-3.5 py-1.5 rounded-lg font-['JetBrains_Mono',monospace] text-xs text-[#888888] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {loading ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f0f0f0] animate-pulse" />
                    <span className="text-[#f0f0f0]">Status: Concurrently Querying Witness Models...</span>
                  </>
                ) : consensus ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f0f0f0]" />
                    <span className="text-[#f0f0f0]">Status: Consensus Synthesized</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#555555]" />
                    <span>Status: Awaiting Question</span>
                  </>
                )}
              </div>
              <div className="text-[#555555] hidden md:block">
                Step 1: Witness Testimony &nbsp;&rarr;&nbsp; Step 2: Judicial Verdict
              </div>
            </div>
          </section>

          {/* Error Message Banner (if error) */}
          {error && (
            <div className="bg-[#1f1f1f] border border-[#555555] text-[#f0f0f0] p-3 rounded-xl font-['JetBrains_Mono',monospace] text-xs shrink-0">
              <strong className="font-semibold block mb-0.5 text-[#f0f0f0]">[ ERROR ] Pipeline Execution Failed</strong>
              <span className="text-[#cccccc]">{error}</span>
            </div>
          )}

          {/* Bottom: 3 Boxes of Witness (3 columns side-by-side filling remaining height) */}
          <div className="flex-1 min-h-0 flex flex-col gap-2">
            <h2 className="font-['Outfit',sans-serif] text-sm font-semibold text-[#888888] uppercase tracking-wider px-1">
              Witness Models
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-0">
              {/* OpenAI Card */}
              <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl flex flex-col min-h-0 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]/50 shrink-0">
                  <div className="inline-flex items-center gap-1.5 bg-[#1f1f1f] text-[#f0f0f0] px-2.5 py-0.5 rounded font-['Outfit',sans-serif] font-semibold text-xs border border-[#2d2d2d]">
                    <ModelLogo src={openaiLogo} alt="OpenAI" fallbackType="openai" />
                    <span>OpenAI</span>
                  </div>
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#888888] bg-[#141414] px-1.5 py-0.5 rounded border border-[#2d2d2d]">
                    gpt-5.4-mini
                  </span>
                </div>
                <div className="p-3.5 flex-1 min-h-0 overflow-y-auto text-xs md:text-sm text-[#f0f0f0] whitespace-pre-wrap break-words">
                  {loading ? (
                    <div className="space-y-2.5 py-1 w-full">
                      <div className="skeleton-bar w-[85%]" />
                      <div className="skeleton-bar w-[95%]" />
                      <div className="skeleton-bar w-[60%]" />
                    </div>
                  ) : getResponseForModel("openai") ? (
                    <p>{getResponseForModel("openai")?.text}</p>
                  ) : (
                    <p className="text-[#555555] italic text-center py-4">Waiting for question...</p>
                  )}
                </div>
                <div className="px-3.5 py-2 bg-[#141414] border-t border-[#2d2d2d] font-['JetBrains_Mono',monospace] text-[11px] text-[#888888] flex justify-between items-center shrink-0">
                  <span>
                    {loading
                      ? "Time: Waiting..."
                      : getResponseForModel("openai")?.time_taken !== undefined
                      ? `Time: ${getResponseForModel("openai")?.time_taken?.toFixed(2)}s`
                      : "Time: --"}
                  </span>
                  <span className="text-[#555555]">Witness #1</span>
                </div>
              </div>

              {/* Gemini Card */}
              <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl flex flex-col min-h-0 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]/50 shrink-0">
                  <div className="inline-flex items-center gap-1.5 bg-[#1f1f1f] text-[#f0f0f0] px-2.5 py-0.5 rounded font-['Outfit',sans-serif] font-semibold text-xs border border-[#2d2d2d]">
                    <ModelLogo src={geminiLogo} alt="Gemini" fallbackType="gemini" />
                    <span>Gemini</span>
                  </div>
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#888888] bg-[#141414] px-1.5 py-0.5 rounded border border-[#2d2d2d]">
                    gemini-2.5-flash
                  </span>
                </div>
                <div className="p-3.5 flex-1 min-h-0 overflow-y-auto text-xs md:text-sm text-[#f0f0f0] whitespace-pre-wrap break-words">
                  {loading ? (
                    <div className="space-y-2.5 py-1 w-full">
                      <div className="skeleton-bar w-[90%]" />
                      <div className="skeleton-bar w-[100%]" />
                      <div className="skeleton-bar w-[70%]" />
                    </div>
                  ) : getResponseForModel("gemini") ? (
                    <p>{getResponseForModel("gemini")?.text}</p>
                  ) : (
                    <p className="text-[#555555] italic text-center py-4">Waiting for question...</p>
                  )}
                </div>
                <div className="px-3.5 py-2 bg-[#141414] border-t border-[#2d2d2d] font-['JetBrains_Mono',monospace] text-[11px] text-[#888888] flex justify-between items-center shrink-0">
                  <span>
                    {loading
                      ? "Time: Waiting..."
                      : getResponseForModel("gemini")?.time_taken !== undefined
                      ? `Time: ${getResponseForModel("gemini")?.time_taken?.toFixed(2)}s`
                      : "Time: --"}
                  </span>
                  <span className="text-[#555555]">Witness #2</span>
                </div>
              </div>

              {/* Claude Card */}
              <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl flex flex-col min-h-0 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]/50 shrink-0">
                  <div className="inline-flex items-center gap-1.5 bg-[#1f1f1f] text-[#f0f0f0] px-2.5 py-0.5 rounded font-['Outfit',sans-serif] font-semibold text-xs border border-[#2d2d2d]">
                    <ModelLogo src={claudeLogo} alt="Claude" fallbackType="claude" />
                    <span>Claude</span>
                  </div>
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#888888] bg-[#141414] px-1.5 py-0.5 rounded border border-[#2d2d2d]">
                    claude-3-haiku
                  </span>
                </div>
                <div className="p-3.5 flex-1 min-h-0 overflow-y-auto text-xs md:text-sm text-[#f0f0f0] whitespace-pre-wrap break-words">
                  {loading ? (
                    <div className="space-y-2.5 py-1 w-full">
                      <div className="skeleton-bar w-[80%]" />
                      <div className="skeleton-bar w-[95%]" />
                      <div className="skeleton-bar w-[65%]" />
                    </div>
                  ) : getResponseForModel("claude") ? (
                    <p>{getResponseForModel("claude")?.text}</p>
                  ) : (
                    <p className="text-[#555555] italic text-center py-4">Waiting for question...</p>
                  )}
                </div>
                <div className="px-3.5 py-2 bg-[#141414] border-t border-[#2d2d2d] font-['JetBrains_Mono',monospace] text-[11px] text-[#888888] flex justify-between items-center shrink-0">
                  <span>
                    {loading
                      ? "Time: Waiting..."
                      : getResponseForModel("claude")?.time_taken !== undefined
                      ? `Time: ${getResponseForModel("claude")?.time_taken?.toFixed(2)}s`
                      : "Time: --"}
                  </span>
                  <span className="text-[#555555]">Witness #3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Columns): Judicial Verdict filling height */}
        <div className="lg:col-span-5 flex flex-col gap-2 min-h-0 h-full">
          <h2 className="font-['Outfit',sans-serif] text-sm font-semibold text-[#888888] uppercase tracking-wider px-1">
            Judicial Verdict
          </h2>

          <div
            className={`bg-[#181818] border rounded-xl flex flex-col min-h-0 flex-1 overflow-hidden transition-all duration-500 ${consensus ? "animate-[verdictReveal_0.6s_ease_forwards] border-[#555555]" : "border-[#2d2d2d]"}`}
          >
            <div className="px-5 py-3 border-b border-[#2d2d2d] flex flex-wrap justify-between items-center gap-2 bg-[#1f1f1f]/60 shrink-0">
              <div className="inline-flex items-center gap-2 bg-[#1f1f1f] text-[#f0f0f0] px-3 py-1 rounded-md font-['Outfit',sans-serif] font-semibold text-xs md:text-sm border border-[#3b3b3b]">
                <ModelLogo src={openaiLogo} alt="OpenAI Judge" fallbackType="openai" />
                <span>Judge</span>
              </div>
              <div className="flex items-center gap-2">
                {consensus?.source && (
                  <span className="font-['JetBrains_Mono',monospace] text-[11px] bg-[#141414] text-[#cccccc] px-2 py-0.5 rounded border border-[#2d2d2d] uppercase tracking-wider font-semibold">
                    Source: {consensus.source}
                  </span>
                )}
                <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#888888] bg-[#141414] px-2 py-0.5 rounded border border-[#2d2d2d] font-medium">
                  gpt-5.4-mini
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 min-h-0 overflow-y-auto text-sm md:text-base text-[#f0f0f0] whitespace-pre-wrap break-words leading-relaxed space-y-4">
              {loading ? (
                <div className="flex items-center gap-3 text-[#888888] italic text-xs md:text-sm py-8 justify-center">
                  <span className="w-4 h-4 border-2 border-[#888888]/30 border-t-[#888888] rounded-full animate-spin shrink-0" />
                  <span>Evaluating witness responses & synthesizing verdict...</span>
                </div>
              ) : consensus ? (
                <>
                  <p className="font-medium text-[#f0f0f0]">{consensus.text}</p>
                  
                  {/* Judicial Reasoning Box */}
                  {consensus.reasoning && (
                    <div className="p-3.5 bg-[#1f1f1f] border-l-2 border-l-[#888888] rounded-r-lg text-xs md:text-sm text-[#888888]">
                      <div className="font-['Outfit',sans-serif] font-semibold text-[#f0f0f0] mb-1 uppercase tracking-wide text-[11px] font-mono">
                        Judicial Reasoning
                      </div>
                      <p className="leading-relaxed text-[#cccccc]">{consensus.reasoning}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[#555555] italic text-center text-xs md:text-sm py-8">
                  Submit a prompt above to convene the panel and receive a judicial verdict.
                </p>
              )}
            </div>

            <div className="px-5 py-2.5 bg-[#141414] border-t border-[#2d2d2d] font-['JetBrains_Mono',monospace] text-xs text-[#888888] flex justify-between items-center shrink-0">
              <span>
                {loading
                  ? "Total Pipeline Time: Calculating..."
                  : consensus?.time_taken !== undefined
                  ? `Total Pipeline Time: ${consensus.time_taken.toFixed(2)}s`
                  : "Total Pipeline Time: --"}
              </span>
              <span className="text-[#888888] font-medium">Final Consensus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
