import Modal from "@/app/components/containers/modals/Modal";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import AddSocials from "./AddSocials";
import SocialCard, { SocialCardProps } from "./SocialCard";
import { useGlobalState } from "@/app/globalStateProvider";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import EmptyState from "@/app/components/containers/cards/EmptyState";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";

function SocialsDisplay() {
  const { loading, setLoading, accessToken } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const LoaderComponent = getLoader(loader) || null;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showModal = searchParams.get("create") === "true";
  const [socials, setSocials] = useState<SocialCardProps[]>([]);

  const handleClose = () => {
    // Remove the create parameter when closing
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("create");
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  const fetchUserSocialLinks = async () => {
    setLoading("fetching_socials");
    try {
      const socialRes: SocialCardProps[] = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/socials/`,
        type: "Social Links",
      });
      if (socialRes && socialRes.length > 0) {
        setSocials(socialRes);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("fetching_socials");
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchUserSocialLinks();
  }, [accessToken]);

  return (
    <>
      <Modal
        isOpen={showModal}
        centered
        onClose={handleClose}
        title={"Upload your social handle"}
      >
        <AddSocials />
      </Modal>
      <div className="flex w-full min-h-screen h-auto items-center justify-center">
        <div></div>
        <div className="flex flex-wrap gap-4">
          {socials.length < 1 ? (
            <EmptyState />
          ) : loading.includes("fetching_socials") ? (
            LoaderComponent ? (
              <div className="flex justify-center items-center py-4 w-full">
                <LoaderComponent color={accentColor.color} />
              </div>
            ) : (
              "Loading..."
            )
          ) : (
            socials.map((socialCard, i) => (
              <SocialCard
                key={socialCard.id}
                platform_name={socialCard.platform_name}
                id={socialCard.id}
                profile_screenshot={socialCard.profile_screenshot}
                screenshot_id={socialCard.screenshot_id}
                profile_url={socialCard.profile_url}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default SocialsDisplay;
