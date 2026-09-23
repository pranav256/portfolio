import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { CodeBlock } from "@/components/ui/code-block";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      skipHtml
      components={{
        h2: ({ id, children }) => <h2 id={id}><a className="heading-anchor" href={`#${id}`}>{children}<span aria-hidden="true">#</span></a></h2>,
        h3: ({ id, children }) => <h3 id={id}><a className="heading-anchor" href={`#${id}`}>{children}<span aria-hidden="true">#</span></a></h3>,
        pre: ({ children }) => {
          const code = Children.toArray(children)[0];
          if (isValidElement<{ className?: string; children?: ReactNode }>(code)) {
            const language = code.props.className?.replace("language-", "") || "text";
            return <CodeBlock code={String(code.props.children ?? "").replace(/\n$/, "")} language={language} className="article-code" />;
          }
          return <pre>{children}</pre>;
        },
        table: ({ children }) => <Table>{children}</Table>,
        thead: ({ children }) => <TableHeader>{children}</TableHeader>,
        tbody: ({ children }) => <TableBody>{children}</TableBody>,
        tr: ({ children }) => <TableRow>{children}</TableRow>,
        th: ({ children }) => <TableHead>{children}</TableHead>,
        td: ({ children }) => <TableCell>{children}</TableCell>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
