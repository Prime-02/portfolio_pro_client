import React, { useRef } from "react";
import { FaCheck, FaInfoCircle } from "react-icons/fa";
import { useTheme } from "../theme/ThemeContext ";

interface CheckBoxProps {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  target?: boolean;
  id?: string;
  description?: string;
  showDescriptionOn?: "hover" | "checked" | "always";
  direction?: "left" | "right" | "top" | "bottom";
}

const CheckBox: React.FC<CheckBoxProps> = ({
  isChecked,
  setIsChecked,
  target = false,
  id = "check",
  description,
  showDescriptionOn = "hover",
  direction = "right",
}) => {
  const { theme, accentColor } = useTheme();
  const descriptionRef = useRef<HTMLDivElement>(null);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleCheckboxTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const shouldShowDescription = (): boolean => {
    if (!description) return false;
    switch (showDescriptionOn) {
      case "checked":
        return isChecked;
      case "always":
        return true;
      case "hover":
      default:
        return false;
    }
  };

  const getPopupStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      padding: '8px 12px',
      background: theme.background,
      color: theme.foreground,
      border: `1px solid ${accentColor.color}`,
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      minWidth: '200px',
      maxWidth: '300px',
      zIndex: 1000,
      fontSize: '14px',
      lineHeight: '1.4',
      whiteSpace: 'pre-wrap',
    };

    switch (direction) {
      case "left":
        return {
          ...baseStyles,
          top: '50%',
          right: '100%',
          transform: 'translateY(-50%)',
          marginRight: '10px',
        };
      case "top":
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '10px',
        };
      case "bottom":
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '10px',
        };
      case "right":
      default:
        return {
          ...baseStyles,
          top: '50%',
          left: '100%',
          transform: 'translateY(-50%)',
          marginLeft: '10px',
        };
    }
  };

  const checkboxStyles: React.CSSProperties = {
    backgroundColor: isChecked ? accentColor.color : theme.background,
    borderRadius: '5px',
    width: '25px',
    height: '25px',
    border: `2px solid ${accentColor.color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <>
      <style>{`
        @keyframes checkboxBounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.5, 0.5); }
          50% { transform: scale(0.5, 1.5); }
          60% { transform: scale(1.3, 0.7); }
          70% { transform: scale(0.8, 1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes checkAppear {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.5); 
          }
          100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }
        
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          max-width: 400px;
          width: auto;
        }
        
        .checkbox-wrapper {
          position: relative;
        }
        
        .checkbox-input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          width: 25px;
          height: 25px;
          margin: 0;
          z-index: 10;
        }
        
        .check-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          opacity: ${isChecked ? 1 : 0};
          animation: ${isChecked ? 'checkAppear 0.3s ease-out 0.1s both' : 'none'};
          pointer-events: none;
        }
        
        .info-icon-wrapper {
          display: flex;
          align-items: center;
          height: 25px;
          position: relative;
        }
        
        .info-icon {
          color: ${accentColor.color};
          cursor: help;
          font-size: 16px;
          transition: color 0.2s ease;
        }
        
        .info-icon:hover {
          color: ${accentColor.color};
          opacity: 0.8;
        }
        
        .description-popup {
          opacity: ${shouldShowDescription() ? 1 : 0};
          visibility: ${shouldShowDescription() ? 'visible' : 'hidden'};
          transition: opacity 0.2s ease, visibility 0.2s ease;
          pointer-events: none;
        }
        
        .description-popup.hover-trigger {
          opacity: 0;
          visibility: hidden;
        }
        
        .info-icon-wrapper:hover .description-popup.hover-trigger {
          opacity: 1;
          visibility: visible;
        }
      `}</style>
      
      <div className="checkbox-container">
        <div className="checkbox-wrapper">
          <input
            id={id}
            type="checkbox"
            className="checkbox-input"
            checked={isChecked}
            onChange={target ? handleCheckboxTarget : handleCheckboxChange}
            aria-checked={isChecked}
            aria-describedby={description ? `${id}-description` : undefined}
          />
          <div 
            style={{
              ...checkboxStyles,
              animation: isChecked ? 'checkboxBounce 0.5s ease-out' : undefined,
            }}
          >
            <FaCheck className="check-icon" />
          </div>
        </div>

        {description && (
          <div className="info-icon-wrapper">
            {(showDescriptionOn === "hover" || showDescriptionOn === "always") && (
              <FaInfoCircle className="info-icon" />
            )}
            <div
              id={`${id}-description`}
              className={`description-popup ${showDescriptionOn === "hover" ? "hover-trigger" : ""}`}
              style={getPopupStyles()}
              ref={descriptionRef}
            >
              {description}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CheckBox;