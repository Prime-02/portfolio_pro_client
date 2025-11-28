import React, { useState } from "react";
import { Textinput } from "./Textinput";
import { TextArea } from "./TextArea";

const TextInputDemo = () => {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [date, setDate] = useState("");
  const [dropdownValue, setDropdownValue] = useState("");
  const [phone, setPhone] = useState("");
  const [textarea, setTextarea] = useState("");

  const dropdownOptions = [
    { id: "1", code: "Option 1" },
    { id: "2", code: "Option 2" },
    { id: "3", code: "Option 3" },
  ];

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Text Input Components Demo</h1>

      <div className="space-y-4">
        {/* Basic Text Input */}
        <Textinput
          label="Basic Text Input"
          type="text"
          value={text}
          onChange={setText}
          placeholder="Enter some text"
        />

        {/* Password Input */}
        <Textinput
          label="Password Input"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter password"
        />

        {/* Email Input */}
        <Textinput
          label="Email Input"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter email"
          inputMode="email"
        />

        {/* Number Input */}
        <Textinput
          label="Number Input"
          type="number"
          value={number}
          onChange={setNumber}
          placeholder="Enter a number"
          inputMode="numeric"
        />

        {/* Date Input */}
        <Textinput
          label="Date Input"
          type="date"
          value={date}
          onChange={setDate}
        />

        {/* Dropdown Input */}
        <Textinput
          label="Dropdown Input"
          type="dropdown"
          value={dropdownValue}
          onChange={setDropdownValue}
          options={dropdownOptions}
          tag="option"
          placeholder="Select an option"
        />

        {/* Phone Input */}
        <Textinput
          label="Phone Input"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="Enter phone number"
        />

        {/* TextArea */}
        <TextArea
          value={textarea}
          onChange={setTextarea}
          className="h-32"
          label="Enter multiline text"
        />
      </div>

      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
        <h2 className="font-semibold mb-2">Current Values:</h2>
        <pre className="text-sm">
          {JSON.stringify(
            {
              text,
              password,
              email,
              number,
              date,
              dropdownValue,
              phone,
              textarea,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default TextInputDemo;
