import {
  Binary,
  BookOpen,
  Braces,
  Database,
  Network,
  ShieldCheck,
  Terminal,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  network: Network,
  terminal: Terminal,
  braces: Braces,
  database: Database,
  binary: Binary,
  book: BookOpen,
};

export function CategoryIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Icon = ICONS[name || ""] || BookOpen;
  return <Icon className={className} />;
}
