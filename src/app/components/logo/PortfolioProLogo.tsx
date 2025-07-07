import React from 'react';

interface LoadingAnimationProps {
  scale?: number;
}

export const PortfolioProLogo: React.FC<LoadingAnimationProps> = ({ scale = 1 }) => {
  const baseSize = 200;
  const size = baseSize * scale;
  const squareSize = 35 * scale;
  const offset = 20 * scale; // Offset for diagonal positioning
  
  // All squares are the same size
  const squareWidth = size;
  const squareHeight = size;
  
  // Calculate the total container size to accommodate all squares
  const containerWidth = squareWidth + (2 * offset);
  const containerHeight = squareHeight + (2 * offset);
  
  // Define positions for each square (bottom-left to top-right diagonal)
  const positions = {
    outer: { left: 0, top: 2 * offset },
    middle: { left: offset, top: offset },
    inner: { left: 2 * offset, top: 0 }
  };
  
  // Static position for the small square (bottom-left corner of outer square)
  const staticSquarePosition = {
    left: positions.outer.left + 30,
    top: positions.outer.top + squareHeight - squareSize - 30
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className="relative"
        style={{ 
          width: `${containerWidth}px`, 
          height: `${containerHeight}px` 
        }}
      >
        {/* Outer square (bottom-left) */}
        <div 
          className="absolute border-2 border-[var(--foreground)]"
          style={{
            width: `${squareWidth}px`,
            height: `${squareHeight}px`,
            left: `${positions.outer.left}px`,
            top: `${positions.outer.top}px`
          }}
        />

        {/* Middle square (center) */}
        <div 
          className="absolute border-2 border-[var(--foreground)]"
          style={{
            width: `${squareWidth}px`,
            height: `${squareHeight}px`,
            left: `${positions.middle.left}px`,
            top: `${positions.middle.top}px`
          }}
        />

        {/* Inner square (top-right) */}
        <div 
          className="absolute border-2 border-[var(--foreground)]"
          style={{
            width: `${squareWidth}px`,
            height: `${squareHeight}px`,
            left: `${positions.inner.left}px`,
            top: `${positions.inner.top}px`
          }}
        />
        
        {/* Static filled square */}
        <div 
          className="absolute bg-[var(--foreground)]"
          style={{
            width: `${squareSize}px`,
            height: `${squareSize}px`,
            left: `${staticSquarePosition.left}px`,
            top: `${staticSquarePosition.top}px`
          }}
        />
      </div>
    </div>
  );
};

export default PortfolioProLogo;