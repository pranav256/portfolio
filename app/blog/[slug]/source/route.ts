import { getPost, getPosts } from "@/lib/posts";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) return new Response("Note not found.", { status: 404 });
  return new Response(post.source, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${post.slug}.md"`,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
