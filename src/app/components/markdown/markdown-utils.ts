// markdown-utils.ts

/**
 * Convert markdown to HTML for the WYSIWYG editor's contentEditable DOM.
 *
 * @param raw            - The raw markdown string.
 * @param resolveImageSrc - Optional callback applied to every image `src` before
 *                          it is written into the `<img>` tag.  Pass
 *                          `resolveImageUrl` from `@/lib/cloudinary/helpers` so
 *                          the editor renders the same Cloudinary-optimised URLs
 *                          that `<CloudinaryImage>` / `MarkdownRenderer` produce.
 */
export function mdToHtml(
  raw: string,
  resolveImageSrc?: (src: string) => string,
): string {
  let s = raw;

  // Fenced code blocks first — ([^\n`]*) captures any lang tag including empty, emoji, spaces
  s = s.replace(/```([^\n`]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code
      .trimEnd()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Collapse internal newlines to a placeholder so the line-by-line loop below
    // doesn't treat each code line as a separate paragraph / empty line
    const singleLine = escaped.replace(/\n/g, "␤");
    return `<pre data-lang="${lang || ""}"><code>${singleLine}</code></pre>`;
  });

  // Scoped inline renderer — captures resolveImageSrc so every <img> src in
  // this mdToHtml call goes through the same resolver as MarkdownRenderer.
  const inline = (text: string) => inlineMd(text, resolveImageSrc);

  const lines = s.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Already-rendered pre block — restore collapsed newlines and pass through
    if (line.startsWith("<pre")) {
      out.push(line.replace(/␤/g, "\n"));
      i++;
      continue;
    }

    // Headings
    const hm = line.match(/^(#{1,6})\s+(.*)/);
    if (hm) {
      out.push(`<h${hm[1].length}>${inline(hm[2])}</h${hm[1].length}>`);
      i++;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      out.push("<hr />");
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s/.test(line)) {
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        const text = lines[i].replace(/^[-*+]\s/, "");
        if (/^\[( |x)\]\s/.test(text)) {
          const checked = text.startsWith("[x]");
          const label = text.replace(/^\[( |x)\]\s/, "");
          items.push(
            `<li class="task-item"><input type="checkbox" ${checked ? "checked" : ""} disabled />${inline(label)}</li>`,
          );
        } else {
          items.push(`<li>${inline(text)}</li>`);
        }
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Table
    if (
      /^\|/.test(line) &&
      i + 1 < lines.length &&
      /^\|[-| :]+\|/.test(lines[i + 1])
    ) {
      const headers = line
        .split("|")
        .filter((c) => c.trim())
        .map((c) => `<th>${inline(c.trim())}</th>`)
        .join("");
      i += 2;
      const rows: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        const cells = lines[i]
          .split("|")
          .filter((c) => c.trim())
          .map((c) => `<td>${inline(c.trim())}</td>`)
          .join("");
        rows.push(`<tr>${cells}</tr>`);
        i++;
      }
      out.push(
        `<table><thead><tr>${headers}</tr></thead><tbody>${rows.join("")}</tbody></table>`,
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      out.push("<p><br /></p>");
      i++;
      continue;
    }

    // Paragraph
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }

  return out.join("\n");
}

function inlineMd(
  s: string,
  resolveImageSrc?: (src: string) => string,
): string {
  // ── Stash image tags BEFORE any inline substitution ───────────────────────
  // Image srcs often contain underscores (f_auto, q_auto, w_1200, h_800…) that
  // the italic regex `_text_` would corrupt.  Replace each image markdown token
  // with a null-byte placeholder, run all inline rules, then restore at the end.
  // This mirrors the same protection used in MarkdownRenderer.
  const imgStash: string[] = [];
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    // Mirror CloudinaryImage: only resolve non-http srcs (Cloudinary public IDs).
    const resolved =
      resolveImageSrc && !src.startsWith("http") ? resolveImageSrc(src) : src;
    imgStash.push(`<img src="${resolved}" alt="${alt}" class="md-img" />`);
    return `\x00IMG${imgStash.length - 1}\x00`;
  });

  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/_(.+?)_/g, "<em>$1</em>");
  s = s.replace(/~~(.+?)~~/g, "<del>$1</del>");
  s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>");

  // ── Restore stashed image tags ────────────────────────────────────────────
  s = s.replace(/\x00IMG(\d+)\x00/g, (_, i) => imgStash[+i]);

  return s;
}

