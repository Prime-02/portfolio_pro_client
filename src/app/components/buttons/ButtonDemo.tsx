import { useState } from "react";
import Button from "./Buttons";

// Enhanced Usage Examples Component
export const ButtonExamples = () => {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const handleClick = (buttonId: string) => {
    console.log(`${buttonId} clicked!`);
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonId]: false }));
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8  min-h-screen">
      <div className=" p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6 ">Enhanced Button Component Examples</h2>
        
        {/* Primary Variants */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold ">Primary Variants</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              text="Small Primary"
              variant="primary"
              size="sm"
              onClick={() => handleClick("primary-sm")}
            />
            <Button
              text="Medium Primary"
              variant="primary"
              size="md"
              onClick={() => handleClick("primary-md")}
            />
            <Button
              text="Large Primary"
              variant="primary"
              size="lg"
              onClick={() => handleClick("primary-lg")}
            />
            <Button
              text="Loading"
              variant="primary"
              loading={loadingStates["primary-loading"]}
              onClick={() => handleClick("primary-loading")}
            />
            <Button
              text="Disabled"
              variant="primary"
              disabled
              onClick={() => handleClick("primary-disabled")}
            />
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold ">Custom Colors</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              text="Custom Purple"
              variant="primary"
              customColor="#8b5cf6"
              onClick={() => handleClick("custom-purple")}
            />
            <Button
              text="Custom Orange"
              variant="outline"
              customColor="#f97316"
              onClick={() => handleClick("custom-orange")}
            />
            <Button
              text="Custom Pink"
              variant="ghost"
              customColor="#ec4899"
              onClick={() => handleClick("custom-pink")}
            />
            <Button
              text="RGB Color"
              variant="secondary"
              customColor="rgb(34, 197, 94)"
              onClick={() => handleClick("custom-rgb")}
            />
          </div>
        </div>

        {/* Color Intensities */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold ">Color Intensities</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              text="Light Intensity"
              variant="primary"
              colorIntensity="light"
              onClick={() => handleClick("light-intensity")}
            />
            <Button
              text="Medium Intensity"
              variant="primary"
              colorIntensity="medium"
              onClick={() => handleClick("medium-intensity")}
            />
            <Button
              text="Dark Intensity"
              variant="primary"
              colorIntensity="dark"
              onClick={() => handleClick("dark-intensity")}
            />
          </div>
        </div>

        {/* All Variants */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold ">All Variants</h3>
          <div className="flex flex-wrap gap-4">
            <Button text="Primary" variant="primary" onClick={() => handleClick("variant-primary")} />
            <Button text="Secondary" variant="secondary" onClick={() => handleClick("variant-secondary")} />
            <Button text="Outline" variant="outline" onClick={() => handleClick("variant-outline")} />
            <Button text="Ghost" variant="ghost" onClick={() => handleClick("variant-ghost")} />
            <Button text="Danger" variant="danger" onClick={() => handleClick("variant-danger")} />
            <Button text="Success" variant="success" onClick={() => handleClick("variant-success")} />
          </div>
        </div>

        {/* With Icons */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold ">With Icons</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              icon={<span>📝</span>}
              text="Edit"
              variant="primary"
              onClick={() => handleClick("icon-edit")}
            />
            <Button
              icon={<span>🗑️</span>}
              text="Delete"
              variant="danger"
              onClick={() => handleClick("icon-delete")}
            />
            <Button
              icon={<span>💾</span>}
              text="Save"
              variant="success"
              onClick={() => handleClick("icon-save")}
            />
            <Button
              icon={<span>⚙️</span>}
              variant="ghost"
              title="Settings"
              onClick={() => handleClick("icon-settings")}
            />
          </div>
        </div>

        {/* Loading States */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold ">Interactive Loading States</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              text="Click me!"
              variant="primary"
              loading={loadingStates["interactive-1"]}
              onClick={() => handleClick("interactive-1")}
            />
            <Button
              text="Save Changes"
              variant="success"
              loading={loadingStates["interactive-2"]}
              onClick={() => handleClick("interactive-2")}
            />
            <Button
              text="Send Message"
              variant="outline"
              loading={loadingStates["interactive-3"]}
              onClick={() => handleClick("interactive-3")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};