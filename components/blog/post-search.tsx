"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty } from "@/components/ui/empty";
import { PostList } from "./post-list";
import type { PostSummary } from "@/lib/posts";

type SearchablePost = PostSummary & { searchText: string };
const normalize = (text: string) => text.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en");

export function PostSearch({ posts }: { posts: SearchablePost[] }) {
  const params = useSearchParams();
  const query = params.get("q")?.trim() || "";
  const category = params.get("category")?.trim().toLowerCase() || "";
  const form = useRef<HTMLFormElement>(null);
  const focusAfterReset = useRef(false);
  const categories = [...new Set(posts.map((post) => post.category))].sort();
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const results = posts.filter((post) =>
    (!category || post.category.toLowerCase() === category) &&
    terms.every((term) => normalize(post.searchText).includes(term)));

  useEffect(() => {
    if (focusAfterReset.current) {
      form.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      focusAfterReset.current = false;
    }
  }, [query, category]);

  function navigateFilters(nextQuery: string, nextCategory: string) {
    const next = new URLSearchParams(window.location.search);
    if (nextQuery.trim()) next.set("q", nextQuery.trim()); else next.delete("q");
    if (nextCategory) next.set("category", nextCategory); else next.delete("category");
    const url = next.size ? `/blog?${next.toString()}` : "/blog";
    if (url !== window.location.pathname + window.location.search) {
      window.history.pushState(null, "", url);
    }
  }

  function draftQuery() {
    return String(new FormData(form.current!).get("q") || "");
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateFilters(draftQuery(), category);
  }

  function reset() {
    focusAfterReset.current = true;
    navigateFilters("", "");
  }

  return (
    <section aria-label="Find a note">
      <div className="writing-tools">
        <form ref={form} role="search" action="/blog" method="get" onSubmit={search} className="writing-search">
          <Label htmlFor="note-search" className="search-label">Search notes</Label>
          <div className="search-controls">
            <div className="search-input-wrap">
              <SearchIcon className="icon" aria-hidden="true" />
              <Input id="note-search" key={query} name="q" type="search" defaultValue={query} placeholder="Try JSON or Rust" maxLength={200} autoComplete="off" className="search-input" />
            </div>
            {category && <Input type="hidden" name="category" value={category} className="hidden" />}
            <Button type="submit" className="primary-action search-submit">Search</Button>
          </div>
        </form>
        <div className="category-filters" role="group" aria-label="Filter notes by category">
          {["All", ...categories].map((label) => {
            const value = label === "All" ? "" : label.toLowerCase();
            return (
              <Button key={label} variant="ghost" className="category-filter" aria-pressed={category === value} onClick={() => navigateFilters(draftQuery(), value)}>
                {label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="results-summary">
        <p role="status" aria-live="polite" aria-atomic="true">
          {results.length} {results.length === 1 ? "note" : "notes"}
          {query && <> for “{query}”</>}
          {category && <> in {categories.find((item) => item.toLowerCase() === category) || `“${category}”`}</>}
        </p>
        {(query || category) && <Button variant="link" className="inline-action reset-filters" onClick={reset}>Clear filters</Button>}
      </div>
      {results.length ? <PostList posts={results} /> : (
        <Empty
          className="search-empty"
          title="No notes found."
          description="Try another phrase, or clear the filters to see all notes."
          action={<Button variant="outline" onClick={reset}>Show all notes</Button>}
        />
      )}
    </section>
  );
}
