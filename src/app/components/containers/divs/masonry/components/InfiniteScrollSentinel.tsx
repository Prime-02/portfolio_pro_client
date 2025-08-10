import { getLoader } from '@/app/components/loaders/Loader';
import { useTheme } from '@/app/components/theme/ThemeContext ';
import React from 'react';
interface InfiniteScrollSentinelProps {
  ref: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  position: 'top' | 'bottom';
}

export const InfiniteScrollSentinel: React.FC<InfiniteScrollSentinelProps> = ({
  ref,
  isLoading,
  position
}) => {
    const {accentColor, loader} = useTheme()
    const LoaderComponent = getLoader(loader) || null
    return (
        (
  <div
    ref={ref}
    className="w-full flex justify-center py-4"
    style={{ minHeight: "20px" }}
  >
    {isLoading && (<>
    {
        LoaderComponent ? <LoaderComponent color={accentColor.color}  /> : <span>Loading...</span>
    }
    </>)}
  </div>
))
}

