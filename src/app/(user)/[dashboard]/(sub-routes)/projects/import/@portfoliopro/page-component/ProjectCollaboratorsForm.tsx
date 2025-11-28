import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import CheckBox from "@/app/components/inputs/CheckBox";
import Dropdown from "@/app/components/inputs/DynamicDropdown";
import { Textinput } from "@/app/components/inputs/Textinput";
import { TextArea } from "@/app/components/inputs/TextArea";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import {
  DeleteData,
  GetAllData,
  UpdateAllData,
  PostAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import {
  formatDateString,
  validateUsername,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { ArrowLeft, Save, Plus, UserPlus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export interface ProjectCollaboratorsProps {
  collaborators: ProjectCollaboratorProps[];
  total: number;
}

export interface ProjectCollaboratorProps {
  username: string;
  role: string;
  contribution: string;
  contribution_description: string;
  can_edit: boolean;
  created_at: string;
  [key: string]: string | boolean | number | null | undefined;
}

export interface ProjectCollaboratorsFormProps {
  projectId: string;
  projectName?: string;
  onPrevious: () => void;
}

interface NewCollaboratorForm {
  username: string;
  role: string;
  contribution: string;
  contribution_description: string;
  can_edit: boolean;
  [key: string]: string | boolean | number | null | undefined;
}

const collaboratorRoles = [
  { id: "owner", code: "Co-owner" },
  { id: "creator", code: "Co-creator" },
  { id: "contributor", code: "Contributor" },
];

const ProjectCollaboratorsForm = ({
  projectId,
  projectName,
  onPrevious,
}: ProjectCollaboratorsFormProps) => {
  const {
    loading,
    setLoading,
    accessToken,
    checkUsernameAvailability,
    isOnline,
    userData,
  } = useGlobalState();
  const [projectCollaborators, setProjectCollaborators] =
    useState<ProjectCollaboratorsProps>({
      collaborators: [],
      total: 0,
    });

  // Track original data for change detection
  const [originalCollaborators, setOriginalCollaborators] = useState<
    ProjectCollaboratorProps[]
  >([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState("");
  const [newCollaborator, setNewCollaborator] = useState<NewCollaboratorForm>({
    username: "",
    role: "contributor",
    contribution: "",
    contribution_description: "",
    can_edit: false,
  });
  const { loader, accentColor } = useTheme();
  const LoaderComponent = getLoader(loader) || null;

  const findUserCollaborator = () => {
    return (
      projectCollaborators.collaborators.find(
        (collaborator) => collaborator.username === userData.username
      ) || null
    );
  };

  // Check if collaborator data has changed
  const hasCollaboratorChanged = (index: number): boolean => {
    const current = projectCollaborators.collaborators[index];
    const original = originalCollaborators[index];

    if (!original || !current) return false;

    return (
      current.role !== original.role ||
      current.contribution !== original.contribution ||
      current.contribution_description !== original.contribution_description ||
      current.can_edit !== original.can_edit
    );
  };

  const getProjectByProjecCollaborators = async () => {
    setLoading("fetching_collaborators");
    try {
      const collaboratorsRes: ProjectCollaboratorsProps = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}/collaborators`,
      });
      if (collaboratorsRes) {
        setProjectCollaborators(collaboratorsRes);
        // Deep copy for tracking changes
        setOriginalCollaborators(
          JSON.parse(JSON.stringify(collaboratorsRes.collaborators))
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("fetching_collaborators");
    }
  };

  useEffect(() => {
    if (accessToken && isOnline) {
      getProjectByProjecCollaborators();
    }
  }, [isOnline, accessToken]);

  const updateCollaboratorInfo = async (index: number) => {
    setLoading(`updating_collaborator_${index}`);
    const username = projectCollaborators.collaborators[index].username;
    const field = projectCollaborators.collaborators[index];
    try {
      const updateRes = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}/collaborators/${username}`,
        field: field as Record<string, unknown>,
      });
      if (updateRes) {
        toast.success(
          `You have successfully updated ${username}'s collaboration details`,
          {
            title: "Update Successful",
          }
        );
        // Update original data after successful save
        setOriginalCollaborators((prev) => {
          const updated = [...prev];
          updated[index] = { ...projectCollaborators.collaborators[index] };
          return updated;
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(`updating_collaborator_${index}`);
    }
  };

  const removeProjectCollaborator = async (index: number) => {
    setLoading(`deleting_collaborator_${index}`);
    const username = projectCollaborators.collaborators[index].username;
    try {
      const updateRes = await DeleteData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}/collaborators/${username}`,
      });
      if (updateRes) {
        toast.success(
          `You have successfully removed ${username} from ${projectName} `,
          {
            title: "Collaborator Removed",
          }
        );
        // Refresh collaborators list after successful removal
        await getProjectByProjecCollaborators();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(`deleting_collaborator_${index}`);
    }
  };

  const checkUsername = useCallback(
    async (username: string) => {
      setLoading("checking_username");
      setUsernameAvailable(""); // Clear previous messages

      if (!username || username.length < 3) {
        setUsernameAvailable("");
        setLoading("checking_username"); // Clear loading state
        return;
      }

      // First validate the username format
      const validationResult = validateUsername(username);
      if (!validationResult.valid) {
        setUsernameAvailable(
          validationResult.message || "Invalid username format"
        );
        setLoading("checking_username"); // Clear loading state
        return;
      }

      try {
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
          setUsernameAvailable("✓ User found and available to add");
        } else {
          setUsernameAvailable("❌ This user was not found on our server");
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailable("❌ Error checking username availability");
      } finally {
        setLoading("checking_username");
      }
    },
    [checkUsernameAvailability, setLoading] // Correct dependencies
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newCollaborator.username.length >= 3) {
        checkUsername(newCollaborator.username);
      } else {
        setUsernameAvailable(""); // Clear message for usernames < 3 chars
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newCollaborator.username]); // Correct dependencies

  const addNewCollaborator = async () => {
    if (!newCollaborator.username.trim()) {
      toast.error("Username is required", {
        title: "Validation Error",
      });
      return;
    }

    // Check if user is already a collaborator
    const existingCollaborator = projectCollaborators.collaborators.find(
      (collaborator) => collaborator.username === newCollaborator.username
    );

    if (existingCollaborator) {
      toast.error("This user is already a collaborator on this project", {
        title: "Validation Error",
      });
      return;
    }

    // Check if user is trying to add themselves
    if (newCollaborator.username === userData.username) {
      toast.error("You cannot add yourself as a collaborator", {
        title: "Validation Error",
      });
      return;
    }

    setLoading("adding_collaborator");
    try {
      const addRes = await PostAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}/collaborators`,
        data: newCollaborator,
      });

      if (addRes) {
        toast.success(
          `You have successfully added ${newCollaborator.username} to ${projectName}`,
          {
            title: "Collaborator Added",
          }
        );

        // Reset form and hide it
        setNewCollaborator({
          username: "",
          role: "contributor",
          contribution: "",
          contribution_description: "",
          can_edit: false,
        });
        setUsernameAvailable(""); // Clear username availability message
        setShowAddForm(false);

        // Refresh collaborators list
        await getProjectByProjecCollaborators();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add collaborator. Please try again.", {
        title: "Error",
      });
    } finally {
      setLoading("adding_collaborator"); // Use empty string instead of specific loading key
    }
  };

  const updateCollaboratorField = (
    index: number,
    field: keyof ProjectCollaboratorProps,
    value: string | boolean
  ) => {
    setProjectCollaborators((prev) => ({
      ...prev,
      collaborators: prev.collaborators.map((collaborator, i) =>
        i === index ? { ...collaborator, [field]: value } : collaborator
      ),
    }));
  };

  const updateNewCollaboratorField = (
    field: keyof NewCollaboratorForm,
    value: string | boolean
  ) => {
    setNewCollaborator((prev) => ({ ...prev, [field]: value }));
  };

  // Updated permission checking functions
  const canAddCollaborators = () => {
    const userCollaborator = findUserCollaborator();
    return userCollaborator?.role === "creator";
  };

  const canEditCollaborator = (collaborator: ProjectCollaboratorProps) => {
    const userCollaborator = findUserCollaborator();
    const userRole = userCollaborator?.role;

    // Users can always edit their own info
    if (collaborator.username === userData.username) {
      return true;
    }

    // Only creators can edit other collaborators
    return userRole === "creator";
  };

  const canRemoveCollaborator = (collaborator: ProjectCollaboratorProps) => {
    const userCollaborator = findUserCollaborator();
    const userRole = userCollaborator?.role;

    // Users can remove themselves (except creators - there can only be one)
    if (collaborator.username === userData.username && userRole !== "creator") {
      return true;
    }

    // Creators can remove others but not themselves
    if (userRole === "creator" && collaborator.username !== userData.username) {
      return true;
    }

    return false;
  };

  if (loading.includes("fetching_collaborators")) {
    return (
      <div className="w-full items-center justify-center flex min-h-64">
        {LoaderComponent && <LoaderComponent color={accentColor.color} />}
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-y-6 w-full mx-auto ">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <BasicHeader
            heading={`${projectName ? `Collaborators for ${projectName}` : "Collaborators"}`}
          />
          {canAddCollaborators() && (
            <Button
              size="sm"
              text="Add Collaborator"
              icon={<UserPlus size={16} />}
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full sm:w-auto"
            />
          )}
        </div>

        {/* Add New Collaborator Form */}
        {showAddForm && canAddCollaborators() && (
          <div className="border border-[var(--accent)]/20 rounded-lg p-4 sm:p-6 bg-[var(--background)]/50">
            <BasicHeader
              headingClass="text-base sm:text-lg mb-4"
              heading="Add New Collaborator"
            />
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Textinput
                    onChange={(e) => updateNewCollaboratorField("username", e)}
                    value={newCollaborator.username}
                    label="Username"
                    placeholder="Enter collaborator's username"
                    labelBgHexIntensity={1}
                  />
                  {usernameAvailable && (
                    <div
                      className={`text-xs ${
                        usernameAvailable.includes("✓")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {usernameAvailable}
                    </div>
                  )}
                </div>
                <div>
                  <Dropdown
                    placeholder="Select role"
                    value={newCollaborator.role}
                    onSelect={(value) =>
                      updateNewCollaboratorField("role", value)
                    }
                    includeNoneOption={false}
                    options={collaboratorRoles}
                  />
                </div>
              </div>

              <div>
                <Textinput
                  onChange={(e) =>
                    updateNewCollaboratorField("contribution", e)
                  }
                  value={newCollaborator.contribution}
                  label="Contribution"
                  placeholder="What will they contribute?"
                  labelBgHexIntensity={1}
                />
              </div>

              <div>
                <TextArea
                  labelBgHexIntensity={1}
                  onChange={(e) =>
                    updateNewCollaboratorField("contribution_description", e)
                  }
                  value={newCollaborator.contribution_description}
                  label="Contribution Description"
                  desc="Describe their contribution in detail"
                />
              </div>

              <div>
                <CheckBox
                  isChecked={newCollaborator.can_edit}
                  setIsChecked={(checked) =>
                    updateNewCollaboratorField("can_edit", checked)
                  }
                  description="This collaborator will be able to make changes, remove you from the project and delete this project"
                  label="Give full control over this project"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  text="Cancel"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCollaborator({
                      username: "",
                      role: "contributor",
                      contribution: "",
                      contribution_description: "",
                      can_edit: false,
                    });
                    setUsernameAvailable("");
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                />
                <Button
                  variant="outline"
                  customColor="green"
                  size="sm"
                  text="Add Collaborator"
                  icon={<Plus size={16} />}
                  onClick={addNewCollaborator}
                  loading={loading.includes("adding_collaborator")}
                  disabled={
                    loading.includes("adding_collaborator") ||
                    !newCollaborator.username.trim() ||
                    usernameAvailable.includes("❌")
                  }
                  className="w-full sm:w-auto order-1 sm:order-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Existing Collaborators */}
        <div className="space-y-8">
          {projectCollaborators.collaborators.map((collaborator, i) => (
            <div key={i} className="space-y-4">
              {i > 0 && <div className="w-full h-px bg-[var(--accent)]/20" />}

              {/* Collaborator Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <BasicHeader
                  headingClass="text-xl sm:text-2xl"
                  heading={collaborator.username}
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                  {canEditCollaborator(collaborator) &&
                    hasCollaboratorChanged(i) && (
                      <Button
                        variant="outline"
                        customColor="green"
                        size="sm"
                        text="Save"
                        icon={<Save size={16} />}
                        onClick={() => updateCollaboratorInfo(i)}
                        loading={loading.includes(`updating_collaborator_${i}`)}
                        disabled={loading.includes(
                          `updating_collaborator_${i}`
                        )}
                        className="flex-1 sm:flex-initial"
                      />
                    )}

                  {projectCollaborators.collaborators.length > 1 &&
                    canRemoveCollaborator(collaborator) && (
                      <Button
                        variant="ghost"
                        customColor="red"
                        size="sm"
                        text="Remove"
                        onClick={() => removeProjectCollaborator(i)}
                        loading={loading.includes(`deleting_collaborator_${i}`)}
                        disabled={loading.includes(
                          `deleting_collaborator_${i}`
                        )}
                        className="flex-1 sm:flex-initial"
                      />
                    )}
                </div>
              </div>

              {/* Collaborator Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Textinput
                      onChange={(e) =>
                        updateCollaboratorField(i, "contribution", e)
                      }
                      value={collaborator.contribution}
                      label="Contribution"
                      labelBgHexIntensity={1}
                      disabled={!canEditCollaborator(collaborator)}
                    />
                  </div>
                  <div>
                    <Dropdown
                      placeholder="Collaborator's role"
                      value={collaborator.role}
                      onSelect={(value) =>
                        updateCollaboratorField(i, "role", value)
                      }
                      includeNoneOption={false}
                      options={collaboratorRoles}
                      disabled={!canEditCollaborator(collaborator)}
                    />
                  </div>
                </div>

                <div>
                  <TextArea
                    labelBgHexIntensity={1}
                    onChange={(e) =>
                      updateCollaboratorField(i, "contribution_description", e)
                    }
                    value={collaborator.contribution_description}
                    label="Contribution Description"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <CheckBox
                      isChecked={collaborator.can_edit}
                      setIsChecked={(checked) =>
                        updateCollaboratorField(i, "can_edit", checked)
                      }
                      description="This collaborator will be able to make changes, remove you from the project and delete this project"
                      label="Give full control over this project"
                    />
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] text-right">
                    Joined{" "}
                    {formatDateString(collaborator.created_at, {
                      includeTime: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="flex justify-start pt-4">
          <Button
            text="Back"
            icon={<ArrowLeft size={18} />}
            variant="outline"
            onClick={onPrevious}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    );
  }
};

export default ProjectCollaboratorsForm;
