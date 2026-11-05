import Link from "next/link";
import { Terminal } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-acid text-ink-950 shadow-glow transition group-hover:bg-acid-soft">
        <Terminal className="h-5 w-5" strokeWidth={2.6} />
      </span>
      <span className="font-mono text-[17px] font-bold tracking-tight text-white">
        hack<span className="text-acid">lab</span>
        <span className="animate-blink text-acid">_</span>
      </span>
    </Link>
  );
}
