// MarkdownEditor.tsx
"use client";

import { useRef, useState, useEffect, useCallback, type KeyboardEvent } from "react";
import { mdToHtml, htmlToMd, processAutoTransform, processSpaceAutoList, extractCloudinaryPublicId } from "./markdown-utils";
import { TOOLS, type ToolDef } from "./toolbar-config";
import { injectStyles } from "./styles";
import { EditorToolbar } from "./EditorToolbar";
import { ViewTabs } from "./ViewTabs";
import { EditorPane } from "./EditorPane";
import { PreviewPane } from "./PreviewPane";
import { EditorFooter } from "./EditorFooter";
import { useCloudinaryCore } from "@/lib/stores/cloudinary";
import { resolveImageUrl } from "@/lib/stores/cloudinary/helpers";

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

    const editorRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pendingDeletion = useRef<{ element: HTMLElement; src: string } | null>(null);
    const [mode, setMode] = useState<ViewMode>(defaultMode);
    const [copied, setCopied] = useState(false);
    const isDragging = useRef(false);
    const imageError = useRef<string | null>(null);
    const uploadingImages = useRef<Set<string>>(new Set());
    const isUploading = useRef(false);
    const skipSync = useRef(false);

    // ------------------------------------------------------------------
    // Keep a stable ref to the latest uploadImage so that handleDrop and
    // handleImageSelect never capture a stale closure.  This is the core
    // fix for the "spinner vanishes instantly / upload never fires" bug.
    // ------------------------------------------------------------------
    const uploadImageRef = useRef<(file: File, placeholder?: HTMLElement) => Promise<string | null>>(
        async () => null
    );

    // Refs for props that must always be current inside async callbacks,
    // regardless of which render's closure uploadImage was created in.
    const uploadTokenRef = useRef(uploadToken);
    const uploadFolderRef = useRef(uploadFolder);
    const enableImageUploadRef = useRef(enableImageUpload);
    // Sync every render — guaranteed to run before any user event handler fires
    uploadTokenRef.current = uploadToken;
    uploadFolderRef.current = uploadFolder;
    enableImageUploadRef.current = enableImageUpload;

    console.debug(
        "[MDE:render] props — enableImageUpload:", enableImageUpload,
        "| uploadToken:", uploadToken ? `${uploadToken.slice(0, 12)}…` : "(EMPTY — will 401!)",
        "| uploadFolder:", uploadFolder
    );

    const { uploadFile, deleteFile } = useCloudinaryCore();

    // Helper to check if a node is an image element
    const isImageElement = (node: Node): boolean => {
        return (
            node.nodeType === Node.ELEMENT_NODE &&
            (node as HTMLElement).tagName === "IMG" &&
            (node as HTMLElement).classList.contains("md-img")
        );
    };

    // Extract Cloudinary public_id from URL — imported from markdown-utils
    const extractPublicIdFromUrl = (url: string): string | null =>
        extractCloudinaryPublicId(url);

    // Handle an image that was removed from the DOM (by any means)
    const handleRemovedImage = useCallback(
        async (imgElement: HTMLElement) => {
            const src = imgElement.getAttribute("src");
            if (!src || !uploadToken) return;
            if (pendingDeletion.current?.element === imgElement) return;
            const publicId = extractPublicIdFromUrl(src);
            if (publicId) {
                try {
                    const success = await deleteFile(publicId, "image");
                    if (success) {
                        console.log(`Deleted image from Cloudinary: ${publicId}`);
                    } else {
                        console.warn(`Failed to delete image from Cloudinary: ${publicId}`);
                    }
                } catch (err) {
                    console.warn("Failed to delete image from Cloudinary:", err);
                }
            }
        },
        [uploadToken, deleteFile]
    );

    // Check if we're about to delete an image, and handle Cloudinary cleanup first
    const handleImageDeletionBeforeDelete = useCallback(
        (key: "Delete" | "Backspace"): boolean => {
            if (!enableImageUpload || !uploadToken) return false;

            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return false;

            const range = sel.getRangeAt(0);
            if (!range.collapsed) return false;

            let targetImage: HTMLElement | null = null;

            if (key === "Backspace") {
                const node = range.startContainer;
                if (node.nodeType === Node.TEXT_NODE) {
                    if (range.startOffset === 0) {
                        const prevSibling = node.previousSibling;
                        if (prevSibling && isImageElement(prevSibling)) {
                            targetImage = prevSibling as HTMLElement;
                        } else if (node.parentElement) {
                            const parentPrev = node.parentElement.previousSibling;
                            if (parentPrev && isImageElement(parentPrev)) {
                                targetImage = parentPrev as HTMLElement;
                            }
                        }
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (range.startOffset === 0) {
                        const prevSibling = (node as HTMLElement).previousSibling;
                        if (prevSibling && isImageElement(prevSibling)) {
                            targetImage = prevSibling as HTMLElement;
                        }
                    } else {
                        const children = (node as HTMLElement).childNodes;
                        const childBefore = children[range.startOffset - 1];
                        if (childBefore && isImageElement(childBefore)) {
                            targetImage = childBefore as HTMLElement;
                        }
                    }
                }
            } else if (key === "Delete") {
                const node = range.startContainer;
                if (node.nodeType === Node.TEXT_NODE) {
                    if (range.startOffset === (node.textContent?.length || 0)) {
                        const nextSibling = node.nextSibling;
                        if (nextSibling && isImageElement(nextSibling)) {
                            targetImage = nextSibling as HTMLElement;
                        }
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const children = (node as HTMLElement).childNodes;
                    const childAfter = children[range.startOffset];
                    if (childAfter && isImageElement(childAfter)) {
                        targetImage = childAfter as HTMLElement;
                    }
                }
            }

            if (targetImage) {
                const src = targetImage.getAttribute("src");
                if (src) {
                    pendingDeletion.current = { element: targetImage, src };
                    targetImage.remove();
                    const el = editorRef.current;
                    if (el) {
                        skipSync.current = true;
                        onChange(htmlToMd(el));
                    }
                    const publicId = extractPublicIdFromUrl(src);
                    if (publicId) {
                        deleteFile(publicId, "image")
                            .then((success) => {
                                if (success) {
                                    console.log(`Deleted image from Cloudinary: ${publicId}`);
                                } else {
                                    console.warn(`Failed to delete image from Cloudinary: ${publicId}`);
                                }
                            })
                            .catch((err) => {
                                console.warn("Failed to delete image from Cloudinary:", err);
                            });
                    }
                    pendingDeletion.current = null;
                    return true;
                }
            }

            return false;
        },
        [enableImageUpload, uploadToken, deleteFile, onChange]
    );

    // MutationObserver to catch image deletions from cut, drag, etc.
    useEffect(() => {
        if (!enableImageUpload || !uploadToken) return;
        const editor = editorRef.current;
        if (!editor) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as HTMLElement;
                        if (isImageElement(element)) {
                            handleRemovedImage(element);
                        } else {
                            const images = element.querySelectorAll("img.md-img");
                            images.forEach((img) => handleRemovedImage(img as HTMLElement));
                        }
                    }
                });
            });
        });

        observer.observe(editor, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [enableImageUpload, uploadToken, handleRemovedImage]);

    // Mirrors CloudinaryImage's resolution logic exactly:
    // - public IDs (no http prefix) → resolveImageUrl with standard editor options
    // - full URLs (http/https)       → pass through untouched, skip Next.js optimization
    const resolveEditorImageSrc = useCallback(
        (src: string) =>
            src.startsWith("http")
                ? src
                : resolveImageUrl(src, { width: 1200, height: 800, quality: "auto" }),
        []
    );

    // Sync value → editor DOM (only when changed externally)
    useEffect(() => {
        const el = editorRef.current;
        if (!el || skipSync.current || isUploading.current) {
            console.debug("[MDE:sync] value→DOM sync SKIPPED —",
                !el ? "no editorRef" : skipSync.current ? "skipSync=true" : "isUploading=true"
            );
            skipSync.current = false;
            return;
        }
        const newHtml = value ? mdToHtml(value, resolveEditorImageSrc) : "";
        if (el.innerHTML !== newHtml) {
            console.debug("[MDE:sync] value→DOM sync APPLIED (innerHTML changed)");
            el.innerHTML = newHtml;
        } else {
            console.debug("[MDE:sync] value→DOM sync skipped — innerHTML already matches");
        }
    }, [value]);

    // Handle contenteditable input
    const handleInput = useCallback(() => {
        const el = editorRef.current;
        if (!el) return;
        skipSync.current = true;
        processAutoTransform(el, (md) => {
            skipSync.current = true;
            onChange(md);
        });
        onChange(htmlToMd(el));
    }, [onChange]);

    // Keyboard shortcuts
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === " ") {
                const el = editorRef.current;
                if (el) {
                    const transformed = processSpaceAutoList(el, (md) => {
                        skipSync.current = true;
                        onChange(md);
                    });
                    if (transformed) {
                        e.preventDefault();
                        return;
                    }
                }
            }

            if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
                e.preventDefault();
                const url = prompt("URL:");
                if (url) document.execCommand("createLink", false, url);
                return;
            }

            if (e.key === "Delete" || e.key === "Backspace") {
                const shouldPrevent = handleImageDeletionBeforeDelete(e.key);
                if (shouldPrevent) e.preventDefault();
            }
        },
        [handleImageDeletionBeforeDelete]
    );

    // Paste handler
    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLDivElement>) => {
            e.preventDefault();
            const el = editorRef.current;
            if (!el || disabled) return;

            const clipboardData = e.nativeEvent.clipboardData;
            if (!clipboardData) return;

            const html = clipboardData.getData("text/html");
            const plain = clipboardData.getData("text/plain");

            let markdown: string;
            if (html && html.trim()) {
                const tmp = document.createElement("div");
                tmp.innerHTML = html;
                tmp.querySelectorAll("meta,style,script,link").forEach((n) => n.remove());
                markdown = htmlToMd(tmp);
            } else {
                markdown = plain;
            }

            if (!markdown.trim()) return;

            const renderedHtml = mdToHtml(markdown, resolveEditorImageSrc);
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;

            const range = sel.getRangeAt(0);
            range.deleteContents();
            const frag = document.createRange().createContextualFragment(renderedHtml);
            const lastNode = frag.lastChild;
            range.insertNode(frag);

            if (lastNode) {
                const r = document.createRange();
                r.setStartAfter(lastNode);
                r.collapse(true);
                sel.removeAllRanges();
                sel.addRange(r);
            }

            skipSync.current = true;
            onChange(htmlToMd(el));
        },
        [disabled, onChange]
    );

    // Insert image HTML at cursor position
    const insertImageAtCursor = (url: string, alt: string) => {
        const img = document.createElement("img");
        // Mirror CloudinaryImage: public IDs get resolved, full URLs pass through.
        img.src = resolveEditorImageSrc(url);
        img.alt = alt;
        img.className = "md-img";
        img.style.maxWidth = "100%";

        const p = document.createElement("p");
        p.innerHTML = "<br/>";

        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            img.after(p);
            range.setStartAfter(p);
        }
    };

    // Insert an inline placeholder at a given range and return it
    const insertPlaceholderAtRange = (range: Range, fileName: string): HTMLElement => {
        const span = document.createElement("span");
        span.className = "mde2-img-placeholder";
        span.contentEditable = "false";
        span.title = fileName;
        span.innerHTML = `<span class="mde2-img-placeholder-spinner"></span><span class="mde2-img-placeholder-text">uploading…</span>`;

        const p = document.createElement("p");
        p.innerHTML = "<br/>";

        range.deleteContents();
        range.insertNode(span);
        span.after(p);

        return span;
    };

    // ------------------------------------------------------------------
    // uploadImage — defined as useCallback and ALSO written into
    // uploadImageRef so callers that need a stable reference (handleDrop,
    // handleImageSelect) always get the latest version without needing it
    // in their own dependency arrays.
    // ------------------------------------------------------------------
    const uploadImage = useCallback(
        async (file: File, placeholderEl?: HTMLElement): Promise<string | null> => {
            // Always read from refs — these are guaranteed to hold the current
            // render's values even if this callback instance is from an older render.
            const currentToken = uploadTokenRef.current;
            const currentFolder = uploadFolderRef.current;
            const currentEnabled = enableImageUploadRef.current;

            console.group(`[MDE:upload] uploadImage called — file: ${file.name}`);
            console.debug("  [from refs] enableImageUpload:", currentEnabled);
            console.debug("  [from refs] uploadToken:", currentToken ? `${currentToken.slice(0, 12)}…` : "(EMPTY — stale closure would 401!)");
            console.debug("  [from refs] uploadFolder:", currentFolder);
            console.debug("  [from closure] uploadToken:", uploadToken ? `${uploadToken.slice(0, 8)}…` : "(empty — confirms stale closure if different from ref)");
            console.debug("  placeholderEl:", placeholderEl ?? "none");

            if (!currentEnabled || !currentToken) {
                console.error("[MDE:upload] GUARD HIT — upload not configured. enableImageUpload:", currentEnabled, "uploadToken:", JSON.stringify(currentToken));
                placeholderEl?.remove();
                imageError.current = "Image upload is not configured";
                console.groupEnd();
                return null;
            }

            if (file.size > 5 * 1024 * 1024) {
                console.warn("[MDE:upload] GUARD HIT — file too large:", file.size, "bytes");
                placeholderEl?.remove();
                imageError.current = "Image must be less than 5MB";
                console.groupEnd();
                return null;
            }

            if (!file.type.startsWith("image/")) {
                console.warn("[MDE:upload] GUARD HIT — not an image type:", file.type);
                placeholderEl?.remove();
                imageError.current = "Only image files are allowed";
                console.groupEnd();
                return null;
            }

            const uploadKey = `editor-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            uploadingImages.current.add(uploadKey);
            isUploading.current = true;
            console.debug("  uploadKey:", uploadKey, "| isUploading set to true");

            try {
                console.debug("  calling uploadFile with args:", {
                    uploadToken: currentToken ? `${currentToken.slice(0, 12)}…` : "(empty!)",
                    uploadKey,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    uploadFolder: currentFolder,
                });

                // Patch XHR open temporarily so we can log the actual Cloudinary request
                // Patch XHR open temporarily so we can log the actual Cloudinary request
                const _origOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function (
                    this: XMLHttpRequest,
                    method: string,
                    url: string | URL,
                    async: boolean = true,
                    username?: string | null,
                    password?: string | null
                ) {
                    console.debug("  [MDE:xhr] XHR open →", method, String(url));
                    return _origOpen.call(this, method, url, async, username, password);
                };

                let publicId: string | null = null;
                try {
                    const result = await uploadFile({ file, folder: currentFolder });
                    publicId = result.publicId as string;
                } finally {
                    XMLHttpRequest.prototype.open = _origOpen; // always restore
                }

                if (publicId) {
                    // publicId is always a bare Cloudinary public ID here (never http),
                    // so resolveEditorImageSrc will always resolve it — no guard needed.
                    const url = resolveEditorImageSrc(publicId);
                    console.debug("  resolved image URL:", url);

                    if (placeholderEl && placeholderEl.parentNode) {
                        console.debug("  replacing placeholder with <img>");
                        const img = document.createElement("img");
                        img.src = url;
                        img.alt = file.name;
                        img.className = "md-img";
                        img.style.maxWidth = "100%";
                        placeholderEl.replaceWith(img);
                    } else {
                        console.debug("  no placeholder (or placeholder detached) — inserting at cursor");
                        insertImageAtCursor(url, file.name);
                    }

                    const el = editorRef.current;
                    if (el) {
                        skipSync.current = true;
                        onChange(htmlToMd(el));
                        console.debug("  markdown synced after upload");
                    }

                    imageError.current = null;
                    console.debug("  upload SUCCESS");
                    console.groupEnd();
                    return publicId;
                } else {
                    console.error("[MDE:upload] uploadFile returned falsy publicId");
                    placeholderEl?.remove();
                    imageError.current = "Failed to upload image";
                    console.groupEnd();
                    return null;
                }
            } catch (err) {
                console.error("[MDE:upload] uploadFile threw:", err);
                placeholderEl?.remove();
                imageError.current = "Failed to upload image";
                console.groupEnd();
                return null;
            } finally {
                uploadingImages.current.delete(uploadKey);
                if (uploadingImages.current.size === 0) {
                    isUploading.current = false;
                    console.debug("  isUploading reset to false");
                }
            }
        },
        [enableImageUpload, uploadToken, uploadFolder, uploadFile, onChange]
    );

    // Keep the ref in sync with the latest callback on every render.
    // This is the key to breaking the circular dependency with handleDrop.
    uploadImageRef.current = uploadImage;
    console.debug("[MDE:render] uploadImageRef.current updated — enableImageUpload:", enableImageUpload, "uploadToken present:", !!uploadToken);

    // Handle file input change — reads from ref so it never goes stale
    const handleImageSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            console.debug("[MDE:fileInput] file selected:", file ? `${file.name} (${file.type})` : "none");
            if (file) uploadImageRef.current(file);
            if (imageInputRef.current) imageInputRef.current.value = "";
        },
        [] // stable — no deps needed because we go through the ref
    );

    // ------------------------------------------------------------------
    // Drag-and-drop
    //
    // FIX for "cursor doesn't follow mouse":
    //   caretRangeFromPoint must be called with the *drop* event coords
    //   (not a cached dragover value) and only after the editor has focus.
    //   We no longer maintain a dropCoords ref — the drop event coords are
    //   always accurate at the moment of release.
    //
    // FIX for "spinner vanishes / upload not called":
    //   We call uploadImageRef.current (always the latest closure) instead
    //   of capturing uploadImage in this callback's dependency array, which
    //   was creating a stale reference cycle.
    // ------------------------------------------------------------------
    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            if (!isDragging.current) {
                console.debug("[MDE:drag] dragover started — Files detected");
            }
            isDragging.current = true;
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        // Only clear when leaving the pane entirely (not just crossing child elements)
        const related = e.relatedTarget as Node | null;
        if (!e.currentTarget.contains(related)) {
            console.debug("[MDE:drag] dragleave — exited pane");
            isDragging.current = false;
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            isDragging.current = false;

            console.group("[MDE:drop] drop event fired");
            console.debug("  dataTransfer.files count:", e.dataTransfer.files.length);
            console.debug("  dataTransfer.types:", Array.from(e.dataTransfer.types));

            const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.type.startsWith("image/")
            );

            console.debug("  image files after filter:", files.map(f => `${f.name} (${f.type}, ${f.size}b)`));

            if (!files.length) {
                console.warn("[MDE:drop] no image files found — bailing");
                console.groupEnd();
                return;
            }

            const el = editorRef.current;
            if (!el) {
                console.error("[MDE:drop] editorRef.current is null — bailing");
                console.groupEnd();
                return;
            }

            // Focus the editor so caret APIs operate inside it.
            el.focus();
            console.debug("  editor focused, clientX/Y:", e.clientX, e.clientY);

            const { clientX, clientY } = e;

            let baseRange: Range | null =
                document.caretRangeFromPoint?.(clientX, clientY) ?? null;
            console.debug("  caretRangeFromPoint result:", baseRange
                ? `node=${baseRange.startContainer.nodeName} offset=${baseRange.startOffset}`
                : "null");

            if (!baseRange) {
                // Firefox fallback
                const pos = (document as any).caretPositionFromPoint?.(clientX, clientY);
                console.debug("  caretPositionFromPoint (FF) result:", pos ?? "null");
                if (pos) {
                    baseRange = document.createRange();
                    baseRange.setStart(pos.offsetNode, pos.offset);
                    baseRange.collapse(true);
                }
            }

            // If the resolved range lands outside the editor, append to the end instead.
            if (baseRange && !el.contains(baseRange.startContainer)) {
                console.warn("[MDE:drop] resolved range is OUTSIDE editor — falling back to end of editor");
                baseRange = document.createRange();
                baseRange.selectNodeContents(el);
                baseRange.collapse(false);
            }

            if (!baseRange) {
                console.error("[MDE:drop] could not resolve any drop range — placeholders will be skipped");
            }

            for (const file of files) {
                console.debug(`  [MDE:drop] processing file: ${file.name}`);
                let placeholder: HTMLElement | undefined;

                if (baseRange) {
                    const r = baseRange.cloneRange();
                    placeholder = insertPlaceholderAtRange(r, file.name);
                    console.debug(`  [MDE:drop] placeholder inserted for ${file.name}:`, placeholder);
                    // Advance baseRange past the placeholder for the next file (if multiple)
                    baseRange = document.createRange();
                    baseRange.setStartAfter(placeholder);
                    baseRange.collapse(true);
                }

                console.debug(`  [MDE:drop] calling uploadImageRef.current for ${file.name}, placeholder:`, placeholder ?? "none");
                uploadImageRef.current(file, placeholder);
            }

            console.groupEnd();
        },
        [] // stable — editorRef and uploadImageRef are refs; insertPlaceholderAtRange is stable
    );

    // Toolbar actions
    const handleTool = useCallback(
        (tool: ToolDef) => {
            if (tool.id === "image-upload" && enableImageUpload) {
                imageInputRef.current?.click();
                return;
            }

            const el = editorRef.current;
            if (!el || disabled) return;
            el.focus();
            tool.exec(el, () => { });
            setTimeout(() => {
                if (!el) return;
                skipSync.current = true;
                onChange(htmlToMd(el));
            }, 0);
        },
        [onChange, disabled, enableImageUpload]
    );

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

    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const charCount = value.length;
    const showEditor = mode === "editor" || mode === "split";
    const showPreview = mode === "preview" || mode === "split";
    const showFooter = showCopy || showDownload;

    return (
        <div
            className="mde2 mde2-shell"
            style={{ ["--mde2-min-height" as string]: minHeight }}
        >
            {label && <label className="mde2-label">{label}</label>}

            <div className={`mde2-card${error ? " has-error" : ""}`}>
                <EditorToolbar
                    tools={TOOLS}
                    disabled={disabled}
                    enableImageUpload={enableImageUpload}
                    onToolSelect={handleTool}
                />

                {showTabs && <ViewTabs currentMode={mode} onModeChange={setMode} />}

                <div className="mde2-panes">
                    {showEditor && (
                        <div
                            className="mde2-pane"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <EditorPane
                                ref={editorRef}
                                disabled={disabled}
                                placeholder={placeholder}
                                onInput={handleInput}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
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

                {enableImageUpload && (
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="mde2-hidden-input"
                        onChange={handleImageSelect}
                        aria-label="Upload image"
                    />
                )}
            </div>

            {imageError.current && <p className="mde2-err">{imageError.current}</p>}
            {error && <p className="mde2-err">{error}</p>}
            {hint && !error && !imageError.current && <p className="mde2-hint">{hint}</p>}
        </div>
    );
}