function CodeEditor({ code, onSubmit, isLoading }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-slate-100">
            File ready to review
          </span>
          <span className="text-[11px] text-slate-500">
            Upload a code file first, then start the review process.
          </span>
        </div>
        {code && (
          <span className="hidden text-[11px] text-slate-500 md:inline">
            {code.length.toLocaleString()} characters
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!code.trim() || isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-sky-600 hover:shadow-[0_10px_30px_rgba(56,189,248,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border border-sky-100 border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>Review Code</>
          )}
        </button>
      </div>
    </div>
  );
}

export default CodeEditor;
