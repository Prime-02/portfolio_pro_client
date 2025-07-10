import Button from "@/app/components/buttons/Buttons";
import Dropdown from "@/app/components/inputs/DynamicDropdown";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { titles } from "@/app/components/utilities/indices/DropDownItems";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { validateFields } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import Link from "next/link";
import React, { useState } from "react";

const FeedBackComponent = () => {
  const { theme } = useTheme();
  const { accessToken, setLoading, loading, userData } = useGlobalState();
  const [sugestion, setSugestion] = useState({
    title: "",
    description: "",
  });

  const makeSuggestions = async () => {
    if (!validateFields(sugestion, toast.warning)) return;
    setLoading("making_sugestions");
    try {
      const sugestionRes = await PostAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/suggestions/`,
        data: sugestion,
      });
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
      setLoading("making_sugestions");
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
                label="Enter your sugestion title"
                labelBgHex={theme.background}
                labelBgHexIntensity={10}
                value={sugestion.description}
                onChange={(e: string) => {
                  setSugestion((prev) => ({
                    ...prev,
                    title: e,
                  }));
                }}
              />
            ) : (
              <Dropdown
                onSelect={(e: string) => {
                  setSugestion((prev) => ({
                    ...prev,
                    title: e,
                  }));
                }}
                type="datalist"
                options={titles}
                value={sugestion.title}
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
              loading={loading.includes("making_sugestions")}
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
