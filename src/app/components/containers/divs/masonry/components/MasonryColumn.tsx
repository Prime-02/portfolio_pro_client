import { AlignItems } from '@/app/components/types and interfaces/masonry';
import React, { ReactNode } from 'react';

interface MasonryColumnProps {
  children: ReactNode[];
  gapY: number;
  alignItems: AlignItems;
  columnClassName: string;
  columnStyle: React.CSSProperties;
  animated: boolean;
  staggerDelay: number;
  columnIndex: number;
}

export const MasonryColumn: React.FC<MasonryColumnProps> = ({
  children,
  gapY,
  alignItems,
  columnClassName,
  columnStyle,
  animated,
  staggerDelay,
  columnIndex,
}) => {
  const alignItemsClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  }[alignItems];

  return (
    <div
      className={`flex-1 flex flex-col ${alignItemsClass} ${columnClassName}`}
      style={{
        gap: `${gapY}px`,
        ...(animated && staggerDelay
          ? { animationDelay: `${columnIndex * staggerDelay}ms` }
          : {}),
        ...columnStyle,
      }}
    >
      {children}
    </div>
  );
};
