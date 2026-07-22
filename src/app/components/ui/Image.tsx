import NextImage, { ImageProps as NextImageProps } from "next/image";

interface ImageComponentProps extends Omit<NextImageProps, 'src'> {
    optimizeImg?: boolean;
    src: string;
    alt: string;
}

const Image = ({
    optimizeImg = true,
    ...props
}: ImageComponentProps) => {
    if (!optimizeImg) {
        const { src, alt, width, height, ...rest } = props;
        // eslint-disable-next-line @next/next/no-img-element
        return (
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                {...rest}
            />
        );
    }

    return <NextImage {...props} />;
};

export default Image;