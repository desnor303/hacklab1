import { cn, getDifficultyMeta } from "@/lib/utils";

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  const meta = getDifficultyMeta(difficulty);
  return (
    <span className={cn("badge", meta.className, className)}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}
