import GithubSlugger from "github-slugger";

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trimEnd();

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length;
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .trim();
    const id = slugger.slug(text);

    if (depth >= 2 && depth <= 3) {
      headings.push({ id, text, depth: depth as 2 | 3 });
    }
  }

  return headings;
}
