"use client";
import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Default styles, you can override them

const PhoneInputComponent = ({
  phone,
  setPhone,
  label,
  onFocus = () => {},
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="phone-input" className="text-xs">
        {label}
      </label>
      <PhoneInput
        id="phone-input"
        // country={"us"} // Default country
        value={phone}
        onChange={(value) => setPhone(value)}
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
