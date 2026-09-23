import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/blog/markdown";
import { PostList } from "@/components/blog/post-list";
import { getPost, getPosts, getRelatedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return { title: `${post.title} — Pranav`, description: post.description };
}

export default async function ArticlePage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  return (
    <main id="main" tabIndex={-1} className="container article-page">
      <div className="article-back">
        <Button asChild nativeButton={false} role="link" variant="link" className="inline-action">
          <Link href="/blog"><ArrowLeftIcon className="icon" aria-hidden="true" /> All writing</Link>
        </Button>
      </div>
      <article>
        <header className="article-header">
          <h1>{post.title}</h1>
          <p className="article-description">{post.description}</p>
          <div className="post-meta article-meta">
            <Badge variant="outline" className="post-category">{post.category}</Badge>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>{post.readingMinutes} min read</span>
          </div>
        </header>
        <div className="article-layout">
          <nav className="article-toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              {post.headings.map((heading) => (
                <li key={heading.id} className={heading.depth === 3 ? "toc-nested" : undefined}>
                  <a href={`#${heading.id}`}>{heading.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="article-body">
            <div className="prose"><Markdown content={post.content} /></div>
          </div>
        </div>
      </article>
      <section className="section section-rule related-posts" aria-labelledby="related-title">
        <h2 id="related-title">Keep reading<span className="accent-period">.</span></h2>
        <PostList posts={getRelatedPosts(post)} headingLevel={3} />
      </section>
    </main>
  );
}
