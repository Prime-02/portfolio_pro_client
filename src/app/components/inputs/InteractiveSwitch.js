import React from "react";

const InteractiveSwitch = ({ options, selectedId, onChange }) => {
  if (!options || options.length !== 2) {
    throw new Error("InteractiveSwitch requires exactly 2 options");
  }

  const [option1, option2] = options;
  const currentOption = selectedId === option1.id ? option1 : option2;

  const toggleSwitch = () => {
    const newId = selectedId === option1.id ? option2.id : option1.id;
    onChange(newId);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={`${
          selectedId === option1.id ? "reverse_card" : "card"
        } relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none border border-gray-400`}
        onClick={toggleSwitch}
      >
        <span
          className={`${
            selectedId === option1.id
              ? "translate-x-6 card"
              : "translate-x-1 reverse_card"
          } inline-block h-4 w-4 transform rounded-full transition-transform duration-200`}
        />
      </button>
      <span className="text-xs font-medium">{currentOption.code}</span>
    </div>
  );
};

export default InteractiveSwitch;
