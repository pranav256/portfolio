import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { toString } from "mdast-util-to-string";

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  featured: boolean;
  readingMinutes: number;
};

export type Post = PostSummary & {
  content: string;
  source: string;
  searchText: string;
  headings: { id: string; title: string; depth: number }[];
};

const postsDirectory = path.join(process.cwd(), "content", "posts");

function readPost(filename: string): Post {
  const source = readFileSync(path.join(postsDirectory, filename), "utf8");
  const { data, content } = matter(source);
  const slug = filename.replace(/\.md$/, "");

  for (const field of ["title", "description", "date", "category"]) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new Error(`${filename}: frontmatter needs a nonempty ${field} string.`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      Number.isNaN(Date.parse(data.date)) ||
      new Date(data.date).toISOString().slice(0, 10) !== data.date) {
    throw new Error(`${filename}: date must be a valid, quoted YYYY-MM-DD date.`);
  }
  if (data.featured !== undefined && typeof data.featured !== "boolean") {
    throw new Error(`${filename}: featured must be true or false.`);
  }

  const tree = unified().use(remarkParse).parse(content);
  const slugger = new GithubSlugger();
  const headings: Post["headings"] = [];
  for (const node of tree.children) {
    if (node.type !== "heading") continue;
    if (node.depth === 1) throw new Error(`${filename}: use ## for article headings; the title is already an h1.`);
    const title = toString(node);
    const id = slugger.slug(title);
    if (node.depth <= 3) headings.push({ id, title, depth: node.depth });
  }
  const plainText = toString(tree);
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: data.title.trim(),
    description: data.description.trim(),
    date: data.date,
    category: data.category.trim(),
    featured: data.featured === true,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
    content,
    source,
    searchText: `${data.title} ${data.description} ${plainText}`,
    headings,
  };
}

// Only enumerated, validated filenames can be read. URL slugs never become paths.
export const getPosts = cache((): Post[] => readdirSync(postsDirectory)
  .filter((filename) => /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(filename))
  .map(readPost)
  .sort((a, b) => b.date.localeCompare(a.date) || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title)));

export const getPost = (slug: string) => getPosts().find((post) => post.slug === slug);

export function summarizePost(post: Post): PostSummary {
  const { slug, title, description, date, category, featured, readingMinutes } = post;
  return { slug, title, description, date, category, featured, readingMinutes };
}

export function getRelatedPosts(post: Post): PostSummary[] {
  return getPosts().filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 2).map(summarizePost);
}
