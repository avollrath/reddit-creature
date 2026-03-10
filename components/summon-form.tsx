type SummonFormProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSummoning: boolean;
  feedback: {
    kind: "error" | "success";
    message: string;
  } | null;
};

export default function SummonForm({
  value,
  onChange,
  onSubmit,
  isSummoning,
  feedback,
}: SummonFormProps) {
  const isError = feedback?.kind === "error";

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-lg">
      <label
        htmlFor="username"
        className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-white/55"
      >
        Reddit username
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="username"
          type="search"
          name="reddit-creature-handle"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. andre"
          aria-invalid={isError}
          disabled={isSummoning}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="go"
          className={`h-12 flex-1 rounded-2xl border bg-white/5 px-4 text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-70 focus:bg-white/8 ${
            isError
              ? "border-rose-400/60 focus:border-rose-400/70"
              : "border-white/10 focus:border-emerald-400/60"
          }`}
        />

        <button
          type="submit"
          disabled={isSummoning}
          className="h-12 rounded-2xl bg-emerald-400 px-5 font-semibold text-black transition disabled:cursor-wait disabled:bg-emerald-400/80 hover:scale-[1.02] hover:bg-emerald-300"
        >
          {isSummoning ? "Summoning..." : "Summon"}
        </button>
      </div>

      <p
        className={`mt-3 min-h-5 text-sm ${
          isError ? "text-rose-200/85" : "text-white/60"
        }`}
      >
        {feedback?.message ?? " "}
      </p>

      <div
        className={`mt-3 h-1.5 overflow-hidden rounded-full bg-white/8 transition-opacity ${
          isSummoning ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isSummoning}
      >
        <div className="h-full w-2/5 animate-loading-bar rounded-full bg-emerald-300" />
      </div>
    </form>
  );
}
