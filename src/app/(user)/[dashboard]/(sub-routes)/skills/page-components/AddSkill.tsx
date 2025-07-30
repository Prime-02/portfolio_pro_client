import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";

const AddSkill = ({ onRefresh }: { onRefresh: () => {} }) => {
  const {} = useTheme();
  const {
    loading,
    setLoading,
    accessToken,
    searchParams,
    router,
    pathname,
    unauthorizedWarning,
  } = useGlobalState();
  const updateParam = searchParams.get("update");
  const update =
    updateParam !== null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      updateParam
    );
  return <div>AddSkill</div>;
};

export default AddSkill;
