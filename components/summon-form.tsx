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
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-8 flex w-full max-w-2xl flex-col items-center"
    >
      <label
        htmlFor="username"
        className="mb-3 block text-center text-xs font-medium uppercase tracking-[0.24em] text-white/55"
      >
        Enter a Chess.com username
      </label>

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:items-stretch">
        <div
          className={`flex h-14 w-full max-w-md items-center rounded-2xl border bg-white/5 pl-4 transition focus-within:bg-white/8 sm:h-12 sm:w-[380px] sm:max-w-none ${
            isError
              ? "border-rose-400/60 focus-within:border-rose-400/70"
              : "border-white/10 focus-within:border-emerald-400/60"
          } ${isSummoning ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <span className="mr-1.5 text-white/45">@</span>
          <input
            id="username"
            type="search"
            name="chess-player-handle"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="hikaru"
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
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 font-bold text-black transition disabled:cursor-wait disabled:bg-emerald-400/80 hover:scale-[1.02] hover:bg-emerald-300 sm:h-12"
        >
          <span aria-hidden="true" className="text-base leading-none">
            
          </span>
          {isSummoning ? "Creating..." : "Create Card"}
        </button>
      </div>

      <p
        className={`mt-3 min-h-5 text-sm ${
          isError ? "text-rose-200/85" : "text-white/60"
        } text-center`}
      >
        {feedback?.message ??
          "You can paste a username, @handle, or Chess.com profile link."}
      </p>

      <div
        className={`mt-3 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/8 transition-opacity sm:w-[380px] sm:max-w-none ${
          isSummoning ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isSummoning}
      >
        <div className="h-full w-2/5 animate-loading-bar rounded-full bg-emerald-300" />
      </div>
    </form>
  );
}
