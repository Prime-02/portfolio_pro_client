import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { toast } from "@/app/components/toastify/Toastify";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import {
  base64ToFile,
  validateFields,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { FormEvent, useState } from "react";

interface AlbumProp {
  cover_media_file: File | null;
  name: string;
  description?: string;
  is_public: boolean;
}

const GalleryActions = ({ fetchAlbum }: { fetchAlbum: () => void }) => {
  const { loading, setLoading, accessToken, clearQuerryParam } = useGlobalState();
  const [albumData, setAlbumData] = useState<AlbumProp>({
    cover_media_file: null,
    name: "",
    description: "",
    is_public: true,
  });

  const [coverReady, setCoverReady] = useState(false);

  const handleFieldChange = (
    key: keyof AlbumProp,
    value: File | string | boolean
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
      setLoading("");
      return;
    }

    setLoading("processing_image");
    try {
      // Extract MIME type (e.g., "image/jpeg" -> "jpeg")
      const mimeType = croppedImage.split(";")[0].split("/")[1];
      const extension = mimeType === "jpeg" ? "jpg" : mimeType; // Normalize jpeg -> jpg
      const filename =
        `${albumData.name || "album"}-cover.${extension}`.toLowerCase();

      const convertedImg = await base64ToFile(croppedImage, filename);
      handleFieldChange("cover_media_file", convertedImg);
      setCoverReady(true);
    } catch (error) {
      toast.error("Invalid image format");
    } finally {
      setLoading("processing_image");
    }
  };
  const uploadAlbum = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFields(albumData, ["description"])) {
      toast.warning("Please fill all required fields");
      return;
    }

    if (!albumData.cover_media_file) {
      toast.warning("Please upload a cover image");
      return;
    }

    setLoading("uploading_album");
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
        // Reset form after successful upload
        setAlbumData({
          cover_media_file: null,
          name: "",
          description: "",
          is_public: true,
        });
        setCoverReady(false);
        clearQuerryParam();
        fetchAlbum(); // Refresh the album list
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create album");
    } finally {
      setLoading("uploading_album");
    }
  };


  return (
    <div className="flex flex-col items-center justify-evenly gap-3 flex-wrap md:flex-row">
      <section>
        <ImageCropper
          title="Upload cover photo"
          description="All image formats supported up to 5mb"
          onFinish={convertToCover}
        />
      </section>
      {coverReady && (
        <form
          onSubmit={uploadAlbum}
          className="flex flex-col gap-3 w-full md:max-w-1/2"
        >
          <h1 className="text-2xl font-bold">New Album</h1>
          <span>
            <Textinput
              value={albumData.name}
              onChange={(e: string) => {
                handleFieldChange("name", e);
              }}
              label="Album Name"
              required
            />
          </span>
          <span>
            <TextArea
              value={albumData.description}
              onChange={(e: string) => {
                handleFieldChange("description", e);
              }}
              label="Album Description"
            />
          </span>
          <span className="flex items-center gap-3 justify-start flex-wrap">
            <CheckBox
              isChecked={albumData.is_public}
              setIsChecked={(e: boolean) => {
                handleFieldChange("is_public", e);
              }}
              description="All users can view this album and its image contents"
            />
            <p className="text-xs text-[var(--accent)]">Make Public</p>
          </span>
          <Button
            type="submit"
            loading={loading.includes("uploading_album")}
            disabled={loading.includes("uploading_album")}
            text="Upload Album"
          />
        </form>
      )}
    </div>
  );
};

export default GalleryActions;
