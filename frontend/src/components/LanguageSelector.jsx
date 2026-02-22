const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "PHP",
  "C#",
  "C++",
  "Ruby",
  "Rust",
];

function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          Bahasa pemrograman
        </label>
        <span className="text-[10px] text-slate-500">
          Digunakan sebagai konteks untuk AI reviewer
        </span>
      </div>
      <select
        className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 shadow-sm outline-none ring-offset-slate-950 placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
