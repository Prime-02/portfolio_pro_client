// styles.ts

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

.mde2 * { box-sizing: border-box; }

.mde2-shell {
  display: flex; flex-direction: column; gap: 6px;
  font-family: 'Lora', Georgia, serif;
}
.mde2-label {
  font-size: 0.85rem; font-weight: 600;
  color: var(--foreground);
  font-family: 'Lora', serif; letter-spacing: 0.02em;
}

/* Card */
.mde2-card {
  border: 2px solid var(--foreground); border-radius: 14px;
  overflow: clip; background: var(--background);
  transition: box-shadow 0.2s;
}
.mde2-card:focus-within {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--foreground) 10%, transparent);
}
.mde2-card.has-error { border-color: var(--error-500); }

/* Tabs (ViewTabs) */
.mde2-tabs {
  display: flex;
  border-bottom: 1.5px solid var(--foreground);
  background: color-mix(in srgb, var(--background) 70%, var(--foreground) 30%);
}
.mde2-tab {
  flex: 1; padding: 5px 0;
  font-size: 0.72rem; font-weight: 600;
  font-family: 'DM Mono', monospace;
  text-align: center; text-transform: uppercase; letter-spacing: 0.07em;
  border: none; border-bottom: 2px solid transparent;
  background: transparent; color: var(--foreground);
  cursor: pointer; transition: color 0.15s;
}
.mde2-tab.active { color: var(--foreground); border-bottom-color: var(--foreground); }

/* Panes */
.mde2-panes { display: flex; min-height: var(--mde2-min-height, 420px); }

.mde2-pane { flex: 1; position: relative; }
.mde2-pane + .mde2-pane { border-left: 1.5px solid var(--foreground); }

/* Small toolbar buttons we still render ourselves (file-tree, collapsible —
   injected into MDXEditor's toolbar via extraToolbarContent) */
.mde2-tbtn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 30px; height: 26px; padding: 0 5px; border: none;
  border-radius: 5px; background: transparent; color: var(--foreground);
  font-size: 0.76rem; font-family: 'DM Mono', monospace; font-weight: 500;
  cursor: pointer; white-space: nowrap; transition: background 0.12s;
}
.mde2-tbtn:hover { background: color-mix(in srgb, var(--foreground) 12%, transparent); }
.mde2-tbtn:active { transform: scale(0.93); }
.mde2-tbtn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Rich content styles — shared between the MDXEditor contentEditable
   (via contentEditableClassName="mde2-editor") and the live preview pane.
   Unchanged from before: MDXEditor's DOM output for these elements matches
   standard HTML tags, so the same rules still apply. */
.mde2-editor { padding: 20px 24px; font-family: 'Lora', Georgia, serif; font-size: 1rem; line-height: 1.8; color: var(--foreground); min-height: var(--mde2-min-height, 420px); }
.mde2-editor h1, .mde2-editor h2, .mde2-editor h3,
.mde2-editor h4, .mde2-editor h5, .mde2-editor h6 {
  font-family: 'Lora', serif; font-weight: 700;
  color: var(--foreground); margin: 0.9em 0 0.3em; line-height: 1.25;
}
.mde2-editor h1 { font-size: 2rem; border-bottom: 2px solid var(--foreground); padding-bottom: 6px; }
.mde2-editor h2 { font-size: 1.5rem; border-bottom: 1px solid var(--foreground); padding-bottom: 4px; }
.mde2-editor h3 { font-size: 1.2rem; }
.mde2-editor h4 { font-size: 1.05rem; }
.mde2-editor p  { margin: 0.4em 0; }
.mde2-editor strong, .mde2-editor b { font-weight: 700; }
.mde2-editor em, .mde2-editor i { font-style: italic; }
.mde2-editor del, .mde2-editor s { text-decoration: line-through; opacity: 0.65; }
.mde2-editor a { color: var(--foreground); text-decoration: underline; }
.mde2-editor hr { border: none; border-top: 2px solid var(--foreground); margin: 1.2em 0; }
.mde2-editor blockquote {
  border-left: 3px solid var(--foreground); margin: 0.7em 0; padding: 4px 16px;
  background: color-mix(in srgb, var(--foreground) 6%, transparent);
  border-radius: 0 8px 8px 0; color: var(--foreground); font-style: italic;
}
.mde2-editor ul, .mde2-editor ol { margin: 0.4em 0; padding-left: 2em; list-style-position: outside; }
.mde2-editor ul { list-style-type: disc; }
.mde2-editor ol { list-style-type: decimal; }
.mde2-editor li { margin: 0.2em 0; }
.mde2-editor code {
  font-family: 'DM Mono', monospace; font-size: 0.85em;
  background: color-mix(in srgb, var(--foreground) 10%, transparent);
  color: var(--foreground); padding: 1px 5px; border-radius: 4px;
}
.mde2-editor pre {
  background: color-mix(in srgb, var(--foreground) 7%, var(--background));
  border: 1.5px solid var(--foreground); border-radius: 8px;
  padding: 12px 16px; margin: 0.8em 0; overflow-x: auto;
}
.mde2-editor pre code { font-family: 'DM Mono', monospace; font-size: 0.85em; background: none; color: var(--foreground); padding: 0; line-height: 1.5; }
.mde2-editor table { border-collapse: collapse; width: 100%; margin: 0.8em 0; font-size: 0.9em; }
.mde2-editor th, .mde2-editor td { border: 1px solid var(--foreground); padding: 7px 12px; text-align: left; }
.mde2-editor th { background: color-mix(in srgb, var(--foreground) 8%, transparent); font-weight: 700; }
.mde2-editor img { max-width: 100%; border-radius: 6px; margin: 4px 0; }

