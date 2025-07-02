import React from "react";
import {
  Loader,
  LoaderProps,
  LoaderOptions,
} from "@/app/components/types and interfaces/loaderTypes";

// Type definitions

interface LoaderContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Enhanced Loader Container Component
const LoaderContainer: React.FC<LoaderContainerProps> = ({
  children,
  className = "",
  style = {},
}) => (
  <div
    className={`inline-flex items-center justify-center ${className}`}
    style={style}
  >
    {children}
  </div>
);

// CSS-in-JS animations
const animations = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes barBounce {
    0%, 80%, 100% { transform: scaleY(0.6); }
    40% { transform: scaleY(1); }
  }
  
  @keyframes wave {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-15px); }
  }
  
  @keyframes gridPulse {
    0%, 70%, 100% { transform: scale(1); opacity: 0.7; }
    35% { transform: scale(1.3); opacity: 1; }
  }
  
  @keyframes morph {
    0% { border-radius: 0; transform: rotate(0deg); }
    25% { border-radius: 50%; }
    50% { border-radius: 0; transform: rotate(180deg); }
    75% { border-radius: 50%; }
    100% { border-radius: 0; transform: rotate(360deg); }
  }
  
  @keyframes ripple {
    0% { width: 0; height: 0; opacity: 1; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    100% { width: 100%; height: 100%; opacity: 0; top: 0; left: 0; transform: translate(0, 0); }
  }
  
  @keyframes spiral {
    0% { transform: rotate(0deg) translateX(15px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(15px) rotate(-360deg); }
  }
  
  @keyframes cubeFlip {
    0% { transform: perspective(120px) rotateX(0deg) rotateY(0deg); }
    50% { transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg); }
    100% { transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg); }
  }
  
  @keyframes elastic {
    0% { transform: scale(1); }
    25% { transform: scaleY(1.5) scaleX(0.8); }
    50% { transform: scaleY(0.8) scaleX(1.2); }
    100% { transform: scale(1); }
  }
  
  @keyframes pendulum {
    0% { transform: rotate(20deg); }
    50% { transform: rotate(-20deg); }
    100% { transform: rotate(20deg); }
  }
  
  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-10px); opacity: 1; }
  }
  
  @keyframes liquid {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
    33% { transform: translate(30px, -30px) scale(0.5); opacity: 0.7; }
    66% { transform: translate(-20px, 20px) scale(1.2); opacity: 0.4; }
  }
  
  @keyframes hexagon {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(0.8); }
    100% { transform: rotate(360deg) scale(1); }
  }
  
  @keyframes particle {
    0% { transform: translate(0, 0) scale(0); opacity: 1; }
    50% { transform: translate(20px, -20px) scale(1); opacity: 0.8; }
    100% { transform: translate(0, 0) scale(0); opacity: 0; }
  }
  
  @keyframes radar {
    0% { transform: rotate(0deg) scaleX(1); opacity: 0; }
    5% { opacity: 1; }
    100% { transform: rotate(360deg) scaleX(0.5); opacity: 0; }
  }
  
  @keyframes infinity {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(20px, 10px) rotate(90deg); }
    50% { transform: translate(0, 20px) rotate(180deg); }
    75% { transform: translate(-20px, 10px) rotate(270deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  
  @keyframes magnetic {
    0% { transform: translate(0, 0); }
    25% { transform: translate(10px, 10px); }
    50% { transform: translate(0, 0); }
    75% { transform: translate(-10px, -10px); }
    100% { transform: translate(0, 0); }
  }
  
  @keyframes spinnerDots {
    0% { opacity: 1; }
    100% { opacity: 0.2; }
  }
  
  @keyframes pulseRing {
    0% { width: 0; height: 0; opacity: 1; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    100% { width: 100%; height: 100%; opacity: 0; top: 0; left: 0; transform: translate(0, 0); }
  }
  
  @keyframes zigzag {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(15px, -15px); }
    50% { transform: translate(0, -30px); }
    75% { transform: translate(-15px, -15px); }
  }
  
  @keyframes bloom {
    0% { transform: rotate(0deg) scale(0.5); opacity: 0; }
    50% { transform: rotate(180deg) scale(1); opacity: 1; }
    100% { transform: rotate(360deg) scale(0.5); opacity: 0; }
  }
`;

// Loader Components
export const SpinLoader: React.FC<LoaderProps> = ({
  size = 40,
  color = "#3b82f6",
  thickness = 4,
}) => (
  <LoaderContainer>
    <div
      className="animate-spin rounded-full border-solid border-opacity-25"
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        borderColor: color,
        borderTopColor: "transparent",
        animation: "spin 0.8s linear infinite",
      }}
    />
  </LoaderContainer>
);

export const DotsLoader: React.FC<LoaderProps> = ({
  size = 8,
  color = "#3b82f6",
  gap = 4,
}) => (
  <LoaderContainer className="space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="rounded-full animate-pulse"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          marginRight: i < 2 ? gap : 0,
          animation: `pulse 1.4s ease-in-out infinite`,
          animationDelay: `${i * 0.16}s`,
        }}
      />
    ))}
  </LoaderContainer>
);

export const BarsLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  small = false,
}) => {
  const barStyle: React.CSSProperties = {
    width: small ? "3px" : "4px",
    backgroundColor: color,
    borderRadius: "2px",
    transformOrigin: "bottom",
  };

  return (
    <LoaderContainer
      className="space-x-1 items-end"
      style={{ height: small ? "20px" : "30px" }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            ...barStyle,
            height: small ? "10px" : "15px",
            animation: `barBounce 0.8s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </LoaderContainer>
  );
};

