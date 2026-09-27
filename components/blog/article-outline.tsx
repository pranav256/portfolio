import { ArrowDownIcon } from "@/components/icons";
import type { Post } from "@/lib/posts";

function OutlineLinks({ headings }: { headings: Post["headings"] }) {
  return <ol>{headings.map((heading) => (
    <li key={heading.id} className={heading.depth === 3 ? "toc-nested" : undefined}>
      <a href={`#${heading.id}`}>{heading.title}</a>
    </li>
  ))}</ol>;
}

export function ArticleOutline({ headings }: { headings: Post["headings"] }) {
  if (!headings.length) return null;
  return (
    <div className="article-toc">
      <nav className="article-outline-desktop" aria-label="On this page">
        <p className="outline-title">On this page</p>
        <OutlineLinks headings={headings} />
      </nav>
      <details className="article-outline-mobile">
        <summary>On this page <ArrowDownIcon className="icon" aria-hidden="true" /></summary>
        <nav aria-label="On this page"><OutlineLinks headings={headings} /></nav>
      </details>
    </div>
  );
}
