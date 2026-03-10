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
        className="mb-3 block text-xs font-medium uppercase tracking-[0.24em] text-white/55"
      >
        Choose your summoner
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div
          className={`flex h-12 flex-1 items-center rounded-2xl border bg-white/5 pl-4 transition focus-within:bg-white/8 ${
            isError
              ? "border-rose-400/60 focus-within:border-rose-400/70"
              : "border-white/10 focus-within:border-emerald-400/60"
          } ${isSummoning ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <span className="mr-1.5 text-white/45">u/</span>
          <input
            id="username"
            type="search"
            name="reddit-creature-handle"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="andre"
            aria-invalid={isError}
            disabled={isSummoning}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="go"
            className="h-full flex-1 bg-transparent pr-4 text-white outline-none placeholder:text-white/28"
          />
        </div>

        <button
          type="submit"
          disabled={isSummoning}
          className="h-12 rounded-2xl bg-emerald-400 px-5 font-bold text-black transition disabled:cursor-wait disabled:bg-emerald-400/80 hover:scale-[1.02] hover:bg-emerald-300"
        >
          {isSummoning ? "Conjuring..." : "Reveal My Card"}
        </button>
      </div>

      <p
        className={`mt-3 min-h-5 text-sm ${
          isError ? "text-rose-200/85" : "text-white/60"
        }`}
      >
        {feedback?.message ?? "Just type the username. We handle the u/ magic for you."}
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
