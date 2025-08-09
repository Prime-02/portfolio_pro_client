import Button from "@/app/components/buttons/Buttons";
import EmptyState from "@/app/components/containers/cards/EmptyState";
import Modal from "@/app/components/containers/modals/Modal";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import GalleryActions from "./GalleryActions";

export interface AlbumProps {
  name: string;
  description?: string;
  is_public: boolean;
  cover_media_url: string;
  created_at: string;
  updated_at: string | null;
}

const GalleryView = () => {
  const {
    accessToken,
    setLoading,
    loading,
    currentUser,
    extendRouteWithQuery,
    searchParams,
    clearQuerryParam,
  } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [galleries, setGalleries] = useState<AlbumProps[]>([]);
  const create = searchParams.get("create") === "true";
  const updateParam = searchParams.get("update");
  const isValidId =
    updateParam !== null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      updateParam
    );
  const LoaderComponent = getLoader(loader) || null;

  const fetchGallery = async () => {
    setLoading("fetching_albums");
    const url = currentUser
      ? `${V1_BASE_URL}/image-gallery/user/${currentUser}/collections`
      : `${V1_BASE_URL}/image-gallery/collections`;
    try {
      const galleryRes: AlbumProps[] = await GetAllData({
        access: accessToken,
        url: url,
      });
      if (galleryRes) {
        setGalleries(galleryRes);
      }
    } catch (error) {
      console.log("Error laoding gallery: ", error);
    } finally {
      setLoading("fetching_albums");
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchGallery();
  }, [accessToken, currentUser]);

  return (
    <div className="pb-8">
      <Modal
        isOpen={isValidId || create}
        onClose={clearQuerryParam}
        title={`${isValidId ? "Update" : "Upload"} Image Album`}
        loading={loading.includes("fetching_album")}
        size="full"
      >
        <GalleryActions
          fetchAlbum={() => {
            fetchGallery();
          }}
        />
      </Modal>
      <header className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
          <div>
            <h2 className={`text-2xl sm:text-3xl font-semibold`}>
              {currentUser
                ? `${currentUser}'s Image Gallery`
                : `My Image Gallery`}
            </h2>
            <p className={`opacity-70 mt-2`}>
              {currentUser
                ? `${currentUser}'s personal captures, creative experiments, and professional work-in-progress`
                : `Personal captures, creative experiments, and professional work-in-progress`}
            </p>
          </div>
          <Button
            icon={<Plus />}
            variant="ghost"
            className="self-end sm:self-auto"
            onClick={() => {
              extendRouteWithQuery({ create: "true" });
            }}
          />
        </div>
      </header>
      <div className="px-8 pb-8">
        {galleries.length < 1 ? (
          <EmptyState
            imageHeight={300}
            imageWidth={300}
            imageUrl="/vectors/undraw_profile-image_2hi8.svg"
            actionText="Create your first album"
            onAction={() => {
              extendRouteWithQuery({ create: "true" });
            }}
            description="No image album or gallery found"
            className="border-[var(--accent)] border "
          />
        ) : loading.includes("fetching_certs") ? (
          LoaderComponent ? (
            <div className="flex justify-center items-center py-4 w-full">
              <LoaderComponent color={accentColor.color} />
            </div>
          ) : (
            "Loading..."
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {galleries.map((gallery) => (
              <>{gallery.name}</>
            ))}
          </div>
        )}
      </div>{" "}
    </div>
  );
};

export default GalleryView;