export const WaveLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  small = false,
}) => {
  const dotStyle: React.CSSProperties = {
    width: small ? "6px" : "8px",
    height: small ? "6px" : "8px",
    backgroundColor: color,
    borderRadius: "50%",
  };

  return (
    <LoaderContainer className="space-x-1 items-center">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            ...dotStyle,
            animation: `wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </LoaderContainer>
  );
};

export const OrbitLoader: React.FC<LoaderProps> = ({
  size = 40,
  color = "#3b82f6",
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute rounded-full border-2 border-opacity-20"
        style={{
          width: "100%",
          height: "100%",
          borderColor: color,
          animation: "spin 2s linear infinite",
        }}
      />
      <div
        className="absolute top-0 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2"
        style={{
          backgroundColor: color,
          animation: "spin 2s linear infinite",
          transformOrigin: `0 ${size / 2}px`,
        }}
      />
    </div>
  </LoaderContainer>
);

export const GridLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  small = false,
}) => {
  const squareSize = small ? "4px" : "6px";

  return (
    <LoaderContainer>
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: squareSize,
              height: squareSize,
              backgroundColor: color,
              animation: `gridPulse 1.5s ease-in-out infinite`,
              animationDelay: `${(i % 3) * 0.1 + Math.floor(i / 3) * 0.1}s`,
            }}
          />
        ))}
      </div>
    </LoaderContainer>
  );
};

export const MorphLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div
      style={{
        width: size * 0.3,
        height: size * 0.3,
        backgroundColor: color,
        animation: "morph 2s ease-in-out infinite",
      }}
    />
  </LoaderContainer>
);

export const RippleLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="absolute border-2 rounded-full"
          style={{
            borderColor: color,
            animation: `ripple 2s ease-out infinite`,
            animationDelay: `${i * 1}s`,
          }}
        />
      ))}
    </div>
  </LoaderContainer>
);

export const SpiralLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: color,
            animation: `spiral 1.5s linear infinite`,
            animationDelay: `${i * 0.375}s`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
          }}
        />
      ))}
    </div>
  </LoaderContainer>
);

export const CubeFlipLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 30,
}) => (
  <LoaderContainer>
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        animation: "cubeFlip 2s infinite ease-in-out",
      }}
    />
  </LoaderContainer>
);

export const ElasticLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div
      className="rounded-full"
      style={{
        width: size * 0.3,
        height: size * 0.3,
        backgroundColor: color,
        animation: "elastic 1.2s ease-in-out infinite",
      }}
    />
  </LoaderContainer>
);

export const GearLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          top: "10%",
          left: "10%",
          backgroundColor: color,
          clipPath:
            "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          animation: "spin 2s linear infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          top: "30%",
          left: "30%",
          backgroundColor: "transparent",
          border: `${size * 0.08}px solid ${color}`,
          animation: "spin 2s linear infinite reverse",
        }}
      />
    </div>
  </LoaderContainer>
);

export const PendulumLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute top-0 left-1/2 w-0.5 opacity-30"
        style={{
          height: size * 0.7,
          backgroundColor: color,
          transformOrigin: "top center",
          animation: "pendulum 1.5s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: color,
          left: "50%",
          top: "70%",
          transformOrigin: `0 -${size * 0.5}px`,
          animation: "pendulum 1.5s ease-in-out infinite",
        }}
      />
    </div>
  </LoaderContainer>
);

export const TypingLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer className="space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="rounded-full"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          backgroundColor: color,
          animation: `typing 1.8s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </LoaderContainer>
);

export const LiquidLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * 0.25,
            height: size * 0.25,
            backgroundColor: color,
            animation: `liquid 2s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  </LoaderContainer>
);

export const HexagonLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div
      style={{
        width: size * 0.6,
        height: size * 0.6,
        backgroundColor: color,
        clipPath:
          "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        animation: "hexagon 2s ease-in-out infinite",
      }}
    />
  </LoaderContainer>
);

export const ParticleLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * 0.1,
            height: size * 0.1,
            backgroundColor: color,
            animation: `particle 3s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  </LoaderContainer>
);

