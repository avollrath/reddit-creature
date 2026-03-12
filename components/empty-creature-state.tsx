import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EmptyCreatureState() {
  return (
    <div className="w-full max-w-sm">
      <Card className="relative overflow-hidden rounded-[28px] border border-dashed border-white/10 bg-neutral-950 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.12),_transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_24%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.06)_100%)]" />

        <div className="relative z-10 flex h-[440px] items-center justify-center p-6">
          <div className="max-w-xs text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
              Archive Idle
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
              No player card forged yet
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Enter a Chess.com username or tap an example to preview the frame
              before the live profile reveal begins.
            </p>
          </div>
        </div>

        <CardHeader className="relative z-10 border-t border-white/10 bg-white/[0.03]">
          <CardTitle className="text-xs uppercase tracking-[0.24em] text-white/55">
            Awaiting Player
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 grid grid-cols-3 gap-3 pb-4">
          {["Power", "Speed", "Prestige"].map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center backdrop-blur-sm"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                {label}
              </p>
              <p className="mt-1 text-sm font-bold text-white/35">---</p>
            </div>
          ))}
        </CardContent>

        <CardFooter className="relative z-10 justify-between border-white/10 bg-black/20 text-xs text-white/55 backdrop-blur-sm">
          <span>CTC - Chess.com Trading Card</span>
          <span>Ready to forge</span>
        </CardFooter>
      </Card>
    </div>
  );
}
