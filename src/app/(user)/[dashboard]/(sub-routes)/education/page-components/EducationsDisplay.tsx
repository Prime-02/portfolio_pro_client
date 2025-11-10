import EmptyState from "@/app/components/containers/cards/EmptyState";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import { useEducationStore } from "@/app/stores/education_stores/EducationStore";
import React, { useEffect } from "react";
import EducationCard from "./EducationCard";

const EducationsDisplay = () => {
  const { setLoading, accessToken, isOnline, isLoading } = useGlobalState();
  const { fetchEducations, educations } = useEducationStore();
  const { loader, accentColor } = useTheme();

  const LoaderComponent = getLoader(loader) || null;

  useEffect(() => {
    if (accessToken && isOnline) {
      fetchEducations(accessToken, setLoading);
    }
  }, [accessToken, isOnline]);
  return (
    <div className="flex items-center flex-col justify-center w-full">
      {isLoading("fetching_educations") ? (
        LoaderComponent && <LoaderComponent color={accentColor.color} />
      ) : educations.length < 1 ? (
        <EmptyState
          title="No educations founds"
          description="It appears you haven't added any education yet."
          actionText="Refresh"
          onAction={() => fetchEducations(accessToken, setLoading)}
        />
      ) : (
        educations.map((education, i) => <EducationCard key={i} {...education} />)
      )}
    </div>
  );
};

export default EducationsDisplay;
