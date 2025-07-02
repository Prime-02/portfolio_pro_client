import React, { useState } from "react";
import { Eye, EyeClosed, Search, Mail, Calendar, Clock, User, Lock, Phone, Globe, Hash, CreditCard, Image, File, Check, X } from "lucide-react";
import { LabelStyle, TextInput, TextArea } from "./Textinput";

const InputDemo = () => {
  const [formData, setFormData] = useState({
    text: "",
    email: "",
    password: "password123",
    number: 0,
    tel: "",
    url: "",
    search: "",
    date: "",
    time: "",
    datetimeLocal: "",
    month: "",
    week: "",
    color: "#000000",
    range: 50,
    file: null as File | null,
    dropdown: "",
    phone: "",
    textarea: "",
    hidden: "secret value"
  });

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string) => (value: string | number | FileList | null) => {
  if (field === "file" && value instanceof FileList) {
    // Handle file input
    setFormData(prev => ({
      ...prev,
      [field]: value.length > 0 ? value[0] : null
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }
};

  const countryOptions = [
    { id: 1, code: "US", name: "United States" },
    { id: 2, code: "CA", name: "Canada" },
    { id: 3, code: "MX", name: "Mexico" },
    { id: 4, code: "GB", name: "United Kingdom" },
    { id: 5, code: "FR", name: "France" },
    { id: 6, code: "DE", name: "Germany" },
    { id: 7, code: "JP", name: "Japan" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Input Component Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Text Input */}
        <TextInput
          label="Text Input"
          type="text"
          value={formData.text}
          onChange={handleChange("text")}
          placeholder="Enter some text"
          leftIcon={<User size={16} />}
          descriptionClassName="bg-blue-50 dark:bg-blue-900"
          desc="This is a basic text input field"
        />

        {/* Email Input */}
        <TextInput
          label="Email Input"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          placeholder="user@example.com"
          leftIcon={<Mail size={16} />}
          required
          errorMessage={!formData.email.includes("@") && formData.email ? "Please enter a valid email" : undefined}
        />

        {/* Password Input */}
        <TextInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange("password")}
          placeholder="Enter password"
          leftIcon={<Lock size={16} />}
          showPasswordToggle
          passwordToggleClassName="text-blue-500"
          onKeyDown={(e) => e.key === "Enter" && alert("Password submitted!")}
        />

        {/* Number Input */}
        <TextInput
          label="Number Input"
          type="number"
          value={formData.number}
          onChange={handleChange("number")}
          placeholder="Enter a number"
          leftIcon={<Hash size={16} />}
          min={0}
          max={100}
          step={5}
        />

        {/* Telephone Input */}
        <TextInput
          label="Telephone"
          type="tel"
          value={formData.tel}
          onChange={handleChange("tel")}
          placeholder="123-456-7890"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          desc="Format: 123-456-7890"
        />

        {/* URL Input */}
        <TextInput
          label="Website URL"
          type="url"
          value={formData.url}
          onChange={handleChange("url")}
          placeholder="https://example.com"
          leftIcon={<Globe size={16} />}
          errorMessage={formData.url && !formData.url.startsWith("http") ? "URL must start with http:// or https://" : undefined}
        />

        {/* Search Input */}
        <TextInput
          label="Search"
          type="search"
          value={formData.search}
          onChange={handleChange("search")}
          placeholder="Search..."
          leftIcon={<Search size={16} />}
          variant="ghost"
          inputSize="lg"
        />

        {/* Date Input */}
        <TextInput
          label="Date"
          type="date"
          value={formData.date}
          onChange={handleChange("date")}
          leftIcon={<Calendar size={16} />}
        />

        {/* Time Input */}
        <TextInput
          label="Time"
          type="time"
          value={formData.time}
          onChange={handleChange("time")}
          leftIcon={<Clock size={16} />}
        />

        {/* Datetime-local Input */}
        <TextInput
          label="Date & Time"
          type="datetime-local"
          value={formData.datetimeLocal}
          onChange={handleChange("datetimeLocal")}
        />

        {/* Month Input */}
        <TextInput
          label="Month"
          type="month"
          value={formData.month}
          onChange={handleChange("month")}
        />

        {/* Week Input */}
        <TextInput
          label="Week"
          type="week"
          value={formData.week}
          onChange={handleChange("week")}
        />

        {/* Color Input */}
        <TextInput
          label="Color Picker"
          type="color"
          value={formData.color}
          onChange={handleChange("color")}
          wrapperClassName="flex items-center"
          className="h-10 w-16"
        />

        {/* Range Input */}
        <TextInput
          label="Range Slider"
          type="range"
          value={formData.range}
          onChange={handleChange("range")}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />

        {/* File Input */}
        <TextInput
          label="File Upload"
          type="file"
          onChange={handleChange("file")}
          accept="image/*"
          capture="environment"
          leftIcon={<Image size={16} />}
          rightIcon={formData.file ? <Check className="text-green-500" size={16} /> : <File size={16} />}
          desc={formData.file ? `Selected: ${formData.file.name}` : "Select an image file"}
        />

        {/* Dropdown Input */}
        <TextInput
          label="Country Dropdown"
          type="dropdown"
          options={countryOptions}
          value={formData.dropdown}
          onSelect={handleChange("dropdown")}
          displayKey="name"
          placeholder="Select a country"
          searchable
          clearable
          maxHeight="max-h-40"
          tag="country"
          emptyMessage="No countries found"
          rightIcon={formData.dropdown ? <Check className="text-green-500" size={16} /> : undefined}
        />

        {/* Phone Input */}
        <TextInput
          label="Phone Number"
          type="phone"
          value={formData.phone}
          onChange={handleChange("phone")}
          placeholder="Enter phone number"
          country="us"
          enableSearch
          preferredCountries={["us", "ca", "mx"]}
          leftIcon={<Phone size={16} />}
          errorMessage={formData.phone && formData.phone.length < 10 ? "Phone number too short" : undefined}
        />

        {/* TextArea */}
        <TextArea
          label="Message"
          value={formData.textarea}
          onChange={handleChange("textarea")}
          placeholder="Enter your message here..."
          rows={4}
          resize="vertical"
          className="min-h-[100px]"
          maxLength={500}
          desc={`${formData.textarea.length}/500 characters`}
        />

        {/* Hidden Input */}
        <TextInput
          label="Hidden Field (not visible)"
          type="hidden"
          value={formData.hidden}
          onChange={handleChange("hidden")}
        />
      </div>

      {/* Different Label Styles */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Label Style Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Card Style (default)"
            labelStyle={LabelStyle.CARD}
            placeholder="Card style input"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Floating Label"
            labelStyle={LabelStyle.FLOATING}
            placeholder="Floating label input"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Modern Style"
            labelStyle={LabelStyle.MODERN}
            placeholder="Modern style input"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Minimal Style"
            labelStyle={LabelStyle.MINIMAL}
            placeholder="Minimal style input"
            value=""
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Status Variations */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Status Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TextInput
            label="Default Input"
            status="default"
            placeholder="Normal input"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Error State"
            status="error"
            errorMessage="This field is required"
            placeholder="Input with error"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Success State"
            status="success"
            successMessage="Looks good!"
            placeholder="Valid input"
            value="valid value"
            onChange={() => {}}
          />
          
          <TextInput
            label="Warning State"
            status="warning"
            placeholder="Input with warning"
            value=""
            onChange={() => {}}
            desc="This might not be correct"
          />
          
          <TextInput
            label="Disabled Input"
            disabled
            placeholder="Disabled input"
            value="Can't edit this"
            onChange={() => {}}
          />
          
          <TextInput
            label="Readonly Input"
            readOnly
            placeholder="Readonly input"
            value="Can view but not edit"
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Variant Styles */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Variant Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label="Default Variant"
            variant="default"
            placeholder="Default style"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Outlined Variant"
            variant="outlined"
            placeholder="Outlined style"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Filled Variant"
            variant="filled"
            placeholder="Filled style"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Ghost Variant"
            variant="ghost"
            placeholder="Ghost style"
            value=""
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Size Variations */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Size Variations</h2>
        <div className="space-y-6">
          <TextInput
            label="Small Input"
            inputSize="sm"
            placeholder="Small size"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Medium Input (default)"
            inputSize="md"
            placeholder="Medium size"
            value=""
            onChange={() => {}}
          />
          
          <TextInput
            label="Large Input"
            inputSize="lg"
            placeholder="Large size"
            value=""
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default InputDemo;