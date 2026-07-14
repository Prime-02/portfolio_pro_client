import React from 'react'
import "@/portfolio-builder/styles/portfolio-theme.css";

const PortfolioViewLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className='bg-[var(--pb-background)]'> 
            {children}
        </div>
    )
}

export default PortfolioViewLayout