export const RadarLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div
      className="relative rounded-full border-2 border-opacity-20"
      style={{
        width: size,
        height: size,
        borderColor: color,
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 origin-left"
        style={{
          width: size * 0.4,
          height: "2px",
          backgroundColor: color,
          transformOrigin: "left center",
          animation: "radar 2s linear infinite",
        }}
      />
    </div>
  </LoaderContainer>
);

export const InfinityLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size * 0.5 }}>
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          backgroundColor: color,
          animation: "infinity 2s ease-in-out infinite",
        }}
      />
    </div>
  </LoaderContainer>
);

export const MagneticLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * 0.15,
            height: size * 0.15,
            backgroundColor: color,
            animation: `magnetic 1.5s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  </LoaderContainer>
);

export const SpinnerDotsLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * 0.15,
            height: size * 0.15,
            backgroundColor: color,
            top: "50%",
            left: "50%",
            transformOrigin: `0 ${size * 0.35}px`,
            transform: `rotate(${i * 45}deg)`,
            animation: `spinnerDots 1s linear infinite`,
            animationDelay: `${i * 0.125}s`,
          }}
        />
      ))}
    </div>
  </LoaderContainer>
);

export const PulseRingLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            borderColor: color,
            animation: `pulseRing 2s ease-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  </LoaderContainer>
);

export const ZigzagLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div
      className="rounded-full"
      style={{
        width: size * 0.2,
        height: size * 0.2,
        backgroundColor: color,
        animation: "zigzag 2s ease-in-out infinite",
      }}
    />
  </LoaderContainer>
);

export const BloomLoader: React.FC<LoaderProps> = ({
  color = "#3b82f6",
  size = 40,
}) => (
  <LoaderContainer>
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * 0.1,
            height: size * 0.3,
            backgroundColor: color,
            top: "50%",
            left: "50%",
            transformOrigin: "center bottom",
            transform: `rotate(${i * 60}deg)`,
            animation: `bloom 2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  </LoaderContainer>
);

// Loader registry
const loaderRegistry: Record<string, React.FC<LoaderProps>> = {
  "spin-loader": SpinLoader,
  "dots-loader": DotsLoader,
  "bars-loader": BarsLoader,
  "wave-loader": WaveLoader,
  "orbit-loader": OrbitLoader,
  "grid-loader": GridLoader,
  "morph-loader": MorphLoader,
  "ripple-loader": RippleLoader,
  "spiral-loader": SpiralLoader,
  "cube-flip-loader": CubeFlipLoader,
  "elastic-loader": ElasticLoader,
  "gear-loader": GearLoader,
  "pendulum-loader": PendulumLoader,
  "typing-loader": TypingLoader,
  "liquid-loader": LiquidLoader,
  "hexagon-loader": HexagonLoader,
  "particle-loader": ParticleLoader,
  "radar-loader": RadarLoader,
  "infinity-loader": InfinityLoader,
  "magnetic-loader": MagneticLoader,
  "spinner-dots": SpinnerDotsLoader,
  "pulse-ring": PulseRingLoader,
  "zigzag-loader": ZigzagLoader,
  "bloom-loader": BloomLoader,
};

export const getLoader = (slug: string): React.FC<LoaderProps> | null => {
  return loaderRegistry[slug] || null;
};

// List of available loader slugs
export const availableLoaders = Object.keys(loaderRegistry) as LoaderOptions[];

// Demo component showing usage
const LoaderDemo: React.FC = () => {
  const [selectedLoader, setSelectedLoader] =
    React.useState<Loader>("spin-loader");
  const LoaderComponent = getLoader(selectedLoader);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <style dangerouslySetInnerHTML={{ __html: animations }} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            TSX Loader Collection
          </h1>
          <p className="text-slate-300">
            24 Modern, TypeScript-ready loading animations
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Try a Loader</h2>

          <div className="mb-6">
            <select
              value={selectedLoader}
              onChange={(e) => setSelectedLoader(e.target.value as Loader)}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableLoaders.map((slug) => (
                <option key={slug} value={slug}>
                  {slug
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center items-center h-24 bg-slate-800/50 rounded-lg">
            {LoaderComponent && <LoaderComponent size={50} color="#10b981" />}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Usage Examples</h2>

          <div className="bg-slate-800/50 rounded-lg p-4 text-slate-300 font-mono text-sm">
            <div className="mb-4">
              <div className="text-green-400 mb-2">
                // Import individual loaders
              </div>
              <div>
                import {`{ SpinLoader, DotsLoader, getLoader }`} from
                './loaders';
              </div>
            </div>

            <div className="mb-4">
              <div className="text-green-400 mb-2">// Use directly</div>
              <div>&lt;SpinLoader size={`{40}`} color="#10b981" /&gt;</div>
            </div>

            <div>
              <div className="text-green-400 mb-2">// Use with slug</div>
              <div>const LoaderComponent = getLoader('spin-loader');</div>
              <div>&lt;LoaderComponent size={`{40}`} color="#10b981" /&gt;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderDemo;
