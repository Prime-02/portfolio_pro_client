import { FaCheck } from "react-icons/fa"; // Import the check icon from react-icons
import { useTheme } from "../theme/ThemeContext ";

interface CheckBoxProps {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  target?: boolean;
  id?: string;
}

const CheckBox = ({
  isChecked,
  setIsChecked,
  target = false,
  id = "check",
}: CheckBoxProps) => {
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleCheckboxTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.checked;
    setIsChecked(selectedDate);
  };
  const { theme, accentColor } = useTheme();

  return (
    <div className="container">
      <div className="checkboxes">
        <div className="check ">
          <input
            id={id}
            type="checkbox"
            checked={isChecked}
            onChange={!target ? handleCheckboxChange : handleCheckboxTarget}
            aria-checked={isChecked}
          />
          <label htmlFor={id} aria-label="Toggle checkbox">
            <div
              className={`box border border-[var(--accent)] ${
                isChecked ? "checked" : ""
              } flex items-center justify-center`}
            >
              {isChecked && (
                <FaCheck
                  className="check-icon text-[var(--accent)] "
                  size={15}
                />
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Add styles using styled-jsx */}
      <style jsx>{`
        @import "https://fonts.googleapis.com/css?family=Poiret+One";

        .container {
          max-width: 400px;
          width: auto;
        }

        .checkboxes {
          display: flex;
          justify-content: start;
        }

        .check {
          input {
            display: none;

            &:checked + label .box {
              animation: animOnTransform 0.5s 1 forwards;
              background: ${theme.background};

              .check-icon {
                transform: translate(-50%, -50%) scale(1);
                transition-duration: 200ms;
                transition-delay: 200ms;
                opacity: 1;
              }
            }
          }

          label {
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            .box {
              background: ${theme.background};
              border-radius: 5px;
              position: relative;
              width: 25px;
              height: 25px;
              transition: background 300ms ease;

              &:hover {
                background: ${theme.background};
              }

              .check-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                font-size: 16px; // Adjusted size for better fit
                color: white;
                opacity: 0;
                pointer-events: none;
                transition: all 0.2s ease-in-out;
                transform: translate(-50%, -50%) scale(4);
              }
            }
          }
        }

        @keyframes animOnTransform {
          40% {
            transform: scale(1.5, 0.5);
          }
          50% {
            transform: scale(0.5, 1.5);
          }
          60% {
            transform: scale(1.3, 0.6);
          }
          70% {
            transform: scale(0.8, 1.2);
          }
          100% {
            transform: scale(1, 1);
          }
        }
      `}</style>
    </div>
  );
};

export default CheckBox;
