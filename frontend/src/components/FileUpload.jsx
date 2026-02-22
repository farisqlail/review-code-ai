const EXTENSION_LANGUAGE_MAP = {
  js: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript",
  py: "Python",
  java: "Java",
  go: "Go",
  php: "PHP",
  rb: "Ruby",
  cs: "C#",
  cpp: "C++",
  c: "C++",
  rs: "Rust",
};

function detectLanguageFromName(name) {
  const parts = name.split(".");
  if (parts.length < 2) {
    return null;
  }
  const ext = parts[parts.length - 1].toLowerCase();
  return EXTENSION_LANGUAGE_MAP[ext] || null;
}

function FileUpload({ onLoad, isBusy }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const lang = detectLanguageFromName(file.name);
      onLoad({
        code: text,
        language: lang,
        fileName: file.name,
      });
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/80 px-6 py-8 text-center text-slate-200 transition hover:border-sky-500/80 hover:bg-slate-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
          ⬆
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Select your file or drag and drop
          </p>
          <p className="text-[11px] text-slate-400">
            .js, .ts, .tsx, .py, .java, .go, .php, .rb and more
          </p>
          <p className="text-[10px] text-slate-500">
            Max 1 file per review. File is not sent until you click Review Code.
          </p>
        </div>
        <button
          type="button"
          className="mt-2 rounded-full bg-sky-500 px-5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600"
        >
          Browse
        </button>
        <input
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.php,.rb,.cs,.cpp,.c,.rs,.txt"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={handleChange}
          disabled={isBusy}
        />
      </label>
    </div>
  );
}

export default FileUpload;
