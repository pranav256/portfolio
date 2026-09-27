import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/blog/markdown";
import { PostList } from "@/components/blog/post-list";
import { ArticleOutline } from "@/components/blog/article-outline";
import { getPost, getPosts, getRelatedPosts } from "@/lib/posts";
import { formatDate, site, socialImage } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article", title: post.title, description: post.description,
      url: `/blog/${post.slug}`, publishedTime: `${post.date}T00:00:00Z`, authors: [site.name], images: [socialImage],
    },
  };
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
          <ArticleOutline headings={post.headings} />
          <div className="article-body">
            <div className="prose"><Markdown content={post.content} /></div>
            <div className="article-end">
              <Button asChild nativeButton={false} role="link" variant="link" className="inline-action">
                <a href={`/blog/${post.slug}/source`} download={`${post.slug}.md`}><ArrowDownIcon className="icon" aria-hidden="true" /> Download Markdown</a>
              </Button>
            </div>
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
