"use client";

/**
 * Tiny dependency-free markdown renderer for AI responses.
 * Handles ## / ### headings, - bullets, **bold**, `code`, and --- rules.
 */
type Block =
  | { type: "h2" | "h3" | "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "hr" };

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let list: string[] = [];

  const flush = () => {
    if (list.length) {
      blocks.push({ type: "ul", items: [...list] });
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) list.push(line.replace(/^\s*[-*]\s+/, ""));
    else if (/^###\s+/.test(line)) {
      flush();
      blocks.push({ type: "h3", text: line.replace(/^###\s+/, "") });
    } else if (/^##\s+/.test(line)) {
      flush();
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
    } else if (/^#\s+/.test(line)) {
      flush();
      blocks.push({ type: "h2", text: line.replace(/^#\s+/, "") });
    } else if (line.trim() === "---") {
      flush();
      blocks.push({ type: "hr" });
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      blocks.push({ type: "p", text: line });
    }
  }
  flush();

  return (
    <div className="ai-prose">
      {blocks.map((b, i) => {
        if (b.type === "h2") return <h2 key={i} dangerouslySetInnerHTML={inline(b.text)} />;
        if (b.type === "h3") return <h3 key={i} dangerouslySetInnerHTML={inline(b.text)} />;
        if (b.type === "hr") return <hr key={i} />;
        if (b.type === "ul")
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j} dangerouslySetInnerHTML={inline(it)} />
              ))}
            </ul>
          );
        return <p key={i} dangerouslySetInnerHTML={inline(b.text)} />;
      })}
    </div>
  );
}

function inline(text: string): { __html: string } {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+?)`/g, '<code class="text-gold-soft">$1</code>');
  return { __html: html };
}
