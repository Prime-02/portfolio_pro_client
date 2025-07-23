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
        console.log(`Fetched Social Links: ${JSON.stringify(socialRes)}`);
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
        <AddSocials onRefresh={fetchUserSocialLinks} />
      </Modal>
      <div className="p-8">
        <div>
          <h2 className="text-3xl font-semibold mb-4">
            {`Social Links & Handles`}
          </h2>
          <p className="opacity-70 mb-6">
            {`Add your social media links and handles to showcase your online presence.`}
          </p>
        </div>
        <div className="flex flex-col   gap-4 w-full ">
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
                url_type={socialCard.url_type}
                profile_url={socialCard.profile_url}
                profile_headline={socialCard.profile_headline}
                onRefresh={fetchUserSocialLinks}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default SocialsDisplay;
