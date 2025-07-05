import React, { useEffect, useRef, useState } from "react";

const PortfolioProLogo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLSpanElement>(null);
  const [lineWidth, setLineWidth] = useState(0);
  const [lineHeight, setLineHeight] = useState(4);
  const [isVisible, setIsVisible] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const fullText = "PORTFOLIO.pro";
  const typingSpeed = 170; // milliseconds per character (smoother)
  const cursorBlinkSpeed = 400; // milliseconds
  const reanimateDelay = 100000; // 5 seconds before reanimating

  useEffect(() => {
    const calculateDimensions = () => {
      if (portfolioRef.current && containerRef.current) {
        const portfolioWidth = portfolioRef.current.offsetWidth;
        const containerWidth = containerRef.current.offsetWidth;
        
        // Calculate line width relative to PORTFOLIO text width
        const calculatedLineWidth = portfolioWidth * 0.8; // 80% of PORTFOLIO width
        
        // Calculate line height based on font size, more conservative scaling
        const fontSize = parseInt(getComputedStyle(portfolioRef.current).fontSize);
        const calculatedLineHeight = Math.max(2, Math.min(6, fontSize * 0.05)); // More conservative height
        
        setLineWidth(calculatedLineWidth);
        setLineHeight(calculatedLineHeight);
      }
    };

    calculateDimensions();
    
    window.addEventListener('resize', calculateDimensions);
    
    // Use timeout to ensure fonts are loaded
    setTimeout(calculateDimensions, 100);
    
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // Intersection Observer to detect when component comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Reset animation state
          setDisplayText("");
          setCurrentIndex(0);
          setIsTypingComplete(false);
          setShowCursor(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of component is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Typing effect
  useEffect(() => {
    if (!isVisible) return;

    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else {
      setIsTypingComplete(true);
      // Hide cursor after typing is complete
      setTimeout(() => setShowCursor(false), 1000);
      
      // Reanimate after 5 seconds
      setTimeout(() => {
        setDisplayText("");
        setCurrentIndex(0);
        setIsTypingComplete(false);
        setShowCursor(true);
      }, reanimateDelay);
    }
  }, [currentIndex, isVisible, fullText]);

  // Cursor blinking effect
  useEffect(() => {
    if (!isVisible || !showCursor) return;

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(cursorTimer);
  }, [isVisible, showCursor]);

  const renderText = () => {
    const portfolioText = displayText.includes('.') ? displayText.split('.')[0] : displayText;
    const proText = displayText.includes('.') ? '.' + displayText.split('.')[1] : '';
    
    return (
      <div className="text-3xl sm:text-4xl  md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-serif text-[var(--foreground)] leading-none">
        <div className="relative inline-block">
          <span 
            ref={portfolioRef} 
            className="relative z-10 tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.35em]"
          >
            {portfolioText}
          </span>
        </div>
        <span className="text-[1.5rem] sm:text-[2rem] md:text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] 2xl:text-[4rem] font-normal tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.35em]">
          {proText}
        </span>
        {/* Blinking cursor */}
        <span 
          className={`inline-block w-0.5 sm:w-1 bg-[var(--foreground)] ml-1 transition-opacity duration-300 ${
            showCursor ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            height: '0.8em',
            transform: 'translateY(-0.1em)',
            display: 'inline-block'
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div ref={containerRef} className="relative w-full max-w-6xl">
        {/* Main text container with better responsive scaling */}
        <div className="flex items-center justify-center">
          {renderText()}
        </div>
      </div>
    </div>
  );
};

export default PortfolioProLogo;