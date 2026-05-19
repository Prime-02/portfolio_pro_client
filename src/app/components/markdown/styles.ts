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
  border: 2px solid var(--accent); border-radius: 14px;
  overflow: clip; background: var(--background);
  transition: accent 0.2s, box-shadow 0.2s;
}
.mde2-card:focus-within {
  accent: var(--foreground);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--foreground) 10%, transparent);
}
.mde2-card.has-error { accent: var(--error-500); }

/* Toolbar */
.mde2-toolbar {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 1px; padding: 6px 10px;
  border-bottom: 1.5px solid var(--accent);
  background: color-mix(in srgb, var(--background) 70%, var(--accent) 30%);
}
.mde2-sep { width: 1px; height: 20px; background: var(--accent); margin: 0 5px; }
.mde2-tbtn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 30px; height: 26px; padding: 0 5px; border: none;
  border-radius: 5px; background: transparent; color: var(--foreground);
  font-size: 0.76rem; font-family: 'DM Mono', monospace; font-weight: 500;
  cursor: pointer; white-space: nowrap; transition: background 0.12s, color 0.12s;
}
.mde2-tbtn:hover { background: color-mix(in srgb, var(--foreground) 12%, transparent); color: var(--foreground); }
.mde2-tbtn:active { transform: scale(0.93); }
.mde2-tbtn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Tabs */
.mde2-tabs {
  display: flex;
  border-bottom: 1.5px solid var(--accent);
  background: color-mix(in srgb, var(--background) 70%, var(--accent) 30%);
}
.mde2-tab {
  flex: 1; padding: 5px 0;
  font-size: 0.72rem; font-weight: 600;
  font-family: 'DM Mono', monospace;
  text-align: center; text-transform: uppercase; letter-spacing: 0.07em;
  border: none; border-bottom: 2px solid transparent;
  background: transparent; color: var(--foreground);
  cursor: pointer; transition: color 0.15s, accent 0.15s;
}
.mde2-tab.active { color: var(--foreground); border-bottom-color: var(--foreground); }

/* Panes */
.mde2-panes { display: flex; min-height: var(--mde2-min-height, 420px); }

.mde2-pane {
  flex: 1; overflow: auto;
  position: relative; /* needed for upload overlay positioning */
}
.mde2-pane + .mde2-pane { border-left: 1.5px solid var(--accent); }

/* ── WYSIWYG EDITOR ── */
.mde2-editor {
  width: 100%; min-height: var(--mde2-min-height, 420px);
  padding: 20px 24px; outline: none;
  color: var(--foreground);
  font-family: 'Lora', Georgia, serif;
  font-size: 1rem; line-height: 1.8;
  caret-color: var(--foreground);
}
.mde2-editor:empty::before {
  content: attr(data-placeholder);
  color: var(--foreground); pointer-events: none; font-style: italic;
}

