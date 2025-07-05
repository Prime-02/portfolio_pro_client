import React from 'react';

export interface LoadingAnimationProps {
  scale?: number;
  speed?: number
}

export const PortfolioPro: React.FC<LoadingAnimationProps> = ({ scale = 1, speed = 0.3 }) => {
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
  
  // Calculate movement path for the small [var(--foreground)] square
  // It should move in a rectangle from outer square's inner edge to inner square's outer edge
  const movementBounds = {
    left: positions.outer.left + 30,
    right: positions.inner.left + squareWidth - squareSize - 30,
    top: positions.inner.top + 30,
    bottom: positions.outer.top + squareHeight - squareSize - 30
  };

  return (
    <div className="flex items-center justify-center p-8">
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
        
        {/* Animated [var(--foreground)] square */}
        <div 
          className="absolute bg-[var(--foreground)]"
          style={{
            width: `${squareSize}px`,
            height: `${squareSize}px`,
            animation: `moveSquare ${speed}s linear infinite`
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes moveSquare {
          0% {
            left: ${movementBounds.left}px;
            top: ${movementBounds.bottom}px;
          }
          25% {
            left: ${movementBounds.right}px;
            top: ${movementBounds.bottom}px;
          }
          50% {
            left: ${movementBounds.right}px;
            top: ${movementBounds.top}px;
          }
          75% {
            left: ${movementBounds.left}px;
            top: ${movementBounds.top}px;
          }
          100% {
            left: ${movementBounds.left}px;
            top: ${movementBounds.bottom}px;
          }
        }
      `}</style>
    </div>
  );
};

export default PortfolioPro;