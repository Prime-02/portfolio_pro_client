import React from 'react'
import "@/portfolio-builder/styles/portfolio-theme.css";

const StudioLayout = ({
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

export default StudioLayout