/* Rich content styles — shared between editor & preview */
.mde2-editor h1, .mde2-preview h1,
.mde2-editor h2, .mde2-preview h2,
.mde2-editor h3, .mde2-preview h3,
.mde2-editor h4, .mde2-preview h4,
.mde2-editor h5, .mde2-preview h5,
.mde2-editor h6, .mde2-preview h6 {
  font-family: 'Lora', serif; font-weight: 700;
  color: var(--foreground); margin: 0.9em 0 0.3em; line-height: 1.25;
}
.mde2-editor h1, .mde2-preview h1 { font-size: 2rem; border-bottom: 2px solid var(--accent); padding-bottom: 6px; }
.mde2-editor h2, .mde2-preview h2 { font-size: 1.5rem; border-bottom: 1px solid var(--accent); padding-bottom: 4px; }
.mde2-editor h3, .mde2-preview h3 { font-size: 1.2rem; }
.mde2-editor h4, .mde2-preview h4 { font-size: 1.05rem; }
.mde2-editor p,  .mde2-preview p  { margin: 0.4em 0; }
.mde2-editor strong, .mde2-preview strong,
.mde2-editor b, .mde2-preview b  { font-weight: 700; }
.mde2-editor em, .mde2-preview em,
.mde2-editor i, .mde2-preview i  { font-style: italic; }
.mde2-editor del, .mde2-preview del,
.mde2-editor s,  .mde2-preview s  { text-decoration: line-through; opacity: 0.65; }
.mde2-editor a, .mde2-preview a   { color: var(--foreground); text-decoration: underline; }
.mde2-editor hr, .mde2-preview hr { border: none; border-top: 2px solid var(--accent); margin: 1.2em 0; }
.mde2-editor blockquote, .mde2-preview blockquote {
  border-left: 3px solid var(--foreground); margin: 0.7em 0; padding: 4px 16px;
  background: color-mix(in srgb, var(--foreground) 6%, transparent);
  border-radius: 0 8px 8px 0; color: var(--foreground); font-style: italic;
}
.mde2-editor ul, .mde2-preview ul,
.mde2-editor ol, .mde2-preview ol { margin: 0.4em 0; padding-left: 2em; list-style-position: outside; }
.mde2-editor ul, .mde2-preview ul { list-style-type: disc; }
.mde2-editor ol, .mde2-preview ol { list-style-type: decimal; }
.mde2-editor li, .mde2-preview li { margin: 0.2em 0; display: list-item; }
.mde2-editor li.task-item, .mde2-preview li.task-item { list-style: none; margin-left: -1.2em; }
.mde2-editor li.task-item input, .mde2-preview li.task-item input { margin-right: 6px; }
.mde2-editor code, .mde2-preview code {
  font-family: 'DM Mono', monospace; font-size: 0.85em;
  background: color-mix(in srgb, var(--foreground) 10%, transparent);
  color: var(--foreground); padding: 1px 5px; border-radius: 4px;
}
.mde2-editor pre, .mde2-preview pre {
  background: color-mix(in srgb, var(--foreground) 7%, var(--background));
  border: 1.5px solid var(--accent); border-radius: 8px;
  padding: 12px 16px; margin: 0.8em 0; overflow-x: auto; position: relative;
}
.mde2-editor pre::before, .mde2-preview pre::before {
  content: attr(data-lang); position: absolute; top: 6px; right: 10px;
  font-size: 0.65rem; font-family: 'DM Mono', monospace;
  color: var(--foreground); text-transform: uppercase; letter-spacing: 0.1em;
}
.mde2-editor pre code, .mde2-preview pre code {
  font-family: 'DM Mono', monospace; font-size: 0.85em;
  background: none; color: var(--foreground); padding: 0; border-radius: 0;
  line-height: 1.5;
}
.mde2-editor table, .mde2-preview table { border-collapse: collapse; width: 100%; margin: 0.8em 0; font-size: 0.9em; }
.mde2-editor th, .mde2-preview th,
.mde2-editor td, .mde2-preview td { border: 1px solid var(--accent); padding: 7px 12px; text-align: left; }
.mde2-editor th, .mde2-preview th {
  background: color-mix(in srgb, var(--foreground) 8%, transparent); font-weight: 700;
}
.mde2-editor img, .mde2-preview img { max-width: 100%; border-radius: 6px; margin: 4px 0; }

/* Preview pane */
.mde2-preview {
  padding: 20px 24px;
  font-family: 'Lora', Georgia, serif;
  font-size: 1rem; line-height: 1.8;
  color: var(--foreground);
}

/* Footer */
.mde2-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 14px; border-top: 1.5px solid var(--accent);
  background: color-mix(in srgb, var(--background) 70%, var(--accent) 30%);
}
.mde2-counter { font-size: 0.68rem; color: var(--foreground); font-family: 'DM Mono', monospace; letter-spacing: 0.03em; }
.mde2-actions { display: flex; gap: 6px; }
.mde2-action-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 6px;
  border: 1.5px solid var(--accent); background: var(--background);
  color: var(--foreground); font-size: 0.7rem; font-weight: 600;
  font-family: 'DM Mono', monospace; cursor: pointer;
  transition: all 0.14s; letter-spacing: 0.02em;
}
.mde2-action-btn:hover { accent: var(--foreground); color: var(--foreground); }
.mde2-hint { font-size: 0.75rem; color: var(--foreground); font-family: 'Lora', serif; }
.mde2-err  { font-size: 0.75rem; color: var(--error-500); font-family: 'Lora', serif; }

/* Image upload specific styles */
.mde2-card.image-drag-over {
  accent: var(--foreground);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--foreground) 20%, transparent);
}

@keyframes mde2-spin {
  to { transform: rotate(360deg); }
}

/* Inline image upload placeholder */
.mde2-img-placeholder {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 6px;
  background: color-mix(in srgb, var(--foreground) 10%, transparent);
  border: 1.5px dashed var(--foreground);
  font-family: 'DM Mono', monospace; font-size: 0.75rem;
  color: var(--foreground); vertical-align: middle;
  user-select: none; cursor: default;
}
.mde2-img-placeholder-spinner {
  display: inline-block; width: 12px; height: 12px;
  border: 2px solid color-mix(in srgb, var(--foreground) 30%, transparent);
  border-top-color: var(--foreground);
  border-radius: 50%;
  animation: mde2-spin 0.6s linear infinite;
  flex-shrink: 0;
}
.mde2-hidden-input {
  display: none;
}

