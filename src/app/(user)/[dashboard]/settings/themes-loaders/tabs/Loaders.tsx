import Button from "@/app/components/buttons/Buttons";
import { Textinput } from "@/app/components/inputs/Textinput";
import { animations, getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { loaderOptions } from "@/app/components/utilities/indices/LoaderOptions";
import React, { Ref } from "react";

type LoadersProps = {
  loaderRef: Ref<HTMLDivElement> | undefined;
};

const Loaders = ({ loaderRef }: LoadersProps) => {
  const { theme, loader, accentColor, setLoader } = useTheme();
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
              onChange={setLoader}
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
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-105 ${
                  loader === option.id ? "border-2" : "border-opacity-20"
                }`}
                style={{
                  borderColor:
                    loader === option.id ? accentColor.color : theme.foreground,
                  backgroundColor: `${theme.foreground}05`,
                }}
                onClick={() => setLoader(option.id)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 flex items-center justify-center">
                    {OptionLoader && (
                      <>
                        {loader === "portfolio-pro" ? (
                          <OptionLoader color={accentColor.color} size={24} />
                        ) : (
                          <OptionLoader color={accentColor.color} size={24} />
                        )}
                      </>
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
