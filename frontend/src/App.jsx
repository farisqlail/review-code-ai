import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import CodeEditor from "./components/CodeEditor.jsx";
import ReviewResult from "./components/ReviewResult.jsx";
import FileUpload from "./components/FileUpload.jsx";

function splitReviewSegments(markdown) {
  if (!markdown) {
    return [];
  }

  const lines = markdown.split("\n");
  const segments = [];
  let inCode = false;
  let currentText = [];
  let currentCode = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (!inCode) {
        if (currentText.length) {
          segments.push({
            type: "text",
            content: currentText.join("\n"),
          });
          currentText = [];
        }
        inCode = true;
      } else {
        segments.push({
          type: "code",
          content: currentCode.join("\n"),
        });
        currentCode = [];
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      currentCode.push(line);
    } else {
      currentText.push(line);
    }
  }

  if (currentText.length) {
    segments.push({
      type: "text",
      content: currentText.join("\n"),
    });
  }

  if (currentCode.length) {
    segments.push({
      type: "code",
      content: currentCode.join("\n"),
    });
  }

  return segments;
}

function normalizeReviewText(text) {
  if (!text) {
    return "";
  }

  return text
    .replace(/^#+\s*/gm, "")
    .replace(/^\*\s+/gm, "• ")
    .trim();
}

function UploadPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const navigate = useNavigate();

  const handleFileLoad = useCallback((payload) => {
    const nextCode = payload?.code || "";
    const nextLanguage = payload?.language;

    if (!nextCode) {
      return;
    }

    setCode(nextCode);

    if (nextLanguage) {
      setLanguage(nextLanguage);
    }
  }, []);

  const goToReview = useCallback(() => {
    if (!code.trim()) {
      return;
    }

    navigate("/review", {
      state: {
        code,
        language,
      },
    });
  }, [code, language, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <img
        src="/assets/images/bg.png"
        alt="Space background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10 md:px-6 md:py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-300">
            AI Code Review Assistant
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
            Good evening, Developer
          </h1>
          <p className="mt-2 text-xl font-medium text-slate-200 md:text-2xl">
            What code would you like me to review today?
          </p>
        </div>

        <main className="flex w-full max-w-3xl flex-col gap-4">
          <section className="flex w-full flex-col gap-3">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur">
              <div className="mb-4 flex flex-col gap-3">
                <FileUpload onLoad={handleFileLoad} isBusy={false} />
              </div>
              <CodeEditor code={code} onSubmit={goToReview} isLoading={false} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCode = typeof location.state?.code === "string" ? location.state.code : "";
  const initialLanguage =
    typeof location.state?.language === "string" ? location.state.language : "JavaScript";

  const [reviewMarkdown, setReviewMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialCode.trim()) {
      navigate("/", { replace: true });
      return;
    }

    async function runReview() {
      setIsLoading(true);
      setError("");
      setReviewMarkdown("");

      try {
        const response = await fetch("/api/review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: initialCode,
            language: initialLanguage,
          }),
        });

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const data = await response.json();

          if (!response.ok) {
            setError(
              typeof data?.error === "string"
                ? data.error
                : "Failed to contact the code review server.",
            );
            return;
          }

          if (typeof data?.review === "string" && data.review.trim()) {
            setReviewMarkdown(data.review);
          } else {
            setError(
              "The model did not return a review result that can be displayed.",
            );
          }
        } else if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() || "";

            for (const part of parts) {
              const line = part.trim();
              if (!line.startsWith("data:")) {
                continue;
              }

              const payload = line.slice(5).trim();
              if (!payload) {
                continue;
              }

              let parsed;
              try {
                parsed = JSON.parse(payload);
              } catch {
                continue;
              }

              if (parsed.error) {
                setError(parsed.error);
              }

              if (parsed.token) {
                setReviewMarkdown((prev) => prev + parsed.token);
              }
            }
          }
        } else {
          setError("Respons server tidak dapat dibaca.");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while processing the code review.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    runReview();

  }, [initialCode, initialLanguage, navigate]);

  const segments = splitReviewSegments(reviewMarkdown || "");

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_60%)] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-sky-300 shadow-sm backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI Code Review Assistant
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
              Your Code Review Results
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Automatic analysis based on the code file you have uploaded.
            </p>
          </div>
          <div className="flex items-end gap-2 text-right text-xs text-slate-400">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 shadow-sm transition hover:border-sky-500 hover:text-white"
            >
              <span className="text-base leading-none">←</span>
              <span>Back to upload</span>
            </button>
            <div className="hidden flex-col items-end md:inline-flex">
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Model
              </span>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 shadow-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
                Groq llama-3.3-70b-versatile
              </span>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 pb-4">
          <section className="flex w-full flex-col gap-3">
            <div className="relative flex h-full flex-col rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.85)] backdrop-blur">
              {isLoading && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/70">
                  <div className="flex flex-col items-center gap-3 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border border-sky-400 border-t-transparent" />
                      <span>AI is analyzing your code...</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      The review results will appear gradually below.
                    </p>
                  </div>
                </div>
              )}
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Review result
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Organized so you can quickly follow up on each point.
                  </p>
                </div>
                {isLoading && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                    Analyzing code...
                  </span>
                )}
              </div>

              {error && (
                <div className="mb-3 rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-xs text-red-100">
                  {error}
                </div>
              )}

              <div className="relative mt-1 flex-1 overflow-hidden">
                <div className="absolute inset-0 overflow-y-auto pr-1">
                  <ReviewResult
                    markdown={reviewMarkdown}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
            {!isLoading && (
              <div className="rounded-2xl border border-sky-800/70 bg-slate-950/80 p-3 text-[11px] text-slate-200 shadow-inner whitespace-pre-wrap">
                {segments.length === 0
                  ? "AI tidak mengembalikan teks review."
                  : segments.map((segment, index) => {
                      if (segment.type === "code") {
                        return (
                          <pre
                            key={`code-${index}`}
                            className="mb-2 overflow-x-auto rounded-lg border border-slate-700/80 bg-slate-900/80 p-2 font-mono text-[10px] text-slate-100"
                          >
                            <code>{segment.content}</code>
                          </pre>
                        );
                      }

                      const normalized = normalizeReviewText(segment.content);

                      if (!normalized) {
                        return null;
                      }

                      return (
                        <p key={`text-${index}`} className="mb-1">
                          {normalized}
                        </p>
                      );
                    })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/review" element={<ReviewPage />} />
    </Routes>
  );
}

export default App;
