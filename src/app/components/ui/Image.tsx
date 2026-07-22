"use client";

import NextImage, { ImageProps as NextImageProps } from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface ImageComponentProps extends Omit<NextImageProps, 'src' | 'width' | 'height'> {
    optimizeImg?: boolean;
    src: string;
    alt: string;
    fallbackSrc?: string;
    width?: number;
    height?: number;
    fill?: boolean;
}

const Image = ({
    optimizeImg = false,
    src,
    alt,
    fallbackSrc,
    width,
    height,
    fill,
    ...props
}: ImageComponentProps) => {
    const [error, setError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    // Check if the URL contains thum.io and proxy it through /api/snapshot
    const processedSrc = imgSrc.includes('https://image.thum.io')
        ? `/api/snapshot?url=${encodeURIComponent(imgSrc)}`
        : imgSrc;

    const handleError = () => {
        if (fallbackSrc && !error) {
            setImgSrc(fallbackSrc);
            setError(true);
        } else {
            setError(true);
        }
    };

    if (error && !fallbackSrc) {
        // Render a placeholder with Lucide icon when image fails
        const containerWidth = width || 100;
        const containerHeight = height || 100;
        return (
            <div
                style={{
                    width: containerWidth,
                    height: containerHeight,
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                }}
                role="img"
                aria-label={alt || 'Image failed to load'}
            >
                <ImageIcon size={Math.min(containerWidth, containerHeight) * 0.4} strokeWidth={1.5} />
            </div>
        );
    }

    if (!optimizeImg) {
        // eslint-disable-next-line @next/next/no-img-element
        return (
            <img
                src={processedSrc}
                alt={alt}
                width={width}
                height={height}
                onError={handleError}
                {...props}
            />
        );
    }

    // Use fill mode if no explicit width/height provided
    if (fill || (!width && !height)) {
        return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <NextImage
                    src={processedSrc}
                    alt={alt}
                    fill
                    onError={handleError}
                    {...props}
                />
            </div>
        );
    }

    return (
        <NextImage
            src={processedSrc}
            alt={alt}
            width={width}
            height={height}
            onError={handleError}
            {...props}
        />
    );
};

export default Image;