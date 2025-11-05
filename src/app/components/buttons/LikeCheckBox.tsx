import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LikeCheckboxProps {
  liked: boolean;
  onLikeChange: (liked: boolean) => void;
  size?: number;
  likedColor?: string;
  unlikedColor?: string;
  disabled?: boolean;
}

const LikeCheckbox: React.FC<LikeCheckboxProps> = ({
  liked,
  onLikeChange,
  size = 24,
  likedColor = '#ef4444',
  unlikedColor = '#9ca3af',
  disabled = false
}) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [prevLiked, setPrevLiked] = useState<boolean>(liked);

  // Detect when parent changes the liked state to trigger animation
  useEffect(() => {
    if (liked !== prevLiked) {
      setPrevLiked(liked);
      if (liked) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
    }
  }, [liked, prevLiked]);

  const handleToggle = () => {
    if (disabled) return;
    onLikeChange(!liked);
  };

  const getHeartColor = () => {
    if (disabled) {
      return liked ? '#d1d5db' : '#e5e7eb';
    }
    return liked ? likedColor : unlikedColor;
  };

  const getStrokeColor = () => {
    if (disabled) {
      return liked ? '#d1d5db' : '#9ca3af';
    }
    return liked ? likedColor : unlikedColor;
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`inline-flex items-center justify-center py-1 rounded-full transition-all duration-200 ${
        disabled 
          ? 'cursor-not-allowed opacity-60' 
          : 'hover:opacity-80 active:scale-95 cursor-pointer'
      }`}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart
        size={size}
        fill={getHeartColor()}
        stroke={getStrokeColor()}
        className={`transition-all duration-200 ${
          isAnimating ? 'animate-[heartBeat_0.6s_ease-in-out]' : ''
        }`}
        style={{
          animation: isAnimating ? 'heartBeat 0.6s ease-in-out' : 'none'
        }}
      />
      <style>{`
        @keyframes heartBeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.3); }
          30% { transform: scale(0.9); }
          45% { transform: scale(1.15); }
          60% { transform: scale(0.95); }
          75% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  );
};

export default LikeCheckbox;