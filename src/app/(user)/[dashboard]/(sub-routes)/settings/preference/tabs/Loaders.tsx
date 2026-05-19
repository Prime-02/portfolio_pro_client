import { loaderOptions } from "@/lib/utilities/indices/LoaderOptions";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { getLoader } from "@/src/app/components/loaders/Loader";
import { useTheme } from "@/src/app/components/theme/ThemeContext ";
import React, { Ref, useCallback } from "react";

type LoadersProps = {
  loaderRef: Ref<HTMLDivElement> | undefined;
};

const Loaders = ({ loaderRef }: LoadersProps) => {
  const { theme, loader, accentColor, setLoader, saveChanges } = useTheme();

  const handleLoaderChange = useCallback(async (newLoader: string) => {
    // Don't do anything if it's the same loader
    if (newLoader === loader) return;

    // Update local state immediately for UI feedback
    setLoader(newLoader);

    // Save directly with the new loader value - no race condition!
    saveChanges({ loader: newLoader });
  }, [loader, setLoader, saveChanges]);

  const LoaderComponent = getLoader(loader);

  return (
    <div className="space-y-6">
      {/* Loader Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Loading Animation</h3>
        <div className="max-w-md">
          <div className="relative" ref={loaderRef}>
            <Textinput
              type="dropdown"
              options={loaderOptions}
              onChange={handleLoaderChange}
              value={loader}
              labelStyle="border focus:outline-none focus:ring-0 focus:border-[var(--accent)] focus:outline rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Loader Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <div
          className="p-8 rounded-lg border border-opacity-20 flex items-center justify-center min-h-[200px]"
          style={{
            borderColor: theme.foreground,
            backgroundColor: `${theme.foreground}05`,
          }}
        >
          {LoaderComponent && (
            <div className="flex flex-col items-center gap-4">
              <LoaderComponent color={String(accentColor.color)} size={40} />
              <p className="text-sm opacity-60">Current loader: {loader}</p>
            </div>
          )}
        </div>
      </div>

      {/* Loader Grid Display */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Loaders</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loaderOptions.map((option) => {
            const OptionLoader = getLoader(option.id);
            return (
              <div
                key={option.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-105 ${loader === option.id ? "border-2" : "border-opacity-20"
                  }`}
                style={{
                  borderColor:
                    loader === option.id ? accentColor.color : theme.foreground,
                  backgroundColor: `${theme.foreground}05`,
                }}
                onClick={() => handleLoaderChange(option.id)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 flex items-center justify-center">
                    {OptionLoader && (
                      <OptionLoader color={accentColor.color} size={24} />
                    )}
                  </div>
                  <p className="text-xs text-center font-medium">
                    {option.code}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Loaders;