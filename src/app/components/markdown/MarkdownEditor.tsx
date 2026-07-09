// MarkdownEditor.tsx
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { ForwardRefEditor } from "./ForwardRefEditor";
import { PreviewPane } from "./PreviewPane";
import { EditorFooter } from "./EditorFooter";
import { ViewTabs } from "./ViewTabs";
import { injectStyles } from "./styles";
import { extractCloudinaryPublicId, diffRemovedImageUrls } from "./markdown-utils";
import { useCloudinaryCore } from "@/lib/stores/cloudinary";

type ViewMode = "editor" | "split" | "preview";

interface MarkdownEditorProps {
    value: string;
    onChange: (markdown: string) => void;
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    minHeight?: string;
    // Image upload props
    enableImageUpload?: boolean;
    uploadToken?: string;
    uploadFolder?: string;
    // View mode props
    defaultMode?: ViewMode;
    showTabs?: boolean;
    // Footer actions visibility
    showCopy?: boolean;
    showDownload?: boolean;
}

export default function MarkdownEditor({
    value,
    onChange,
    label,
    hint,
    error,
    placeholder = "Start writing…  (type # for heading, - for bullets, > for quotes…)",
    disabled = false,
    minHeight = "420px",
    enableImageUpload = false,
    uploadToken = "",
    uploadFolder = "blog",
    defaultMode = "editor",
    showTabs = false,
    showCopy = false,
    showDownload = false,
}: MarkdownEditorProps) {
    injectStyles();

    const editorRef = useRef<MDXEditorMethods>(null);
    const [mode, setMode] = useState<ViewMode>(defaultMode);
    const [copied, setCopied] = useState(false);

    // Keep latest props available inside the upload handler's closure
    // without re-creating the handler (and therefore the plugin) on every
    // keystroke — same defensive pattern as the old uploadTokenRef.
    const uploadTokenRef = useRef(uploadToken);
    const uploadFolderRef = useRef(uploadFolder);
    uploadTokenRef.current = uploadToken;
    uploadFolderRef.current = uploadFolder;

    // Tracks the markdown value as of the last onChange, so we can diff
    // image URLs when the next change comes in and detect removals.
    const prevValueRef = useRef(value);

    const { uploadFile, deleteFile } = useCloudinaryCore();

    // ------------------------------------------------------------------
    // Image upload — MDXEditor calls this for both the "insert image"
    // dialog and drag/drop/paste. Replace the body of this function with
    // whatever your useCloudinaryCore().uploadFile actually returns —
    // I don't have that file's signature, so this assumes it resolves to
    // an object with a `url` (or `secure_url`) field. Adjust as needed.
    // ------------------------------------------------------------------
    const handleImageUpload = useCallback(
        async (file: File): Promise<string> => {
            if (!enableImageUpload || !uploadTokenRef.current) {
                throw new Error("Image upload is not enabled for this editor.");
            }
            const result = await uploadFile({
                file,
                folder: uploadFolderRef.current,
            });
            const url = (result as any)?.secure_url ?? (result as any)?.url;
            if (!url) throw new Error("Upload succeeded but no URL was returned.");
            return url as string;
        },
        [uploadFile, enableImageUpload]
    );

    // ------------------------------------------------------------------
    // Cloudinary delete-on-remove — since MDXEditor gives us markdown
    // strings rather than a DOM we can watch, we diff image URLs between
    // the previous and next value on every change and clean up anything
    // that disappeared. Covers manual deletion, undo-then-retype, cut, etc.
    // ------------------------------------------------------------------
    const handleChange = useCallback(
        (markdown: string) => {
            if (enableImageUpload && uploadTokenRef.current) {
                const removed = diffRemovedImageUrls(prevValueRef.current, markdown);
                for (const url of removed) {
                    const publicId = extractCloudinaryPublicId(url);
                    if (publicId) {
                        deleteFile(publicId, "image").catch((err) =>
                            console.warn("Failed to delete image from Cloudinary:", publicId, err)
                        );
                    }
                }
            }
            prevValueRef.current = markdown;
            onChange(markdown);
        },
        [onChange, enableImageUpload, deleteFile]
    );

    // Keep the ref in sync if `value` is changed from outside the editor
    // (e.g. loading a saved draft, AI-generated content) without that
    // itself triggering a spurious Cloudinary diff.
    //
    // IMPORTANT: MDXEditor only consumes the `markdown` prop ONCE, on
    // mount — it does NOT re-render its content when the prop changes on
    // subsequent renders, since it manages its own state internally via
    // ProseMirror. So any external update to `value` (AI Assistant output,
    // loading a draft, an undo from a parent store, etc.) needs to be
    // pushed into the editor imperatively via the ref's setMarkdown(),
    // or the visible editor will silently ignore it even though React
    // state (and this `value` prop) updates correctly.
    useEffect(() => {
        if (value !== prevValueRef.current) {
            editorRef.current?.setMarkdown(value);
            prevValueRef.current = value;
        }
    }, [value]);

    // ------------------------------------------------------------------
    // Custom toolbar extras — recreated from your old "filetree" and
    // "details" tools. These were canned text snippets before, not real
    // integrations, so we reproduce them the same way via insertMarkdown.
    // ------------------------------------------------------------------
    const insertFileTree = () => {
        editorRef.current?.insertMarkdown(
            '```\nproject/\n├── src/\n│   ├── index.ts\n│   └── utils.ts\n├── package.json\n└── README.md\n```\n'
        );
    };
    const insertDetails = () => {
        editorRef.current?.insertMarkdown(
            "<details>\n<summary>Click to expand</summary>\n\nContent here.\n\n</details>\n"
        );
    };

    const extraToolbarContent = !disabled && (
        <>
            <button type="button" className="mde2-tbtn" title="File tree" onMouseDown={(e) => { e.preventDefault(); insertFileTree(); }}>
                🗂
            </button>
            <button type="button" className="mde2-tbtn" title="Collapsible" onMouseDown={(e) => { e.preventDefault(); insertDetails(); }}>
                ▶…
            </button>
        </>
    );

    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const charCount = value.length;
    const showEditor = mode === "editor" || mode === "split";
    const showPreview = mode === "preview" || mode === "split";
    const showFooter = showCopy || showDownload;

    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    const handleDownload = () => {
        const blob = new Blob([value], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mde2 mde2-shell" style={{ ["--mde2-min-height" as string]: minHeight }}>
            {label && <label className="mde2-label">{label}</label>}

            <div className={`mde2-card${error ? " has-error" : ""}`}>
                {showTabs && <ViewTabs currentMode={mode} onModeChange={setMode} />}

                <div className="mde2-panes">
                    {showEditor && (
                        <div className="mde2-pane mde2-mdx-pane">
                            <ForwardRefEditor
                                ref={editorRef}
                                markdown={value}
                                onChange={handleChange}
                                readOnly={disabled}
                                placeholder={placeholder}
                                imageUploadHandler={enableImageUpload ? handleImageUpload : undefined}
                                extraToolbarContent={extraToolbarContent}
                                contentEditableClassName="mde2-editor"
                            />
                        </div>
                    )}

                    {showPreview && <PreviewPane markdown={value} />}
                </div>

                {showFooter && (
                    <EditorFooter
                        wordCount={wordCount}
                        charCount={charCount}
                        copied={copied}
                        disabled={disabled}
                        onCopy={handleCopy}
                        onDownload={handleDownload}
                    />
                )}
            </div>

            {error && <p className="mde2-err">{error}</p>}
            {hint && !error && <p className="mde2-hint">{hint}</p>}
        </div>
    );
}