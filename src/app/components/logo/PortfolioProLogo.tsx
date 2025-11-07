import React from 'react';
import { useTheme } from '../theme/ThemeContext ';

interface LoadingAnimationProps {
  scale?: number;
  variant?: 'logo' | 'logo-fill' | 'banner' | 'banner-fill';
}

export const PortfolioProLogo: React.FC<LoadingAnimationProps> = ({ 
  scale = 1,
  variant = 'logo'
}) => {
  const { isDarkMode } = useTheme();
  
  const images = {
    logo: `/socials/profolio/${!isDarkMode ? "profolio-03" : "profolio-04"}.svg`,
    'logo-fill': `/socials/profolio/${!isDarkMode ? "profolio-02" : "profolio-01"}.png`,
    banner: `/socials/profolio/${!isDarkMode ? "profolio-06" : "profolio-07"}.svg`,
    'banner-fill': `/socials/profolio/${!isDarkMode ? "profolio-08" : "profolio-05"}.png`
  };
  
  const baseSize = 200;
  const size = baseSize * scale;
  
  // Determine if we're using a banner variant for aspect ratio
  const isBanner = variant.includes('banner');
  const width = isBanner ? size * 2 : size; // Banners are typically wider
  const height = size;

  return (
    <div className="flex w-fit items-center justify-center">
      <img 
        src={images[variant]}
        alt="Portfolio Pro Logo"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'contain'
        }}
        className="select-none"
      />
    </div>
  );
};

export default PortfolioProLogo;