/**
 * If `url` is a resolved Cloudinary URL (contains `/upload/`), extract and
 * return the bare public ID so it can be stored in markdown.  This is the
 * inverse of `resolveImageUrl` and keeps stored markdown free of resolved
 * transformation params — preventing the italic regex from mangling
 * underscores in strings like `f_auto,q_auto,w_1200,h_800`.
 *
 * Returns `null` for non-Cloudinary URLs so callers can fall back to the
 * raw src.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) return null;
    // Skip the version/transformation segment(s) after "upload"
    let publicIdWithExt = parts.slice(uploadIdx + 2).join("/");
    const dot = publicIdWithExt.lastIndexOf(".");
    if (dot !== -1) publicIdWithExt = publicIdWithExt.substring(0, dot);
    return publicIdWithExt || null;
  } catch {
    return null;
  }
}

export function htmlToMd(el: HTMLElement): string {
  function n2m(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const e = node as HTMLElement;
    const tag = e.tagName.toLowerCase();
    const inner = Array.from(e.childNodes).map(n2m).join("");

    switch (tag) {
      case "h1":
        return `# ${inner.trim()}\n`;
      case "h2":
        return `## ${inner.trim()}\n`;
      case "h3":
        return `### ${inner.trim()}\n`;
      case "h4":
        return `#### ${inner.trim()}\n`;
      case "h5":
        return `##### ${inner.trim()}\n`;
      case "h6":
        return `###### ${inner.trim()}\n`;
      case "strong":
      case "b":
        return `**${inner}**`;
      case "em":
      case "i":
        return `*${inner}*`;
      case "del":
      case "s":
        return `~~${inner}~~`;
      case "code":
        return e.closest("pre") ? inner : `\`${inner}\``;
      case "pre": {
        const lang = e.getAttribute("data-lang") || "";
        const code = e.querySelector("code")?.textContent || inner;
        return `\`\`\`${lang}\n${code}\n\`\`\`\n`;
      }
      case "a":
        return `[${inner}](${e.getAttribute("href") || ""})`;
      case "img": {
        const rawSrc = e.getAttribute("src") || "";
        // Store the bare public ID in markdown so the italic/bold regexes can't
        // mangle underscores in transformation params (f_auto, q_auto, w_1200…).
        // extractCloudinaryPublicId returns null for non-Cloudinary srcs, in
        // which case we fall back to the raw src (external URLs, data URIs, etc).
        const mdSrc = extractCloudinaryPublicId(rawSrc) ?? rawSrc;
        return `![${e.getAttribute("alt") || ""}](${mdSrc})`;
      }
      case "blockquote":
        return `> ${inner.trim()}\n`;
      case "hr":
        return `---\n`;
      case "br":
        return "\n";
      case "ul":
        return Array.from(e.querySelectorAll(":scope > li"))
          .map((li) => {
            const liEl = li as HTMLElement;
            const cb = liEl.querySelector(
              "input[type=checkbox]",
            ) as HTMLInputElement | null;
            if (cb)
              return `- [${cb.checked ? "x" : " "}] ${liEl.textContent?.trim()}\n`;
            return `- ${Array.from(liEl.childNodes).map(n2m).join("").trim()}\n`;
          })
          .join("");
      case "ol":
        return Array.from(e.querySelectorAll(":scope > li"))
          .map(
            (li, idx) =>
              `${idx + 1}. ${Array.from((li as HTMLElement).childNodes)
                .map(n2m)
                .join("")
                .trim()}\n`,
          )
          .join("");
      case "li":
        return inner;
      case "table": {
        const ths = Array.from(e.querySelectorAll("thead th"))
          .map((th) => (th as HTMLElement).textContent?.trim() || "")
          .join(" | ");
        const sep = Array.from(e.querySelectorAll("thead th"))
          .map(() => "---")
          .join(" | ");
        const rows = Array.from(e.querySelectorAll("tbody tr"))
          .map((tr) =>
            Array.from(tr.querySelectorAll("td"))
              .map((td) => (td as HTMLElement).textContent?.trim() || "")
              .join(" | "),
          )
          .join("\n| ");
        return `| ${ths} |\n| ${sep} |\n| ${rows} |\n`;
      }
      case "p": {
        const content = inner.trim();
        if (!content || content === "<br>" || content === "") return "\n";
        return `${content}\n`;
      }
      case "div":
        return `${inner}\n`;
      default:
        return inner;
    }
  }

  return Array.from(el.childNodes)
    .map(n2m)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function processAutoTransform(
  editorEl: HTMLElement,
  syncMd: (md: string) => void,
) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  let node: Node | null = sel.getRangeAt(0).startContainer;
  while (
    node &&
    node !== editorEl &&
    !(node as HTMLElement).matches?.("p,h1,h2,h3,h4,h5,h6,blockquote,li,div")
  ) {
    node = node.parentNode;
  }
  if (!node || node === editorEl) return;

  const block = node as HTMLElement;
  const text = block.textContent || "";
  const tag = block.tagName.toLowerCase();

  function replaceBlock(newEl: HTMLElement, focusEl: HTMLElement = newEl) {
    block.replaceWith(newEl);
    const r = document.createRange();
    r.selectNodeContents(focusEl);
    r.collapse(false);
    sel!.removeAllRanges();
    sel!.addRange(r);
    syncMd(htmlToMd(editorEl));
  }

  // # Heading
  const hm = text.match(/^(#{1,6})\s(.*)/);
  if (hm && tag === "p") {
    const h = document.createElement(`h${hm[1].length}`);
    h.textContent = hm[2];
    replaceBlock(h);
    return;
  }

  // - or * → ul
  if (/^[-*+]\s/.test(text) && tag === "p") {
    const content = text.replace(/^[-*+]\s/, "");
    const ul = document.createElement("ul");
    const li = document.createElement("li");
    li.textContent = content;
    ul.appendChild(li);
    replaceBlock(ul, li);
    return;
  }

  // 1. → ol
  if (/^\d+\.\s/.test(text) && tag === "p") {
    const content = text.replace(/^\d+\.\s/, "");
    const ol = document.createElement("ol");
    const li = document.createElement("li");
    li.textContent = content;
    ol.appendChild(li);
    replaceBlock(ol, li);
    return;
  }

  // > → blockquote
  if (/^>\s/.test(text) && tag === "p") {
    const bq = document.createElement("blockquote");
    bq.textContent = text.replace(/^>\s?/, "");
    replaceBlock(bq);
    return;
  }

  // --- → hr
  if (/^---+$/.test(text.trim()) && tag === "p") {
    const hr = document.createElement("hr");
    const p = document.createElement("p");
    p.innerHTML = "<br/>";
    block.replaceWith(hr);
    hr.after(p);
    const r = document.createRange();
    r.selectNodeContents(p);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
    syncMd(htmlToMd(editorEl));
  }
}

/**
 * Called on Space keydown. If the current block text matches a list/quote
 * trigger prefix (e.g. "1.", "45.", "-", "*", ">"), prevent the space from
 * being inserted and immediately convert the block to the right element.
 * Returns true if the event should be preventDefault-ed.
 */
