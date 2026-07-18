import { useSuggestionsStore } from "@/lib/stores/suggestions/useSuggestions";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useUserStore } from "@/lib/stores/user/userStore";
import { suggestionTitles } from "@/lib/utilities/indices/DropDownItems";
import { validateFields } from "@/lib/utilities/syncFunctions/syncs";
import Button from "@/src/app/components/buttons/Buttons";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { TextArea } from "@/src/app/components/inputs/TextArea";
import { useTheme } from "@/src/context/ThemeContext";
import { toast } from "@/src/context/Toastify";
import Link from "next/link";
import React, { useState } from "react";

const FeedBackComponent = () => {
  const { theme } = useTheme();
  const { startLoading, stopLoading, isLoading, toggleMobileMenu } = useUIStore();
  const { createSuggestion } = useSuggestionsStore()
  const { userData } = useUserStore()
  const [sugestion, setSugestion] = useState({
    title: "",
    description: "",
  });

  const makeSuggestions = async () => {
    if (!validateFields(sugestion)) return;
    startLoading("making_sugestions");
    try {
      const sugestionRes = await createSuggestion(sugestion);
      if (sugestionRes) {
        toast.success(
          "Thank you for your sugestion, please be rest assured that we hear you "
        );
        toggleMobileMenu(false)
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
            <Dropdown
              onSelect={(e) => {
                setSugestion((prev) => ({
                  ...prev,
                  title: e as string,
                }));
              }}
              type="datalist"
              options={suggestionTitles}
              value={sugestion.title}
              placeholder="Select a title"
              label="Suggestion Title"
              className="rounded-full outline focus:outline-[var(--accent)]"
              includeQueryAsOption
              includeNoneOption={false}
            />
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
        <Link href={`${userData.username}/feed/whats-new`} className="w-full">
          <Button
            variant="ghost"
            className="w-full"
            text="See suggestions"
            size="sm"
            type="submit"
          />
        </Link>
      </div>
    </div>
  );
};

export default FeedBackComponent;
