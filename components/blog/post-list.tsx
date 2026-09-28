import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/lib/posts";
import { formatDate } from "@/lib/site";

export function PostList({ posts, headingLevel = 2, compact = false }: {
  posts: PostSummary[];
  headingLevel?: 2 | 3;
  compact?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`} className="post-link">
            <div className="post-summary">
              <Heading>{post.title}</Heading>
              {!compact && <>
                <p>{post.description}</p>
                <div className="post-meta">
                  <Badge variant="outline" className="post-category">{post.category}</Badge>
                  <span>{post.readingMinutes} min read</span>
                </div>
              </>}
            </div>
            <div className="post-date">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <ArrowRightIcon className="icon" aria-hidden="true" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
