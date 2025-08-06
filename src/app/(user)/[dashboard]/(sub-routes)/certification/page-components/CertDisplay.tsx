import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import CertCard, { CertificateCardProps } from "./CertCard";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { getLoader } from "@/app/components/loaders/Loader";
import Modal from "@/app/components/containers/modals/Modal";
import AddCert from "./AddCert";
import Button from "@/app/components/buttons/Buttons";
import { Plus } from "lucide-react";
import EmptyState from "@/app/components/containers/cards/EmptyState";

const CertDisplay = () => {
  const {
    loading,
    setLoading,
    accessToken,
    extendRouteWithQuery,
    searchParams,
    clearQuerryParam,
  } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const LoaderComponent = getLoader(loader) || null;
  const addCert = searchParams.get("create") === "true";
  const updateCert = searchParams.get("update");
  const isValidCertId =
    updateCert !== null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      updateCert
    );
  const [certificates, setCertificates] = useState<CertificateCardProps[]>([]);

  // const theme = getThemeClasses();

  const fetchUserCertifications = async () => {
    setLoading("fetching_certs");
    try {
      const certsRes: CertificateCardProps[] = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/certification/`,
        type: "Certification",
      });
      if (certsRes && certsRes.length > 0) {
        setCertificates(certsRes);
      }
    } catch (error) {
      console.log("error fetching user cert: ", error);
    } finally {
      setLoading("fetching_certs");
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchUserCertifications();
  }, [accessToken]);

  return (
    <>
      <Modal
        isOpen={isValidCertId || addCert}
        centered
        onClose={clearQuerryParam}
        title={`${isValidCertId ? "Update" : "Upload"} your certificate information`}
        loading={loading.includes("fetching_cert")}
      >
        <AddCert
          onRefresh={() => {
            fetchUserCertifications();
          }}
        />
      </Modal>

      <div className="pb-8">
        <header className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-semibold`}>
                {`Certificates & Awards`}
              </h2>
              <p className={`opacity-70 mt-2`}>
                {`Boost Your Credibility – Upload Verified Certificates & Awards`}
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
          {certificates.length < 1 ? (
            <EmptyState
              description=""
              actionText="Add you first certificate/award"
              onAction={() => {
                extendRouteWithQuery({ create: "true" });
              }}
              title="No certificate or award found"
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
              {certificates.map((certificate) => (
                <CertCard
                  key={certificate.id}
                  id={certificate.id}
                  created_at={certificate.created_at}
                  certification_name={certificate.certification_name}
                  certificate_external_url={
                    certificate.certificate_external_url
                  }
                  certificate_internal_url={
                    certificate.certificate_internal_url
                  }
                  certificate_internal_url_id={
                    certificate.certificate_internal_url_id
                  }
                  expiration_date={certificate.expiration_date}
                  is_public={certificate.is_public}
                  issue_date={certificate.issue_date}
                  issuing_organization={certificate.issuing_organization}
                  onRefresh={() => {
                    fetchUserCertifications();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CertDisplay;