/* Footer */
.mde2-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 14px; border-top: 1.5px solid var(--foreground);
  background: color-mix(in srgb, var(--background) 70%, var(--foreground) 30%);
}
.mde2-counter { font-size: 0.68rem; color: var(--foreground); font-family: 'DM Mono', monospace; letter-spacing: 0.03em; }
.mde2-actions { display: flex; gap: 6px; }
.mde2-action-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 6px;
  border: 1.5px solid var(--foreground); background: var(--background);
  color: var(--foreground); font-size: 0.7rem; font-weight: 600;
  font-family: 'DM Mono', monospace; cursor: pointer;
  transition: all 0.14s; letter-spacing: 0.02em;
}
.mde2-hint { font-size: 0.75rem; color: var(--foreground); font-family: 'Lora', serif; }
.mde2-err  { font-size: 0.75rem; color: var(--error-500); font-family: 'Lora', serif; }

/* ──────────────────────────────────────────────────────────────────────
   MDXEditor chrome theming — brings its toolbar/dialogs/table-editor UI
   in line with the mde2 card look. MDXEditor exposes its palette as CSS
   custom properties following the Radix semantic-color convention,
   scoped to the editor root. Verify these variable/class names against
   your installed @mdxeditor/editor version's style.css if colors look
   off — this is a best-effort mapping, not guaranteed 1:1 across versions.
   ────────────────────────────────────────────────────────────────────── */
