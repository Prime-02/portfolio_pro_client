import NextImage, { ImageProps as NextImageProps } from "next/image";

interface ImageComponentProps extends Omit<NextImageProps, 'src'> {
    optimizeImg?: boolean;
    src: string;
    alt: string;
}

const Image = ({
    optimizeImg = true,
    src,
    alt,
    ...props
}: ImageComponentProps) => {
    // Check if the URL contains thum.io and proxy it through /api/snapshot
    const processedSrc = src.includes('https://image.thum.io')
        ? `/api/snapshot?url=${encodeURIComponent(src)}`
        : src;

    if (!optimizeImg) {
        const { width, height, ...rest } = props;
        // eslint-disable-next-line @next/next/no-img-element
        return (
            <img
                src={processedSrc}
                alt={alt}
                width={width}
                height={height}
                {...rest}
            />
        );
    }

    return (
        <NextImage
            {...props}
            src={processedSrc}
            alt={alt}
        />
    );
};

export default Image;