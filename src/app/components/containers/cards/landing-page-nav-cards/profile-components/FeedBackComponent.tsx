import { api } from "@/lib/client/api";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useUserStore } from "@/lib/stores/user/userStore";
import { titles } from "@/lib/utilities/indices/DropDownItems";
import { validateFields } from "@/lib/utilities/syncFunctions/syncs";
import Button from "@/src/app/components/buttons/Buttons";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { TextArea } from "@/src/app/components/inputs/TextArea";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { useTheme } from "@/src/app/components/theme/ThemeContext ";
import { toast } from "@/src/app/components/toastify/Toastify";
import Link from "next/link";
import React, { useState } from "react";

const FeedBackComponent = () => {
  const { theme } = useTheme();
  const { startLoading, stopLoading, isLoading } = useUIStore();
  const { userData } = useUserStore()
  const [sugestion, setSugestion] = useState({
    title: "",
    description: "",
  });

  const makeSuggestions = async () => {
    if (!validateFields(sugestion)) return;
    startLoading("making_sugestions");
    try {
      const sugestionRes = await api.post(`/suggestions/`, sugestion);
      if (sugestionRes) {
        toast.success(
          "Thank you for your sugestion, please be rest assured that we hear you "
        );
        setSugestion({
          title: "",
          description: "",
        });
      }
    } catch (error) {
      console.log(error)

    } finally {
      stopLoading("making_sugestions");
    }
  };

  return (
    <div>
      <div>
        <div className="flex flex-col gap-y-3">
          <span>
            {sugestion.title === "custom" ? (
              <Textinput
                type="text"
                label="Enter your suggestion title"
                value={sugestion.title}  // Changed from description to title
                onChange={(e: string) => {
                  setSugestion((prev) => ({
                    ...prev,
                    title: e,
                  }));
                }}
              />
            ) : (
              <Dropdown
                onSelect={(e) => {
                  setSugestion((prev) => ({
                    ...prev,
                    title: e as string,
                  }));
                }}
                type="datalist"
                options={titles}
                value={sugestion.title}
                placeholder="Select a title"
                label="Suggestion Title"
                className="rounded-full outline focus:outline-[var(--accent)]"
              />
            )}
          </span>
          <span>
            <TextArea
              labelBgHex={theme.background}
              labelBgHexIntensity={10}
              label="Description"
              value={sugestion.description}
              onChange={(e: string) => {
                setSugestion((prev) => ({
                  ...prev,
                  description: e,
                }));
              }}
            />
          </span>
          <span>
            <Button
              variant="primary"
              className="w-full"
              text="Submit"
              size="md"
              type="submit"
              loading={isLoading("making_sugestions")}
              onClick={() => {
                makeSuggestions();
              }}
            />
          </span>
        </div>
      </div>
      <div className="flex flex-col w-full  justify-center mt-4 items-center gap-y-3">
        <span>OR</span>
        <Link href={`${userData.username}/suggestions`} className="w-full">
          <Button
            variant="primary"
            className="w-full"
            text="See sugestions"
            size="md"
            type="submit"
          />
        </Link>
      </div>
    </div>
  );
};

export default FeedBackComponent;
