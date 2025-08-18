export interface CertificateCardProps {
  id: string;
  created_at?: null | Date;
  certification_name?: string | null;
  issuing_organization?: string | null;
  issue_date?: string | Date; // ISO format date string or Date object
  expiration_date?: string | Date; // ISO format date string or Date object
  certificate_external_url?: string | null;
  certificate_internal_url?: File | string;
  certificate_internal_url_id?: string | null;
  is_public?: boolean;
  key?: string;
  onRefresh?: () => void;
}

import { DeleteData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useState } from "react";
import {
  Calendar,
  Building2,
  ExternalLink,
  Download,
  Eye,
  Trash2,
  Globe,
  Lock,
  FileText,
  Image as ImageIcon,
  Edit2,
} from "lucide-react";
import { useTheme } from "@/app/components/theme/ThemeContext ";

const CertCard = (props: CertificateCardProps) => {
  const {
    accessToken,
    clearQuerryParam,
    loading,
    setLoading,
    extendRouteWithQuery,
  } = useGlobalState();
  const { theme } = useTheme();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    id,
    created_at,
    certification_name,
    certificate_external_url,
    certificate_internal_url,
    // certificate_internal_url_id,
    expiration_date,
    is_public,
    issue_date,
    issuing_organization,
    key,
    onRefresh,
  } = props;

  const isDeleting = loading?.includes(`deleting_${id}`);

  // Format date helper
  const formatDate = (date?: string | Date | null) => {
    if (!date) return "Not specified";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if certificate is expired
  const isExpired = () => {
    if (!expiration_date) return false;
    const expDate =
      typeof expiration_date === "string"
        ? new Date(expiration_date)
        : expiration_date;
    return expDate < new Date();
  };

  // Get certificate URL with priority to internal
  const getCertificateUrl = () => {
    if (certificate_internal_url) {
      if (typeof certificate_internal_url === "string") {
        return certificate_internal_url;
      } else if (certificate_internal_url instanceof File) {
        return URL.createObjectURL(certificate_internal_url);
      }
    }
    return certificate_external_url;
  };

  // Check if URL is PDF
  const isPDF = (url?: string | null) => {
    if (!url) return false;
    return (
      url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("pdf")
    );
  };

  // Check if URL is image
  const isImage = (url?: string | null) => {
    if (!url) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return (
      imageExtensions.some((ext) => url.toLowerCase().includes(ext)) ||
      url.includes("image/")
    );
  };

  const deleteCertificate = async () => {
    setLoading(`deleting_${id}`);
    try {
      const deleteRes = await DeleteData({
        access: accessToken,
        url: `${V1_BASE_URL}/certification/${id}`,
      });
      if (deleteRes) {
        clearQuerryParam();
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.log("error deleting certificate: ", error);
    } finally {
      setLoading(`deleting_${id}`);
    }
  };

  const handleViewCertificate = () => {
    const url = getCertificateUrl();
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleDownloadCertificate = () => {
    const url = getCertificateUrl();
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${certification_name || "certificate"}.${isPDF(url) ? "pdf" : "jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const certificateUrl = getCertificateUrl();

  return (
    <div
      key={key}
      className="bg-[var(--background)] rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold  mb-1">
              {certification_name || "Untitled Certificate"}
            </h3>
            {issuing_organization && (
              <div className="flex items-center text-sm  mb-2">
                <Building2 className="w-4 h-4 mr-1" />
                {issuing_organization}
              </div>
            )}
          </div>

          {/* Privacy indicator */}
          <div className="flex items-center ml-4">
            {is_public ? (
              <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </div>
            ) : (
              <div className="flex items-center  bg-gray-50 px-2 py-1 rounded-full text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Preview */}
      {certificateUrl && (
        <div className="p-4 border-b border-[var(--accent)]">
          <div
          >
            {isImage(certificateUrl) && !imageError ? (
              <img
                src={certificateUrl}
                alt={certification_name || "Certificate"}
                className="w-full h-32 object-cover"
                onError={() => setImageError(true)}
              />
            ) : isPDF(certificateUrl) ? (
              <div className="flex items-center justify-center h-32 ">
                <FileText className="w-8 h-8 mr-2" />
                <span>PDF Certificate</span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 ">
                <ImageIcon className="w-8 h-8 mr-2" />
                <span>Certificate File</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certificate Details */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {issue_date && (
            <div className="flex items-center text-sm ">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-xs  mr-1">Issued:</span>
              {formatDate(issue_date)}
            </div>
          )}

          {expiration_date && (
            <div
              className={`flex items-center text-sm ${isExpired() ? "text-red-600" : ""}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-xs  mr-1">Expires:</span>
              {formatDate(expiration_date)}
              {isExpired() && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                  Expired
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-x-2 ">
            {certificateUrl && (
              <>
                <button
                  onClick={handleViewCertificate}
                  className="flex items-center text-sm text-blue-600 hover:underline cursor-pointer  transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>

                <button
                  onClick={handleDownloadCertificate}
                  className="flex items-center text-sm hover:underline cursor-pointer  transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </>
            )}

            {certificate_external_url && certificate_internal_url && (
              <button
                onClick={() => window.open(certificate_external_url, "_blank")}
                className="flex items-center text-sm hover:underline cursor-pointer  transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                External
              </button>
            )}

            <button
              onClick={() => extendRouteWithQuery({ update: id })}
              className="flex items-center text-sm hover:underline cursor-pointer  transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>

          {/* Delete button */}
          <div className="relative">
            {!showConfirmDelete ? (
              <button
                onClick={() => setShowConfirmDelete(true)}
                disabled={isDeleting}
                className="flex items-center text-sm text-red-600   rounded-lhover:underline cursor-pointerg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1 text-xs  hover: rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteCertificate}
                  disabled={isDeleting}
                  className="px-3 py-1 text-xs text-white bg-red-600  rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Confirm"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Created date footer */}
      {created_at && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs ">Added on {formatDate(created_at)}</p>
        </div>
      )}
    </div>
  );
};

export default CertCard;
