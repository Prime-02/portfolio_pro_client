// toolbar-config.ts

export interface ToolDef {
  id: string;
  icon: string;
  title: string;
  /** el = editor element; syncMd = call after DOM mutations to re-serialize markdown */
  exec: (el: HTMLElement, syncMd: () => void) => void;
}

function insertAtCursor(html: string) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const frag = range.createContextualFragment(html);
  const last = frag.lastChild;
  range.insertNode(frag);
  if (last) {
    range.setStartAfter(last);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export const TOOLS: (ToolDef | "sep")[] = [
  {
    id: "h1",
    icon: "H1",
    title: "Heading 1",
    exec: () => document.execCommand("formatBlock", false, "h1"),
  },
  {
    id: "h2",
    icon: "H2",
    title: "Heading 2",
    exec: () => document.execCommand("formatBlock", false, "h2"),
  },
  {
    id: "h3",
    icon: "H3",
    title: "Heading 3",
    exec: () => document.execCommand("formatBlock", false, "h3"),
  },
  "sep",
  {
    id: "bold",
    icon: "B",
    title: "Bold (Ctrl+B)",
    exec: () => document.execCommand("bold"),
  },
  {
    id: "italic",
    icon: "I",
    title: "Italic (Ctrl+I)",
    exec: () => document.execCommand("italic"),
  },
  {
    id: "strike",
    icon: "S̶",
    title: "Strikethrough",
    exec: () => document.execCommand("strikeThrough"),
  },
  "sep",
  {
    id: "ul",
    icon: "≡",
    title: "Bullet list",
    exec: () => document.execCommand("insertUnorderedList"),
  },
  {
    id: "ol",
    icon: "1.",
    title: "Numbered list",
    exec: () => document.execCommand("insertOrderedList"),
  },
  {
    id: "task",
    icon: "☑",
    title: "Task item",
    exec: () =>
      insertAtCursor(
        `<ul><li class="task-item"><input type="checkbox" disabled />&nbsp;Task</li></ul><p><br/></p>`,
      ),
  },
  "sep",
  {
    id: "bq",
    icon: "❝",
    title: "Blockquote",
    exec: () => document.execCommand("formatBlock", false, "blockquote"),
  },
  {
    id: "hr",
    icon: "—",
    title: "Horizontal rule",
    exec: () => document.execCommand("insertHorizontalRule"),
  },
  "sep",
  {
    id: "code",
    icon: "`…`",
    title: "Inline code",
    exec: () => {
      const sel = window.getSelection();
      const text = sel?.toString() || "code";
      insertAtCursor(`<code>${text}</code>`);
    },
  },
  {
    id: "codeblock",
    icon: "{ }",
    title: "Code block",
    exec: () =>
      insertAtCursor(
        `<pre data-lang="js"><code>// code here</code></pre><p><br/></p>`,
      ),
  },
  "sep",
  {
    id: "link",
    icon: "🔗",
    title: "Link (Ctrl+K)",
    exec: () => {
      const url = prompt("URL:");
      if (url) document.execCommand("createLink", false, url);
    },
  },
  {
    id: "image-url", // ✅ Changed from "image" to "image-url"
    icon: "🖼",
    title: "Image URL",
    exec: () => {
      const url = prompt("Image URL:");
      if (url) document.execCommand("insertImage", false, url);
    },
  },
  {
    id: "image-upload", // ✅ Keep this one for Cloudinary uploads
    icon: "📤",
    title: "Upload Image",
    exec: () => {}, // Handled by parent component
  },
  "sep",
  {
    id: "table",
    icon: "⊞",
    title: "Table",
    exec: (_el, syncMd) => {
      // Remove any stale picker first
      document.getElementById("mde2-table-picker")?.remove();

      const COLS = 8;
      const ROWS = 8;

      const picker = document.createElement("div");
      picker.id = "mde2-table-picker";
      picker.style.cssText = `
        position:fixed;z-index:9999;
        background:var(--bg-primary,#fff);
        border:1.5px solid var(--border-color,#ddd);
        border-radius:10px;padding:10px;
        box-shadow:0 8px 24px rgba(0,0,0,0.13);
        font-family:'DM Mono',monospace;
      `;

      const label = document.createElement("div");
      label.style.cssText =
        "font-size:0.7rem;color:var(--text-muted,#999);margin-bottom:7px;text-align:center;letter-spacing:0.05em;user-select:none;";
      label.textContent = "hover to select size";
      picker.appendChild(label);

      const grid = document.createElement("div");
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${COLS},18px);gap:3px;`;

      const cells: HTMLButtonElement[][] = [];

      function highlight(c: number, r: number) {
        label.textContent = `${c} col × ${r} row`;
        for (let ri = 0; ri < ROWS; ri++) {
          for (let ci = 0; ci < COLS; ci++) {
            const active = ci < c && ri < r;
            cells[ri][ci].style.background = active
              ? "var(--primary-500,#6366f1)"
              : "color-mix(in srgb, var(--border-color,#ddd) 60%, transparent)";
          }
        }
      }

      function insertTable(cols: number, rows: number) {
        picker.remove();
        document.removeEventListener("mousedown", dismiss);
        const headers = Array.from(
          { length: cols },
          (_, i) => `<th>Column ${i + 1}</th>`,
        ).join("");
        const bodyRow = `<tr>${Array.from({ length: cols }, () => "<td>Cell</td>").join("")}</tr>`;
        const bodyRows = Array.from({ length: rows }, () => bodyRow).join("");
        insertAtCursor(
          `<table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table><p><br/></p>`,
        );
        syncMd();
      }

      for (let r = 0; r < ROWS; r++) {
        cells[r] = [];
        for (let c = 0; c < COLS; c++) {
          const cell = document.createElement("button");
          cell.type = "button";
          cell.style.cssText = `
            width:18px;height:18px;border:none;border-radius:3px;cursor:pointer;
            background:color-mix(in srgb, var(--border-color,#ddd) 60%, transparent);
            transition:background 0.08s;padding:0;
          `;
          const col = c + 1;
          const row = r + 1;
          cell.addEventListener("mouseenter", () => highlight(col, row));
          cell.addEventListener("click", (e) => {
            e.stopPropagation();
            insertTable(col, row);
          });
          grid.appendChild(cell);
          cells[r][c] = cell;
        }
      }

      picker.appendChild(grid);
      document.body.appendChild(picker);

      // Position below the toolbar ⊞ button
      const btn = document.querySelector(
        '[title="Table"]',
      ) as HTMLElement | null;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        picker.style.top = `${rect.bottom + 6}px`;
        picker.style.left = `${Math.min(rect.left, window.innerWidth - 220)}px`;
      } else {
        picker.style.top = "80px";
        picker.style.left = "50%";
        picker.style.transform = "translateX(-50%)";
      }

      // Dismiss on outside click
      const dismiss = (e: MouseEvent) => {
        if (!picker.contains(e.target as Node)) {
          picker.remove();
          document.removeEventListener("mousedown", dismiss);
        }
      };
      setTimeout(() => document.addEventListener("mousedown", dismiss), 0);
    },
  },
  {
    id: "filetree",
    icon: "🗂",
    title: "File tree",
    exec: () =>
      insertAtCursor(
        `<pre data-lang=""><code>project/\n├── src/\n│   ├── index.ts\n│   └── utils.ts\n├── package.json\n└── README.md</code></pre><p><br/></p>`,
      ),
  },
  {
    id: "details",
    icon: "▶…",
    title: "Collapsible",
    exec: () =>
      insertAtCursor(
        `<p>&lt;details&gt;<br/>&lt;summary&gt;Click to expand&lt;/summary&gt;<br/><br/>Content here.<br/><br/>&lt;/details&gt;</p><p><br/></p>`,
      ),
  },
];
