import Button from "@/app/components/buttons/Buttons";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import SkillCard, { SkillsProp } from "./SkillCard";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import Modal from "@/app/components/containers/modals/Modal";
import AddSkill from "./AddSkill";
import EmptyState from "@/app/components/containers/cards/EmptyState";

const SkillsDisplay = () => {
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
  const create = searchParams.get("create") === "true";
  const updateParam = searchParams.get("update");
  const isValidId =
    updateParam !== null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      updateParam
    );

  const [skills, setSkills] = useState<SkillsProp[]>([]);
  const fetchUserSkills = async () => {
    setLoading("fetching_skills");
    try {
      const skillsRes: SkillsProp[] = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/skills/`,
        type: "User Skills",
      });
      if (skillsRes && skillsRes.length > 0) {
        setSkills(skillsRes);
        
      }
    } catch (error) {
      console.log("Error fetching skills: ", error);
    } finally {
      setLoading("fetching_skills");
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchUserSkills();
  }, [accessToken]);
  return (
    <div>
      <Modal
        isOpen={isValidId || create}
        centered
        onClose={clearQuerryParam}
        title={`${isValidId ? "Update" : "Upload"} your skill or proffession`}
        loading={loading.includes("fetching_cert")}
      >
        <AddSkill
          onRefresh={() => {
            fetchUserSkills();
          }}
        />
      </Modal>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            {`Skills & Expertise`}
          </h2>
          <p className="opacity-70 mt-2">
            {`Demonstrate your capabilities through proven results and measurable impact.`}
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
      <div>
        {loading.includes("fetching_skills") ? (
          LoaderComponent ? (
            <div className="flex justify-center items-center py-4 w-full">
              <LoaderComponent color={accentColor.color} />
            </div>
          ) : (
            "Loading..."
          )
        ) : skills.length < 1 ? (
          <EmptyState
          title="No skills found"
          description="You have either not added one or something went wrong"
          onAction={()=>{
            extendRouteWithQuery({create: "true"})
          }}
          />
        ) : (
          <div className="space-y-4">
            {skills.map((skill, i) => (
              <SkillCard
                key={i}
                skill={skill}
                onEdit={() => {
                  extendRouteWithQuery({ update: String(skill.id) }); // Assuming skill has an id field
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsDisplay;
