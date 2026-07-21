

// components/ui/SectionDesc.tsx
export function ASSectionDesc({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-1 text-sm text-(--foreground)/60">{children}</p>
    );
}
