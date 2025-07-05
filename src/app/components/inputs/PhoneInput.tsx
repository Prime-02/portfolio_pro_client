import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneInputComponentProps {
  phone: string;
  setPhone: (value: string) => void;
  label?: string;
  onFocus?: () => void;
}

const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({
  phone,
  setPhone,
  label,
  onFocus = () => {},
}) => {
  return (
    <div className="flex flex-col gap-2" id="phone-input">
      <label htmlFor="phone-input" className="text-xs">
        {label}
      </label>
      <PhoneInput
        value={phone}
        onChange={setPhone}
        inputClass="card !w-full"
        containerClass="!w-full"
        buttonClass="card"
        onFocus={onFocus}
        dropdownClass="card"
      />
    </div>
  );
};

export default PhoneInputComponent;
