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
            <div className={`relative w-full`}>
                {children}
            </div>
        </div>
    )
}

export default PublicLayout