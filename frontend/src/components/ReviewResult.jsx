function splitIntoSegments(markdown) {
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

function normalizeText(text) {
  if (!text) {
    return "";
  }

  return text
    .replace(/^#+\s*/gm, "")
    .replace(/^\*\s+/gm, "• ")
    .trim();
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-32 animate-pulse rounded-full bg-slate-800/80" />
      <div className="h-24 animate-pulse rounded-xl bg-slate-900/80" />
      <div className="h-4 w-40 animate-pulse rounded-full bg-slate-800/80" />
      <div className="h-24 animate-pulse rounded-xl bg-slate-900/80" />
    </div>
  );
}

function ReviewResult({ markdown, isLoading }) {
  const segments = splitIntoSegments(markdown);
  const hasContent = segments.some(
    (segment) => segment.content && segment.content.trim(),
  );

  if (!hasContent && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-700/70 bg-slate-950/60 px-6 py-10 text-center text-sm text-slate-400">
        The review result will appear here after you send your code. Start by
        uploading a function or component on the left panel.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-2">
      <SectionCard title="Review result">
        <div className="space-y-3 text-[13px] leading-relaxed text-slate-100">
          {segments.map((segment, index) => {
            if (segment.type === "code") {
              return (
                <pre
                  key={`code-${index}`}
                  className="overflow-x-auto rounded-lg border border-slate-700/80 bg-slate-900/80 p-3 font-mono text-xs text-slate-100"
                >
                  <code>{segment.content}</code>
                </pre>
              );
            }

            const normalized = normalizeText(segment.content);

            if (!normalized) {
              return null;
            }

            return (
              <p
                key={`text-${index}`}
                className="whitespace-pre-wrap text-slate-100"
              >
                {normalized}
              </p>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children, actions }) {
  return (
    <section className="group rounded-xl border border-slate-800/80 bg-slate-950/80 p-3.5 shadow-sm transition hover:border-sky-700/70 hover:bg-slate-950">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-semibold text-slate-100">{title}</h2>
        {actions}
      </div>
      <div className="text-[13px] leading-relaxed text-slate-100 group-hover:text-slate-50">
        {children}
      </div>
    </section>
  );
}

export default ReviewResult;
