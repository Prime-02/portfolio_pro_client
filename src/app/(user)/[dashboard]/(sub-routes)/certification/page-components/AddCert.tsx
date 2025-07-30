import { useGlobalState } from "@/app/globalStateProvider";
import React, { useState, useEffect } from "react";
import { CertificateCardProps } from "./CertCard";
import {
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { Textinput } from "@/app/components/inputs/Textinput";
import CheckBox from "@/app/components/inputs/CheckBox";
import { FileInput } from "@/app/components/inputs/FileInput";
import Button from "@/app/components/buttons/Buttons";
import { useTheme } from "@/app/components/theme/ThemeContext ";

// Create a type for your certificate state that matches what you need
type CertificateState = {
  id?: string;
  created_at: null;
  certification_name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date: string;
  certificate_external_url: string;
  certificate_internal_url: File | string | null;
  certificate_internal_url_id: null;
  is_public: boolean;
};

type FieldChangeTracker = {
  certification_name: boolean;
  issuing_organization: boolean;
  issue_date: boolean;
  expiration_date: boolean;
  certificate_external_url: boolean;
  certificate_internal_url: boolean;
};

const AddCert = ({ onRefresh }: { onRefresh: () => void }) => {
  const { theme } = useTheme();
  const {
    loading,
    setLoading,
    accessToken,
    searchParams,
    router,
    pathname,
    clearQuerryParam,
  } = useGlobalState();

  const addCert = searchParams.get("create") === "true";
  const updateCert = searchParams.get("update");
  const isValidCertId =
    updateCert !== null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      updateCert
    );

  const [certificate, setCertificate] = useState<CertificateState>({
    id: "",
    created_at: null,
    certification_name: "",
    issuing_organization: "",
    issue_date: new Date().toISOString().split("T")[0], // Format for date input
    expiration_date: new Date(
      new Date().setFullYear(new Date().getFullYear() + 3)
    )
      .toISOString()
      .split("T")[0], // Format for date input
    certificate_external_url: "",
    certificate_internal_url: null,
    certificate_internal_url_id: null,
    is_public: false,
  });

  // Track changes for update mode
  const [changedFields, setChangedFields] = useState<FieldChangeTracker>({
    certification_name: false,
    issuing_organization: false,
    issue_date: false,
    expiration_date: false,
    certificate_external_url: false,
    certificate_internal_url: false,
  });

  const [originalCertificate, setOriginalCertificate] =
    useState<CertificateState | null>(null);

  // Load certificate data for update mode
  useEffect(() => {
    if (isValidCertId && accessToken) {
      getCertInfo();
    }
  }, [isValidCertId, updateCert, accessToken]);

  const uploadCertificate = async () => {
    setLoading("uploading_certificate");
    try {
      const certificateData = {
        cert_data: JSON.stringify({
          certification_name: certificate.certification_name,
          issuing_organization: certificate.issuing_organization,
          issue_date: certificate.issue_date,
          expiration_date: certificate.expiration_date,
          certificate_external_url: certificate.certificate_external_url,
          is_public: certificate.is_public,
        }),
        certificate_internal_url: certificate.certificate_internal_url,
      };

      const uploadRes: CertificateCardProps = await PostAllData({
        access: accessToken,
        data: certificateData,
        url: `${V1_BASE_URL}/certification/`,
        intToString: false,
        useFormData: true,
      });
      if (uploadRes) {
        clearQuerryParam();
        onRefresh();
      }
    } catch (error) {
      console.log("Failed to upload certificate: ", error);
    } finally {
      setLoading("");
    }
  };

  const updateCertificate = async () => {
    setLoading("updating_certificate");
    try {
      const updateRes: CertificateCardProps = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/certification/${updateCert}`,
        field: {
          certification_name: certificate.certification_name,
          issuing_organization: certificate.issuing_organization,
          issue_date: certificate.issue_date,
          expiration_date: certificate.expiration_date,
          certificate_external_url: certificate.certificate_external_url,
          certificate_internal_url: certificate.certificate_internal_url,
          is_public: certificate.is_public,
        },
      });
      if (updateRes && updateRes.certification_name) {
        clearQuerryParam();
        onRefresh();
        // Reset change tracking
        setChangedFields({
          certification_name: false,
          issuing_organization: false,
          issue_date: false,
          expiration_date: false,
          certificate_external_url: false,
          certificate_internal_url: false,
        });
      }
    } catch (error) {
      console.log("Error updating certificate: ", error);
    } finally {
      setLoading("");
    }
  };

  const updateSingleField = async (fieldName: keyof FieldChangeTracker) => {
    setLoading(`updating_${fieldName}`);
    try {
      const updateRes = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/certification/${updateCert}`,
        field: {
          [fieldName]: certificate[fieldName],
        },
      });
      if (updateRes) {
        setChangedFields((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
        // Update original certificate to reflect the change
        if (originalCertificate) {
          setOriginalCertificate((prev) =>
            prev
              ? {
                  ...prev,
                  [fieldName]: certificate[fieldName],
                }
              : null
          );
        }
      }
    } catch (error) {
      console.log(`Error updating ${fieldName}: `, error);
    } finally {
      setLoading("");
    }
  };

  const updatePublicStatus = async () => {
    setLoading("updating_public_status");
    try {
      const updateRes = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/certification/${updateCert}`,
        field: {
          is_public: certificate.is_public,
        },
      });
      if (updateRes && originalCertificate) {
        setOriginalCertificate((prev) =>
          prev
            ? {
                ...prev,
                is_public: certificate.is_public,
              }
            : null
        );
      }
    } catch (error) {
      console.log("Error updating public status: ", error);
    } finally {
      setLoading("");
    }
  };

  const getCertInfo = async () => {
    setLoading("get_cert_info");
    try {
      const certRes: CertificateState = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/certification/${updateCert}`,
        type: "Certificate Info",
      });
      if (certRes) {
        const formattedCert = {
          ...certRes,
          issue_date: certRes.issue_date
            ? new Date(certRes.issue_date).toISOString().split("T")[0]
            : "",
          expiration_date: certRes.expiration_date
            ? new Date(certRes.expiration_date).toISOString().split("T")[0]
            : "",
        };
        setCertificate(formattedCert);
        setOriginalCertificate(formattedCert);
      }
    } catch (error) {
      console.log("Failed to fetch certificate information: ", error);
    } finally {
      setLoading("");
    }
  };

  const handleFieldChange = (
    fieldName: keyof FieldChangeTracker,
    value: any
  ) => {
    setCertificate((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Track changes for update mode
    if (isValidCertId && originalCertificate) {
      const hasChanged = originalCertificate[fieldName] !== value;
      setChangedFields((prev) => ({
        ...prev,
        [fieldName]: hasChanged,
      }));
    }
  };

  const handlePublicToggle = (isPublic: boolean) => {
    setCertificate((prev) => ({
      ...prev,
      is_public: isPublic,
    }));

    // Auto-update public status in update mode
    if (
      isValidCertId &&
      originalCertificate &&
      originalCertificate.is_public !== isPublic
    ) {
      updatePublicStatus();
    }
  };

  const isFormValid = () => {
    return (
      certificate.certification_name.trim() !== "" &&
      certificate.issuing_organization.trim() !== "" &&
      certificate.issue_date !== "" &&
      certificate.expiration_date !== "" &&
      (certificate.certificate_external_url.trim() !== "" ||
        certificate.certificate_internal_url !== null)
    );
  };

  const hasAnyChanges = () => {
    return Object.values(changedFields).some((changed) => changed);
  };

  return (
    <div className="flex flex-col w-full gap-y-4 p-4">
      <div className="space-y-4">
        {/* Certificate Name */}
        <div className="relative">
          <Textinput
            value={certificate.certification_name}
            label="Certificate Name *"
            onChange={(e) => handleFieldChange("certification_name", e)}
            placeholder="e.g., AWS Solutions Architect"
          />
          {isValidCertId && changedFields.certification_name && (
            <Button
              text="Update"
              size="sm"
              variant="secondary"
              className="absolute right-2 top-8"
              onClick={() => updateSingleField("certification_name")}
              disabled={loading.includes("updating_certification_name")}
            />
          )}
        </div>

        {/* Issuing Organization */}
        <div className="relative">
          <Textinput
            value={certificate.issuing_organization}
            label="Issuing Organization *"
            onChange={(e) => handleFieldChange("issuing_organization", e)}
            placeholder="e.g., Amazon Web Services"
          />
          {isValidCertId && changedFields.issuing_organization && (
            <Button
              text="Update"
              size="sm"
              variant="secondary"
              className="absolute right-2 top-8"
              onClick={() => updateSingleField("issuing_organization")}
              disabled={loading.includes("updating_issuing_organization")}
            />
          )}
        </div>

        {/* Date Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Textinput
              value={certificate.issue_date}
              label="Issue Date *"
              type="date"
              onChange={(e) => handleFieldChange("issue_date", e)}
            />
            {isValidCertId && changedFields.issue_date && (
              <Button
                text="Update"
                size="sm"
                variant="secondary"
                className="absolute right-2 top-8"
                onClick={() => updateSingleField("issue_date")}
                disabled={loading.includes("updating_issue_date")}
              />
            )}
          </div>

          <div className="relative">
            <Textinput
              value={certificate.expiration_date}
              label="Expiration Date *"
              type="date"
              onChange={(e) => handleFieldChange("expiration_date", e)}
            />
            {isValidCertId && changedFields.expiration_date && (
              <Button
                text="Update"
                size="sm"
                variant="secondary"
                className="absolute right-2 top-8"
                onClick={() => updateSingleField("expiration_date")}
                disabled={loading.includes("updating_expiration_date")}
              />
            )}
          </div>
        </div>

        {/* Public Checkbox */}
        <div className="flex flex-row items-center justify-between px-3 py-2  rounded-lg">
          <div className="flex items-center gap-3">
            <CheckBox
              isChecked={certificate.is_public}
              setIsChecked={handlePublicToggle}
              // disabled={loading.includes("updating_public_status")}
            />
            <span className="text-sm text-[var(--accent)]">Make public</span>
          </div>
          {loading.includes("updating_public_status") && (
            <span className="text-xs text-blue-500">Updating...</span>
          )}
        </div>

        {/* Certificate Link/File Upload */}
        <div className="space-y-3">
          <div className="relative">
            <Textinput
              value={certificate.certificate_external_url}
              label="Certificate Link"
              onChange={(e) => handleFieldChange("certificate_external_url", e)}
              placeholder="https://example.com/certificate"
            />
            {isValidCertId && changedFields.certificate_external_url && (
              <Button
                text="Update"
                size="sm"
                variant="secondary"
                className="absolute right-2 top-8"
                onClick={() => updateSingleField("certificate_external_url")}
                disabled={loading.includes("updating_certificate_external_url")}
              />
            )}
          </div>

          <div className="text-center">
            <span className="text-xs opacity-65">
              Or upload certificate file
            </span>
          </div>

          <div className="relative">
            <FileInput
              value={certificate.certificate_internal_url}
              onChange={(file) =>
                handleFieldChange("certificate_internal_url", file)
              }
            />
            {isValidCertId && changedFields.certificate_internal_url && (
              <Button
                text="Update File"
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => updateSingleField("certificate_internal_url")}
                disabled={loading.includes("updating_certificate_internal_url")}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        {!isValidCertId ? (
          // Create mode - submit all fields at once
          <Button
            text={
              loading.includes("uploading_certificate")
                ? "Uploading..."
                : "Upload Certificate"
            }
            size="md"
            className="flex-1"
            variant="primary"
            onClick={uploadCertificate}
            disabled={
              !isFormValid() || loading.includes("uploading_certificate")
            }
          />
        ) : null}
      </div>

      {/* Validation Messages */}
      {!isFormValid() && !isValidCertId && (
        <div className="text-xs text-red-500 mt-2">
          * Please fill in all required fields and provide either a certificate
          link or upload a file.
        </div>
      )}
    </div>
  );
};

export default AddCert;
