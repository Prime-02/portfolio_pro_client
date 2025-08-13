import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { toast } from "@/app/components/toastify/Toastify";
import {
  DeleteData,
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import {
  base64ToFile,
  validateFields,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { FormEvent, useState, useEffect } from "react";

export interface AlbumProp {
  cover_media_file: string | File | null;
  name: string;
  description?: string;
  is_public: boolean;
}

const GalleryActions = ({
  fetchAlbum,
  albumId,
  edit = false,
}: {
  fetchAlbum: () => void;
  albumId: string | null;
  edit?: boolean;
}) => {
  const {
    loading,
    setLoading,
    accessToken,
    clearQuerryParam,
    router,
    userData,
  } = useGlobalState();

  const [albumData, setAlbumData] = useState<AlbumProp>({
    cover_media_file: null,
    name: "",
    description: "",
    is_public: true,
  });

  const [showCoverUpload, setShowCoverUpload] = useState(!edit);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);

  // Fetch album data when editing
  useEffect(() => {
    if (edit && albumId) {
      fetchAlbumData();
    }
  }, [edit, albumId]);

  const handleFieldChange = (
    key: keyof AlbumProp,
    value: File | string | boolean | null
  ) => {
    setAlbumData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const convertToCover = async (data: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    const { croppedImage } = data;
    if (!croppedImage) {
      toast.warning("No image provided");
      return;
    }

    setLoading("processing_image");
    try {
      // Extract MIME type (e.g., "image/jpeg" -> "jpeg")
      const mimeType = croppedImage.split(";")[0].split("/")[1];
      const extension = mimeType === "jpeg" ? "jpg" : mimeType;
      const filename =
        `${albumData.name || "album"}-cover.${extension}`.toLowerCase();

      const convertedImg = await base64ToFile(croppedImage, filename);

      if (edit) {
        // Store for separate upload when editing
        setPendingCoverFile(convertedImg);
      } else {
        // Set directly for creation
        handleFieldChange("cover_media_file", convertedImg);
      }
    } catch (error) {
      toast.error("Invalid image format");
    } finally {
      setLoading("processing_image");
    }
  };

  const uploadCoverPhoto = async () => {
    if (!pendingCoverFile || !albumId) return;

    setLoading("uploading_cover");
    try {
      const coverData = { cover_media_file: pendingCoverFile, id: albumId };
      const uploadRes = await UpdateAllData({
        method: "patch",
        access: accessToken,
        url: `${V1_BASE_URL}/media-gallery/collections/${albumId}`,
        field: coverData,
        useFormData: true,

        useFormData: true,
      });

      if (uploadRes) {
        toast.success("Cover photo updated successfully!");
        setPendingCoverFile(null);
        setShowCoverUpload(false);
        fetchAlbum();
        // Update local state to reflect the new cover
        handleFieldChange("cover_media_file", pendingCoverFile);
      }
    } catch (error) {
      console.log("Error uploading cover:", error);
      toast.error("Failed to update cover photo");
    } finally {
      setLoading("uploading_cover");
    }
  };

  const createAlbum = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields (exclude description and cover_media_file for separate handling)
    const fieldsToValidate = {
      name: albumData.name,
      is_public: albumData.is_public,
    };
    if (!validateFields(fieldsToValidate, [])) {
      toast.warning("Please fill all required fields");
      return;
    }

    if (!albumData.cover_media_file) {
      toast.warning("Please upload a cover image");
      return;
    }

    setLoading("creating_album");
    try {
      const uploadRes = await PostAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/media-gallery/collections`,
        data: albumData,
        useFormData: true,
      });

      if (uploadRes) {
        toast.success(
          "You can now add photos, audios and videos to this album!",
          {
            title: "Album Created Successfully!",
          }
        );
        // Reset form
        setAlbumData({
          cover_media_file: null,
          name: "",
          description: "",
          is_public: true,
        });
        setShowCoverUpload(true);
        clearQuerryParam();
        fetchAlbum();
      }
    } catch (error) {
      console.log("Error creating album:", error);
      toast.error("Failed to create album");
    } finally {
      setLoading("creating_album");
    }
  };

  const updateAlbum = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fieldsToValidate = {
      name: albumData.name,
      is_public: albumData.is_public,
    };
    if (!validateFields(fieldsToValidate, [])) {
      toast.warning("Please fill all required fields");
      return;
    }

    setLoading("updating_album");
    try {
      // Send only the text fields, not the cover_media_file
      const updateData = {
        name: albumData.name,
        description: albumData.description,
        is_public: albumData.is_public,
        id: albumId,
      };

      const updateRes = await UpdateAllData({
        method: "patch",
        access: accessToken,
        url: `${V1_BASE_URL}/media-gallery/collections/${albumId}`,
        field: updateData,
        useFormData: true,
      });

      if (updateRes) {
        toast.success("Album updated successfully!");
        fetchAlbum();
        clearQuerryParam();
      }
    } catch (error) {
      console.log("Error updating album:", error);
      toast.error("Failed to update album");
    } finally {
      setLoading("updating_album");
    }
  };

  const deleteAlbum = async () => {
    if (!albumId) return;

    setLoading("deleting_album");
    try {
      const deleteRes = await DeleteData({
        access: accessToken,
        url: `${V1_BASE_URL}/media-gallery/collections/${albumId}`,
      });

      if (deleteRes) {
        toast.success("Album deleted successfully!");
        fetchAlbum();
        router.push(`/${userData.username}/media-gallery`);
      }
    } catch (error) {
      console.log("Error deleting album:", error);
      toast.error("Failed to delete album");
    } finally {
      setLoading("deleting_album");
    }
  };

  const fetchAlbumData = async () => {
    if (!albumId) return;

    setLoading("fetching_album");
    try {
      const albumRes: AlbumProp = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/media-gallery/collections/${albumId}`,
      });

      if (albumRes) {
        setAlbumData({
          cover_media_file: albumRes.cover_media_file,
          name: albumRes.name,
          description: albumRes.description || "",
          is_public: albumRes.is_public,
        });
      }
    } catch (error) {
      console.log("Error fetching album data:", error);
      toast.error("Failed to load album data");
    } finally {
      setLoading("fetching_album");
    }
  };

  // Render delete confirmation
  if (albumId && !edit) {
    return (
      <div className="flex flex-col items-center gap-y-4">
        <h1 className="text-lg font-semibold text-center">
          Are you sure you want to delete this album?
        </h1>
        <p className="text-sm opacity-65 text-center">
          This action cannot be undone. All photos, videos, and data in this
          album will be permanently removed.
        </p>
        <div className="flex gap-3">
          <Button
            text="Cancel"
            variant="outline"
            size="md"
            onClick={() => clearQuerryParam()}
          />
          <Button
            text="Delete Album"
            customColor="red"
            size="md"
            onClick={deleteAlbum}
            loading={loading.includes("deleting_album")}
            disabled={loading.includes("deleting_album")}
          />
        </div>
      </div>
    );
  }

  // Render create mode
  if (!edit) {
    return (
      <div className="flex flex-col items-center justify-evenly gap-6 flex-wrap md:flex-row">
        <section className="w-full md:w-auto">
          <ImageCropper
            title="Upload cover photo"
            description="All image formats supported up to 5mb"
            onFinish={convertToCover}
            onResetImageChange={() => {
              handleFieldChange("cover_media_file", null);
            }}
          />
        </section>

        {albumData.cover_media_file && (
          <form
            onSubmit={createAlbum}
            className="flex flex-col gap-4 w-full md:max-w-md"
          >
            <h1 className="text-2xl font-bold">Create New Album</h1>

            <Textinput
              value={albumData.name}
              onChange={(e: string) => handleFieldChange("name", e)}
              label="Album Name"
              required
            />

            <TextArea
              value={albumData.description || ""}
              onChange={(e: string) => handleFieldChange("description", e)}
              label="Album Description"
              maxLength={1000}
            />

            <div className="flex items-center gap-3 justify-start flex-wrap">
              <CheckBox
                isChecked={albumData.is_public}
                setIsChecked={(e: boolean) => handleFieldChange("is_public", e)}
                description="All users can view this album and its contents"
              />
              <p className="text-xs text-[var(--accent)]">Make Public</p>
            </div>

            <Button
              type="submit"
              loading={loading.includes("creating_album")}
              disabled={loading.includes("creating_album")}
              text="Create Album"
            />
          </form>
        )}
      </div>
    );
  }

  // Render edit mode
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Main Album Form - Shows First in Edit Mode */}
      <form onSubmit={updateAlbum} className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Edit Album</h1>

        <Textinput
          loading={
            loading.includes("updating_album") ||
            loading.includes("fetching_album")
          }
          value={albumData.name}
          onChange={(e: string) => handleFieldChange("name", e)}
          label="Album Name"
          required
        />

        <TextArea
          value={albumData.description || ""}
          onChange={(e: string) => handleFieldChange("description", e)}
          label="Album Description"
          maxLength={1000}
        />

        <div className="flex items-center gap-3 justify-start flex-wrap">
          <CheckBox
            isChecked={albumData.is_public}
            setIsChecked={(e: boolean) => handleFieldChange("is_public", e)}
            description="All users can view this album and its contents"
          />
          <p className="text-xs text-[var(--accent)]">Make Public</p>
        </div>

        <Button
          type="submit"
          loading={loading.includes("updating_album")}
          disabled={loading.includes("updating_album")}
          text="Update Album"
        />
      </form>

      {/* Cover Photo Section - Shows After Form in Edit Mode */}
      <div className="border-t pt-6">
        {!showCoverUpload ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Cover Photo</h2>
            {albumData.cover_media_file &&
              typeof albumData.cover_media_file === "string" && (
                <div className="w-32 h-32 rounded-lg overflow-hidden border">
                  <img
                    src={albumData.cover_media_file}
                    alt="Current cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            <p className="text-sm opacity-65">
              Would you like to change the cover photo for this album?
            </p>
            <Button
              text="Change Cover Photo"
              variant="outline"
              size="sm"
              onClick={() => setShowCoverUpload(true)}
              className="w-fit"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload New Cover Photo</h2>
              <Button
                text="Cancel"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCoverUpload(false);
                  setPendingCoverFile(null);
                }}
              />
            </div>

            <ImageCropper
              title="Upload new cover photo"
              description="All image formats supported up to 5mb"
              onFinish={convertToCover}
              onResetImageChange={() => setPendingCoverFile(null)}
            />

            {pendingCoverFile && (
              <Button
                text="Save Cover Photo"
                onClick={uploadCoverPhoto}
                loading={loading.includes("uploading_cover")}
                disabled={loading.includes("uploading_cover")}
                className="w-fit"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryActions;
