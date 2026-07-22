// InitializedMDXEditor.tsx
//
// This file may import '@mdxeditor/editor' directly and touch the DOM/window
// at module scope, so it must NEVER be imported outside of a next/dynamic
// boundary with { ssr: false }. See ForwardRefEditor.tsx.
"use client";

import { type ForwardedRef } from "react";
import {
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    linkPlugin,
    linkDialogPlugin,
    imagePlugin,
    tablePlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    UndoRedo,
    Separator,
    BoldItalicUnderlineToggles,
    StrikeThroughSupSubToggles,
    BlockTypeSelect,
    ListsToggle,
    CreateLink,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    InsertCodeBlock,
    ConditionalContents,
    ChangeCodeMirrorLanguage,
    type ImageUploadHandler,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export interface InitializedMDXEditorProps extends MDXEditorProps {
    editorRef: ForwardedRef<MDXEditorMethods> | null;
    imageUploadHandler?: ImageUploadHandler;
    /** Renders extra buttons (file-tree, collapsible) after the standard toolbar */
    extraToolbarContent?: React.ReactNode;
}

export default function InitializedMDXEditor({
    editorRef,
    imageUploadHandler,
    extraToolbarContent,
    ...props
}: InitializedMDXEditorProps) {
    return (
        <MDXEditor
            {...props}
            ref={editorRef}
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin({
                    imageUploadHandler,
                    // Explicit dimensions aren't part of plain markdown image
                    // syntax; MDXEditor falls back to <Image width height> when
                    // the user resizes, which your MarkdownRenderer already
                    // needs to render (see resolveRendererImageSrc there).
                    disableImageResize: false,
                }),
                tablePlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
                codeMirrorPlugin({
                    codeBlockLanguages: {
                        "": "text",
                        js: "JavaScript",
                        ts: "TypeScript",
                        jsx: "JSX",
                        tsx: "TSX",
                        css: "CSS",
                        html: "HTML",
                        json: "JSON",
                        bash: "Bash",
                        python: "Python",
                        sql: "SQL",
                    },
                }),
                // Gives us the "Write / Source" toggle your ViewTabs used to
                // provide manually — plus it's what makes the raw-markdown
                // <-> WYSIWYG round-trip debuggable if content ever looks off.
                diffSourcePlugin({ viewMode: "rich-text" }),
                markdownShortcutPlugin(),
                toolbarPlugin({
                    toolbarClassName: "mde2-mdx-toolbar",
                    toolbarContents: () => (
                        <>
                            <UndoRedo />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <StrikeThroughSupSubToggles />
                            <Separator />
                            <BlockTypeSelect />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <CreateLink />
                            <InsertImage />
                            <InsertTable />
                            <InsertThematicBreak />
                            <Separator />
                            <ConditionalContents
                                options={[
                                    {
                                        when: (editor) => editor?.editorType === "codeblock",
                                        contents: () => <ChangeCodeMirrorLanguage />,
                                    },
                                    { fallback: () => <InsertCodeBlock /> },
                                ]}
                            />
                            {extraToolbarContent}
                        </>
                    ),
                }),
            ]}
        />
    );
}