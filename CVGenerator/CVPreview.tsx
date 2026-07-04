// components/CVGenerator/CVPreview.tsx
import { useRef, useState, useEffect } from "react";
import type { CVPreviewProps } from "./types";
import { COMPLEXITY_MODES } from "./constants";

export default function CVPreview({
  cvHtml,
  complexity,
  tone,
  sections,
  error,
  onReconfigure,
}: CVPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Track browser back button and prevent navigation
  useEffect(() => {
    // Push a new state to create an entry for the back button
    window.history.pushState({ preview: true }, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // When back button is pressed, call onReconfigure instead
      event.preventDefault();
      onReconfigure();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onReconfigure]);

  const handleDownloadPDF = () => {
    if (!iframeRef.current) return;
    const iframeWindow = iframeRef.current.contentWindow;
    if (iframeWindow) {
      iframeWindow.focus();
      iframeWindow.print();
    }
  };

  const modeLabel = COMPLEXITY_MODES.find((m) => m.id === complexity)?.label;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-wrap gap-3 sticky top-0 z-10 bg-[var(--background)] border-[var(--foreground)]/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onReconfigure}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
            style={{
              color: 'var(--foreground)',
              opacity: 0.7
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.backgroundColor = 'var(--foreground)';
              e.currentTarget.style.color = 'var(--background)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--foreground)';
            }}
          >
            <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
            Reconfigure
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
            <span style={{ color: 'var(--foreground)', fontWeight: 600, opacity: 1 }}>{modeLabel}</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span className="capitalize">{tone}</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>{sections.length} sections</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg shadow-md transition-all disabled:cursor-not-allowed reverse-card"
            style={{
              opacity: downloading ? 0.6 : 1,
              boxShadow: '0 4px 6px -1px var(--foreground), 0 2px 4px -2px var(--foreground)'
            }}
          >
            <i
              className={`ti ${downloading ? "ti-loader-2 animate-spin" : "ti-printer"}`}
              style={{ fontSize: 14 }}
            />
            {downloading ? "Preparing…" : "Save as PDF"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 text-sm border-b" style={{
          backgroundColor: 'var(--foreground)',
          color: 'var(--background)',
          borderColor: 'var(--foreground)',
          opacity: 0.9
        }}>
          <i className="ti ti-alert-circle flex-shrink-0" style={{ fontSize: 16 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Area */}
      <div className="flex-1 p-4 md:p-6 flex justify-center">
        {cvHtml ? (
          <iframe
            ref={iframeRef}
            srcDoc={cvHtml}
            title="CV Preview"
            sandbox="allow-same-origin allow-modals allow-popups"
            className="w-full max-w-4xl border-0 rounded-lg card"
            style={{
              minHeight: 900,
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)",
            }}
            onLoad={(e) => {
              try {
                const iframe = e.target as HTMLIFrameElement;
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                  const height = Math.max(
                    doc.body.scrollHeight,
                    doc.documentElement.scrollHeight,
                    doc.body.offsetHeight,
                    doc.documentElement.offsetHeight
                  );
                  iframe.style.height = height + "px";
                }
              } catch {
                // Cross-origin issues are ignored
              }
            }}
          />
        ) : (
          <EmptyState onReconfigure={onReconfigure} />
        )}
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onReconfigure }: { onReconfigure: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md">
      <i
        className="ti ti-file-off mb-6"
        style={{
          fontSize: 64,
          color: 'var(--foreground)',
          opacity: 0.3
        }}
      />
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        No CV Generated Yet
      </h3>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
        Click "Reconfigure" to adjust your CV settings, then click "Generate CV" to create your preview.
      </p>
      <button
        onClick={onReconfigure}
        className="flex items-center gap-1.5 px-6 py-3 rounded-lg shadow-md transition-all reverse-card"
        style={{
          boxShadow: '0 4px 6px -1px var(--foreground), 0 2px 4px -2px var(--foreground)'
        }}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
        Go to Configuration
      </button>
    </div>
  );
}