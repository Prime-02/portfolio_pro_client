import React, { useState } from 'react';

interface MenuIconProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    initiallyOpen?: boolean;
    isOpen?: boolean; // Added controlled prop
    onToggle?: (isOpen: boolean) => void;
}

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const PATHS = {
    top: {
        closed: 'M9,6 Q15,6 21,6',
        open: 'M6,6 Q12,12 18,18',
    },
    middle: {
        closed: 'M3,12 Q12,12 21,12',
        open: 'M12,12 Q12,12 12,12',
    },
    bottom: {
        closed: 'M3,18 Q9,18 15,18',
        open: 'M6,18 Q12,12 18,6',
    },
};

const MenuIconLiquid: React.FC<MenuIconProps> = ({
    size = 28,
    color = '#1a1a1a',
    strokeWidth = 2,
    className = '',
    initiallyOpen = false,
    isOpen: controlledIsOpen,
    onToggle,
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(initiallyOpen);
    const [isPressed, setIsPressed] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    const handleClick = () => {
        const newState = !isOpen;

        // Only update internal state if not controlled
        if (controlledIsOpen === undefined) {
            setInternalIsOpen(newState);
        }

        onToggle?.(newState);
    };

    const pathBase: React.CSSProperties = {
        fill: 'none',
        stroke: color,
        strokeWidth,
        strokeLinecap: 'round',
        transition: `d 0.5s ${SPRING}`,
    };

    return (
        <button
            onClick={handleClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            className={`menu-icon-button ${className}`}
            style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                transition: `transform 0.25s ${SPRING}`,
            }}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
            {/* Glow that blooms in behind the icon when open */}
            <span
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${color}26 0%, ${color}00 70%)`,
                    transform: isOpen ? 'scale(1.4)' : 'scale(0)',
                    opacity: isOpen ? 1 : 0,
                    transition: `transform 0.45s ${SPRING}, opacity 0.35s ease`,
                    pointerEvents: 'none',
                }}
            />

            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'relative' }}
            >
                {/* Top line */}
                <path
                    d={isOpen ? PATHS.top.open : PATHS.top.closed}
                    style={pathBase}
                />

                {/* Middle line */}
                <path
                    d={isOpen ? PATHS.middle.open : PATHS.middle.closed}
                    style={{
                        ...pathBase,
                        opacity: isOpen ? 0 : 1,
                        transition: `d 0.4s ${SPRING}, opacity 0.25s ease 0.05s`,
                    }}
                />

                {/* Bottom line */}
                <path
                    d={isOpen ? PATHS.bottom.open : PATHS.bottom.closed}
                    style={{
                        ...pathBase,
                        transition: `d 0.5s ${SPRING} 0.03s`,
                    }}
                />

                {/* Center dot */}
                <circle
                    cx={12}
                    cy={12}
                    r={isOpen ? 1.4 : 0}
                    fill={color}
                    style={{ transition: `r 0.3s ${SPRING} 0.3s` }}
                />
            </svg>
        </button>
    );
};

export default MenuIconLiquid;