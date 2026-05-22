const PortfolioSkeleton = () => (
    <div className="card rounded-xl border border-[var(--foreground)]/10 p-5 animate-pulse">
        <div className="h-40 bg-[var(--foreground)]/5 rounded-lg mb-4" />
        <div className="h-5 bg-[var(--foreground)]/5 rounded w-3/4 mb-2" />
        <div className="h-4 bg-[var(--foreground)]/5 rounded w-1/2 mb-4" />
        <div className="flex gap-2">
            <div className="h-8 bg-[var(--foreground)]/5 rounded w-20" />
            <div className="h-8 bg-[var(--foreground)]/5 rounded w-20" />
        </div>
    </div>
)

export default PortfolioSkeleton