export function processSpaceAutoList(
  editorEl: HTMLElement,
  syncMd: (md: string) => void,
): boolean {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return false;

  // Only act when cursor is collapsed (no text selected)
  if (!sel.getRangeAt(0).collapsed) return false;

  let node: Node | null = sel.getRangeAt(0).startContainer;
  while (
    node &&
    node !== editorEl &&
    !(node as HTMLElement).matches?.("p,h1,h2,h3,h4,h5,h6,blockquote,li,div")
  ) {
    node = node.parentNode;
  }
  if (!node || node === editorEl) return false;

  const block = node as HTMLElement;
  const text = (block.textContent || "").trimEnd();
  const tag = block.tagName.toLowerCase();

  // Cursor must be at the very end of the block text
  const range = sel.getRangeAt(0);
  const cursorOffset = range.startOffset;
  const nodeText = range.startContainer.textContent || "";
  const isAtEnd =
    range.startContainer === block
      ? cursorOffset >= (block.textContent?.length ?? 0)
      : cursorOffset >= nodeText.length;
  if (!isAtEnd) return false;

  function replaceBlock(newEl: HTMLElement, focusEl: HTMLElement = newEl) {
    block.replaceWith(newEl);
    const r = document.createRange();
    r.selectNodeContents(focusEl);
    r.collapse(false);
    sel!.removeAllRanges();
    sel!.addRange(r);
    syncMd(htmlToMd(editorEl));
  }

  // "1.", "45.", any number followed by dot → ordered list
  if (/^\d+\.$/.test(text) && tag === "p") {
    const ol = document.createElement("ol");
    const li = document.createElement("li");
    li.innerHTML = "<br/>";
    ol.appendChild(li);
    replaceBlock(ol, li);
    return true;
  }

  // "-", "*", "+" → unordered list
  if (/^[-*+]$/.test(text) && tag === "p") {
    const ul = document.createElement("ul");
    const li = document.createElement("li");
    li.innerHTML = "<br/>";
    ul.appendChild(li);
    replaceBlock(ul, li);
    return true;
  }

  // ">" → blockquote
  if (text === ">" && tag === "p") {
    const bq = document.createElement("blockquote");
    bq.innerHTML = "<br/>";
    replaceBlock(bq);
    return true;
  }

  return false;
}
