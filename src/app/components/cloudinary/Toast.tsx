"use client";

// Toast.tsx — floating toast notification

interface ToastProps {
    message: string | null;
}

export function Toast({ message }: ToastProps) {
    if (!message) return null;

    return (
        <>
            <div
                className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-sm px-5 py-2.5 text-xs font-mono tracking-[0.05em] shadow-2xl z-[9999] pointer-events-none animate-[toastIn_0.15s_ease]"
                style={{
                    backgroundColor: "var(--foreground)",
                    color: "var(--background)",
                }}
            >
                {message}
            </div>

            <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
        </>
    );
}