.mde2-mdx-pane .mdxeditor {
  --baseBase: var(--background);
  --baseBg: var(--background);
  --baseBgSubtle: color-mix(in srgb, var(--background) 70%, var(--foreground) 30%);
  --baseBorder: var(--foreground);
  --baseText: var(--foreground);
  --accentBase: var(--foreground);
  --accentBorder: var(--foreground);
  --accentText: var(--foreground);
  font-family: 'Lora', Georgia, serif;
}
.mde2-mdx-pane .mde2-mdx-toolbar {
  border-bottom: 1.5px solid var(--foreground);
  background: color-mix(in srgb, var(--background) 70%, var(--foreground) 30%);
  border-radius: 0;
  padding: 6px 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  position: sticky;
  /* EditBlogPage already has its own sticky header at top:0, z-40.
     Sticking this toolbar at top:0 too would overlap it. Adjust this
     value to match your actual page header's rendered height. */
  top: var(--mde2-toolbar-sticky-offset, 64px);
  z-index: 30;
}
.mde2-mdx-pane .mde2-mdx-toolbar button,
.mde2-mdx-pane .mde2-mdx-toolbar [role="button"] {
  font-family: 'DM Mono', monospace;
  color: var(--foreground);
}
.mde2-mdx-pane .mde2-mdx-toolbar svg {
  color: var(--foreground);
  fill: currentColor;
  stroke: currentColor;
}
.mde2-mdx-pane .mde2-mdx-toolbar svg path,
.mde2-mdx-pane .mde2-mdx-toolbar svg line,
.mde2-mdx-pane .mde2-mdx-toolbar svg circle,
.mde2-mdx-pane .mde2-mdx-toolbar svg rect {
  stroke: currentColor;
}
.mdxeditor-select-content,
.mdxeditor-popup-container {
  font-family: 'Lora', Georgia, serif;
}
`;

let injected = false;
export function injectStyles() {
  if (injected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.textContent = STYLES;
  document.head.appendChild(s);
  injected = true;
}

export const RENDERER_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

.mdr * { box-sizing: border-box; }

.mdr {
  font-family: 'Lora', Georgia, serif;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--foreground);
  padding: 20px 24px;
}

.mdr h1, .mdr h2, .mdr h3,
.mdr h4, .mdr h5, .mdr h6 {
  font-family: 'Lora', serif;
  font-weight: 700;
  color: var(--foreground);
  margin: 0.9em 0 0.3em;
  line-height: 1.25;
}
.mdr h1 { font-size: 2rem;   border-bottom: 2px solid var(--foreground); padding-bottom: 6px; }
.mdr h2 { font-size: 1.5rem; border-bottom: 1px solid var(--foreground); padding-bottom: 4px; }
.mdr h3 { font-size: 1.2rem; }
.mdr h4 { font-size: 1.05rem; }
.mdr h5 { font-size: 0.95rem; }
.mdr h6 { font-size: 0.85rem; }

.mdr p  { margin: 0.4em 0; }
.mdr strong, .mdr b { font-weight: 700; }
.mdr em, .mdr i     { font-style: italic; }
.mdr del, .mdr s    { text-decoration: line-through; opacity: 0.65; }
.mdr a              { color: var(--foreground); text-decoration: underline; }
.mdr hr             { border: none; border-top: 2px solid var(--foreground); margin: 1.2em 0; }

.mdr blockquote {
  border-left: 3px solid var(--foreground);
  margin: 0.7em 0;
  padding: 4px 16px;
  background: color-mix(in srgb, var(--foreground) 6%, transparent);
  border-radius: 0 8px 8px 0;
  color: var(--foreground);
  font-style: italic;
}

.mdr ul, .mdr ol {
  margin: 0.4em 0;
  padding-left: 2em;
  list-style-position: outside;
}
.mdr ul { list-style-type: disc; }
.mdr ol { list-style-type: decimal; }
.mdr li { margin: 0.2em 0; display: list-item; }

/* Task list (remark-gfm renders className="task-list-item"; MarkdownRenderer
   remaps that to "task-item" so this selector keeps working unchanged) */
.mdr li.task-item {
  list-style: none;
  margin-left: -1.2em;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.mdr li.task-item input[type="checkbox"] {
  margin-right: 2px;
  cursor: default;
  accent-color: var(--foreground);
}

.mdr code {
  font-family: 'DM Mono', monospace;
  font-size: 0.85em;
  background: color-mix(in srgb, var(--foreground) 10%, transparent);
  color: var(--foreground);
  padding: 1px 5px;
  border-radius: 4px;
}

.mdr pre {
  background: color-mix(in srgb, var(--foreground) 7%, var(--background));
  border: 1.5px solid var(--foreground);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 0.8em 0;
  overflow-x: auto;
  position: relative;
}
.mdr pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 6px;
  right: 10px;
  font-size: 0.65rem;
  font-family: 'DM Mono', monospace;
  color: var(--foreground);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.mdr pre code {
  font-family: 'DM Mono', monospace;
  font-size: 0.85em;
  background: none;
  color: var(--foreground);
  padding: 0;
  border-radius: 0;
  line-height: 1.5;
  white-space: pre;
}

.mdr table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.8em 0;
  font-size: 0.9em;
}
.mdr th, .mdr td {
  border: 1px solid var(--foreground);
  padding: 7px 12px;
  text-align: left;
}
.mdr th {
  background: color-mix(in srgb, var(--foreground) 8%, transparent);
  font-weight: 700;
}

.mdr img {
  max-width: 100%;
  border-radius: 6px;
  margin: 4px 0;
  display: block;
}

.mdr details {
  border: 1.5px solid var(--foreground);
  border-radius: 8px;
  padding: 6px 14px;
  margin: 0.6em 0;
}
.mdr summary {
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  color: var(--foreground);
}
.mdr summary:hover { opacity: 0.8; }
`;