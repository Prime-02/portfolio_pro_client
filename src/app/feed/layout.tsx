import React from 'react'
import NavBar from '../components/feed/NavBar';

const PublicLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className='max-h-screen h-screen overflow-auto custom-scrollbar'>
            <NavBar />
            {children}
        </div>
    )
}

export default PublicLayout
