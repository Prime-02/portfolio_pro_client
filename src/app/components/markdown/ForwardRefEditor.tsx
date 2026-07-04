// ForwardRefEditor.tsx
//
// MDXEditor doesn't support server rendering. This wrapper is the only
// place InitializedMDXEditor is imported, and it's loaded via next/dynamic
// with ssr: false so Next.js never tries to render it on the server.
"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { InitializedMDXEditorProps } from "./InitializedMDXEditor";

const Editor = dynamic(() => import("./InitializedMDXEditor"), {
    ssr: false,
    loading: () => (
        <div style={{ padding: 20, fontFamily: "monospace", opacity: 0.6 }}>
            Loading editor…
        </div>
    ),
});

export const ForwardRefEditor = forwardRef<MDXEditorMethods, Omit<InitializedMDXEditorProps, "editorRef">>(
    (props, ref) => <Editor {...props} editorRef={ref} />
);

ForwardRefEditor.displayName = "ForwardRefEditor";