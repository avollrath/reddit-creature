type ExampleUsernamesProps = {
  usernames: string[];
  activeUsername: string | null;
  disabled: boolean;
  onSelect: (username: string) => void;
};

export default function ExampleUsernames({
  usernames,
  activeUsername,
  disabled,
  onSelect,
}: ExampleUsernamesProps) {
  return (
    <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/65">
      {usernames.map((username) => {
        const isActive = activeUsername === username;

        return (
          <button
            key={username}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(username)}
            className={`rounded-full border px-4 py-2 transition ${
              isActive
                ? "border-white bg-white/10 text-white"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            @{username}
          </button>
        );
      })}
    </div>
  );
}