/* Image styles in editor */
.mde2-editor img.md-img {
  max-width: 100%;
  border-radius: 8px;
  margin: 8px 0;
  cursor: default;
  transition: opacity 0.2s;
}

.mde2-editor img.md-img:hover {
  opacity: 0.9;
}

/* Enhanced image button in toolbar */
.mde2-tbtn.image-upload-btn {
  position: relative;
}

.mde2-tbtn.image-upload-btn:hover {
  background: color-mix(in srgb, var(--foreground) 15%, transparent);
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
  color: var(--foreground, #1a1a1a);
  padding: 20px 24px;
}

/* ── Headings ── */
.mdr h1, .mdr h2, .mdr h3,
.mdr h4, .mdr h5, .mdr h6 {
  font-family: 'Lora', serif;
  font-weight: 700;
  color: var(--foreground, #1a1a1a);
  margin: 0.9em 0 0.3em;
  line-height: 1.25;
}
.mdr h1 { font-size: 2rem;   border-bottom: 2px solid var(--accent, #e2e8f0); padding-bottom: 6px; }
.mdr h2 { font-size: 1.5rem; border-bottom: 1px solid var(--accent, #e2e8f0); padding-bottom: 4px; }
.mdr h3 { font-size: 1.2rem; }
.mdr h4 { font-size: 1.05rem; }
.mdr h5 { font-size: 0.95rem; }
.mdr h6 { font-size: 0.85rem; }

/* ── Body ── */
.mdr p  { margin: 0.4em 0; }
.mdr strong, .mdr b { font-weight: 700; }
.mdr em, .mdr i     { font-style: italic; }
.mdr del, .mdr s    { text-decoration: line-through; opacity: 0.65; }
.mdr a              { color: var(--foreground, #6366f1); text-decoration: underline; }
.mdr hr             { border: none; border-top: 2px solid var(--accent, #e2e8f0); margin: 1.2em 0; }

/* ── Blockquote ── */
.mdr blockquote {
  border-left: 3px solid var(--foreground, #6366f1);
  margin: 0.7em 0;
  padding: 4px 16px;
  background: color-mix(in srgb, var(--foreground, #6366f1) 6%, transparent);
  border-radius: 0 8px 8px 0;
  color: var(--foreground, #4a5568);
  font-style: italic;
}

/* ── Lists ── */
.mdr ul, .mdr ol {
  margin: 0.4em 0;
  padding-left: 2em;
  list-style-position: outside;
}
.mdr ul { list-style-type: disc; }
.mdr ol { list-style-type: decimal; }
.mdr li { margin: 0.2em 0; display: list-item; }

/* Task list */
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
  accent-color: var(--foreground, #6366f1);
}

/* ── Inline code ── */
.mdr code {
  font-family: 'DM Mono', monospace;
  font-size: 0.85em;
  background: color-mix(in srgb, var(--foreground, #6366f1) 10%, transparent);
  color: var(--foreground, #6366f1);
  padding: 1px 5px;
  border-radius: 4px;
}

/* ── Code block ── */
.mdr pre {
  background: color-mix(in srgb, var(--foreground, #1a1a1a) 7%, var(--background, #fff));
  border: 1.5px solid var(--accent, #e2e8f0);
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
  color: var(--foreground, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.mdr pre code {
  font-family: 'DM Mono', monospace;
  font-size: 0.85em;
  background: none;
  color: var(--foreground, #1a1a1a);
  padding: 0;
  border-radius: 0;
  line-height: 1.5;
  white-space: pre;
}

/* ── Table ── */
.mdr table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.8em 0;
  font-size: 0.9em;
}
.mdr th, .mdr td {
  border: 1px solid var(--accent, #e2e8f0);
  padding: 7px 12px;
  text-align: left;
}
.mdr th {
  background: color-mix(in srgb, var(--foreground, #6366f1) 8%, transparent);
  font-weight: 700;
}

/* ── Images ── */
.mdr img {
  max-width: 100%;
  border-radius: 6px;
  margin: 4px 0;
  display: block;
}

/* ── Details / Summary ── */
.mdr details {
  border: 1.5px solid var(--accent, #e2e8f0);
  border-radius: 8px;
  padding: 6px 14px;
  margin: 0.6em 0;
}
.mdr summary {
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  color: var(--foreground, #6366f1);
}
.mdr summary:hover { opacity: 0.8; }
`;